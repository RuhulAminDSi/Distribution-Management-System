import { query, getConnection } from '../config/database.js';
import { generatePaymentNo, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import notificationService from './notificationService.js';

export const paymentService = {
  async findAll(page = 1, limit = 20, retailerId = null, startDate = null, endDate = null, search = '') {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('payments p')
      .select('p.*, r.name as retailer_name, u.full_name as collected_by_name')
      .join('retailers r', 'p.retailer_id = r.id')
      .join('users u', 'p.collected_by = u.id')
      .orderBy('p.id', 'DESC');

    if (retailerId) {
      builder.where('p.retailer_id', retailerId);
    }

    if (startDate) {
      builder.where('p.payment_date', '>=', startDate);
    }

    if (endDate) {
      builder.where('p.payment_date', '<=', endDate);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(p.payment_no LIKE ? OR r.name LIKE ? OR p.reference_no LIKE ?)', [searchTerm, searchTerm, searchTerm]);
    }

    return builder.paginate(page, limit);
  },

  async findById(id) {
    return new QueryBuilder('payments p')
      .select('p.*, r.name as retailer_name, u.full_name as collected_by_name')
      .join('retailers r', 'p.retailer_id = r.id')
      .join('users u', 'p.collected_by = u.id')
      .where('p.id', id)
      .first();
  },

  async create(data, userId) {
    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      const paymentNo = generatePaymentNo();
      const retailerId = parseInt(data.retailer_id);
      
      const retailerResult = await db.query('SELECT * FROM retailers WHERE id = ? AND is_active = 1', [retailerId]);
      const retailers = retailerResult.rows;
      if (!retailers.length) throw new Error('Retailer not found');

      const result = await db.query(
        `INSERT INTO payments (payment_no, retailer_id, amount, payment_method, reference_no, notes, collected_by, payment_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [paymentNo, retailerId, data.amount, data.payment_method || 'cash', data.reference_no || null, data.notes || null, userId, data.payment_date || new Date().toISOString().split('T')[0]]
      );
      const paymentId = result.rows[0].id;

      await db.query(
        'UPDATE retailers SET outstanding_balance = outstanding_balance - ? WHERE id = ?',
        [data.amount, retailerId]
      );

      if (data.invoice_id) {
        const invoiceResult = await db.query('SELECT * FROM invoices WHERE id = ?', [data.invoice_id]);
        const invoices = invoiceResult.rows;
        if (invoices.length) {
          const invoice = invoices[0];
          const newPaidAmount = invoice.paid_amount + data.amount;
          const newDueAmount = invoice.total_amount - newPaidAmount;
          const status = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due');
          
          await db.query(
            'UPDATE invoices SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?',
            [newPaidAmount, Math.max(0, newDueAmount), status, data.invoice_id]
          );
        }
      } else {
        const dueInvoiceResult = await db.query(
          `SELECT id, due_amount FROM invoices WHERE retailer_id = ? AND status IN ('due', 'partial') ORDER BY invoice_date ASC`,
          [retailerId]
        );
        const dueInvoices = dueInvoiceResult.rows;

        let remainingAmount = data.amount;
        for (const invoice of dueInvoices) {
          if (remainingAmount <= 0) break;
          
          const paymentForInvoice = Math.min(invoice.due_amount, remainingAmount);
          
          const invResult = await db.query('SELECT * FROM invoices WHERE id = ?', [invoice.id]);
          const inv = invResult.rows;
          if (inv.length) {
            const invoiceData = inv[0];
            const newPaidAmount = invoiceData.paid_amount + paymentForInvoice;
            const newDueAmount = invoiceData.total_amount - newPaidAmount;
            const invStatus = newDueAmount <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : 'due');
            
            await db.query(
              'UPDATE invoices SET paid_amount = ?, due_amount = ?, status = ? WHERE id = ?',
              [newPaidAmount, Math.max(0, newDueAmount), invStatus, invoice.id]
            );
          }
          remainingAmount -= paymentForInvoice;
        }
      }

      await db.commit();
      
      const createdPayment = await this.findById(paymentId);

      try {
        const notifyUsers = await query(
          `SELECT DISTINCT u.id FROM users u
           JOIN role_permissions rp ON u.role_id = rp.role_id
           WHERE rp.permission = 'payments_view' AND u.is_active = 1`
        );
        for (const userRow of notifyUsers) {
          await notificationService.notifyPaymentReceived(userRow.id, {
            id: paymentId,
            amount: data.amount,
            retailer_name: retailers[0].name,
            payment_method: data.payment_method || 'cash'
          });
        }
      } catch (notifError) {
        console.error('Failed to send payment notification:', notifError.message);
      }

      return createdPayment;
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
    }
  },

  async getRetailerPayments(retailerId) {
    return new QueryBuilder('payments p')
      .select('p.*, u.full_name as collected_by_name')
      .join('users u', 'p.collected_by = u.id')
      .where('p.retailer_id', retailerId)
      .orderBy('p.payment_date', 'DESC')
      .orderBy('p.id', 'DESC')
      .get();
  }
};
