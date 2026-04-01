# Bug Fix: Foreign Key Constraint Failure in Purchase Order

**Date:** 2026-04-01  
**Issue:** Cannot add or update a child row: foreign key constraint fails (`purchase_order_items_ibfk_2`)  
**Root Cause:** Frontend sending invalid product_id that doesn't exist in products table  
**Status:** ✅ FIXED

---

## Problem Description

When creating a purchase order, the system throws a MySQL foreign key constraint error because the `product_id` being sent doesn't exist in the `products` table.

The error occurred at:
```
INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, rate, amount) 
VALUES (?, ?, ?, ?, ?)
```

---

## Solution Applied

Added validation in `stockService.js` to check if each product_id exists before inserting:

```javascript
// Validate all product IDs exist
for (const item of data.items) {
  const [products] = await db.execute('SELECT id FROM products WHERE id = ?', [item.product_id]);
  if (products.length === 0) {
    throw new Error(`Product with ID ${item.product_id} not found`);
  }
}
```

This provides a clear error message instead of a cryptic MySQL foreign key error.

---

## Files Modified

- `backend/src/services/stockService.js` - Added product ID validation in `createPurchaseOrder` function

---

## Testing

Test creating a purchase order with valid product IDs and verify proper error message appears for invalid ones.