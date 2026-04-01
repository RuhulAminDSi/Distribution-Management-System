# Debugging & Testing Commands

## Debug Backend

### Enable Debug Logging
```javascript
// Add to controller before operation
console.log('DEBUG: Starting operation', { data, user: req.user });

// Log errors with full details
console.error('DEBUG: Error details', error.message, error.stack);
```

### Run Backend with Inspector
```bash
cd backend && node --inspect src/server.js
# Then open chrome://inspect in Chrome DevTools
```

### Check Request/Response
```bash
# Backend logs all requests (Express)
npm run dev:backend

# Check incoming data
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "company_id": 1}'
```

### Test Database Query
```bash
# Connect to MySQL and test query
mysql -u root -p dms

SELECT * FROM products WHERE id = 1;
SELECT COUNT(*) FROM invoices WHERE retailer_id = 1;
```

## Debug Frontend

### Check Console Errors
```javascript
// Browser Console (F12)
// All fetch/Axios errors logged with context
console.error('API Error:', error.message);

// Check network tab for API calls
// All requests to /api are visible in Network tab
```

### React DevTools
- Install React DevTools Chrome extension
- Inspect component state and props in DevTools
- Profile performance in Profiler tab

### Check LocalStorage
```javascript
// In browser console
localStorage.getItem('token');           // JWT token
localStorage.getItem('dms_user');        // User data
localStorage.getItem('dms_language');    // Language preference
```

### Debug Axios Interceptors
```javascript
// Add to api.js to log all requests
api.interceptors.request.use(config => {
  console.log('Request:', config);
  return config;
});

api.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.error('Response Error:', error);
    return Promise.reject(error);
  }
);
```

---

## Testing (When Available)

### Backend Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- authController.test.js

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test -- --watch
```

### Backend Integration Tests
```bash
# Run integration tests (may require test database)
npm run test:integration

# Run specific test
npm run test:integration -- invoices.test.js
```

### Frontend Unit Tests
```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- ProductList.test.jsx

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

### Frontend E2E Tests (Recommended Tools: Playwright, Cypress)
```bash
# Run E2E tests
npm run test:e2e

# Watch mode
npm run test:e2e -- --watch

# Run specific test
npm run test:e2e -- login.spec.js
```

---

## Common Issues & Solutions

### Backend Won't Start
```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill process using port
kill -9 <PID>

# Check database connection
curl http://localhost:5000/api/health
```

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1"

# Check credentials in .env
cat backend/.env | grep DB_

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"
```

### Frontend Can't Connect to Backend
```bash
# Check backend is running
curl http://localhost:5000/api/health

# Check CORS is configured (should allow 5173)
grep FRONTEND_URL backend/.env

# Check Vite proxy in frontend/vite.config.js
cat frontend/vite.config.js
```

### Authentication Token Issues
```bash
# Clear cookies and localStorage
localStorage.clear();
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
});

# Login again
# Frontend will get new JWT token
```

### Soft Delete Issues
```bash
# Products marked as inactive won't show
# To restore: UPDATE products SET is_active = 1 WHERE id = X;

SELECT * FROM products WHERE is_active = 1;  # Only active
SELECT * FROM products;  # All including inactive
```

---

## Performance Monitoring

### Check Slow Queries
```bash
# Enable slow query log in MySQL
mysql -u root -p -e "SET GLOBAL slow_query_log = 'ON';"

# View slow queries (adjust threshold)
mysql -u root -p -e "SET GLOBAL long_query_time = 0.1;"
```

### Monitor Backend Performance
```bash
# Memory usage
npm run dev:backend 2>&1 | grep -i memory

# Check stack traces for bottlenecks
# Look for repeated long operations in logs
```

### Check Frontend Performance
```javascript
// In browser console
performance.timing.loadEventEnd - performance.timing.navigationStart  // Total load time

// Measure specific operation
console.time('fetch-products');
await productService.getAll();
console.timeEnd('fetch-products');
```
