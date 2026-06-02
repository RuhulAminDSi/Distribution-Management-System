import { query } from '../config/database.js';

export class BaseModel {
  constructor(tableName) {
    this.tableName = tableName;
  }

  async findAll(conditions = {}, orderBy = null, limit = null) {
    let sql = `SELECT * FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => {
          if (Array.isArray(conditions[key])) {
            const placeholders = conditions[key].map(() => '?').join(', ');
            return `${key} IN (${placeholders})`;
          }
          return `${key} = ?`;
        })
        .join(' AND ');

      sql += ` WHERE ${whereClause}`;
      for (const val of Object.values(conditions)) {
        if (Array.isArray(val)) {
          params.push(...val);
        } else {
          params.push(val);
        }
      }
    }

    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }

    if (limit) {
      sql += ` LIMIT ${parseInt(limit)}`;
    }

    return await query(sql, params);
  }

  async findById(id) {
    const results = await query(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
    return results[0] || null;
  }

  async findOne(conditions) {
    const results = await this.findAll(conditions, null, 1);
    return results[0] || null;
  }

  async create(data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = fields.map(() => '?').join(', ');

    const sql = `INSERT INTO ${this.tableName} (${fields.join(', ')}) VALUES (${placeholders}) RETURNING id`;
    const result = await query(sql, values);

    return { id: result[0].id, ...data };
  }

  async update(id, data) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map(field => `${field} = ?`).join(', ');

    const sql = `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`;
    await query(sql, [...values, id]);

    return await this.findById(id);
  }

  async delete(id) {
    await query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
    return true;
  }

  async count(conditions = {}) {
    let sql = `SELECT COUNT(*) as count FROM ${this.tableName}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    const result = await query(sql, params);
    return result[0].count;
  }
}
