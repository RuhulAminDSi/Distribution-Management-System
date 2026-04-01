# DMS CODEBASE REFACTORING QUICK REFERENCE

## TOP 10 ISSUES BY IMPACT

### 🔴 CRITICAL (Fix Immediately)
1. **authController.js - 429 lines (ideal: 50-100)** 
   - Status: Bloated with mixed concerns
   - Fix: Split updateUser into userService.js (saves 150 lines)
   - Time: 2 hours
   - Files: authController.js, userService.js (new)

2. **SQL Injection Risk - stockService.js line 65**
   - Status: LIMIT/OFFSET not parameterized
   - Fix: Parameterize limit/offset values
   - Time: 5 minutes
   - Files: stockService.js

3. **SQL Query Duplication Pattern**
   - Status: 10+ services repeat query building
   - Fix: Create QueryBuilder utility class
   - Time: 4 hours
   - Files: queryBuilder.js (new), 4 services

4. **Error Handling Inconsistency**
   - Status: Mix of next(error), direct responses, non-standard formats
   - Fix: Standardize with ApiError class + errorHandler
   - Time: 2 hours
   - Files: errorHandler.js, ApiError.js (new), 3 controllers

5. **Missing Input Validation**
   - Status: Only minimal client checks, no server validation
   - Fix: Add express-validator with validators.js
   - Time: 3 hours
   - Files: validators.js (new), routes

### 🟡 HIGH (This Sprint)
6. **N+1 Query Problem - authController.js line 137**
   - Status: 20 queries for 20 users instead of 1
   - Fix: Use JOIN in SQL query
   - Time: 1 hour
   - Impact: 20x faster user list

7. **Sales.jsx & Retailers.jsx - 300+ lines each**
   - Status: Mixed logic/render, hard to test
   - Fix: Extract hooks (useSalesForm, useAsyncError)
   - Time: 3 hours
   - Files: useSalesForm.js, useAsyncError.js (new), pages

8. **Inconsistent Permission Middleware**
   - Status: Not all routes have permit() checks
   - Fix: Audit all routes, add missing permissions
   - Time: 1 hour
   - Files: authRoutes.js, roleRoutes.js

9. **Dashboard Performance**
   - Status: Multiple sequential queries
   - Fix: Use Promise.all() for parallel execution
   - Time: 30 minutes
   - Impact: 3-4x faster dashboard load

10. **Missing Database Indexes**
    - Status: No indexes on frequently queried columns
    - Fix: Add indexes on email, status, created_at
    - Time: 30 minutes
    - Files: database/schema.sql

---

## REFACTORING CHECKLIST BY FILE

### BACKEND - Controllers
- [ ] authController.js: Split updateUser() to userService.js (lines 149-292)
- [ ] authController.js: Fix N+1 in getAllUsers (line 137-140)
- [ ] notificationController.js: Change "error" to "message" in responses
- [ ] productController.js: Remove unused parameter parsing (use middleware)
- [ ] paymentController.js: Same as productController

### BACKEND - Services
- [ ] invoiceService.js: Replace findAll() with QueryBuilder (lines 7-52)
- [ ] productService.js: Replace findAll() with QueryBuilder (lines 5-40)
- [ ] productService.js: Replace update() with updateBuilder() (lines 77-98)
- [ ] retailerService.js: Replace findAll() with QueryBuilder (lines 5-31)
- [ ] retailerService.js: Replace update() with updateBuilder() (lines 57-78)
- [ ] stockService.js: Parameterize LIMIT/OFFSET (line 65)
- [ ] stockService.js: Replace findAll() with QueryBuilder (lines 5-68)
- [ ] dashboardService.js: Use Promise.all() for queries (lines 7-70)
- [ ] reportService.js: Replace findAll() pattern throughout

### BACKEND - Middleware & Utils
- [ ] Create: utils/queryBuilder.js (100 lines)
- [ ] Create: utils/updateBuilder.js (30 lines)
- [ ] Create: utils/ApiError.js (20 lines)
- [ ] Create: middleware/validators.js (80 lines)
- [ ] Create: middleware/queryParser.js (20 lines)
- [ ] Create: middleware/cacheInvalidation.js (10 lines)
- [ ] Update: middleware/errorHandler.js (standardize format)
- [ ] Update: middleware/auth.js (add CSRF & rate limit)

### BACKEND - Routes
- [ ] Audit all routes for missing permission checks
- [ ] Replace roleRoutes.js wrapper pattern with middleware
- [ ] Add validators to all POST/PUT routes
- [ ] Standardize middleware order (auth → validate → permit → handler)

### FRONTEND - Pages
- [ ] Create: hooks/useSalesForm.js (80 lines)
- [ ] Create: hooks/useAsyncError.js (50 lines)
- [ ] Create: components/InvoiceItemsForm.jsx (60 lines)
- [ ] Refactor: pages/Sales.jsx (376 → 120 lines)
- [ ] Refactor: pages/Retailers.jsx (298 → 100 lines)
- [ ] Refactor: pages/Products.jsx (328 → 120 lines)
- [ ] Refactor: pages/Payments.jsx (similar pattern)

### FRONTEND - Services & Context
- [ ] Audit: services/api.js for consistency
- [ ] Fix: context/AuthContext.jsx error handling

---

## CODE REDUCTION SUMMARY

| Component | Current | Target | Savings |
|-----------|---------|--------|---------|
| authController.js | 429 | 180 | 249 lines |
| userService.js (new) | - | 80 | -80 lines |
| productService.js | 164 | 60 | 104 lines |
| invoiceService.js | 173 | 100 | 73 lines |
| retailerService.js | 119 | 50 | 69 lines |
| stockService.js | 170 | 100 | 70 lines |
| Sales.jsx | 376 | 120 | 256 lines |
| Retailers.jsx | 298 | 100 | 198 lines |
| queryBuilder.js (new) | - | 100 | -100 lines |
| **TOTALS** | **2228** | **980** | **~1050 lines (47% reduction)** |

---

## TESTING CHECKLIST

After each refactoring:
- [ ] Unit test the utility (QueryBuilder, updateBuilder, ApiError)
- [ ] Integration test the affected controller
- [ ] Test error scenarios (validation errors, not found, etc.)
- [ ] Verify API response format consistency
- [ ] Check performance improvement (if applicable)

---

## SECURITY CHECKLIST

Before production:
- [ ] SQL injection: Verify all LIMIT/OFFSET parameterized
- [ ] XSS: Add sanitization middleware
- [ ] CSRF: Add CSRF tokens to forms
- [ ] Rate limiting: Enable on auth endpoints
- [ ] Validation: 100% of user input validated
- [ ] Permissions: Audit all routes have permission checks

---

## PERFORMANCE CHECKLIST

- [ ] Dashboard load time < 500ms
- [ ] API responses < 100ms
- [ ] N+1 queries: Fix all identified cases
- [ ] Database indexes: Add to schema
- [ ] Promise.all(): Use for parallel queries

