import { query, getConnection } from '../config/database.js';
import { generateInvoiceNo, calculateDiscount, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { productService } from './productService.js';
import { retailerService } from './retailerService.js';

export const invoiceService = {
  async findAll(page = 1, limit = 20, retailerId = null, status = null, startDate = null, endDate = null) {
    let sql = `
      SELECT i.*, r.name as retailer_name, r.phone as retailer_phone, u.full_name as created_by_name
      FROM invoices i
      LEFT JOIN retailers r ON i.retailer_id = r.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (retailerId) {
      sql += ' AND i.retailer_id = ?';
      params.push(retailerId);
    }

    if (status) {
      sql += ' AND i.status = ?';
      params.push(status);
    }

    if (startDate) {
      sql += ' AND i.invoice_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND i.invoice_date <= ?';
      params.push(endDate);
    }

    const countSql = sql.replace(/SELECT i\.\*, r\.name as retailer_name, r\.phone as retailer_phone, u\.full_name as created_by_name/, 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    sql += ' ORDER BY i.id DESC LIMIT ? OFFSET ?';
    const { offset, limit: parsedLimit } = paginate(page, limit);
    params.push(parsedLimit, offset);

    const invoices = await query(sql, params);
    return buildPaginatedResponse(invoices, total, page, limit);
  },

  async findById(id) {
    const invoices = await query(`
      SELECT i.*, r.name as retailer_name, r.phone as retailer_phone, r.address as retailer_address, u.full_name as created_by_name
      FROM invoices i
      LEFT JOIN retailers r ON i.retailer_id = r.id
      LEFT JOIN users u ON i.created_by = u.id
      WHERE i.id = ?
    `, [id]);

    if (invoices.length === 0) return null;

    const invoice = invoices[0];
    const items = await query(`
      SELECT ii.*, p.name as product_name, p.code as product_code, p.unit
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = ?
    `, [id]);

    return { ...invoice, items };
  },

  async create(data, userId) {
    const db = getConnection();
    
    try {
      db.exec('BEGIN TRANSACTION');

      const invoiceNo = generateInvoiceNo();
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const discountAmount = calculateDiscount(subtotal, data.discount_percent || 0);
      const totalAmount = subtotal - discountAmount;

      const retailer = await retailerService.findById(data.retailer_id);
      if (!retailer) throw new Error('Retailer not found');

      const currentOutstanding = await retailerService.getBalance(data.retailer_id);
      const newOutstanding = (currentOutstanding.outstanding || 0) + totalAmount;
      
      if (newOutstanding > retailer.credit_limit && retailer.credit_limit > 0) {
        throw new Error('Credit limit exceeded');
      }

      const invoiceDate = data.invoice_date || new Date().toISOString().split('T')[0];
      const paidAmount = data.paid_amount || 0;
      const invoiceStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'due');

      db.prepare(
        `INSERT INTO invoices (invoice_no, retailer_id, created_by, subtotal, discount_percent, discount_amount, total_amount, paid_amount, due_amount, status, notes, invoice_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(invoiceNo, data.retailer_id, userId, subtotal, data.discount_percent || 0, discountAmount, totalAmount, paidAmount, totalAmount - paidAmount, invoiceStatus, data.notes || null, invoiceDate);

      const insertId = db.prepare('SELECT last_insert_rowid() as id').get().id;

      for (const item of data.items) {
        const product = db.prepare('SELECT stock_quantity FROM products WHERE id = ?').get(item.product_id);
        
        if (!product) throw new Error(`Product not found: ${item.product_id}`);
        if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for product: ${item.product_id}`);

        db.prepare(
          'INSERT INTO invoice_items (invoice_id, product_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)'
        ).run(insertId, item.product_id, item.quantity, item.rate, item.quantity * item.rate);

        db.prepare(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?'
        ).run(item.quantity, item.product_id);

        db.prepare(
          'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, created_by) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(item.product_id, -item.quantity, 'OUT', 'invoice', insertId, userId);
      }

      if (paidAmount > 0) {
        db.prepare(
          'UPDATE retailers SET outstanding_balance = outstanding_balance + ? WHERE id = ?'
        ).run(totalAmount - paidAmount, data.retailer_id);
      } else {
        db.prepare(
          'UPDATE retailers SET outstanding_balance = outstanding_balance + ? WHERE id = ?'
        ).run(totalAmount, data.retailer_id);
      }

      db.exec('COMMIT');
      return this.findById(insertId);
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  },

  async updatePayment(id, paidAmount, userId) {
    const invoice = await this.findById(id);
    if (!invoice) throw new Error('Invoice not found');

    const newPaidAmount = invoice.paid_amount + paidAmount;
    const newDueAmount = invoice.total_amount - newPaidAmount;
    const status = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due');

    await query(
      'UPDATE invoices SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?',
      [newPaidAmount, Math.max(0, newDueAmount), status, id]
    );

    await retailerService.updateOutstanding(invoice.retailer_id, -paidAmount);

    return this.findById(id);
  }
};
