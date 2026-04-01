# Bug Fixes Summary - Session 2026-04-01

## Fix 1: Validation Failed Error on Create/Update Modals

**Date:** 2026-04-01  
**Issue:** Validation failed error shown when trying to create or update records  
**Root Cause:** Backend express-validator rules were too strict (using `isInt()`, `isEmail()`, `matches()` for optional fields)  
**Fix Applied:** Relaxed validation rules to allow optional fields and string inputs

### Files Modified
- `backend/src/utils/validation.js`

### Changes Made
- Changed `isInt()` to `notEmpty()` for foreign key fields
- Changed strict email/phone validation to `optional()` 
- Removed duplicate `validateAdjustStock` declaration

## Fix 1: Validation Failed Error on Create/Update Modals

**Date:** 2026-04-01  
**Issue:** Validation failed error shown when trying to create or update records  
**Root Cause:** Backend express-validator rules were too strict (using `isInt()`, `isEmail()`, `matches()` for optional fields)  
**Fix Applied:** Relaxed validation rules to allow optional fields and string inputs

### Files Modified
- `backend/src/utils/validation.js`

### Changes Made
- Changed `isInt()` to `notEmpty()` for foreign key fields
- Changed strict email/phone validation to `optional()` 
- Removed duplicate `validateAdjustStock` declaration
- Fixed validation error field name using `err.path || err.param`

### Additional Fix: Show Errors Under Each Field
- **Issue:** Error shows as alert popup
- **Fix:** Added fieldErrors state, parse from response, display under each field
- **Files:** `frontend/src/pages/Companies.jsx`, `frontend/src/styles/index.css`

---

## Fix 2: Product Create - Bind Parameters Must Not Contain Undefined

**Date:** 2026-04-01  
**Issue:** Create product fails with "Bind parameters must not contain undefined" error  
**Root Cause:** productService.js passes undefined values for price fields (purchase_price, dealer_price, mrp)  
**Fix Applied:** Added default values (0) for price fields

### Files Modified
- `backend/src/services/productService.js`

### Code Change
```javascript
// Before
data.purchase_price,
data.dealer_price,
data.mrp,

// After  
data.purchase_price || 0,
data.dealer_price || 0,
data.mrp || 0,
```

---

## Fix 3: Dashboard and Login Page Blinking/Flickering

**Date:** 2026-04-01  
**Issue:** Dashboard and Login pages showing "Loading..." text that causes visual blinking/flickering  
**Root Cause:** Simple text-based loading indicators without proper styling  
**Fix Applied:** Added styled loading spinner animations

### Files Modified
- `frontend/src/styles/index.css` - Added loading spinner CSS
- `frontend/src/App.jsx` - Updated PrivateRoute/PermissionRoute loading states
- `frontend/src/pages/Dashboard.jsx` - Added page loading spinner

### CSS Added
```css
.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--background);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}
```

---

## Fix 4: Login/Logout Race Condition

**Date:** 2026-04-01  
**Issue:** After logout, can't login again - race condition in AuthContext  
**Root Cause:** Login function using stale `user` state instead of fetching fresh user data  
**Fix Applied:** Fixed login/logout async handling in AuthContext.jsx

### Files Modified
- `frontend/src/context/AuthContext.jsx`

### Code Change
```javascript
// Before - race condition
const login = async (username, password) => {
  await authService.login(username, password);
  await fetchUser();
  const currentUser = user || (await api.get('/auth/me')).data.user;
  return currentUser;
};

// After - proper async handling
const login = async (username, password) => {
  try {
    await authService.login(username, password);
    const response = await api.get('/auth/me');
    const currentUser = response.data.user;
    setUser(currentUser);
    return currentUser;
  } catch (error) {
    setLoading(false);
    throw error;
  }
};
```

---

## Automated Test Script

**Date:** 2026-04-01  
**Created:** `.test_script/test.sh` - Automated integration test script

### Test Coverage (18 tests)
- Health Check
- Login with valid credentials
- Create Company, Retailer, Product, Invoice
- Update Company, Retailer, Product
- List Companies, Retailers, Products
- Get Dashboard
- Logout and re-login
- Validation error handling

### Running the tests
```bash
./.test_script/test.sh
```

---

## Test Results

```
==========================================
TEST SUMMARY
==========================================
Passed: 18
Failed: 0
Total: 18
All tests passed! ✓
```

---

## Files Modified Summary

| File | Changes |
|------|---------|
| backend/src/utils/validation.js | Fixed duplicate declaration, relaxed validation |
| backend/src/services/productService.js | Added default values for price fields |
| frontend/src/styles/index.css | Added loading spinner CSS animations |
| frontend/src/App.jsx | Updated loading state components |
| frontend/src/pages/Dashboard.jsx | Added page loading spinner |
| frontend/src/context/AuthContext.jsx | Fixed login/logout race condition |

---

## Git Commit

```
fix: validation errors, product prices, login/logout issues, loading spinners
- Fix duplicate validateAdjustStock declaration
- Add default values for product price fields
- Add styled loading spinners to prevent blinking
- Fix login/logout race condition in AuthContext
```

---

**Last Updated:** 2026-04-01
**Status:** All issues fixed and tested ✅
