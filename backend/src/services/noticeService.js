import { query } from '../config/database.js';
import { QueryBuilder } from '../utils/QueryBuilder.js';

export const noticeService = {
  async getActive() {
    const rows = await query(
      `SELECT n.*, u.full_name as created_by_name
       FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       WHERE n.is_active = 1 AND n.is_published = 1
       LIMIT 1`
    );
    return rows[0] || null;
  },

  async findAll(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE n.is_active = 1';
    const params = [];

    if (search) {
      const searchTerm = `%${search}%`;
      whereClause += ' AND (n.title LIKE ? OR n.content LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    const countResult = await query(
      `SELECT COUNT(*) as total FROM notices n ${whereClause}`,
      params
    );
    const total = parseInt(countResult[0].total);

    const rows = await query(
      `SELECT n.*, u.full_name as created_by_name
       FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       ${whereClause}
       ORDER BY n.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      data: rows,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  async findById(id) {
    const rows = await query(
      `SELECT n.*, u.full_name as created_by_name
       FROM notices n
       LEFT JOIN users u ON u.id = n.created_by
       WHERE n.id = ? AND n.is_active = 1`,
      [id]
    );
    return rows[0] || null;
  },

  async create(data, userId) {
    const result = await query(
      `INSERT INTO notices (title, content, created_by) VALUES (?, ?, ?) RETURNING id`,
      [data.title, data.content, userId]
    );
    return this.findById(result[0].id);
  },

  async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['title', 'content'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    await query(`UPDATE notices SET ${fields.join(', ')} WHERE id = ?`, params);
    return this.findById(id);
  },

  async delete(id) {
    await query('UPDATE notices SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return { message: 'Notice deleted successfully' };
  },

  async togglePublished(id) {
    const notice = await this.findById(id);
    if (!notice) return null;

    const newStatus = notice.is_published ? 0 : 1;

    if (newStatus === 1) {
      await query('UPDATE notices SET is_published = 0 WHERE is_published = 1 AND id != ?', [id]);
    }

    await query('UPDATE notices SET is_published = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newStatus, id]);
    return this.findById(id);
  }
};
