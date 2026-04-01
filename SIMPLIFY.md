# SIMPLIFY.md - Efficient Development Workflow

Quick, streamlined guides for common development tasks in DMS.

---

## 🚀 Feature Development - Quick Path

### Step 1: Setup (2 min)
```bash
# Start development environment
npm run dev

# In another terminal, create branch
git checkout -b feature/your-feature-name
```

### Step 2: Database (if needed)
```sql
-- In database/schema.sql, add table:
CREATE TABLE my_features (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

Restart server (auto-initializes):
```bash
npm run dev:backend
```

### Step 3: Backend Structure (10 min)

**Model** → **Service** → **Controller** → **Routes**

Create these 4 files:

**backend/src/models/MyFeature.js**
```javascript
import BaseModel from './baseModel.js';

class MyFeature extends BaseModel {
  constructor() {
    super('my_features');
  }
}

export default new MyFeature();
```

**backend/src/services/myFeatureService.js**
```javascript
import { query } from '../config/database.js';

export const myFeatureService = {
  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data] = await query(
      'SELECT * FROM my_features WHERE is_active = 1 LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return data;
  },

  async create(data) {
    const [result] = await query(
      'INSERT INTO my_features (name) VALUES (?)',
      [data.name]
    );
    return result.insertId;
  }
};
```

**backend/src/controllers/myFeatureController.js**
```javascript
import { myFeatureService } from '../services/myFeatureService.js';

export const myFeatureController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const data = await myFeatureService.getAll(page, limit);
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      if (!req.body.name) {
        return res.status(400).json({ message: 'Name required' });
      }
      const id = await myFeatureService.create(req.body);
      res.status(201).json({ id });
    } catch (error) {
      next(error);
    }
  }
};
```

**backend/src/routes/myFeatureRoutes.js**
```javascript
import express from 'express';
import { authorize, permit } from '../middleware/auth.js';
import { myFeatureController } from '../controllers/myFeatureController.js';

const router = express.Router();
router.use(authorize);

router.get('/', permit('myfeature_view'), myFeatureController.getAll);
router.post('/', permit('myfeature_create'), myFeatureController.create);

export default router;
```

### Step 4: Register Routes
```javascript
// backend/src/app.js - Add this line:
import myFeatureRoutes from './routes/myFeatureRoutes.js';
app.use('/api/myfeature', myFeatureRoutes);
```

### Step 5: Frontend Service
```javascript
// frontend/src/services/api.js - Add to file:
export const myFeatureService = {
  getAll: (params) => api.get('/myfeature', { params }),
  create: (data) => api.post('/myfeature', data)
};
```

### Step 6: Frontend Page (Simple)
```javascript
// frontend/src/pages/MyFeature.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { myFeatureService } from '../services/api';

function MyFeaturePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await myFeatureService.getAll({ page: 1, limit: 20 });
      setData(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      await myFeatureService.create({ name });
      setName('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>{t('my_feature')}</h1>
      
      <input
        type="text"
        placeholder={t('name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button onClick={handleCreate}>Create</button>

      {loading ? <div>{t('loading')}</div> : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {data.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyFeaturePage;
```

### Step 7: Add Route
```javascript
// frontend/src/App.jsx - Add:
import MyFeaturePage from './pages/MyFeature';

// In routes section:
<PermissionRoute permission="myfeature_view">
  <MyFeaturePage />
</PermissionRoute>
```

### Step 8: Add Permission (if needed)
```sql
-- Add to permissions:
INSERT INTO permissions (name) VALUES ('myfeature_view');
INSERT INTO permissions (name) VALUES ('myfeature_create');

-- Assign to role (manager = role_id 2):
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions WHERE name LIKE 'myfeature_%';
```

---

## ✅ Code Review Checklist (5 min)

### Backend Review
- [ ] All controller functions use try/catch → next(error)
- [ ] All routes use authorize + permit middleware
- [ ] All database queries use `?` placeholders (no string concat)
- [ ] Service methods are pure business logic
- [ ] Error responses return JSON with status codes
- [ ] All inputs validated before DB query

### Frontend Review
- [ ] All API calls in try/catch blocks
- [ ] Loading and error states handled
- [ ] useAuth() and useLanguage() used correctly
- [ ] No hardcoded English text (use t() function)
- [ ] PermissionRoute wraps protected content
- [ ] Component is functional (not class)
- [ ] Props destructured in function signature

### Database Review
- [ ] Table has id, is_active, created_at, created_by fields
- [ ] Foreign keys reference existing tables
- [ ] Naming follows snake_case pattern
- [ ] Indexes on frequently queried columns

### Git Review
- [ ] Branch name follows convention: feature/*, fix/*, refactor/*
- [ ] Commit messages are descriptive
- [ ] No console.log or debugger statements left
- [ ] No .env or credentials in commits

---

## 🧪 Testing Quick Guide

### Manual Testing
```bash
# 1. Start everything
npm run dev

# 2. Test API with curl
curl -X POST http://localhost:5000/api/myfeature \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Item"}'

# 3. Check response
curl http://localhost:5000/api/myfeature

# 4. Test frontend
# Open http://localhost:5173
# Create an item
# Verify it shows in table
```

### Permission Testing
```bash
# 1. Login as admin: admin / admin123
# 2. Create an item (should work)
# 3. Logout
# 4. Login as user without permission
# 5. Try accessing page (should show "Access Denied")
```

### Database Testing
```bash
# Check data was saved
mysql -u root -p dms -e "SELECT * FROM my_features;"

# Check soft delete works
mysql -u root -p dms -e "UPDATE my_features SET is_active = 0 WHERE id = 1;"
mysql -u root -p dms -e "SELECT * FROM my_features WHERE is_active = 1;"
```

### Error Testing
```bash
# Test missing required field
curl -X POST http://localhost:5000/api/myfeature \
  -H "Content-Type: application/json" \
  -d '{}'  # Empty body

# Should return: { message: 'Name required' }
```

---

## 🔍 Debugging Quick Fixes

### Backend Not Starting
```bash
# Check port in use
lsof -i :5000

# Kill and restart
npm run dev:backend
```

### Frontend Can't Call API
```bash
# Check backend running
curl http://localhost:5000/api/health

# Check in browser console (F12)
# Network tab → check API calls
# Look for CORS errors
```

### Permission Denied Error
```bash
# 1. Check permission exists
mysql -u root -p dms -e "SELECT * FROM permissions WHERE name LIKE 'myfeature_%';"

# 2. Check role assigned
mysql -u root -p dms -e "SELECT * FROM role_permissions WHERE permission_id IN (SELECT id FROM permissions WHERE name LIKE 'myfeature_%');"

# 3. Restart backend to clear cache
npm run dev:backend
```

### Soft Delete Issues
```bash
# See only active items
mysql -u root -p dms -e "SELECT * FROM my_features WHERE is_active = 1;"

# Restore deleted item
mysql -u root -p dms -e "UPDATE my_features SET is_active = 1 WHERE id = 1;"
```

---

## 📝 Git Workflow - Simple

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add my feature"

# 3. Push to remote
git push -u origin feature/my-feature

# 4. Create pull request on GitHub

# 5. After review approved
git checkout main
git pull origin main
git merge feature/my-feature

# 6. Delete branch
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

---

## ⚡ Common Patterns - Copy & Paste

### Form Validation Pattern
```javascript
function handleSubmit(e) {
  e.preventDefault();
  const errors = {};
  
  if (!formData.name) errors.name = 'Required';
  if (formData.price <= 0) errors.price = 'Must be > 0';
  
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }
  
  // Submit
}
```

### Permission Check Pattern
```javascript
// Frontend
const { hasPermission } = useAuth();
if (!hasPermission('feature_edit')) return <div>Access Denied</div>;

// Backend
router.put('/:id', permit('feature_edit'), controller.update);
```

### Async Loading Pattern
```javascript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  async function fetch() {
    try {
      setLoading(true);
      const res = await service.getAll();
      setData(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  fetch();
}, []);
```

### Error Handler Pattern
```javascript
// Backend
async function handler(req, res, next) {
  try {
    // Logic
    res.json(result);
  } catch (error) {
    next(error);  // Middleware handles it
  }
}

// Frontend
try {
  await service.method();
} catch (error) {
  console.error('Error:', error);
  setError(error.response?.data?.message || 'Error');
}
```

---

## 📊 Performance Tips

### Frontend
```javascript
// ✅ Good - Prevents unnecessary re-renders
const [list, setList] = useState([]);
useEffect(() => { fetchData(); }, []); // Runs once

// ❌ Bad - Runs on every render
useEffect(() => { fetchData(); }); // No dependency array
```

### Backend
```javascript
// ✅ Good - Uses limit
const [data] = await query(
  'SELECT * FROM items LIMIT ? OFFSET ?',
  [20, 0]
);

// ❌ Bad - Fetches everything
const [data] = await query('SELECT * FROM items');
```

### Database
```javascript
// ✅ Good - Indexed query
SELECT * FROM users WHERE id = 1;  // Primary key = fast

// ❌ Bad - Full table scan
SELECT * FROM users WHERE email = 'test@test.com';  // Need index
```

---

## 🎯 Daily Checklist (Before Committing)

- [ ] Feature works end-to-end (create, read, update, delete)
- [ ] Error handling in place (try/catch, validation)
- [ ] Permissions checked (frontend + backend)
- [ ] No console.logs left (except for debug)
- [ ] No hardcoded text (use translations)
- [ ] Responsive design tested
- [ ] API tested with curl
- [ ] Database transactions intact (no orphaned records)
- [ ] All imports use absolute paths
- [ ] Code follows naming conventions
- [ ] Commit message is descriptive
- [ ] Ready for code review

---

## 🚀 Before Production Deploy

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Set NODE_ENV
export NODE_ENV=production

# 3. Start backend
cd backend && node src/server.js

# 4. Health check
curl https://your-domain.com/api/health

# 5. Test key flows
# - Login works
# - Create item works
# - Permissions enforced
# - Transactions complete
# - No error in logs
```

---

## 📞 Quick Help

**Backend won't start?**
```bash
# Check port 5000 not in use
lsof -i :5000
# Check MySQL running
mysql -u root -p -e "SELECT 1"
# Check .env file exists in backend/
```

**Frontend won't load?**
```bash
# Check backend running
curl http://localhost:5000/api/health
# Check browser console (F12)
# Clear cache: Ctrl+Shift+Delete
```

**API call fails?**
```bash
# Test with curl first
curl -X GET http://localhost:5000/api/myfeature

# Check permissions in DB
mysql -u root -p dms -e "SELECT * FROM role_permissions WHERE role_id = 1;"

# Check middleware order in routes
```

**Permission denied?**
```bash
# Restart backend (cache invalidation)
npm run dev:backend

# Check user role
mysql -u root -p dms -e "SELECT role_id FROM users WHERE id = 1;"

# Check role has permission
mysql -u root -p dms -e "SELECT * FROM role_permissions WHERE role_id = 1;"
```

---

## 📋 File Template Summary

**Use these as starting points:**

- Model: 5 lines (extends BaseModel)
- Service: 15 lines (basic CRUD)
- Controller: 20 lines (getAll, create)
- Routes: 10 lines (GET, POST with permissions)
- Frontend Page: 50 lines (basic CRUD UI)
- Frontend Service: 5 lines (API calls)

**Total new code for simple feature: ~150 lines**

---

## ✨ Common Gotchas

❌ **Forgot try/catch in async function**
```javascript
// BAD
async function getAll(req, res) {
  const data = await service.getAll();  // If error, crashes!
  res.json(data);
}

// GOOD
async function getAll(req, res, next) {
  try {
    const data = await service.getAll();
    res.json(data);
  } catch (error) {
    next(error);
  }
}
```

❌ **String concatenation in SQL**
```javascript
// BAD - SQL injection risk!
query(`SELECT * FROM users WHERE id = ${id}`);

// GOOD - Safe with placeholders
query('SELECT * FROM users WHERE id = ?', [id]);
```

❌ **No permission check**
```javascript
// BAD - Anyone can delete
router.delete('/:id', controller.delete);

// GOOD - Only authorized users
router.delete('/:id', permit('feature_delete'), controller.delete);
```

❌ **Hardcoded English text**
```javascript
// BAD - Not bilingual
return <div>Welcome to our app</div>;

// GOOD - Uses translations
const { t } = useLanguage();
return <div>{t('welcome')}</div>;
```

---

**Last Updated**: April 1, 2026
**Audience**: Developers & AI Coding Agents
**Purpose**: Speed up feature development with simplified workflows
