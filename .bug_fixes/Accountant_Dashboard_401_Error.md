# Bug Fix: Non-Admin Roles - Dashboard 401 Unauthorized

**Date:** 2026-04-01  
**Issue:** After login with non-admin roles (accountant, salesman, etc.), dashboard shows 401 Unauthorized error or redirects to /unauthorized  
**Root Cause:** Dashboard endpoint required 'dashboard_view' permission that non-admin roles don't have, and frontend also blocked via PermissionRoute  
**Status:** ✅ FIXED

---

## Problem Description

When logging in with any non-admin role (accountant, salesman, etc.), the dashboard shows:
```
GET http://localhost:5173/api/dashboard/summary 401 (Unauthorized)
```

Or redirects to `/unauthorized` page after successful login.

This happened because:
1. The backend `/dashboard/summary` endpoint had `permit('dashboard_view')` middleware
2. The frontend `/dashboard` route used `<PermissionRoute permission="dashboard_view">`
3. Non-admin roles don't have the `dashboard_view` permission assigned
4. Both backend and frontend blocked access for non-admin users

---

## Solution Applied

### 1. Backend Fix - Removed permission requirement from dashboard endpoint

In `dashboardRoutes.js`, removed the `permit('dashboard_view')` middleware:

**Before:**
```javascript
router.get('/summary', authenticate, permit('dashboard_view'), dashboardController.getSummary);
```

**After:**
```javascript
router.get('/summary', authenticate, dashboardController.getSummary);
```

### 2. Frontend Fix - Changed PermissionRoute to PrivateRoute

In `App.jsx`, changed the dashboard route from PermissionRoute to PrivateRoute:

**Before:**
```jsx
<Route path="/dashboard" element={
  <PermissionRoute permission="dashboard_view">
    <MainLayout />
  </PermissionRoute>
}>
```

**After:**
```jsx
<Route path="/dashboard" element={
  <PrivateRoute>
    <MainLayout />
  </PrivateRoute>
}>
```

Now any authenticated user can access the dashboard, which is the expected behavior since all roles need dashboard access.

---

## Files Modified

- `backend/src/routes/dashboardRoutes.js` - Removed `permit('dashboard_view')` middleware
- `frontend/src/App.jsx` - Changed dashboard route from PermissionRoute to PrivateRoute

---

## Testing

1. Login with accountant role
2. Login with salesman role  
3. Navigate to dashboard
4. Should load without 401 error for all roles

```bash
curl -s -H "Authorization: Bearer <token>" "http://localhost:5000/api/dashboard/summary"
```

---

## Git Commit

```
fix: remove dashboard_view permission requirement for dashboard endpoint
- Allow all authenticated users to access dashboard summary
- Changed frontend from PermissionRoute to PrivateRoute
- Non-admin roles were getting 401 due to missing dashboard_view permission
```
