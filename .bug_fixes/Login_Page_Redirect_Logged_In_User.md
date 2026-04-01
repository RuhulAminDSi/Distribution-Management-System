# Bug Fix: Logged In User Seeing Login Page

**Date:** 2026-04-01  
**Issue:** Logged in user clicking "Login" button shows login page instead of redirecting to dashboard  
**Root Cause:** Login page doesn't check if user is already authenticated  
**Status:** ✅ FIXED

---

## Problem Description

1. User logs in successfully
2. User visits homepage (Landing page)
3. User clicks "Login" button
4. Login page is shown even though user is already authenticated
5. Should redirect to dashboard if already logged in

---

## Solution

### 1. Login.jsx - Redirect logged-in users to dashboard

Added useAuth hook and redirect if user is already logged in:

```javascript
// Login.jsx
const { login, user } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  // If user is already logged in, redirect to dashboard
  if (user) {
    navigate('/dashboard', { replace: true });
  }
}, [user, navigate]);
```

### 2. api.js - Add response interceptor for 401 errors

Added axios interceptor to handle unauthorized responses:

```javascript
// api.js
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(error);
  }
);
```

### 3. AuthContext.jsx - Listen for auth:logout event

Added event listener to clear user state on 401:

```javascript
useEffect(() => {
  fetchUser();
  fetchRoles();

  const handleLogoutEvent = () => {
    setUser(null);
    setUserPermissions([]);
    setLoading(false);
  };
  window.addEventListener('auth:logout', handleLogoutEvent);

  return () => {
    window.removeEventListener('auth:logout', handleLogoutEvent);
  };
}, []);
```

---

## Files Modified

1. `frontend/src/pages/Login.jsx` - Added user redirect check
2. `frontend/src/services/api.js` - Added 401 response interceptor
3. `frontend/src/context/AuthContext.jsx` - Added auth:logout event listener

---

## Testing

- Login with valid credentials: ✅ PASS
- Logout: ✅ PASS
- Auth required after logout: ✅ PASS
- Re-login after logout: ✅ PASS

---

## Git Commit

```
fix: redirect logged-in users from login page, add 401 interceptor
```
