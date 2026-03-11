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

    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      const [result] = await db.execute(
        `INSERT INTO purchase_orders (po_no, company_id, total_amount, status, notes, order_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [poNo, data.company_id, totalAmount, 'pending', data.notes || null, data.order_date || new Date().toISOString().split('T')[0], userId]
      );
      const poId = result.insertId;

      for (const item of data.items) {
        await db.execute(
          'INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, amount) VALUES (?, ?, ?, ?, ?)',
          [poId, item.product_id, item.quantity, item.rate, item.quantity * item.rate]
        );
      }

      await db.commit();
      
      const po = await query('SELECT * FROM purchase_orders WHERE id = ?', [poId]);
      return po[0];
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
    }
  },

  async receivePurchaseOrder(id, userId) {
    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      const [poRows] = await db.execute('SELECT * FROM purchase_orders WHERE id = ?', [id]);
      const po = poRows[0];
      if (!po) throw new Error('Purchase order not found');

      const [itemRows] = await db.execute('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?', [id]);

      for (const item of itemRows) {
        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );

        await db.execute(
          'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.product_id, item.quantity, 'IN', 'purchase_order', id, `PO: ${po.po_no}`, userId]
        );

        await db.execute(
          'UPDATE purchase_order_items SET received_quantity = ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      await db.execute(
        'UPDATE purchase_orders SET status = ? WHERE id = ?',
        ['received', id]
      );

      await db.commit();
      
      const updatedPO = await query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
      return updatedPO[0];
    } catch (error) {
      await db.rollback();
      throw error;
    } finally {
      db.release();
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
