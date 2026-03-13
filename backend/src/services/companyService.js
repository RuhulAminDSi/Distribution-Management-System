import { query } from '../config/database.js';
import { generateCode } from '../utils/helpers.js';

export const companyService = {
  async findAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const data = await query('SELECT * FROM companies WHERE is_active = 1 ORDER BY name LIMIT ? OFFSET ?', [limit, offset]);
    const countResult = await query('SELECT COUNT(*) as total FROM companies WHERE is_active = 1');
    const total = countResult[0]?.total || 0;
    return { data, total };
  },

  async findById(id) {
    const companies = await query('SELECT * FROM companies WHERE id = ? AND is_active = 1', [id]);
    return companies[0] || null;
  },

  async create(data) {
    const code = data.code || generateCode('COM');
    const result = await query(
      'INSERT INTO companies (name, code, contact_person, phone, address, due_limit) VALUES (?, ?, ?, ?, ?, ?)',
      [data.name, code, data.contact_person || null, data.phone || null, data.address || null, data.due_limit || 0]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'code', 'contact_person', 'phone', 'address', 'due_limit'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);
    params.push(id);

    await query(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async delete(id) {
    await query('UPDATE companies SET is_active = 0 WHERE id = ?', [id]);
    return { message: 'Company deleted successfully' };
  }
};

export const categoryService = {
  async findAll(companyId = null) {
    let sql = 'SELECT * FROM categories WHERE is_active = 1';
    const params = [];
    if (companyId) {
      sql += ' AND company_id = ?';
      params.push(companyId);
    }
    sql += ' ORDER BY name';
    return query(sql, params);
  },

  async findById(id) {
    const categories = await query('SELECT * FROM categories WHERE id = ? AND is_active = 1', [id]);
    return categories[0] || null;
  },

  async create(data) {
    const result = await query(
      'INSERT INTO categories (name, company_id, description) VALUES (?, ?, ?)',
      [data.name, data.company_id || null, data.description || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'company_id', 'description'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);
    params.push(id);

    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async delete(id) {
    await query('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
    return { message: 'Category deleted successfully' };
  }
};
