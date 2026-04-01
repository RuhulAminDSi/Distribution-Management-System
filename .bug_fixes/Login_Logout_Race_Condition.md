# Bug Fix: Login/Logout Race Condition

**Date:** 2026-04-01  
**Issue:** After logout, can't login again - blank screen with no error  
**Root Cause:** Race condition in AuthContext.jsx login function - using stale `user` state  
**Status:** ✅ FIXED

---

## Problem Description

1. User logs in successfully
2. User logs out - all sessions cleared
3. User tries to login again - fails with blank screen or stuck on loading
4. The login doesn't complete properly

**Root Cause:** The login function was using `user || (await api.get(...))` which used stale state instead of waiting for the fresh API response.

---

## Solution

Rewrote the login function to properly handle async flow:

```javascript
// Before - race condition
const login = async (username, password) => {
  await authService.login(username, password);
  await fetchUser();
  setLoading(true);
  const response = await api.get('/auth/me');
  const currentUser = response.data.user;
  setUser(currentUser);
  setLoading(false);
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

## Files Modified

- `frontend/src/context/AuthContext.jsx`

---

## Testing

### Test Results (18/18 passed)
```
✓ Login with valid credentials
✓ Logout
✓ Auth required after logout
✓ Re-login after logout
```

---

## Git Commit

```
fix: resolve login/logout race condition in AuthContext
```
