import { query, getConnection } from '../config/database.js';
import { generatePONo } from '../utils/helpers.js';

export const stockService = {
  async getStockHistory(productId = null, startDate = null, endDate = null) {
    let sql = `
      SELECT 
        sl.*,
        p.name as product_name,
        p.code as product_code,
        u.full_name as created_by_name
      FROM stock_logs sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (productId) {
      sql += ' AND sl.product_id = ?';
      params.push(productId);
    }

    if (startDate) {
      sql += ' AND DATE(sl.created_at) >= ?';
      params.push(startDate);
    }

    if (endDate) {
      sql += ' AND DATE(sl.created_at) <= ?';
      params.push(endDate);
    }

    sql += ' ORDER BY sl.id DESC LIMIT 100';
    return query(sql, params);
  },

  async createPurchaseOrder(data, userId) {
    const poNo = generatePONo();
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    const db = getConnection();
    
    try {
      db.exec('BEGIN TRANSACTION');

      db.prepare(
        `INSERT INTO purchase_orders (po_no, company_id, total_amount, status, notes, order_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(poNo, data.company_id, totalAmount, 'pending', data.notes || null, data.order_date || new Date().toISOString().split('T')[0], userId);

      const poResult = db.prepare('SELECT last_insert_rowid() as id').get();
      const poId = poResult.id;

      for (const item of data.items) {
        db.prepare(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)'
        ).run(poId, item.product_id, item.quantity, item.rate, item.quantity * item.rate);
      }

      db.exec('COMMIT');
      
      const po = await query('SELECT * FROM purchase_orders WHERE id = ?', [poId]);
      return po[0];
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  },

  async receivePurchaseOrder(id, userId) {
    const db = getConnection();
    
    try {
      db.exec('BEGIN TRANSACTION');

      const po = db.prepare('SELECT * FROM purchase_orders WHERE id = ?').get(id);
      if (!po) throw new Error('Purchase order not found');

      const items = db.prepare('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?').all(id);

      for (const item of items) {
        db.prepare(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?'
        ).run(item.quantity, item.product_id);

        db.prepare(
          'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(item.product_id, item.quantity, 'IN', 'purchase_order', id, `PO: ${po.po_no}`, userId);

        db.prepare(
          'UPDATE purchase_order_items SET received_quantity = ? WHERE id = ?'
        ).run(item.quantity, item.id);
      }

      db.prepare(
        'UPDATE purchase_orders SET status = ? WHERE id = ?'
      ).run('received', id);

      db.exec('COMMIT');
      
      const updatedPO = await query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
      return updatedPO[0];
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  },

  async getPurchaseOrders(status = null) {
    let sql = `
      SELECT po.*, c.name as company_name, u.full_name as created_by_name
      FROM purchase_orders po
      LEFT JOIN companies c ON po.company_id = c.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND po.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY po.id DESC';
    return query(sql, params);
  }
};
