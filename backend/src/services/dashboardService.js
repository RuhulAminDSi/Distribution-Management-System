import { query } from '../config/database.js';

export const dashboardService = {
  async getSummary() {
    const today = new Date().toISOString().split('T')[0];

    const todaySales = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(due_amount), 0) as total_due
      FROM invoices 
      WHERE invoice_date = ?
    `, [today]);

    const allTimeSales = await query(`
      SELECT 
        COUNT(*) as total_invoices,
        COALESCE(SUM(total_amount), 0) as total_amount,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(due_amount), 0) as total_due
      FROM invoices 
    `);

    const totalOutstanding = await query(`
      SELECT COALESCE(SUM(outstanding_balance), 0) as total
      FROM retailers WHERE is_active = 1
    `);

    const totalProducts = await query(`
      SELECT COUNT(*) as total FROM products WHERE is_active = 1
    `);

    const lowStock = await query(`
      SELECT COUNT(*) as total FROM products 
      WHERE is_active = 1 AND stock_quantity <= low_stock_alert
    `);

    const todayInvoices = await query(`
      SELECT 
        i.id,
        i.invoice_no,
        i.total_amount,
        i.status,
        r.name as retailer_name
      FROM invoices i
      LEFT JOIN retailers r ON i.retailer_id = r.id
      WHERE i.invoice_date = ?
      ORDER BY i.id DESC
      LIMIT 10
    `, [today]);

    const lowStockProducts = await query(`
      SELECT id, name, code, stock_quantity, low_stock_alert, unit
      FROM products
      WHERE is_active = 1 AND stock_quantity <= low_stock_alert
      ORDER BY stock_quantity ASC
      LIMIT 10
    `);

    const monthlySales = await query(`
      SELECT 
        DATE_FORMAT(invoice_date, '%Y-%m') as month,
        SUM(total_amount) as total,
        COUNT(*) as count
      FROM invoices
      WHERE invoice_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(invoice_date, '%Y-%m')
      ORDER BY month ASC
    `);

    return {
      today: {
        totalInvoices: todaySales[0]?.total_invoices || 0,
        totalSales: todaySales[0]?.total_amount || 0,
        totalCollected: todaySales[0]?.total_collected || 0,
        totalDue: todaySales[0]?.total_due || 0
      },
      allTime: {
        totalInvoices: allTimeSales[0]?.total_invoices || 0,
        totalSales: allTimeSales[0]?.total_amount || 0,
        totalCollected: allTimeSales[0]?.total_collected || 0
      },
      totalOutstanding: totalOutstanding[0]?.total || 0,
      totalProducts: totalProducts[0]?.total || 0,
      lowStockCount: lowStock[0]?.total || 0,
      recentInvoices: todayInvoices,
      lowStockProducts,
      monthlySales
    };
  }
};
