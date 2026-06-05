import { query } from '../config/database.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const reportService = {
  async getReportSummary(startDate, endDate) {
    // Daily sales summary
    const dailySalesSummary = await new QueryBuilder('invoices')
      .select('COUNT(*) as total_invoices, COALESCE(SUM(total_amount), 0) as total_amount, COALESCE(SUM(paid_amount), 0) as total_collected, COALESCE(SUM(due_amount), 0) as total_due')
      .whereRaw('invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .first();

    // Product sales summary
    const productSalesSummary = await new QueryBuilder('invoice_items ii')
      .select('COUNT(DISTINCT p.id) as total_products, COALESCE(SUM(ii.quantity), 0) as total_quantity, COALESCE(SUM(ii.amount), 0) as total_amount')
      .innerJoin('invoices i', 'ii.invoice_id = i.id')
      .innerJoin('products p', 'ii.product_id = p.id')
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .first();

    // Company sales summary  
    const companySalesSummary = await new QueryBuilder('companies comp')
      .select('COUNT(DISTINCT comp.id) as total_companies, COALESCE(SUM(ii.amount), 0) as total_sales')
      .join('products p', 'p.company_id = comp.id')
      .join('invoice_items ii', 'ii.product_id = p.id')
      .join('invoices i', 'ii.invoice_id = i.id')
      .where('comp.is_active', 1)
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .first();

    // Stock summary
    const stockSummary = await new QueryBuilder('products')
      .select('COUNT(*) as total_products, COALESCE(SUM(stock_quantity), 0) as total_quantity, COALESCE(SUM(stock_quantity * dealer_price), 0) as stock_value')
      .where('is_active', 1)
      .first();

    // Due summary — uses invoice due_amounts (not cached column)
    const dueSummary = await new QueryBuilder('invoices i')
      .select('COUNT(DISTINCT i.retailer_id) as total_retailers, COALESCE(SUM(i.due_amount), 0) as total_due')
      .join('retailers r', 'i.retailer_id = r.id')
      .where('r.is_active', 1)
      .whereRaw("i.status IN ('due', 'partial')", [])
      .first();

    // Expiry summary
    const expirySummary = await new QueryBuilder('products')
      .select("COUNT(*) as total_products, COUNT(CASE WHEN expiry_date < CURRENT_DATE THEN 1 END) as expired, COUNT(CASE WHEN expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days' THEN 1 END) as expiring_soon")
      .where('is_active', 1)
      .whereRaw('expiry_date IS NOT NULL AND stock_quantity > 0', [])
      .first();

    // Profit summary (complex query - use raw)
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

    return {
      daily: {
        totalInvoices: dailySalesSummary?.total_invoices || 0,
        totalAmount: dailySalesSummary?.total_amount || 0,
        totalCollected: dailySalesSummary?.total_collected || 0,
        totalDue: dailySalesSummary?.total_due || 0
      },
      product: {
        totalProducts: productSalesSummary?.total_products || 0,
        totalQuantity: productSalesSummary?.total_quantity || 0,
        totalAmount: productSalesSummary?.total_amount || 0
      },
      company: {
        totalCompanies: companySalesSummary?.total_companies || 0,
        totalSales: companySalesSummary?.total_sales || 0
      },
      profit: {
        totalInvoices: profitSummary[0]?.total_invoices || 0,
        totalSales: profitSummary[0]?.total_sales || 0,
        totalCost: profitSummary[0]?.total_cost || 0,
        totalProfit: profitSummary[0]?.total_profit || 0
      },
      stock: {
        totalProducts: stockSummary?.total_products || 0,
        totalQuantity: stockSummary?.total_quantity || 0,
        stockValue: stockSummary?.stock_value || 0
      },
      due: {
        totalRetailers: dueSummary?.total_retailers || 0,
        totalDue: dueSummary?.total_due || 0
      },
      expiry: {
        totalProducts: expirySummary?.total_products || 0,
        expired: expirySummary?.expired || 0,
        expiringSoon: expirySummary?.expiring_soon || 0
      }
    };
  },

  async dailySales(startDate, endDate, page = 1, limit = 20) {
    const result = await new QueryBuilder('invoices i')
      .select('i.id, i.invoice_no, i.invoice_date, r.name as retailer_name, i.total_amount, i.paid_amount, i.due_amount, i.status, u.full_name as created_by')
      .join('retailers r', 'i.retailer_id = r.id')
      .join('users u', 'i.created_by = u.id')
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .orderBy('i.invoice_date', 'DESC')
      .orderBy('i.id', 'DESC')
      .paginate(page, limit);

    return result;
  },

  async productSales(startDate, endDate, productId = null, page = 1, limit = 20) {
    let builder = new QueryBuilder('invoice_items ii')
      .select('p.id as product_id, p.name as product_name, p.code as product_code, c.name as category_name, comp.name as company_name, SUM(ii.quantity) as total_quantity, SUM(ii.amount) as total_amount, COUNT(DISTINCT ii.invoice_id) as invoice_count')
      .innerJoin('products p', 'ii.product_id = p.id')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .innerJoin('invoices i', 'ii.invoice_id = i.id')
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .groupBy('p.id, p.name, p.code, c.name, comp.name')
      .orderBy('total_quantity', 'DESC');

    if (productId) {
      builder.where('p.id', productId);
    }

    return builder.paginate(page, limit);
  },

  async companySales(startDate, endDate, page = 1, limit = 20) {
    const result = await new QueryBuilder('companies comp')
      .select('comp.id as company_id, comp.name as company_name, COUNT(DISTINCT ii.invoice_id) as total_invoices, SUM(ii.quantity) as total_quantity, SUM(ii.amount) as total_sales, SUM((ii.rate - p.purchase_price) * ii.quantity) as total_profit')
      .join('products p', 'p.company_id = comp.id')
      .join('invoice_items ii', 'ii.product_id = p.id')
      .join('invoices i', 'ii.invoice_id = i.id')
      .where('comp.is_active', 1)
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .groupBy('comp.id')
      .orderBy('total_sales', 'DESC')
      .paginate(page, limit);

    return result;
  },

  async profitReport(startDate, endDate, page = 1, limit = 20) {
    const result = await new QueryBuilder('invoices i')
      .select('i.id as invoice_id, i.invoice_no, i.invoice_date, r.name as retailer_name, i.total_amount as sales_amount, COALESCE((SELECT SUM(ii.quantity * p.purchase_price) FROM invoice_items ii JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = i.id), 0) as cost_amount, i.total_amount - COALESCE((SELECT SUM(ii.quantity * p.purchase_price) FROM invoice_items ii JOIN products p ON ii.product_id = p.id WHERE ii.invoice_id = i.id), 0) as profit, i.discount_amount')
      .join('retailers r', 'i.retailer_id = r.id')
      .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
      .orderBy('i.invoice_date', 'DESC')
      .orderBy('i.id', 'DESC')
      .paginate(page, limit);

    return result;
  },

  async stockReport(page = 1, limit = 20) {
    const result = await new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name, p.stock_quantity * p.dealer_price as stock_value, p.stock_quantity * (p.dealer_price - p.purchase_price) as potential_profit')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .orderBy('p.stock_quantity', 'ASC')
      .orderBy('p.name', 'ASC')
      .paginate(page, limit);

    return result;
  },

  async dueReport(page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    const countResult = await QueryBuilder.raw(`
      SELECT COUNT(*) as total FROM (
        SELECT r.id
        FROM retailers r
        LEFT JOIN invoices i ON r.id = i.retailer_id AND i.status IN ('due', 'partial')
        WHERE r.is_active = 1
        GROUP BY r.id
        HAVING COALESCE(SUM(i.due_amount), 0) > 0
      ) sub
    `);
    const total = countResult[0]?.total || 0;

    const data = await QueryBuilder.raw(`
      SELECT r.id as retailer_id, r.name as retailer_name, r.phone, r.address, r.area,
        r.credit_limit, r.due_limit,
        COALESCE(SUM(i.due_amount), 0) as outstanding_balance,
        COUNT(i.id) as total_invoices,
        COALESCE(SUM(i.due_amount), 0) as total_due
      FROM retailers r
      LEFT JOIN invoices i ON r.id = i.retailer_id AND i.status IN ('due', 'partial')
      WHERE r.is_active = 1
      GROUP BY r.id
      HAVING COALESCE(SUM(i.due_amount), 0) > 0
      ORDER BY outstanding_balance DESC
      LIMIT ? OFFSET ?
    `, [limitNum, offset]);

    const pages = Math.ceil(total / limitNum);

    return { data, total, page: pageNum, limit: limitNum, pages, hasMore: pageNum < pages };
  },

  async expiryReport() {
    const data = await new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .whereRaw('p.expiry_date IS NOT NULL AND p.stock_quantity > 0', [])
      .orderBy('p.expiry_date', 'ASC')
      .get();

    return { data, total: data.length };
  }
};
