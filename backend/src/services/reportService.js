import { query } from '../config/database.js';

export const reportService = {
  async dailySales(startDate, endDate, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        i.id,
        i.invoice_no,
        i.invoice_date,
        r.name as retailer_name,
        i.total_amount,
        i.paid_amount,
        i.due_amount,
        i.status,
        u.full_name as created_by
      FROM invoices i
      LEFT JOIN retailers r ON i.retailer_id = r.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.invoice_date BETWEEN ? AND ?
      ORDER BY i.invoice_date DESC, i.id DESC
      LIMIT ? OFFSET ?
    `;
    const data = await query(sql, [startDate, endDate, limit, offset]);
    const countSql = `
      SELECT COUNT(*) as total FROM invoices WHERE invoice_date BETWEEN ? AND ?
    `;
    const countResult = await query(countSql, [startDate, endDate]);
    return { data, total: countResult[0]?.total || 0 };
  },

  async productSales(startDate, endDate, productId = null, page = 1, limit = 20) {
    let sql = `
      SELECT 
        p.id as product_id,
        p.name as product_name,
        p.code as product_code,
        c.name as category_name,
        comp.name as company_name,
        SUM(ii.quantity) as total_quantity,
        SUM(ii.amount) as total_amount,
        COUNT(DISTINCT ii.invoice_id) as invoice_count
      FROM invoice_items ii
      JOIN products p ON ii.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.invoice_date BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (productId) {
      sql += ' AND p.id = ?';
      params.push(productId);
    }

    const countSql = sql.replace('SELECT \n        p.id as product_id,', 'SELECT COUNT(DISTINCT p.id) as total,');
    const countResult = await query(countSql.slice(0, countSql.indexOf('GROUP BY')), params);
    
    const offset = (page - 1) * limit;
    sql += ` GROUP BY p.id ORDER BY total_quantity DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    const data = await query(sql, params);
    return { data, total: countResult[0]?.total || 0 };
  },

  async companySales(startDate, endDate, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        comp.id as company_id,
        comp.name as company_name,
        COUNT(DISTINCT ii.invoice_id) as total_invoices,
        SUM(ii.quantity) as total_quantity,
        SUM(ii.amount) as total_sales,
        SUM((ii.rate - p.purchase_price) * ii.quantity) as total_profit
      FROM companies comp
      LEFT JOIN products p ON p.company_id = comp.id
      LEFT JOIN invoice_items ii ON ii.product_id = p.id
      LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.invoice_date BETWEEN ? AND ?
      WHERE comp.is_active = 1
      GROUP BY comp.id
      ORDER BY total_sales DESC
      LIMIT ? OFFSET ?
    `;
    const data = await query(sql, [startDate, endDate, limit, offset]);
    const countSql = `
      SELECT COUNT(DISTINCT comp.id) as total FROM companies comp WHERE comp.is_active = 1
    `;
    const countResult = await query(countSql);
    return { data, total: countResult[0]?.total || 0 };
  },

  async profitReport(startDate, endDate, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        i.id as invoice_id,
        i.invoice_no,
        i.invoice_date,
        r.name as retailer_name,
        i.total_amount as sales_amount,
        COALESCE((
          SELECT SUM(ii.quantity * p.purchase_price)
          FROM invoice_items ii
          JOIN products p ON ii.product_id = p.id
          WHERE ii.invoice_id = i.id
        ), 0) as cost_amount,
        i.total_amount - COALESCE((
          SELECT SUM(ii.quantity * p.purchase_price)
          FROM invoice_items ii
          JOIN products p ON ii.product_id = p.id
          WHERE ii.invoice_id = i.id
        ), 0) as profit,
        i.discount_amount
      FROM invoices i
      LEFT JOIN retailers r ON i.retailer_id = r.id
      WHERE i.invoice_date BETWEEN ? AND ?
      ORDER BY i.invoice_date DESC, i.id DESC
      LIMIT ? OFFSET ?
    `;
    const data = await query(sql, [startDate, endDate, limit, offset]);
    const countSql = `
      SELECT COUNT(*) as total FROM invoices WHERE invoice_date BETWEEN ? AND ?
    `;
    const countResult = await query(countSql, [startDate, endDate]);
    return { data, total: countResult[0]?.total || 0 };
  },

  async stockReport(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        comp.name as company_name,
        p.stock_quantity * p.dealer_price as stock_value,
        p.stock_quantity * (p.dealer_price - p.purchase_price) as potential_profit
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      WHERE p.is_active = 1
      ORDER BY p.stock_quantity ASC, p.name ASC
      LIMIT ? OFFSET ?
    `;
    const data = await query(sql, [limit, offset]);
    const countSql = `SELECT COUNT(*) as total FROM products WHERE is_active = 1`;
    const countResult = await query(countSql);
    return { data, total: countResult[0]?.total || 0 };
  },

  async dueReport(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT 
        r.id as retailer_id,
        r.name as retailer_name,
        r.phone,
        r.address,
        r.area,
        r.credit_limit,
        r.due_limit,
        r.outstanding_balance,
        COUNT(i.id) as total_invoices,
        COALESCE(SUM(i.due_amount), 0) as total_due
      FROM retailers r
      LEFT JOIN invoices i ON r.id = i.retailer_id AND i.status IN ('due', 'partial')
      WHERE r.is_active = 1 AND r.outstanding_balance > 0
      GROUP BY r.id
      ORDER BY r.outstanding_balance DESC
      LIMIT ? OFFSET ?
    `;
    const data = await query(sql, [limit, offset]);
    const countSql = `
      SELECT COUNT(*) as total FROM retailers WHERE is_active = 1 AND outstanding_balance > 0
    `;
    const countResult = await query(countSql);
    return { data, total: countResult[0]?.total || 0 };
  }
};
