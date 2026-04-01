import { query } from '../config/database.js';
import { generateCode, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const productService = {
  async findAll(page = 1, limit = 20, search = '', companyId = null, categoryId = null) {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .orderBy('p.id', 'DESC');

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(p.name LIKE ? OR p.code LIKE ?)', [searchTerm, searchTerm]);
    }

    if (companyId) {
      builder.where('p.company_id', companyId);
    }

    if (categoryId) {
      builder.where('p.category_id', categoryId);
    }

    return builder.paginate(page, limit);
  },

  async findById(id) {
    return new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.id', id)
      .where('p.is_active', 1)
      .first();
  },

  async create(data) {
    const code = data.code || generateCode('PRO');
    const sql = `
      INSERT INTO products (name, code, category_id, company_id, purchase_price, dealer_price, mrp, stock_quantity, low_stock_alert, unit, pack_size, expiry_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.pack_size || 1,
      data.expiry_date || null
    ]);
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'code', 'category_id', 'company_id', 'purchase_price', 'dealer_price', 'mrp', 'low_stock_alert', 'unit', 'pack_size', 'expiry_date'];
    
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
    return new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .whereRaw('p.stock_quantity <= p.low_stock_alert', [])
      .orderBy('p.stock_quantity', 'ASC')
      .get();
  },

  async getExpired() {
    return new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .whereRaw('p.expiry_date IS NOT NULL AND p.expiry_date <= CURDATE() AND p.stock_quantity > 0', [])
      .orderBy('p.expiry_date', 'ASC')
      .get();
  },

  async getExpiringSoon(days = 30) {
    return new QueryBuilder('products p')
      .select('p.*, c.name as category_name, comp.name as company_name')
      .join('categories c', 'p.category_id = c.id')
      .join('companies comp', 'p.company_id = comp.id')
      .where('p.is_active', 1)
      .whereRaw('p.expiry_date IS NOT NULL AND p.expiry_date > CURDATE() AND p.expiry_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY) AND p.stock_quantity > 0', [days])
      .orderBy('p.expiry_date', 'ASC')
      .get();
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
