# Bug Fix: Company Wise Report - MySQL Statement Error

**Date:** 2026-04-01  
**Issue:** Incorrect arguments to mysqld_stmt_execute validation  
**Root Cause:** QueryBuilder join() method doesn't support inline WHERE conditions  
**Status:** ✅ FIXED

---

## Problem Description

When accessing the Company Wise report in the Reports section, the following error occurred:

```
Error: Incorrect arguments to mysqld_stmt_execute
```

This happened because the code tried to embed WHERE conditions directly in the JOIN clause, which the QueryBuilder doesn't support.

---

## Root Cause Analysis

The problematic code in `reportService.js`:

```javascript
.join('invoices i', 'ii.invoice_id = i.id AND i.invoice_date BETWEEN ? AND ?')
```

The QueryBuilder's `join()` method only accepts a simple ON condition (e.g., `ii.invoice_id = i.id`). It doesn't parse or handle complex conditions with additional WHERE clauses embedded in the JOIN.

---

## Solution Applied

Moved the date condition from the JOIN to a `whereRaw()` clause:

```javascript
async companySales(startDate, endDate, page = 1, limit = 20) {
  const result = await new QueryBuilder('companies comp')
    .select('comp.id as company_id, comp.name as company_name, COUNT(DISTINCT ii.invoice_id) as total_invoices, SUM(ii.quantity) as total_quantity, SUM(ii.amount) as total_sales, SUM((ii.rate - p.purchase_price) * ii.quantity) as total_profit')
    .join('products p', 'p.company_id = comp.id')
    .join('invoice_items ii', 'ii.product_id = p.id')
    .join('invoices i', 'ii.invoice_id = i.id')
    .where('comp.is_active', 1)
    .whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
    .groupBy('comp.id')
    .orderBy('total_sales', 'DESC')
    .paginate(page, limit);

  return result;
},
```

---

## Files Modified

- `backend/src/services/reportService.js` - Fixed companySales() method

---

## Testing

Test the Company Wise report:
```bash
curl -s -H "Cookie: token=..." "http://localhost:5000/api/reports/company-sales?start=2026-01-01&end=2026-04-01"
```

Should return sales data grouped by company.

---

## Git Commit

```
fix: company-wise report mysqld_stmt_execute error
- Move date condition from JOIN to whereRaw() in companySales()
```
