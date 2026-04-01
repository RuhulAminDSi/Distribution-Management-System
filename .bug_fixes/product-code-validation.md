# Bug Fix: Product Code Validation Error

**Date:** 2026-04-01  
**Issue:** `ApiError: Validation failed - Product code cannot be empty` when creating products without a code  
**Root Cause:** `optional()` in express-validator only skips validation for `undefined`/`null`, not empty strings. The frontend sends `code: ''`, which still triggers `notEmpty()`.  
**Status:** ✅ FIXED

---

## Problem Description

When creating a product without entering a code, the backend throws a 400 validation error:
```
{ code: 'Product code cannot be empty' }
```

The frontend form sends `code: ''` (empty string) by default. Using `optional()` alone doesn't skip validation for empty strings — it only skips for `undefined`/`null`.

---

## Solution Applied

Used `optional({ values: 'falsy' })` which treats empty strings as falsy and skips validation:

```javascript
// Before (still validates empty strings)
body('code').optional().trim().notEmpty().withMessage('Product code cannot be empty'),

// After (skips validation for empty strings too)
body('code').optional({ values: 'falsy' }).trim(),
```

---

## Files Modified

- `backend/src/utils/validation.js:70` - Changed `code` validation to use `optional({ values: 'falsy' })`

---

## Testing

1. Restart the dev server
2. Navigate to Products page
3. Create a new product without entering a code
4. Product should be created successfully

---

## Git Commit

```
fix: allow empty product code using optional({ values: 'falsy' })
```
