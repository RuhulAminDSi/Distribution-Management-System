# Bug Fix: Product Create - Bind Parameters Undefined Error

**Date:** 2026-04-01  
**Issue:** Create product fails with "Bind parameters must not contain undefined" error  
**Root Cause:** productService.js passes undefined values for price fields when not provided  
**Status:** ✅ FIXED

---

## Problem Description

When creating a new product without all price fields, the API returns:
```
{"success":false,"message":"Bind parameters must not contain undefined. To pass SQL NULL specify JS null"}
```

This happens because `data.purchase_price`, `data.dealer_price`, and `data.mrp` are undefined when not provided in the request body.

---

## Solution

Added default values (0) for all price fields in productService.js:

```javascript
// Before
const result = await query(sql, [
  data.name,
  code,
  data.category_id || null,
  data.company_id || null,
  data.purchase_price,      // undefined when not provided
  data.dealer_price,        // undefined when not provided
  data.mrp,                 // undefined when not provided
  data.stock_quantity || 0,
  ...
]);

// After
const result = await query(sql, [
  data.name,
  code,
  data.category_id || null,
  data.company_id || null,
  data.purchase_price || 0,  // defaults to 0
  data.dealer_price || 0,    // defaults to 0
  data.mrp || 0,             // defaults to 0
  data.stock_quantity || 0,
  ...
]);
```

---

## Files Modified

- `backend/src/services/productService.js` (lines 47-60)

---

## Testing

```bash
# Create product without price fields
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Product","code":"TP001","stock_quantity":10}'

# Result: ✅ Success - Product created with default prices (0)
```

---

## Git Commit

```
fix: add default values for product price fields to prevent undefined errors
```
