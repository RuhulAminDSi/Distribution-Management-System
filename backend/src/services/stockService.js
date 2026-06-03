import { query, getConnection } from '../config/database.js';
import { generatePONo, buildPaginatedResponse } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const stockService = {
  async getStockHistory(page = 1, limit = 20, productId = null, startDate = null, endDate = null, search = '') {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('stock_logs sl')
      .select('sl.*, p.name as product_name, p.code as product_code, u.full_name as created_by_name')
      .join('products p', 'sl.product_id = p.id')
      .join('users u', 'sl.created_by = u.id')
      .orderBy('sl.id', 'DESC');

    if (productId) {
      builder.where('sl.product_id', productId);
    }

    if (startDate) {
      builder.whereRaw('DATE(sl.created_at) >= ?', [startDate]);
    }

    if (endDate) {
      builder.whereRaw('DATE(sl.created_at) <= ?', [endDate]);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(p.name LIKE ? OR p.code LIKE ?)', [searchTerm, searchTerm]);
    }

    return builder.paginate(page, limit);
  },

  async createPurchaseOrder(data, userId) {
    const poNo = generatePONo();
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    const db = await getConnection();
    
    try {
      await db.beginTransaction();

      // Validate all product IDs exist
      for (const item of data.items) {
        const productResult = await db.query('SELECT id FROM products WHERE id = ?', [item.product_id]);
        const products = productResult.rows;
        if (products.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found`);
        }
      }

      const result = await db.query(
        `INSERT INTO purchase_orders (po_no, company_id, total_amount, status, notes, order_date, created_by)
         VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id`,
        [poNo, data.company_id, totalAmount, 'pending', data.notes || null, data.order_date || new Date().toISOString().split('T')[0], userId]
      );
      const poId = result.rows[0].id;

      for (const item of data.items) {
        await db.query(
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

      const poResult = await db.query('SELECT * FROM purchase_orders WHERE id = ?', [id]);
      const po = poResult.rows[0];
      if (!po) throw new Error('Purchase order not found');

      const itemResult = await db.query('SELECT * FROM purchase_order_items WHERE purchase_order_id = ?', [id]);
      const itemRows = itemResult.rows;

      for (const item of itemRows) {
        await db.query(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );

        await db.query(
          'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [item.product_id, item.quantity, 'IN', 'purchase_order', id, `PO: ${po.po_no}`, userId]
        );

        await db.query(
          'UPDATE purchase_order_items SET received_quantity = ? WHERE id = ?',
          [item.quantity, item.id]
        );
      }

      await db.query(
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

  async getPurchaseOrders(page = 1, limit = 20, search = '', status = null) {
    let builder = new QueryBuilder('purchase_orders po')
      .select('po.*, c.name as company_name, c.phone as company_phone, u.full_name as created_by_name, (SELECT COUNT(*) FROM purchase_order_items poi WHERE poi.purchase_order_id = po.id) as items_count')
      .join('companies c', 'po.company_id = c.id')
      .join('users u', 'po.created_by = u.id')
      .orderBy('po.id', 'DESC');

    if (status) {
      builder.where('po.status', status);
    }

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(po.po_no LIKE ? OR c.name LIKE ? OR u.full_name LIKE ?)', [searchTerm, searchTerm, searchTerm]);
    }

    const result = await builder.paginate(page, limit);
    return buildPaginatedResponse(result.data, result.total, result.page, result.limit);
  },

  async getPurchaseOrderById(id) {
    const po = await new QueryBuilder('purchase_orders po')
      .select('po.*, c.name as company_name, c.phone as company_phone, c.address as company_address, c.contact_person, u.full_name as created_by_name')
      .join('companies c', 'po.company_id = c.id')
      .join('users u', 'po.created_by = u.id')
      .where('po.id', id)
      .first();

    if (!po) return null;

    const items = await new QueryBuilder('purchase_order_items poi')
      .select('poi.*, p.name as product_name, p.code as product_code, p.unit')
      .join('products p', 'poi.product_id = p.id')
      .where('poi.purchase_order_id', id)
      .get();

    return { ...po, items };
  }
};
