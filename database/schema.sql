-- Distribution Management System Database Schema
-- Run this in PostgreSQL to create the database
-- First create the database: CREATE DATABASE dms_db;
-- Then connect: \c dms_db;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(20) DEFAULT '#6b7280',
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  module VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50) UNIQUE,
  profile_picture VARCHAR(255),
  is_active SMALLINT DEFAULT 1,
  role_id INT NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  due_limit DECIMAL(12,2) DEFAULT 0,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  company_id INT REFERENCES companies(id) ON DELETE SET NULL,
  description TEXT,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
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
);

-- Retailers Table
CREATE TABLE IF NOT EXISTS retailers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE,
  owner_name VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  address TEXT,
  area VARCHAR(100),
  credit_limit DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  due_limit DECIMAL(12,2) DEFAULT 0,
  is_active SMALLINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  invoice_no VARCHAR(50) UNIQUE NOT NULL,
  retailer_id INT NOT NULL REFERENCES retailers(id),
  created_by INT NOT NULL REFERENCES users(id),
  subtotal DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'due',
  notes TEXT,
  invoice_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id INT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  payment_no VARCHAR(50) UNIQUE NOT NULL,
  retailer_id INT NOT NULL REFERENCES retailers(id),
  amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cash',
  reference_no VARCHAR(100),
  notes TEXT,
  collected_by INT NOT NULL REFERENCES users(id),
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stock Logs Table
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
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
  id SERIAL PRIMARY KEY,
  po_no VARCHAR(50) UNIQUE NOT NULL,
  company_id INT NOT NULL REFERENCES companies(id),
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_amount DECIMAL(12,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending',
  notes TEXT,
  order_date DATE NOT NULL,
  created_by INT NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id SERIAL PRIMARY KEY,
  purchase_order_id INT NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  received_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Table
CREATE TABLE IF NOT EXISTS role_permissions (
  id SERIAL PRIMARY KEY,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  UNIQUE (role_id, permission)
);

-- Notifications Table
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
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);
CREATE INDEX IF NOT EXISTS idx_users_search ON users(full_name, is_active);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(low_stock_alert);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);
CREATE INDEX IF NOT EXISTS idx_products_listing ON products(category_id, is_active);
CREATE INDEX IF NOT EXISTS idx_invoices_retailer_id ON invoices(retailer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date_status ON invoices(invoice_date, status);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_stock_logs_history ON stock_logs(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_retailers_area ON retailers(area);
CREATE INDEX IF NOT EXISTS idx_retailers_is_active ON retailers(is_active);
