import { BaseModel } from './baseModel.js';
import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

export class User extends BaseModel {
  constructor() {
    super('users');
  }

  async findByUsername(username) {
    const results = await query(
      'SELECT * FROM users WHERE username = ? OR email = ? OR phone = ?',
      [username, username, username]
    );
    return results[0] || null;
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async findByPhone(phone) {
    return await this.findOne({ phone });
  }

  async create(data) {
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO users (${fields.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);

    return { id: result.insertId, ...data };
  }

  async update(id, data) {
    if (data.password) {
      data.password_hash = await bcrypt.hash(data.password, 10);
      delete data.password;
    }
    
    return await super.update(id, data);
  }

  async verifyPassword(user, password) {
    return await bcrypt.compare(password, user.password_hash);
  }

  async getRoleWithPermissions(userId) {
    const user = await this.findById(userId);
    if (!user) return null;

    const role = await query('SELECT * FROM roles WHERE id = ?', [user.role_id]);
    if (!role[0]) return null;

    const permissions = await query(
      `SELECT p.name FROM permissions p 
       JOIN role_permissions rp ON p.name = rp.permission 
       WHERE rp.role_id = ?`,
      [role[0].id]
    );

    return {
      ...role[0],
      permissions: permissions.map(p => p.name)
    };
  }

  async getAllWithPagination(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    let sql = 'SELECT id, username, full_name, email, phone, role_id, is_active, created_at FROM users';
    const params = [];

    if (search) {
      sql += ' WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const users = await query(sql, params);

    let countSql = 'SELECT COUNT(*) as total FROM users';
    const countParams = [];
    if (search) {
      countSql += ' WHERE username LIKE ? OR full_name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const countResult = await query(countSql, countParams);
    const total = countResult[0].total;

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async toggleStatus(id) {
    const user = await this.findById(id);
    if (!user) return null;

    const newStatus = user.is_active ? 0 : 1;
    return await this.update(id, { is_active: newStatus });
  }

  async findActive() {
    return await this.findAll({ is_active: 1 });
  }

  async countByRole(roleId) {
    const result = await query('SELECT COUNT(*) as count FROM users WHERE role_id = ?', [roleId]);
    return result[0].count;
  }
}

export const userModel = new User();
