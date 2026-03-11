import { query } from '../config/database.js';
import { generateCode, buildPaginatedResponse, paginate } from '../utils/helpers.js';

export const productService = {
  async findAll(page = 1, limit = 20, search = '', companyId = null, categoryId = null) {
    let sql = `
      SELECT p.*, c.name as category_name, comp.name as company_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN companies comp ON p.company_id = comp.id 
      WHERE p.is_active = 1
    `;
    const params = [];

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (companyId) {
      sql += ' AND p.company_id = ?';
      params.push(companyId);
    }

    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    const countSql = sql.replace('SELECT p.*, c.name as category_name, comp.name as company_name', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    const { offset, limit: parsedLimit } = paginate(page, limit);
    params.push(parsedLimit, offset);

    const products = await query(sql, params);
    return buildPaginatedResponse(products, total, page, limit);
  },

  async findById(id) {
    const sql = `
      SELECT p.*, c.name as category_name, comp.name as company_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN companies comp ON p.company_id = comp.id 
      WHERE p.id = ? AND p.is_active = 1
    `;
    const products = await query(sql, [id]);
    return products[0] || null;
  },

  async create(data) {
    const code = data.code || generateCode('PRO');
    const sql = `
      INSERT INTO products (name, code, category_id, company_id, purchase_price, dealer_price, mrp, stock_quantity, low_stock_alert, unit, pack_size)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      data.name,
      code,
      data.category_id || null,
      data.company_id || null,
      data.purchase_price,
      data.dealer_price,
      data.mrp,
      data.stock_quantity || 0,
      data.low_stock_alert || 10,
      data.unit || 'piece',
      data.pack_size || 1
    ]);
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'code', 'category_id', 'company_id', 'purchase_price', 'dealer_price', 'mrp', 'low_stock_alert', 'unit', 'pack_size'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    params.push(id);
    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
    return this.findById(id);
  },

  async delete(id) {
    await query('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return { message: 'Product deleted successfully' };
  },

  async getLowStock() {
    const sql = `
      SELECT p.*, c.name as category_name, comp.name as company_name 
      FROM products p 
      LEFT JOIN categories c ON p.category_id = c.id 
      LEFT JOIN companies comp ON p.company_id = comp.id 
      WHERE p.is_active = 1 AND p.stock_quantity <= p.low_stock_alert
      ORDER BY p.stock_quantity ASC
    `;
    return query(sql);
  },

  async updateStock(id, quantity, type, referenceType = null, referenceId = null, notes = null, userId) {
    const product = await this.findById(id);
    if (!product) throw new Error('Product not found');

    let newQuantity;
    if (type === 'IN') {
      newQuantity = product.stock_quantity + quantity;
    } else if (type === 'OUT') {
      newQuantity = product.stock_quantity - quantity;
      if (newQuantity < 0) throw new Error('Insufficient stock');
    } else {
      newQuantity = quantity;
    }

    await query('UPDATE products SET stock_quantity = ? WHERE id = ?', [newQuantity, id]);

    await query(
      'INSERT INTO stock_logs (product_id, quantity, type, reference_type, reference_id, notes, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, quantity, type, referenceType, referenceId, notes, userId]
    );

    return this.findById(id);
  }
};
