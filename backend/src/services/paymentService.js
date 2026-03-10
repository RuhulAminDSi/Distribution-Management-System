import { query, getConnection } from '../config/database.js';
import { generatePaymentNo, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { retailerService } from './retailerService.js';
import { invoiceService } from './invoiceService.js';

export const paymentService = {
  async findAll(page = 1, limit = 20, retailerId = null, startDate = null, endDate = null) {
    let sql = `
      SELECT p.*, r.name as retailer_name, u.full_name as collected_by_name
      FROM payments p
      LEFT JOIN retailers r ON p.retailer_id = r.id
      LEFT JOIN users u ON p.collected_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (retailerId) {
      sql += ' AND p.retailer_id = ?';
      params.push(retailerId);
    }

    if (startDate) {
      sql += ' AND p.payment_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND p.payment_date <= ?';
      params.push(endDate);
    }

    const countSql = sql.replace(/SELECT p\.\*, r\.name as retailer_name, u\.full_name as collected_by_name/, 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    const { offset, limit: parsedLimit } = paginate(page, limit);
    params.push(parsedLimit, offset);

    const payments = await query(sql, params);
    return buildPaginatedResponse(payments, total, page, limit);
  },

  async findById(id) {
    const payments = await query(`
      SELECT p.*, r.name as retailer_name, u.full_name as collected_by_name
      FROM payments p
      LEFT JOIN retailers r ON p.retailer_id = r.id
      LEFT JOIN users u ON p.collected_by = u.id
      WHERE p.id = ?
    `, [id]);
    return payments[0] || null;
  },

  async create(data, userId) {
    const db = getConnection();
    
    try {
      db.exec('BEGIN TRANSACTION');

      const paymentNo = generatePaymentNo();
      const retailer = await retailerService.findById(data.retailer_id);
      if (!retailer) throw new Error('Retailer not found');

      db.prepare(
        `INSERT INTO payments (payment_no, retailer_id, amount, payment_method, reference_no, notes, collected_by, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(paymentNo, data.retailer_id, data.amount, data.payment_method || 'cash', data.reference_no || null, data.notes || null, userId, data.payment_date || new Date().toISOString().split('T')[0]);

      await retailerService.updateOutstanding(data.retailer_id, -data.amount);

      if (data.invoice_id) {
        await invoiceService.updatePayment(data.invoice_id, data.amount, userId);
      } else {
        const dueInvoices = db.prepare(
          `SELECT id, due_amount FROM invoices WHERE retailer_id = ? AND status IN ('due', 'partial') ORDER BY invoice_date ASC`
        ).all(data.retailer_id);

        let remainingAmount = data.amount;
        for (const invoice of dueInvoices) {
          if (remainingAmount <= 0) break;
          
          const paymentForInvoice = Math.min(invoice.due_amount, remainingAmount);
          await invoiceService.updatePayment(invoice.id, paymentForInvoice, userId);
          remainingAmount -= paymentForInvoice;
        }
      }

      db.exec('COMMIT');
      
      const payments = await query('SELECT last_insert_rowid() as id');
      return this.findById(payments[0].id);
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  },

  async getRetailerPayments(retailerId) {
    return query(`
      SELECT p.*, u.full_name as collected_by_name
      FROM payments p
      LEFT JOIN users u ON p.collected_by = u.id
      WHERE p.retailer_id = ?
      ORDER BY p.payment_date DESC, p.id DESC
    `, [retailerId]);
  }
};
