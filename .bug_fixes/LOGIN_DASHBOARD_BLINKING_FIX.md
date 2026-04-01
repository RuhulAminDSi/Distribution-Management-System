# Bug Fix: Dashboard and Login Page Blinking/Flickering

**Date:** 2026-04-01  
**Issue:** Dashboard and Login pages showing "Loading..." text that causes visual blinking/flickering  
**Root Cause:** Simple text-based loading indicators without proper styling  
**Fix Applied:** Added styled loading spinner animations to prevent visual flickering

---

## Problem Description

When the application loads, users see:
1. Plain "Loading..." text on Login page while checking authentication
2. "Loading..." text on Dashboard while fetching data
3. Simple `<div>Loading...</div>` inline text causing visual flicker

---

## Files Modified

### 1. `frontend/src/styles/index.css`
Added loading spinner styles:

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

@keyframes spin {
  to { transform: rotate(360deg); }
}

.page-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 16px;
}

.page-loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primary-light);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

### 2. `frontend/src/App.jsx`
Updated PrivateRoute and PermissionRoute components:

```jsx
if (loading) {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
    </div>
  );
}
```

### 3. `frontend/src/pages/Dashboard.jsx`
Updated loading state rendering:

```jsx
if (loading) {
  return (
    <div className="page-loading">
      <div className="page-loading-spinner"></div>
      <span>{t('Loading')}</span>
    </div>
  );
}

if (!data) {
  return (
    <div className="page-loading">
      <span>{t('NoDataFound')}</span>
    </div>
  );
}
```

---

## Testing

### Before Fix
- Login page: Shows raw "Loading..." text
- Dashboard: Shows raw "Loading..." text during data fetch

### After Fix
- Login page: Shows smooth spinning loader
- Dashboard: Shows spinner with loading text
- No visual flickering

---

## Git Commit

```
fix: add styled loading spinners to prevent page flickering
```
