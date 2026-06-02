import { query } from '../config/database.js';
import { generateCode } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const companyService = {
  async findAll(page = 1, limit = 20, search = '') {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('companies')
      .where('is_active', 1)
      .orderBy('name', 'ASC');

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(name LIKE ? OR code LIKE ? OR contact_person LIKE ?)', [searchTerm, searchTerm, searchTerm]);
    }

    return builder.paginate(page, limit);
  },

  async findById(id) {
    return new QueryBuilder('companies')
      .where('id', id)
      .where('is_active', 1)
      .first();
  },

  async create(data) {
    const code = data.code || generateCode('COM');
    const result = await query(
      'INSERT INTO companies (name, code, contact_person, phone, address, due_limit) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
      [data.name, code, data.contact_person || null, data.phone || null, data.address || null, data.due_limit || 0]
    );
    return this.findById(result[0].id);
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
    let builder = new QueryBuilder('categories')
      .where('is_active', 1)
      .orderBy('name', 'ASC');

    if (companyId) {
      builder.where('company_id', companyId);
    }

    return builder.get();
  },

  async findById(id) {
    return new QueryBuilder('categories')
      .where('id', id)
      .where('is_active', 1)
      .first();
  },

  async create(data) {
    const result = await query(
      'INSERT INTO categories (name, company_id, description) VALUES (?, ?, ?) RETURNING id',
      [data.name, data.company_id || null, data.description || null]
    );
    return this.findById(result[0].id);
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
