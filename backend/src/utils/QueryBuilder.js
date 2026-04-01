/**
 * QueryBuilder - Fluent query builder for MySQL
 * Eliminates SQL duplication across service files
 * 
 * Usage:
 *   const users = await new QueryBuilder('users')
 *     .select('id, name, email')
 *     .where('is_active', 1)
 *     .where('role_id', req.body.role_id)
 *     .orderBy('created_at', 'DESC')
 *     .limit(20)
 *     .offset(0)
 *     .get();
 * 
 *   const count = await new QueryBuilder('users')
 *     .where('is_active', 1)
 *     .count();
 * 
 *   const result = await new QueryBuilder('products')
 *     .select('p.*, c.name as category_name')
 *     .join('categories c', 'c.id = p.category_id')
 *     .where('p.is_active', 1)
 *     .orderBy('p.name')
 *     .paginate(page, limit);
 */

import { query as executeQuery } from '../config/database.js';

export class QueryBuilder {
  constructor(table) {
    this.table = table;
    this.selectCols = '*';
    this.joins = [];
    this.conditions = [];
    this.params = [];
    this.orderByClause = '';
    this.limitClause = '';
    this.offsetClause = '';
    this.groupByClause = '';
  }

  /**
   * SELECT specific columns
   * @param {string} columns - Comma-separated column names or array
   */
  select(columns) {
    if (Array.isArray(columns)) {
      this.selectCols = columns.join(', ');
    } else {
      this.selectCols = columns;
    }
    return this;
  }

  /**
   * LEFT JOIN another table
   * @param {string} table - Table name with alias (e.g., 'users u')
   * @param {string} condition - Join condition (e.g., 'u.id = orders.user_id')
   */
  join(table, condition, type = 'LEFT JOIN') {
    this.joins.push(`${type} ${table} ON ${condition}`);
    return this;
  }

  /**
   * LEFT JOIN another table
   */
  leftJoin(table, condition) {
    return this.join(table, condition, 'LEFT JOIN');
  }

  /**
   * INNER JOIN another table
   */
  innerJoin(table, condition) {
    return this.join(table, condition, 'INNER JOIN');
  }

  /**
   * WHERE condition (supports multiple conditions)
   * @param {string} field - Column name
   * @param {*} value - Value to match (or operator if 2 args)
   * @param {*} value2 - Value (if 3 args: field, operator, value)
   */
  where(field, value, value2 = null) {
    if (value2 !== null) {
      // Three arguments: field, operator, value
      this.conditions.push(`${field} ${value} ?`);
      this.params.push(value2);
    } else {
      // Two arguments: field, value (assumes =)
      this.conditions.push(`${field} = ?`);
      this.params.push(value);
    }
    return this;
  }

  /**
   * WHERE IN condition
   * @param {string} field - Column name
   * @param {array} values - Array of values
   */
  whereIn(field, values) {
    if (!Array.isArray(values) || values.length === 0) {
      return this;
    }
    const placeholders = values.map(() => '?').join(', ');
    this.conditions.push(`${field} IN (${placeholders})`);
    this.params.push(...values);
    return this;
  }

  /**
   * WHERE LIKE condition (for search)
   * @param {string} field - Column name
   * @param {string} value - Search term (will add % around it)
   */
  whereLike(field, value) {
    this.conditions.push(`${field} LIKE ?`);
    this.params.push(`%${value}%`);
    return this;
  }

  /**
   * WHERE raw SQL condition
   * @param {string} sql - Raw SQL condition
   * @param {array} params - Parameters for placeholders
   */
  whereRaw(sql, params = []) {
    this.conditions.push(sql);
    this.params.push(...params);
    return this;
  }

  /**
   * ORDER BY clause
   * @param {string} column - Column name
   * @param {string} direction - ASC or DESC
   */
  orderBy(column, direction = 'ASC') {
    if (this.orderByClause) {
      this.orderByClause += `, ${column} ${direction}`;
    } else {
      this.orderByClause = `ORDER BY ${column} ${direction}`;
    }
    return this;
  }

