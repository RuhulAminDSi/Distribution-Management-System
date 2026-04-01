# Bug Fix: User Service - leftJoin Method Missing

**Date:** 2026-04-01  
**Issue:** TypeError: (intermediate value).select(...).leftJoin is not a function  
**Root Cause:** QueryBuilder missing leftJoin() method  
**Status:** ✅ FIXED

---

## Problem Description

When accessing the Users page, the following error occurred:

```
TypeError: (intermediate value).select(...).leftJoin is not a function
    at Object.getAllUsers (file:///.../userService.js:68:8)
```

The code was calling `.leftJoin()` on QueryBuilder but the method didn't exist.

---

## Root Cause Analysis

The `userService.js` was using `.leftJoin()` method:

```javascript
let builder = new QueryBuilder('users u')
  .select('u.id, u.username, u.full_name, u.email, u.role_id, u.phone, u.is_active, u.created_at, r.name as role')
  .leftJoin('roles r', 'r.id = u.role_id');
```

But the QueryBuilder class only had `.join()` and `.innerJoin()` methods, no `.leftJoin()`.

---

## Solution Applied

Added `leftJoin()` method to QueryBuilder class:

```javascript
/**
 * LEFT JOIN another table
 */
leftJoin(table, condition) {
  return this.join(table, condition, 'LEFT JOIN');
}
```

---

## Files Modified

- `backend/src/utils/QueryBuilder.js` - Added leftJoin() method

---

## Testing

Test the Users page:
```bash
curl -s -H "Cookie: token=..." "http://localhost:5000/api/users?page=1&limit=10"
```

Should return users list with role names.

---

## Git Commit

```
fix: add leftJoin method to QueryBuilder
- Added leftJoin() method to QueryBuilder class for user service queries
```
