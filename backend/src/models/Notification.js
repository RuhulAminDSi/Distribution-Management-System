import { BaseModel } from './baseModel.js';
import { query } from '../config/database.js';

export class Notification extends BaseModel {
  constructor() {
    super('notifications');
  }

  async findByUser(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await query(sql, [userId, limit, offset]);
  }

  async countByUser(userId) {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = ?`;
    const result = await query(sql, [userId]);
    return result[0].count;
  }

  async countUnread(userId) {
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE user_id = ? AND is_read = 0`;
    const result = await query(sql, [userId]);
    return result[0].count;
  }

  async getUnread(userId) {
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = ? AND is_read = 0
      ORDER BY created_at DESC
      LIMIT 10
    `;
    return await query(sql, [userId]);
  }

  async markAsRead(notificationId, userId) {
    const sql = `UPDATE ${this.tableName} SET is_read = 1 WHERE id = ? AND user_id = ?`;
    return await query(sql, [notificationId, userId]);
  }

  async markAllAsRead(userId) {
    const sql = `UPDATE ${this.tableName} SET is_read = 1 WHERE user_id = ? AND is_read = 0`;
    return await query(sql, [userId]);
  }

  async deleteOlderThan(days = 30) {
    const sql = `DELETE FROM ${this.tableName} WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`;
    return await query(sql, [days]);
  }

  async createBulk(notifications) {
    const values = notifications.map(n => [
      n.user_id,
      n.title,
      n.message,
      n.type || 'info',
      n.category || null,
      n.reference_type || null,
      n.reference_id || null,
      n.action_url || null
    ]);

    const placeholders = values.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = values.flat();

    const sql = `
      INSERT INTO ${this.tableName} 
      (user_id, title, message, type, category, reference_type, reference_id, action_url)
      VALUES ${placeholders}
    `;
    return await query(sql, flatValues);
  }

  async getByCategory(userId, category, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM ${this.tableName}
      WHERE user_id = ? AND category = ?
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    return await query(sql, [userId, category, limit, offset]);
  }
}

export default new Notification();
