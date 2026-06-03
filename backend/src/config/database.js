import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'dms_db',
  max: 10,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

function convertPlaceholders(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export const query = async (sql, params = [], retries = 3) => {
  try {
    const pgSql = convertPlaceholders(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
  } catch (error) {
    if (error.code === '40P01' && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return query(sql, params, retries - 1);
    }
    throw error;
  }
};

export const getConnection = async () => {
  const client = await pool.connect();
  return {
    query: (sql, params = []) => {
      const pgSql = convertPlaceholders(sql);
      return client.query(pgSql, params);
    },
    beginTransaction: () => client.query('BEGIN'),
    commit: () => client.query('COMMIT'),
    rollback: () => client.query('ROLLBACK'),
    release: () => client.release(),
    _client: client
  };
};

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(`
      CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        color VARCHAR(20) DEFAULT '#6b7280',
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        module VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(50) UNIQUE,
          is_active SMALLINT DEFAULT 1,
          role_id INT NOT NULL REFERENCES roles(id),
          profile_picture VARCHAR(255),
          reset_token VARCHAR(255),
          reset_expires TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        contact_person VARCHAR(255),
        phone VARCHAR(50),
        address TEXT,
        due_limit DECIMAL(10,2) DEFAULT 0,
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        company_id INT REFERENCES companies(id) ON DELETE SET NULL,
        description TEXT,
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        company_id INT REFERENCES companies(id) ON DELETE SET NULL,
        purchase_price DECIMAL(10,2) NOT NULL,
        dealer_price DECIMAL(10,2) NOT NULL,
        mrp DECIMAL(10,2) NOT NULL,
        stock_quantity INT DEFAULT 0,
        low_stock_alert INT DEFAULT 10,
        unit VARCHAR(50) DEFAULT 'piece',
        pack_size INT DEFAULT 1,
        expiry_date DATE,
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS retailers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) UNIQUE,
        owner_name VARCHAR(255),
        phone VARCHAR(50) NOT NULL,
        address TEXT,
        area VARCHAR(100),
        credit_limit DECIMAL(10,2) DEFAULT 0,
        outstanding_balance DECIMAL(10,2) DEFAULT 0,
        due_limit DECIMAL(10,2) DEFAULT 0,
        is_active SMALLINT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_no VARCHAR(50) UNIQUE NOT NULL,
        retailer_id INT NOT NULL REFERENCES retailers(id),
        created_by INT NOT NULL REFERENCES users(id),
        subtotal DECIMAL(10,2) NOT NULL,
        discount_percent DECIMAL(5,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        due_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'due',
        notes TEXT,
        invoice_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL,
        rate DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        payment_no VARCHAR(50) UNIQUE NOT NULL,
        retailer_id INT NOT NULL REFERENCES retailers(id),
        amount DECIMAL(10,2) NOT NULL,
        payment_method VARCHAR(50) DEFAULT 'cash',
        reference_no VARCHAR(100),
        notes TEXT,
        collected_by INT NOT NULL REFERENCES users(id),
        payment_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_logs (
        id SERIAL PRIMARY KEY,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL,
        type VARCHAR(20) NOT NULL,
        reference_type VARCHAR(50),
        reference_id INT,
        notes TEXT,
        created_by INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id SERIAL PRIMARY KEY,
        po_no VARCHAR(50) UNIQUE NOT NULL,
        company_id INT NOT NULL REFERENCES companies(id),
        total_amount DECIMAL(10,2) NOT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0,
        due_amount DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'pending',
        notes TEXT,
        order_date DATE NOT NULL,
        created_by INT NOT NULL REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS purchase_order_items (
        id SERIAL PRIMARY KEY,
        purchase_order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL REFERENCES products(id),
        quantity INT NOT NULL,
        rate DECIMAL(10,2) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        received_quantity INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(20) DEFAULT 'info',
        category VARCHAR(50),
        reference_type VARCHAR(50),
        reference_id INT,
        is_read SMALLINT DEFAULT 0,
        action_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        id SERIAL PRIMARY KEY,
        role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission VARCHAR(50) NOT NULL,
        UNIQUE (role_id, permission)
      )
    `);

    const existingPerms = await client.query('SELECT id FROM permissions LIMIT 1');
    if (existingPerms.rows.length === 0) {
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
        { name: 'view_deliveries', description: 'View deliveries', module: 'deliveries' },
        { name: 'orders_view', description: 'View orders', module: 'orders' },
        { name: 'orders_create', description: 'Create orders', module: 'orders' }
      ];

      for (const perm of defaultPermissions) {
        await client.query(
          'INSERT INTO permissions (name, description, module) VALUES ($1, $2, $3)',
          [perm.name, perm.description, perm.module]
        );
      }
      console.log('Default permissions created');
    }

    const missingPerms = ['orders_view', 'orders_create'];
    for (const permName of missingPerms) {
      const existing = await client.query('SELECT id FROM permissions WHERE name = $1', [permName]);
      if (existing.rows.length === 0) {
        const desc = permName === 'orders_view' ? 'View orders' : 'Create orders';
        await client.query(
          'INSERT INTO permissions (name, description, module) VALUES ($1, $2, $3)',
          [permName, desc, 'orders']
        );
        console.log(`Added missing permission: ${permName}`);
      }
    }

    const existingRoles = await client.query('SELECT id FROM roles LIMIT 1');
    if (existingRoles.rows.length === 0) {
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
        const result = await client.query(
          'INSERT INTO roles (name, description, color) VALUES ($1, $2, $3) RETURNING id',
          [role.name, role.description, role.color]
        );
        const roleId = result.rows[0].id;

        for (const perm of role.permissions) {
          const permRows = await client.query('SELECT id FROM permissions WHERE name = $1', [perm]);
          if (permRows.rows.length > 0) {
            await client.query(
              'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2)',
              [roleId, perm]
            );
          }
        }
      }
      console.log('Default roles created');
    }

    const existingRolesWithPerms = await client.query("SELECT DISTINCT role_id FROM role_permissions WHERE permission = $1", ['dashboard_view']);
    if (existingRolesWithPerms.rows.length === 0) {
      const allRoles = await client.query('SELECT id FROM roles');
      const dashboardPerm = await client.query("SELECT name FROM permissions WHERE name = $1", ['dashboard_view']);

      if (dashboardPerm.rows.length > 0) {
        for (const role of allRoles.rows) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [role.id, 'dashboard_view']
          );
        }
        console.log('Added dashboard_view permission to all roles');
      }
    }

    const shopkeeperRole = await client.query("SELECT id FROM roles WHERE name = $1", ['shopkeeper']);
    if (shopkeeperRole.rows.length === 0) {
      const result = await client.query(
        'INSERT INTO roles (name, description, color) VALUES ($1, $2, $3) RETURNING id',
        ['shopkeeper', 'Can view products, retailers, create orders from dealers, and manage own settings', '#6366f1']
      );
      const roleId = result.rows[0].id;
      const shopkeeperPerms = ['dashboard_view', 'products_view', 'retailers_view', 'companies_view', 'orders_view', 'orders_create', 'settings_view'];
      for (const perm of shopkeeperPerms) {
        const permRows = await client.query('SELECT id FROM permissions WHERE name = $1', [perm]);
        if (permRows.rows.length > 0) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [roleId, perm]
          );
        }
      }
      console.log('Shopkeeper role created');
    } else {
      const roleId = shopkeeperRole.rows[0].id;
      const updatePerms = ['companies_view', 'orders_view', 'orders_create', 'settings_view'];
      for (const perm of updatePerms) {
        const permRows = await client.query('SELECT id FROM permissions WHERE name = $1', [perm]);
        if (permRows.rows.length > 0) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [roleId, perm]
          );
        }
      }
      console.log('Shopkeeper role updated with new permissions');
    }

    // Ensure all roles have settings_view for profile access
    const settingsPerm = await client.query("SELECT id FROM permissions WHERE name = $1", ['settings_view']);
    if (settingsPerm.rows.length > 0) {
      const roleNames = ['manager', 'salesman', 'accountant', 'driver', 'loader'];
      for (const roleName of roleNames) {
        const roleRow = await client.query("SELECT id FROM roles WHERE name = $1", [roleName]);
        if (roleRow.rows.length > 0) {
          await client.query(
            'INSERT INTO role_permissions (role_id, permission) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [roleRow.rows[0].id, 'settings_view']
          );
        }
      }
      console.log('Added settings_view to all roles');
    }

    const adminUser = await client.query("SELECT id FROM users WHERE username = $1 OR username = $2", ['admin', 'SystemAdmin']);
    const adminPhone = await client.query("SELECT id FROM users WHERE phone = $1", ['01700000000']);
    if (adminUser.rows.length === 0 && adminPhone.rows.length === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await client.query(
        'INSERT INTO users (username, password_hash, full_name, role_id, phone) VALUES ($1, $2, $3, $4, $5)',
        ['admin', passwordHash, 'System Admin', 1, '01700000000']
      );
      console.log('Default admin user created: admin / admin123');
    }

    const shopkeeperUser = await client.query("SELECT id FROM users WHERE username = $1", ['shopkeeper1']);
    if (shopkeeperUser.rows.length === 0) {
      const roleRes = await client.query("SELECT id FROM roles WHERE name = $1", ['shopkeeper']);
      if (roleRes.rows.length > 0) {
        const passwordHash = bcrypt.hashSync('admin123', 10);
        await client.query(
          'INSERT INTO users (username, password_hash, full_name, role_id, phone) VALUES ($1, $2, $3, $4, $5)',
          ['shopkeeper1', passwordHash, 'Shopkeeper One', roleRes.rows[0].id, '01711111111']
        );
        console.log('Shopkeeper user created: shopkeeper1 / admin123');
      }
    }

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'users' AND column_name = 'profile_picture'
        ) THEN
          ALTER TABLE users ADD COLUMN profile_picture VARCHAR(255);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'users' AND constraint_type = 'UNIQUE' AND constraint_name = 'users_username_key'
        ) THEN
          ALTER TABLE users DROP CONSTRAINT users_username_key;
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'users' AND constraint_type = 'UNIQUE' AND constraint_name = 'users_email_key'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE table_name = 'users' AND constraint_type = 'UNIQUE' AND constraint_name = 'users_phone_key'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_phone_key UNIQUE (phone);
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;
