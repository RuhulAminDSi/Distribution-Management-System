import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'dms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 10000,
  timeout: 10000
});

export const query = async (sql, params = [], retries = 3) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    if (error.code === 'ER_LOCK_WAIT_TIMEOUT' && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return query(sql, params, retries - 1);
    }
    throw error;
  }
};

export const getConnection = async () => {
  return pool.getConnection();
};

export const initializeDatabase = async () => {
  const connection = await pool.getConnection();
  
  try {
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        is_active TINYINT DEFAULT 1,
        role_id INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS companies (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        due_limit DECIMAL(10,2) DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        company_id INT,
        description TEXT,
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        category_id INT,
        company_id INT,
        purchase_price DECIMAL(10,2) NOT NULL,
        dealer_price DECIMAL(10,2) NOT NULL,
        mrp DECIMAL(10,2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        low_stock_alert INT DEFAULT 10,
        unit VARCHAR(50) DEFAULT 'piece',
        pack_size INT DEFAULT 1,
        expiry_date DATE,
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);

    // Add expiry_date column if not exists
    try {
      await connection.execute(`ALTER TABLE products ADD COLUMN expiry_date DATE`);
    } catch (e) {}

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS retailers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        owner_name VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        area VARCHAR(100),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        outstanding_balance DECIMAL(10,2) DEFAULT 0,
        due_limit DECIMAL(10,2) DEFAULT 0,
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoices (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_no VARCHAR(50) UNIQUE NOT NULL,
        retailer_id INT NOT NULL,
        created_by INT NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        due_amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('due', 'partial', 'paid') DEFAULT 'due',
        notes TEXT,
        invoice_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (retailer_id) REFERENCES retailers(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        invoice_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        rate DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT PRIMARY KEY AUTO_INCREMENT,
        payment_no VARCHAR(50) UNIQUE NOT NULL,
        retailer_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        reference_no VARCHAR(100),
        notes TEXT,
        collected_by INT NOT NULL,
        payment_date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (retailer_id) REFERENCES retailers(id),
        FOREIGN KEY (collected_by) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT,
        notes TEXT,
        created_by INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id INT PRIMARY KEY AUTO_INCREMENT,
        po_no VARCHAR(50) UNIQUE NOT NULL,
        company_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        due_amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('pending', 'received', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        order_date DATE NOT NULL,
        created_by INT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies(id),
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id INT PRIMARY KEY AUTO_INCREMENT,
        purchase_order_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        rate DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        received_quantity INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
        category VARCHAR(50),
        reference_type VARCHAR(50),
        reference_id INT,
        is_read TINYINT DEFAULT 0,
        action_url VARCHAR(255),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_read (user_id, is_read),
        INDEX idx_created_at (created_at)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS roles (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#6b7280',
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        role_id INT NOT NULL,
        permission VARCHAR(50) NOT NULL,
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
        UNIQUE KEY unique_role_permission (role_id, permission)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS permissions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        module VARCHAR(50) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [existingPerms] = await connection.execute('SELECT id FROM permissions LIMIT 1');
    if (existingPerms.length === 0) {
      const defaultPermissions = [
        { name: 'all', description: 'Full system access', module: 'system' },
        { name: 'dashboard_view', description: 'View dashboard', module: 'dashboard' },
        { name: 'companies_view', description: 'View companies', module: 'companies' },
        { name: 'companies_create', description: 'Create companies', module: 'companies' },
        { name: 'companies_edit', description: 'Edit companies', module: 'companies' },
        { name: 'companies_delete', description: 'Delete companies', module: 'companies' },
        { name: 'products_view', description: 'View products', module: 'products' },
        { name: 'products_create', description: 'Create products', module: 'products' },
        { name: 'products_edit', description: 'Edit products', module: 'products' },
        { name: 'products_delete', description: 'Delete products', module: 'products' },
        { name: 'retailers_view', description: 'View retailers', module: 'retailers' },
        { name: 'retailers_create', description: 'Create retailers', module: 'retailers' },
        { name: 'retailers_edit', description: 'Edit retailers', module: 'retailers' },
        { name: 'retailers_delete', description: 'Delete retailers', module: 'retailers' },
        { name: 'sales_view', description: 'View sales', module: 'sales' },
        { name: 'sales_create', description: 'Create sales', module: 'sales' },
        { name: 'payments_view', description: 'View payments', module: 'payments' },
        { name: 'payments_create', description: 'Create payments', module: 'payments' },
        { name: 'stock_view', description: 'View stock', module: 'stock' },
        { name: 'stock_create', description: 'Create stock', module: 'stock' },
        { name: 'stock_edit', description: 'Edit stock', module: 'stock' },
        { name: 'reports_view', description: 'View reports', module: 'reports' },
        { name: 'users_view', description: 'View users', module: 'users' },
        { name: 'users_create', description: 'Create users', module: 'users' },
        { name: 'users_edit', description: 'Edit users', module: 'users' },
        { name: 'users_delete', description: 'Delete users', module: 'users' },
        { name: 'roles_manage', description: 'Manage roles', module: 'roles' },
        { name: 'settings_view', description: 'View settings', module: 'settings' },
        { name: 'settings_edit', description: 'Edit settings', module: 'settings' },
        { name: 'view_deliveries', description: 'View deliveries', module: 'deliveries' }
      ];
      
      for (const perm of defaultPermissions) {
        await connection.execute(
          'INSERT INTO permissions (name, description, module) VALUES (?, ?, ?)',
          [perm.name, perm.description, perm.module]
        );
      }
      console.log('Default permissions created');
    }

    const [existingRoles] = await connection.execute('SELECT id FROM roles LIMIT 1');
    if (existingRoles.length === 0) {
      const defaultRoles = [
        { name: 'system_admin', description: 'Full system access with all permissions', color: '#ef4444', permissions: ['all'] },
        { name: 'admin', description: 'Full access to all features except system settings', color: '#f97316', permissions: ['all'] },
        { name: 'manager', description: 'Manage sales, inventory, retailers and reports', color: '#eab308', permissions: ['dashboard_view', 'products_view', 'products_create', 'products_edit', 'retailers_view', 'retailers_create', 'retailers_edit', 'sales_view', 'sales_create', 'payments_view', 'payments_create', 'stock_view', 'stock_create', 'stock_edit', 'reports_view', 'companies_view', 'companies_create', 'companies_edit'] },
        { name: 'salesman', description: 'Create sales, manage retailers and payments', color: '#22c55e', permissions: ['dashboard_view', 'retailers_view', 'retailers_create', 'sales_view', 'sales_create', 'payments_view', 'payments_create'] },
        { name: 'accountant', description: 'Manage payments, invoices and financial reports', color: '#3b82f6', permissions: ['dashboard_view', 'payments_view', 'payments_create', 'reports_view', 'sales_view'] },
        { name: 'driver', description: 'View deliveries and routes', color: '#8b5cf6', permissions: ['dashboard_view', 'stock_view', 'view_deliveries'] },
        { name: 'loader', description: 'Manage stock and warehouse', color: '#ec4899', permissions: ['dashboard_view', 'stock_view', 'stock_create', 'stock_edit', 'products_view'] }
      ];
      
      for (const role of defaultRoles) {
        const [result] = await connection.execute(
          'INSERT INTO roles (name, description, color) VALUES (?, ?, ?)',
          [role.name, role.description, role.color]
        );
        
        for (const perm of role.permissions) {
          const [permRows] = await connection.execute('SELECT id FROM permissions WHERE name = ?', [perm]);
          if (permRows.length > 0) {
            await connection.execute(
              'INSERT INTO role_permissions (role_id, permission) VALUES (?, ?)',
              [result.insertId, perm]
            );
          }
        }
      }
      console.log('Default roles created');
    }

    const [existingRolesWithPerms] = await connection.execute('SELECT DISTINCT role_id FROM role_permissions WHERE permission = ?', ['dashboard_view']);
    if (existingRolesWithPerms.length === 0) {
      const [allRoles] = await connection.execute('SELECT id FROM roles');
      const [dashboardPerm] = await connection.execute('SELECT name FROM permissions WHERE name = ?', ['dashboard_view']);
      
      if (dashboardPerm.length > 0) {
        for (const role of allRoles) {
          await connection.execute(
            'INSERT IGNORE INTO role_permissions (role_id, permission) VALUES (?, ?)',
            [role.id, 'dashboard_view']
          );
        }
        console.log('Added dashboard_view permission to all roles');
      }
    }

    const [users] = await connection.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await connection.execute(
        'INSERT INTO users (username, password_hash, full_name, role_id, phone) VALUES (?, ?, ?, ?, ?)',
        ['admin', passwordHash, 'System Admin', 1, '01700000000']
      );
      console.log('Default admin user created: admin / admin123');
    }

    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
};

export default pool;
