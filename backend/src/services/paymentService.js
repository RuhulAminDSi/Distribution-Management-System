import { query, getConnection } from '../config/database.js';
import { generatePaymentNo, buildPaginatedResponse, paginate } from '../utils/helpers.js';

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
    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      const paymentNo = generatePaymentNo();
      const retailerId = parseInt(data.retailer_id);
      
      const [retailers] = await db.execute('SELECT * FROM retailers WHERE id = ? AND is_active = 1', [retailerId]);
      if (!retailers.length) throw new Error('Retailer not found');

      const [result] = await db.execute(
        `INSERT INTO payments (payment_no, retailer_id, amount, payment_method, reference_no, notes, collected_by, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [paymentNo, retailerId, data.amount, data.payment_method || 'cash', data.reference_no || null, data.notes || null, userId, data.payment_date || new Date().toISOString().split('T')[0]]
      );
      const paymentId = result.insertId;

      await db.execute(
        'UPDATE retailers SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
        [data.amount, retailerId]
      );

      if (data.invoice_id) {
        const [invoices] = await db.execute('SELECT * FROM invoices WHERE id = ?', [data.invoice_id]);
        if (invoices.length) {
          const invoice = invoices[0];
          const newPaidAmount = invoice.paid_amount + data.amount;
          const newDueAmount = invoice.total_amount - newPaidAmount;
          const status = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due');
          
          await db.execute(
            'UPDATE invoices SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?',
            [newPaidAmount, Math.max(0, newDueAmount), status, data.invoice_id]
          );
        }
      } else {
        const [dueInvoices] = await db.execute(
          `SELECT id, due_amount FROM invoices WHERE retailer_id = ? AND status IN ('due', 'partial') ORDER BY invoice_date ASC`,
          [retailerId]
        );

        let remainingAmount = data.amount;
        for (const invoice of dueInvoices) {
          if (remainingAmount <= 0) break;
          
          const paymentForInvoice = Math.min(invoice.due_amount, remainingAmount);
          
          const [inv] = await db.execute('SELECT * FROM invoices WHERE id = ?', [invoice.id]);
          if (inv.length) {
            const invoiceData = inv[0];
            const newPaidAmount = invoiceData.paid_amount + paymentForInvoice;
            const newDueAmount = invoiceData.total_amount - newPaidAmount;
            const invStatus = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due');
            
            await db.execute(
              'UPDATE invoices SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?',
              [newPaidAmount, Math.max(0, newDueAmount), invStatus, invoice.id]
            );
          }
          remainingAmount -= paymentForInvoice;
        }
      }

      await db.commit();
      
      return this.findById(paymentId);
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
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
