import { query } from '../config/database.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const dashboardService = {
  async getSummary() {
    const today = new Date().toISOString().split('T')[0];

    // Today's sales using QueryBuilder
    const todaySales = await new QueryBuilder('invoices')
      .select('COUNT(*) as total_invoices, COALESCE(SUM(total_amount), 0) as total_amount, COALESCE(SUM(paid_amount), 0) as total_collected, COALESCE(SUM(due_amount), 0) as total_due')
      .where('invoice_date', today)
      .first();

    // All time sales using QueryBuilder
    const allTimeSales = await new QueryBuilder('invoices')
      .select('COUNT(*) as total_invoices, COALESCE(SUM(total_amount), 0) as total_amount, COALESCE(SUM(paid_amount), 0) as total_collected, COALESCE(SUM(due_amount), 0) as total_due')
      .first();

    // Outstanding balance using QueryBuilder
    const totalOutstanding = await new QueryBuilder('retailers')
      .select('COALESCE(SUM(outstanding_balance), 0) as total')
      .where('is_active', 1)
      .first();

    // Total products using QueryBuilder
    const totalProducts = await new QueryBuilder('products')
      .select('COUNT(*) as total')
      .where('is_active', 1)
      .first();

    // Low stock count using QueryBuilder
    const lowStock = await new QueryBuilder('products')
      .select('COUNT(*) as total')
      .where('is_active', 1)
      .whereRaw('stock_quantity <= low_stock_alert', [])
      .first();

    // Today's invoices using QueryBuilder
    const todayInvoices = await new QueryBuilder('invoices i')
      .select('i.id, i.invoice_no, i.total_amount, i.status, r.name as retailer_name')
      .join('retailers r', 'i.retailer_id = r.id')
      .where('i.invoice_date', today)
      .orderBy('i.id', 'DESC')
      .limit(10)
      .get();

    // Low stock products using QueryBuilder
    const lowStockProducts = await new QueryBuilder('products')
      .select('id, name, code, stock_quantity, low_stock_alert, unit')
      .where('is_active', 1)
      .whereRaw('stock_quantity <= low_stock_alert', [])
      .orderBy('stock_quantity', 'ASC')
      .limit(10)
      .get();

    // Monthly sales (raw query for complex GROUP BY)
    const monthlySales = await query(`
      SELECT 
        TO_CHAR(invoice_date, 'YYYY-MM') as month,
        SUM(total_amount) as total,
        COUNT(*) as count
      FROM invoices
      WHERE invoice_date >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(invoice_date, 'YYYY-MM')
      ORDER BY month ASC
    `);

    return {
      today: {
        totalInvoices: todaySales?.total_invoices || 0,
        totalSales: todaySales?.total_amount || 0,
        totalCollected: todaySales?.total_collected || 0,
        totalDue: todaySales?.total_due || 0
      },
      allTime: {
        totalInvoices: allTimeSales?.total_invoices || 0,
        totalSales: allTimeSales?.total_amount || 0,
        totalCollected: allTimeSales?.total_collected || 0
      },
      totalOutstanding: totalOutstanding?.total || 0,
      totalProducts: totalProducts?.total || 0,
      lowStockCount: lowStock?.total || 0,
      recentInvoices: todayInvoices,
      lowStockProducts,
      monthlySales
    };
  }
};
