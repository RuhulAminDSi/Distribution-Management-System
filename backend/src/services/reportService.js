import { query } from '../config/database.js';

export const reportService = {
  async getReportSummary(startDate, endDate) {
    const dailySalesSummary = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(due_amount), 0) as total_due
      FROM invoices 
      WHERE invoice_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    const productSalesSummary = await query(`
      SELECT 
        COUNT(DISTINCT p.id) as total_products,
        COALESCE(SUM(ii.quantity), 0) as total_quantity,
        COALESCE(SUM(ii.amount), 0) as total_amount
      FROM invoice_items ii
      JOIN invoices i ON ii.invoice_id = i.id
      JOIN products p ON ii.product_id = p.id
      WHERE i.invoice_date BETWEEN ? AND ?
    `, [startDate, endDate]);

    const companySalesSummary = await query(`
      SELECT 
        COUNT(DISTINCT comp.id) as total_companies,
        COALESCE(SUM(ii.amount), 0) as total_sales
      FROM companies comp
      LEFT JOIN products p ON p.company_id = comp.id
      LEFT JOIN invoice_items ii ON ii.product_id = p.id
      LEFT JOIN invoices i ON ii.invoice_id = i.id AND i.invoice_date BETWEEN ? AND ?
      WHERE comp.is_active = 1
    `, [startDate, endDate]);

    const profitSummary = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE((
          SELECT SUM(ii.quantity * p.purchase_price)
          FROM invoice_items ii
          JOIN products p ON ii.product_id = p.id
          JOIN invoices i ON ii.invoice_id = i.id
          WHERE i.invoice_date BETWEEN ? AND ?
        ), 0) as total_cost,
        COALESCE(SUM(total_amount), 0) - COALESCE((
          SELECT SUM(ii.quantity * p.purchase_price)
          FROM invoice_items ii
          JOIN products p ON ii.product_id = p.id
          JOIN invoices i ON ii.invoice_id = i.id
          WHERE i.invoice_date BETWEEN ? AND ?
        ), 0) as total_profit
      FROM invoices
      WHERE invoice_date BETWEEN ? AND ?
    `, [startDate, endDate, startDate, endDate, startDate, endDate]);

    const stockSummary = await query(`
      SELECT 
        COUNT(*) as total_products,
        COALESCE(SUM(stock_quantity), 0) as total_quantity,
        COALESCE(SUM(stock_quantity * dealer_price), 0) as stock_value
      FROM products 
      WHERE is_active = 1
    `);

    const dueSummary = await query(`
      SELECT 
        COUNT(DISTINCT r.id) as total_retailers,
        COALESCE(SUM(i.due_amount), 0) as total_due
      FROM retailers r
      LEFT JOIN invoices i ON r.id = i.retailer_id AND i.status IN ('due', 'partial')
      WHERE r.is_active = 1 AND r.outstanding_balance > 0
    `);

    const expirySummary = await query(`
      SELECT 
        COUNT(*) as total_products,
        COUNT(CASE WHEN expiry_date < CURDATE() THEN 1 END) as expired,
        COUNT(CASE WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 END) as expiring_soon
      FROM products 
      WHERE is_active = 1 AND expiry_date IS NOT NULL AND stock_quantity > 0
    `);

    return {
      daily: {
        totalInvoices: dailySalesSummary[0]?.total_invoices || 0,
        totalAmount: dailySalesSummary[0]?.total_amount || 0,
        totalCollected: dailySalesSummary[0]?.total_collected || 0,
        totalDue: dailySalesSummary[0]?.total_due || 0
      },
      product: {
        totalProducts: productSalesSummary[0]?.total_products || 0,
        totalQuantity: productSalesSummary[0]?.total_quantity || 0,
        totalAmount: productSalesSummary[0]?.total_amount || 0
      },
      company: {
        totalCompanies: companySalesSummary[0]?.total_companies || 0,
        totalSales: companySalesSummary[0]?.total_sales || 0
      },
      profit: {
        totalInvoices: profitSummary[0]?.total_invoices || 0,
        totalSales: profitSummary[0]?.total_sales || 0,
        totalCost: profitSummary[0]?.total_cost || 0,
        totalProfit: profitSummary[0]?.total_profit || 0
      },
      stock: {
        totalProducts: stockSummary[0]?.total_products || 0,
        totalQuantity: stockSummary[0]?.total_quantity || 0,
        stockValue: stockSummary[0]?.stock_value || 0
      },
      due: {
        totalRetailers: dueSummary[0]?.total_retailers || 0,
        totalDue: dueSummary[0]?.total_due || 0
      },
      expiry: {
        totalProducts: expirySummary[0]?.total_products || 0,
        expired: expirySummary[0]?.expired || 0,
        expiringSoon: expirySummary[0]?.expiring_soon || 0
      }
    };
  },

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
  },

  async expiryReport() {
    const sql = `
      SELECT 
        p.*,
        c.name as category_name,
        comp.name as company_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN companies comp ON p.company_id = comp.id
      WHERE p.is_active = 1 AND p.expiry_date IS NOT NULL AND p.stock_quantity > 0
      ORDER BY p.expiry_date ASC
    `;
    const data = await query(sql);
    return { data, total: data.length };
  }
};
