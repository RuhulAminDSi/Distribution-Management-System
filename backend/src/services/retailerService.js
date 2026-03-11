import { query, getConnection } from '../config/database.js';
import { generateCode, buildPaginatedResponse, paginate } from '../utils/helpers.js';

export const retailerService = {
  async findAll(page = 1, limit = 20, search = '', area = null) {
    let sql = `
      SELECT * FROM retailers WHERE is_active = 1
    `;
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR code LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (area) {
      sql += ' AND area = ?';
      params.push(area);
    }

    const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0]?.total || 0;

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    const { offset, limit: parsedLimit } = paginate(page, limit);
    params.push(parsedLimit, offset);

    const retailers = await query(sql, params);
    return buildPaginatedResponse(retailers, total, page, limit);
  },

  async findById(id) {
    const retailers = await query('SELECT * FROM retailers WHERE id = ? AND is_active = 1', [id]);
    return retailers[0] || null;
  },

  async create(data) {
    const code = data.code || generateCode('RET');
    const sql = `
      INSERT INTO retailers (name, code, owner_name, phone, address, area, credit_limit, due_limit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      data.name,
      code,
      data.owner_name || null,
      data.phone,
      data.address || null,
      data.area || null,
      data.credit_limit || 0,
      data.due_limit || 0
    ]);
    return this.findById(result.insertId);
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
    
    const sql = `
      SELECT 
        COALESCE(SUM(total_amount), 0) as total_sales,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(due_amount), 0) as outstanding
      FROM invoices 
      WHERE retailer_id = ?
    `;
    const result = await query(sql, [id]);
    
    return {
      retailer_id: id,
      total_sales: result[0]?.total_sales || 0,
      total_collected: result[0]?.total_collected || 0,
      outstanding: result[0]?.outstanding || 0,
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
    const result = await query('SELECT DISTINCT area FROM retailers WHERE is_active = 1 AND area IS NOT NULL ORDER BY area');
    return result.map(r => r.area);
  }
};
