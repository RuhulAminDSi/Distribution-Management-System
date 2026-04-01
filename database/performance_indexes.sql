-- Database Indexes for Performance Optimization
-- Add these indexes to improve query performance
-- Run this file against your database

-- ============================================
-- INDEXES FOR USERS TABLE
-- ============================================

-- Index for user login (username lookup)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Index for active user filtering
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Index for user search
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

-- ============================================
-- INDEXES FOR PRODUCTS TABLE
-- ============================================

-- Index for category-based queries
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);

-- Index for company-based queries
CREATE INDEX IF NOT EXISTS idx_products_company_id ON products(company_id);

-- Index for low stock alerts
CREATE INDEX IF NOT EXISTS idx_products_low_stock ON products(low_stock_alert);

-- Index for product code (unique lookups)
CREATE INDEX IF NOT EXISTS idx_products_code ON products(code);

-- Index for active product filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- ============================================
-- INDEXES FOR INVOICES TABLE
-- ============================================

-- Index for retailer-based invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_retailer_id ON invoices(retailer_id);

-- Index for company-based invoice queries
CREATE INDEX IF NOT EXISTS idx_invoices_company_id ON invoices(company_id);

-- Index for invoice date filtering
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);

-- Index for invoice status filtering
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- INDEXES FOR INVOICE_ITEMS TABLE
-- ============================================

-- Index for invoice item lookups
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Index for product-based invoice items
CREATE INDEX IF NOT EXISTS idx_invoice_items_product_id ON invoice_items(product_id);

-- ============================================
-- INDEXES FOR PAYMENTS TABLE
-- ============================================

-- Index for invoice payment queries
CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);

-- Index for payment date filtering
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);

-- ============================================
-- INDEXES FOR STOCK_LOGS TABLE
-- ============================================

-- Index for product stock history
CREATE INDEX IF NOT EXISTS idx_stock_logs_product_id ON stock_logs(product_id);

-- Index for stock log date filtering
CREATE INDEX IF NOT EXISTS idx_stock_logs_created_at ON stock_logs(created_at);

-- Index for stock type filtering (IN/OUT/ADJUSTMENT)
CREATE INDEX IF NOT EXISTS idx_stock_logs_type ON stock_logs(type);

-- ============================================
-- INDEXES FOR RETAILERS TABLE
-- ============================================

-- Index for area-based retailer queries
CREATE INDEX IF NOT EXISTS idx_retailers_area ON retailers(area);

-- Index for active retailer filtering
CREATE INDEX IF NOT EXISTS idx_retailers_is_active ON retailers(is_active);

-- ============================================
-- COMPOSITE INDEXES (Multi-column)
-- ============================================

-- For user search with pagination
CREATE INDEX IF NOT EXISTS idx_users_search ON users(full_name, is_active);

-- For product listings with category
CREATE INDEX IF NOT EXISTS idx_products_listing ON products(category_id, is_active);

-- For invoice reports by date range
CREATE INDEX IF NOT EXISTS idx_invoices_date_status ON invoices(invoice_date, status);

-- For stock history queries
CREATE INDEX IF NOT EXISTS idx_stock_logs_history ON stock_logs(product_id, created_at DESC);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- List all indexes in database
-- SHOW INDEX FROM users;
-- SHOW INDEX FROM products;
-- SHOW INDEX FROM invoices;
-- SHOW INDEX FROM stock_logs;

-- Check index usage (after queries run)
-- EXPLAIN SELECT * FROM users WHERE username = 'admin';
-- EXPLAIN SELECT * FROM products WHERE category_id = 1;
