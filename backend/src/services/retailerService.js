import { query, getConnection } from '../config/database.js';
import { generateCode, buildPaginatedResponse, paginate } from '../utils/helpers.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const retailerService = {
  async findAll(page = 1, limit = 20, search = '', area = null) {
    // Build query with QueryBuilder
    let builder = new QueryBuilder('retailers')
      .where('is_active', 1)
      .orderBy('id', 'DESC');

    if (search) {
      const searchTerm = `%${search}%`;
      builder.whereRaw('(name LIKE ? OR code LIKE ? OR phone LIKE ?)', [searchTerm, searchTerm, searchTerm]);
    }

    if (area) {
      builder.where('area', area);
    }

    return builder.paginate(page, limit);
  },

  async findById(id) {
    return new QueryBuilder('retailers')
      .where('id', id)
      .where('is_active', 1)
      .first();
  },

  async create(data) {
    const code = data.code || generateCode('RET');
    const sql = `
      INSERT INTO retailers (name, code, owner_name, phone, address, area, credit_limit, due_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql + ' RETURNING id', [
      data.name,
      code,
      data.owner_name || null,
      data.phone,
      data.address || null,
      data.area || null,
      data.credit_limit || 0,
      data.due_limit || 0
    ]);
    return this.findById(result[0].id);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'code', 'owner_name', 'phone', 'address', 'area', 'credit_limit', 'due_limit'];
    
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
    const sql = `UPDATE retailers SET ${fields.join(', ')} WHERE id = ?`;
    await query(sql, params);
    return this.findById(id);
  },

  async delete(id) {
    await query('UPDATE retailers SET is_active = 0 WHERE id = ?', [id]);
    return { message: 'Retailer deleted successfully' };
  },

  async getBalance(id) {
    const retailer = await this.findById(id);
    if (!retailer) throw new Error('Retailer not found');
    
    const result = await new QueryBuilder('invoices')
      .select('COALESCE(SUM(total_amount), 0) as total_sales, COALESCE(SUM(paid_amount), 0) as total_collected, COALESCE(SUM(due_amount), 0) as outstanding')
      .where('retailer_id', id)
      .first();
    
    return {
      retailer_id: id,
      total_sales: result?.total_sales || 0,
      total_collected: result?.total_collected || 0,
      outstanding: result?.outstanding || 0,
      credit_limit: retailer.credit_limit,
      due_limit: retailer.due_limit
    };
  },

  async updateOutstanding(id, amount) {
    await query('UPDATE retailers SET outstanding_balance = outstanding_balance + ? WHERE id = ?', [amount, id]);
    const retailers = await query('SELECT * FROM retailers WHERE id = ?', [id]);
    return retailers[0] || null;
  },

  async getAllAreas() {
    const result = await new QueryBuilder('retailers')
      .select('DISTINCT area')
      .where('is_active', 1)
      .whereRaw('area IS NOT NULL', [])
      .orderBy('area', 'ASC')
      .get();
    return result.map(r => r.area);
  }
};
