# Custom Commands Documentation

This folder contains comprehensive markdown documentation for agentic coding systems and developers working on the Distribution Management System (DMS) project.

## Available Documentation Files

### 1. **DATABASE.md**
Commands and guidelines for database operations:
- Database reset and initialization
- Backup and restore procedures
- Connection testing
- Schema and table reference

**Use when:** Working with MySQL, managing data, debugging database issues

### 2. **BACKEND_API.md**
Backend development and API reference:
- Server startup commands
- Health check endpoints
- Complete API endpoint examples (authentication, products, invoices, payments, reports, etc.)
- Default test credentials
- Common curl examples for testing

**Use when:** Testing APIs, debugging backend, integrating frontend with backend

### 3. **FRONTEND.md**
Frontend development commands and architecture:
- Development server startup and features
- Page component reference (15 pages)
- Context providers (AuthContext, LanguageContext)
- API service patterns
- Common development patterns with code examples
- Translation key system
- Export functionality (PDF, Excel)
- Port configuration

**Use when:** Building UI, managing state, working with components, translations

### 4. **CODE_PATTERNS.md**
Best practices and design patterns:
- Service layer pattern
- Controller pattern
- Route pattern
- Error handling pattern
- Database transaction pattern
- Frontend component pattern
- Form handling pattern
- Permission checking pattern
- SQL injection prevention

**Use when:** Writing new features, refactoring code, learning codebase conventions

### 5. **DEBUGGING.md**
Debugging and testing utilities:
- Backend debugging techniques
- Frontend debugging with DevTools
- Console logging strategies
- LocalStorage inspection
- Unit and integration test commands
- E2E testing setup
- Common issues and solutions
- Performance monitoring tools

**Use when:** Fixing bugs, testing code, optimizing performance, troubleshooting errors

### 6. **PERMISSIONS.md**
Complete permissions and roles reference:
- 7 predefined roles with descriptions
- 30 permissions organized by feature
- Permission assignment matrix
- How to check permissions in code (backend/frontend)
- Permission caching mechanism
- Creating custom roles
- Default admin user credentials

**Use when:** Implementing authorization, managing roles, protecting routes, debugging permission issues

### 7. **FEATURE_DEVELOPMENT.md**
Step-by-step guide for creating new features:
- Database table creation
- Model, service, controller creation
- Route registration
- Frontend page creation
- Navigation integration
- Router setup
- Permission management
- Testing checklist

**Use when:** Adding new features, creating complete feature modules from scratch

---

## Quick Start Guide for Agents

### For Running the Application
1. Start with **DATABASE.md** for MySQL setup
2. Use **BACKEND_API.md** for server startup
3. Use **FRONTEND.md** for frontend dev server

### For Understanding Code
1. Read **AGENTS.md** in root (code style guidelines)
2. Use **CODE_PATTERNS.md** for common patterns
3. Check **PERMISSIONS.md** for authorization logic

### For Fixing Issues
1. Check **DEBUGGING.md** for common problems
2. Use database commands from **DATABASE.md**
3. Test APIs with curl examples from **BACKEND_API.md**

### For Adding Features
1. Follow **FEATURE_DEVELOPMENT.md** step-by-step
2. Reference **PERMISSIONS.md** for required permissions
3. Use **CODE_PATTERNS.md** for implementation patterns
4. Test with **DEBUGGING.md** techniques

---

## Technology Stack Summary

| Layer | Technology | Key Info |
|-------|-----------|----------|
| Backend | Node.js + Express | Port 5000, ES Modules |
| Database | MySQL | 14 tables, connection pooling |
| Frontend | React 18 + Vite | Port 5173, HMR enabled |
| Authentication | JWT + httpOnly cookies | 24-hour expiration |
| State | Context API | AuthContext, LanguageContext |
| HTTP Client | Axios | 30s timeout, auto-retry |
| Exports | XLSX/jsPDF | Excel & PDF generation |
| i18n | Custom Context | English & Bangla |

---

## Key Concepts

### Soft Deletes
- Users, products, retailers, companies use `is_active` field
- Deleted items are deactivated, not removed
- Query with `WHERE is_active = 1` to get active items

### Role-Based Access Control (RBAC)
- 7 predefined roles with 30 fine-grained permissions
- Permissions cached in memory (5-min TTL)
- Check with `hasPermission()` function

### Database Transactions
- Invoice creation uses transactions
- Ensures atomicity: all operations succeed or all rollback
- Use `getConnection()`, `beginTransaction()`, `commit()`, `rollback()`

### Stock Tracking
- All movements logged in `stock_logs` table
- Three types: IN (purchase), OUT (sales), ADJUSTMENT (corrections)
- Provides complete audit trail

### Bilingual Support
- English & Bangla (Bengali) built-in
- 500+ translation keys
- Format functions: `formatCurrency()`, `formatNumber()`, `toBanglaNumber()`
- Persists in localStorage

---

## File Organization

```
.commands/
├── README.md (this file)
├── DATABASE.md
├── BACKEND_API.md
├── FRONTEND.md
├── CODE_PATTERNS.md
├── DEBUGGING.md
├── PERMISSIONS.md
└── FEATURE_DEVELOPMENT.md
```

---

## Common Command Quick Reference

### Start Development
```bash
npm run dev              # Both backend + frontend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only
```

### Start Services
```bash
npm run start:mysql      # MySQL server
npm run start:apache     # Apache server
```

### Build Production
```bash
cd frontend && npm run build
cd backend && node src/server.js
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

### Test API
```bash
curl http://localhost:5000/api/products
curl http://localhost:5000/api/retailers
curl http://localhost:5000/api/invoices
```

---

## Notes for AI Agents

1. **Always read AGENTS.md first** - Contains code style guidelines
2. **Follow CODE_PATTERNS.md** - Ensures consistency across codebase
3. **Check PERMISSIONS.md** - Before protecting new routes
4. **Use FEATURE_DEVELOPMENT.md** - For complete feature implementation
5. **Reference DEBUGGING.md** - When troubleshooting
6. **Verify with BACKEND_API.md** - For API endpoint examples

---

## Support

For issues or questions:
1. Check relevant markdown file in this folder
2. Search for similar patterns in codebase
3. Run tests and check console output
4. Review error messages in browser console (F12) or backend logs
5. Refer to MEMORY.md in root for architecture overview
