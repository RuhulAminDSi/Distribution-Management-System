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
  queueLimit: 0
});

export const query = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows;
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
        role ENUM('system_admin', 'admin', 'manager', 'salesman', 'accountant', 'driver', 'loader') NOT NULL,
        phone VARCHAR(50),
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        is_active TINYINT DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
      )
    `);

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

    const [users] = await connection.execute('SELECT id FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      const passwordHash = bcrypt.hashSync('admin123', 10);
      await connection.execute(
        'INSERT INTO users (username, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)',
        ['admin', passwordHash, 'System Admin', 'system_admin', '01700000000']
      );
      console.log('Default admin user created: admin / admin123');
    }

    console.log('Database initialized successfully');
  } finally {
    connection.release();
  }
};

export default pool;
