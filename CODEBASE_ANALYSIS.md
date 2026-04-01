# DMS Codebase Analysis & Refactoring Recommendations

**Analysis Date**: April 1, 2026  
**Focus Areas**: Code Duplication, Complexity, Error Handling, Performance, Security  
**Alignment**: SIMPLIFY.md principles (Keep it simple, clean, efficient)

---

## Executive Summary

The DMS codebase is well-structured with good separation of concerns but shows signs of:
- **Code Duplication**: SQL building patterns repeated across 10+ services
- **Controller Bloat**: `authController.js` is 429 lines (ideal: 50-100)
- **Inconsistent Error Handling**: Mix of `next(error)` and direct error responses
- **Validation Gaps**: Frontend and backend validate independently
- **Component Bloat**: Frontend pages average 300+ lines
- **Performance Issues**: Unindexed queries, missing pagination in several endpoints
- **Security Concerns**: Dynamic SQL string building (though currently safe with params)

---

## SECTION 1: CODE DUPLICATION (HIGH PRIORITY)

### Issue 1.1: Repeated SQL Query Building Pattern
**Impact**: 🔴 High - Affects 10+ files, 200+ lines of duplicated code

**Files Affected**:
- `services/invoiceService.js` (lines 7-52)
- `services/productService.js` (lines 5-40)
- `services/retailerService.js` (lines 5-31)
- `services/stockService.js` (lines 5-68)
- `services/reportService.js` (entire file)

**Problem**:
```javascript
// Pattern repeated 10+ times:
let sql = `SELECT * FROM table WHERE 1=1`;
const params = [];

if (search) {
  sql += ' AND (name LIKE ? OR code LIKE ?)';
  params.push(`%${search}%`, `%${search}%`);
}

const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
const countResult = await query(countSql, params);
const total = countResult[0]?.total || 0;

sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
const { offset, limit: parsedLimit } = paginate(page, limit);
params.push(parsedLimit, offset);

const data = await query(sql, params);
return buildPaginatedResponse(data, total, page, limit);
```

**Recommendation**:
Create a reusable `QueryBuilder` class in `utils/queryBuilder.js`:

```javascript
// backend/src/utils/queryBuilder.js
export class QueryBuilder {
  constructor(tableName, selectFields = '*') {
    this.tableName = tableName;
    this.selectFields = selectFields;
    this.conditions = [];
    this.params = [];
    this.orderBy = null;
  }

  where(field, operator, value) {
    this.conditions.push(`${field} ${operator} ?`);
    this.params.push(value);
    return this;
  }

  search(fields, searchTerm) {
    if (!searchTerm) return this;
    const searchPattern = `%${searchTerm}%`;
    const searchConditions = fields.map(f => `${f} LIKE ?`).join(' OR ');
    this.conditions.push(`(${searchConditions})`);
    fields.forEach(() => this.params.push(searchPattern));
    return this;
  }

  order(field, direction = 'DESC') {
    this.orderBy = `${field} ${direction}`;
    return this;
  }

  async paginate(page = 1, limit = 20) {
    const selectSql = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    const whereClause = this.conditions.length ? `WHERE ${this.conditions.join(' AND ')}` : '';
    const countParams = [...this.params];
    
    const countSql = `SELECT COUNT(*) as total FROM ${this.tableName} ${whereClause}`;
    const countResult = await query(countSql, countParams);
    const total = countResult[0]?.total || 0;

    const orderClause = this.orderBy ? `ORDER BY ${this.orderBy}` : '';
    const offset = (page - 1) * limit;
    const sql = `${selectSql} ${whereClause} ${orderClause} LIMIT ? OFFSET ?`;
    this.params.push(limit, offset);

    const data = await query(sql, this.params);
    return buildPaginatedResponse(data, total, page, limit);
  }
}
```