  /**
   * GROUP BY clause
   * @param {string} columns - Column names to group by
   */
  groupBy(columns) {
    if (Array.isArray(columns)) {
      this.groupByClause = `GROUP BY ${columns.join(', ')}`;
    } else {
      this.groupByClause = `GROUP BY ${columns}`;
    }
    return this;
  }

  /**
   * LIMIT clause
   * @param {number} limit - Number of rows to return
   */
  limit(limit) {
    this.limitClause = `LIMIT ${parseInt(limit)}`;
    return this;
  }

  /**
   * OFFSET clause
   * @param {number} offset - Number of rows to skip
   */
  offset(offset) {
    this.offsetClause = `OFFSET ${parseInt(offset)}`;
    return this;
  }

  /**
   * Build the complete SQL query
   */
  buildQuery() {
    let sql = `SELECT ${this.selectCols} FROM ${this.table}`;

    if (this.joins.length > 0) {
      sql += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      sql += ' WHERE ' + this.conditions.join(' AND ');
    }

    if (this.groupByClause) {
      sql += ' ' + this.groupByClause;
    }

    if (this.orderByClause) {
      sql += ' ' + this.orderByClause;
    }

    if (this.limitClause) {
      sql += ' ' + this.limitClause;
    }

    if (this.offsetClause) {
      sql += ' ' + this.offsetClause;
    }

    return sql;
  }

  /**
   * Execute the query and return all rows
   */
  async get() {
    const sql = this.buildQuery();
    return executeQuery(sql, this.params);
  }

  /**
   * Execute the query and return first row only
   */
  async first() {
    this.limit(1);
    const results = await this.get();
    return results[0] || null;
  }

  /**
   * Get count of rows (uses COUNT(*))
   */
  async count() {
    let sql = `SELECT COUNT(*) as total FROM ${this.table}`;

    if (this.joins.length > 0) {
      sql += ' ' + this.joins.join(' ');
    }

    if (this.conditions.length > 0) {
      sql += ' WHERE ' + this.conditions.join(' AND ');
    }

    const result = await executeQuery(sql, this.params);
    return result[0]?.total || 0;
  }

  /**
   * Get paginated results (page, limit) and total count
   * Returns: { data: [], total: 0, page: 1, limit: 20, pages: 1 }
   */
  async paginate(page = 1, limit = 20) {
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, parseInt(limit));
    const offset = (pageNum - 1) * limitNum;

    // Get total count (before applying limit/offset)
    const countSql = `SELECT COUNT(*) as total FROM ${this.table}`;
    let fullCountSql = countSql;
    if (this.joins.length > 0) {
      fullCountSql += ' ' + this.joins.join(' ');
    }
    if (this.conditions.length > 0) {
      fullCountSql += ' WHERE ' + this.conditions.join(' AND ');
    }

    const countResult = await executeQuery(fullCountSql, this.params);
    const total = countResult[0]?.total || 0;

    // Get paginated data
    this.limit(limitNum);
    this.offset(offset);
    const data = await this.get();

    const pages = Math.ceil(total / limitNum);

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      pages,
      hasMore: pageNum < pages
    };
  }

  /**
   * Raw parameter support for complex queries
   * Use when QueryBuilder doesn't support your needs
   */
  static raw(sql, params = []) {
    return executeQuery(sql, params);
  }
}

/**
 * Helper function: Build paginated response object
 * @param {array} data - Array of results
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 */
export const buildPaginatedResponse = (data, total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return {
    data,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages,
    hasMore: page < pages
  };
};

/**
 * Helper function: Build filtered response
 * For endpoints that don't need pagination
 */
export const buildFilteredResponse = (data) => {
  return {
    success: true,
    data,
    count: data.length
  };
};
