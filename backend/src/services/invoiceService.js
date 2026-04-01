import { query, getConnection } from '../config/database.js';
import { generateInvoiceNo, calculateDiscount, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';
import { productService } from './productService.js';
import { retailerService } from './retailerService.js';

export const invoiceService = {
  async findAll(page = 1, limit = 20, retailerId = null, status = null, startDate = null, endDate = null, search = '') {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('invoices i')
      .select('i.*, r.name as retailer_name, r.phone as retailer_phone, u.full_name as created_by_name')
      .join('retailers r', 'i.retailer_id = r.id')
      .join('users u', 'i.created_by = u.id')
      .orderBy('i.id', 'DESC');

    if (retailerId) {
      builder.where('i.retailer_id', retailerId);
    }

    if (status) {
      builder.where('i.status', status);
    }

    if (startDate) {
      builder.where('i.invoice_date', '>=', startDate);
    }

    if (endDate) {
      builder.where('i.invoice_date', '<=', endDate);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(i.invoice_no LIKE ? OR r.name LIKE ?)', [searchTerm, searchTerm]);
    }

    return builder.paginate(page, limit);
  },

  async findById(id) {
    // Get invoice with details
    const invoice = await new QueryBuilder('invoices i')
      .select('i.*, r.name as retailer_name, r.phone as retailer_phone, r.address as retailer_address, u.full_name as created_by_name')
      .join('retailers r', 'i.retailer_id = r.id')
      .join('users u', 'i.created_by = u.id')
      .where('i.id', id)
      .first();

    if (!invoice) return null;

    // Get invoice items with product details
    const items = await new QueryBuilder('invoice_items ii')
      .select('ii.*, p.name as product_name, p.code as product_code, p.unit')
      .join('products p', 'ii.product_id = p.id')
      .where('ii.invoice_id', id)
      .get();

    return { ...invoice, items };
  },

  async create(data, userId) {
    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      const invoiceNo = generateInvoiceNo();
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      const discountAmount = calculateDiscount(subtotal, data.discount_percent || 0);
      const totalAmount = subtotal - discountAmount;

      const retailer = await retailerService.findById(data.retailer_id);
      if (!retailer) throw new Error('Retailer not found');

      const currentOutstanding = await retailerService.getBalance(data.retailer_id);
      const newOutstanding = (currentOutstanding.outstanding || 0) + totalAmount;
      
      // Credit limit check - only if credit_limit is explicitly set (> 0)
      const creditLimit = parseFloat(retailer.credit_limit) || 0;
      if (creditLimit > 0 && newOutstanding > creditLimit) {
        throw new Error('Credit limit exceeded. Available: ' + (creditLimit - newOutstanding + totalAmount));
      }

      const invoiceDate = data.invoice_date || new Date().toISOString().split('T')[0];
      const paidAmount = data.paid_amount || 0;
      const invoiceStatus = paidAmount >= totalAmount ? 'paid' : (paidAmount > 0 ? 'partial' : 'due');

      const [result] = await db.execute(
        `INSERT INTO invoices (invoice_no, retailer_id, created_by, subtotal, discount_percent, discount_amount, total_amount, paid_amount, due_amount, status, notes, invoice_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [invoiceNo, data.retailer_id, userId, subtotal, data.discount_percent || 0, discountAmount, totalAmount, paidAmount, totalAmount - paidAmount, invoiceStatus, data.notes || null, invoiceDate]
      );
      const insertId = result.insertId;

      for (const item of data.items) {
        const [productRows] = await db.execute('SELECT stock_quantity FROM products WHERE id = ?', [item.product_id]);
        const product = productRows[0];
        
        if (!product) throw new Error(`Product not found: ${item.product_id}`);
        if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for product: ${item.product_id}`);

        await db.execute(
          'INSERT INTO invoice_items (invoice_id, product_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
          [insertId, item.product_id, item.quantity, item.rate, item.quantity * item.rate]
        );

        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );

        await db.execute(
          'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, created_by) VALUES (?, ?, ?, ?, ?, ?)',
          [item.product_id, -item.quantity, 'OUT', 'invoice', insertId, userId]
        );
      }

      if (paidAmount > 0) {
        await db.execute(
          'UPDATE retailers SET outstanding_balance = outstanding_balance + ? WHERE id = ?',
          [totalAmount - paidAmount, data.retailer_id]
        );
      } else {
        await db.execute(
          'UPDATE retailers SET outstanding_balance = outstanding_balance + ? WHERE id = ?',
          [totalAmount, data.retailer_id]
        );
      }

      await db.commit();
      return this.findById(insertId);
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
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
