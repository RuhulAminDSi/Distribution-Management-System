# Bug Fix: Accountant Role - Dashboard 401 Unauthorized

**Date:** 2026-04-01  
**Issue:** After login with accountant role, dashboard shows 401 Unauthorized error  
**Root Cause:** Token not being sent with API requests  
**Status:** ✅ FIXED

---

## Problem Description

When logging in with the accountant role (or any non-admin role), the dashboard shows:
```
GET http://localhost:5173/api/dashboard/summary 401 (Unauthorized)
```

This happened because:
1. Backend sets token in httpOnly cookie (not accessible via JavaScript)
2. Frontend wasn't sending token in Authorization header
3. Vite proxy wasn't forwarding cookies properly

---

## Solution Applied

### 1. Added Request Interceptor in api.js
Added axios interceptor to send token in Authorization header:

```javascript
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);
```

### 2. Modified Backend to Return Token in Response
In authController.js, return token in JSON response:

```javascript
res.json({
  user: { ... },
  token  // Now included in response
});
```

### 3. Modified AuthContext to Store Token
In AuthContext.jsx, save token to localStorage after login:

```javascript
const login = async (username, password) => {
  const response = await authService.login(username, password);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  // ... rest of login
};
```

---

## Files Modified

- `frontend/src/services/api.js` - Added request interceptor for Authorization header
- `backend/src/controllers/authController.js` - Return token in login response
- `frontend/src/context/AuthContext.jsx` - Store token in localStorage after login

---

## Testing

1. Login with accountant role
2. Navigate to dashboard
3. Should load without 401 error

```bash
curl -s -H "Cookie: token=..." "http://localhost:5000/api/dashboard/summary"
```

---

## Git Commit

```
fix: add token to Authorization header for API requests
- Add request interceptor to send Bearer token
- Return token in login response for non-admin roles
- Store token in localStorage for API calls
```