**Refactored Service Example**:
```javascript
// backend/src/services/productService.js (BEFORE: 164 lines)
import { QueryBuilder } from '../utils/queryBuilder.js';

export const productService = {
  async findAll(page = 1, limit = 20, search = '', companyId = null, categoryId = null) {
    const qb = new QueryBuilder(
      'products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN companies comp ON p.company_id = comp.id',
      'p.*, c.name as category_name, comp.name as company_name'
    );
    
    qb.where('p.is_active', '=', 1);
    if (search) qb.search(['p.name', 'p.code'], search);
    if (companyId) qb.where('p.company_id', '=', companyId);
    if (categoryId) qb.where('p.category_id', '=', categoryId);
    qb.order('p.id');

    return qb.paginate(page, limit);
  }
};
```

**Expected Outcome**: 
- Reduce `productService.js` from 164 → 60 lines
- Reduce `invoiceService.js` from 173 → 100 lines
- Reduce `retailerService.js` from 119 → 50 lines
- **Total savings**: ~200 lines of code

---

### Issue 1.2: Repeated Field Validation Pattern
**Impact**: 🟡 Medium - Affects 5 controllers, 100+ lines

**Files Affected**:
- `controllers/authController.js` (lines 167-189, 221-245, 247-284)
- `controllers/productController.js`
- `services/productService.js` (lines 77-98)
- `services/retailerService.js` (lines 57-78)

**Problem**:
```javascript
// Pattern repeated 5+ times:
const fields = [];
const params = [];

const allowedFields = ['name', 'code', 'category_id', 'company_id', ...];

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
const sql = `UPDATE ${tableName} SET ${fields.join(', ')} WHERE id = ?`;
await query(sql, params);
```

**Recommendation**:
Create a utility function in `utils/updateBuilder.js`:

```javascript
// backend/src/utils/updateBuilder.js
export const buildUpdateQuery = (tableName, data, allowedFields, id) => {
  const fields = [];
  const params = [];

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      params.push(data[field]);
    }
  }

  if (fields.length === 0) return null;

  params.push(id);
  const sql = `UPDATE ${tableName} SET ${fields.join(', ')} WHERE id = ?`;
  return { sql, params };
};
```

**Usage**:
```javascript
const update = buildUpdateQuery('products', data, ['name', 'price', 'stock'], id);
if (!update) return this.findById(id);
await query(update.sql, update.params);
```

**Expected Outcome**: 
- Reduce `authController.js` from 429 → 280 lines
- Reduce controller/service update methods by 60%

---

### Issue 1.3: Repeated Pagination Pattern Across Routes
**Impact**: 🟡 Medium - All paginated endpoints

**Problem**: Every controller parses page/limit from query params:
```javascript
const { page = 1, limit = 20, ... } = req.query;
const result = await service.findAll(
  parseInt(page),
  parseInt(limit),
  ...
);
```

**Recommendation**: Create middleware in `middleware/queryParser.js`:
```javascript
export const parseQuery = (req, res, next) => {
  const { page = 1, limit = 20, search = '', ...rest } = req.query;
  req.pagination = {
    page: Math.max(1, parseInt(page)),
    limit: Math.min(100, Math.max(1, parseInt(limit)))
  };
  req.search = search;
  req.filters = rest;
  next();
};
```

**Usage**:
```javascript
// In routes
router.get('/', authenticate, permit('products_view'), parseQuery, productController.findAll);

// In controller (SIMPLIFIED)
async findAll(req, res, next) {
  try {
    const result = await productService.findAll(
      req.pagination.page,
      req.pagination.limit,
      req.search,
      req.filters.company_id
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
}
```

---

## SECTION 2: BLOATED COMPONENTS & CONTROLLERS (HIGH PRIORITY)

### Issue 2.1: authController.js is 429 Lines (Ideal: 50-100)
**Impact**: 🔴 High - Hard to maintain, mixed concerns

**Current breakdown**:
- Lines 8-62: login (55 lines)
- Lines 73-79: me (7 lines)
- Lines 81-126: register (46 lines)
- Lines 128-147: getAllUsers (20 lines)
- Lines 149-292: updateUser (144 lines) ← **BLOATED**
- Lines 294-325: deleteUser (32 lines)
- Lines 327-353: changePassword (27 lines)
- Lines 355-399: forgotPassword (45 lines)
- Lines 401-428: resetPassword (28 lines)

*
