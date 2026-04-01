# Bug Fix: MySQL Incorrect Arguments in Report Summary

**Date:** 2026-04-01  
**Issue:** Error: Incorrect arguments to mysqld_stmt_execute - ER_WRONG_ARGUMENTS  
**Root Cause:** WHERE conditions embedded in JOIN clause with duplicate date parameters  
**Status:** ✅ FIXED

---

## Problem Description

The `getReportSummary` function in `reportService.js` was throwing MySQL error 1210. The query had date filtering conditions in both the JOIN clause and WHERE clause with the same parameters, causing the prepared statement to receive incorrect arguments.

The problematic query was:
```sql
JOIN invoices i ON ii.invoice_id = i.id AND i.invoice_date BETWEEN ? AND ?
WHERE ... AND i.invoice_date BETWEEN ? AND ?
```

This duplication confused the MySQL prepared statement executor.

---

## Solution Applied

Removed the date condition from the JOIN clause and kept it only in the WHERE clause:

```javascript
// Before (broken)
.join('invoices i', 'ii.invoice_id = i.id AND i.invoice_date BETWEEN ? AND ?')
.where('comp.is_active', 1)
.whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])

// After (fixed)
.join('invoices i', 'ii.invoice_id = i.id')
.where('comp.is_active', 1)
.whereRaw('i.invoice_date BETWEEN ? AND ?', [startDate, endDate])
```

---

## Files Modified

- `backend/src/services/reportService.js` - Removed duplicate date filter from JOIN clause in `getReportSummary` function (line 25)

---

## Testing

Run the backend and test the report summary endpoint with date range parameters.