# New Feature Development Commands

Complete command reference for developing a new feature from scratch in the DMS project.

---

## Phase 1: Planning & Database Setup

### 1.1 Create Database Table
```sql
-- Add to backend/src/config/database.js initializeDatabase()
-- OR add to database/schema.sql

CREATE TABLE IF NOT EXISTS feature_name (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
  is_active TINYINT DEFAULT 1,
  created_by INT NOT NULL,
  updated_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 1.2 Add to database.js (Auto-Creation)
```javascript
// backend/src/config/database.js - inside initializeDatabase()
await connection.execute(`
  CREATE TABLE IF NOT EXISTS feature_name (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('draft', 'active', 'completed', 'cancelled') DEFAULT 'draft',
    is_active TINYINT DEFAULT 1,
    created_by INT NOT NULL,
    updated_by INT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
  )
`);
```

### 1.3 Run Manual Migration (if needed)
```bash
mysql -u root -p dms_db < database/schema.sql
```

---

## Phase 2: Backend Development

### 2.1 Create Model
```bash
# Create the model file
touch backend/src/models/FeatureName.js
```

```javascript
// backend/src/models/FeatureName.js
import { BaseModel } from './baseModel.js';
import { query } from '../config/database.js';

export class FeatureName extends BaseModel {
  constructor() {
    super('feature_name');
  }

  async findByStatus(status, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await query(
      `SELECT * FROM ${this.tableName} 
       WHERE status = ? AND is_active = 1 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [status, limit, offset]
    );
  }

  async countByStatus(status) {
    const result = await query(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE status = ? AND is_active = 1`,
      [status]
    );
    return result[0].count;
  }

  async findByCreatedBy(userId, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return await query(
      `SELECT * FROM ${this.tableName} 
       WHERE created_by = ? AND is_active = 1 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
  }
}

export const featureNameModel = new FeatureName();
```

### 2.2 Export Model from index.js
```javascript
// backend/src/models/index.js - add this line
export { FeatureName, featureNameModel } from './FeatureName.js';
```

### 2.3 Create Service
```bash
touch backend/src/services/featureNameService.js
```

```javascript
// backend/src/services/featureNameService.js
import { featureNameModel } from '../models/index.js';
import { query } from '../config/database.js';

export const featureNameService = {
  async getAll(page = 1, limit = 20, search = '') {
    const offset = (page - 1) * limit;
    
    let sql = `SELECT f.*, u.full_name as created_by_name 
               FROM feature_name f 
               LEFT JOIN users u ON f.created_by = u.id 
               WHERE f.is_active = 1`;
    const params = [];
    
    if (search) {
      sql += ` AND (f.name LIKE ? OR f.description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    sql += ` ORDER BY f.created_at DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    const data = await query(sql, params);
    
    const countSql = `SELECT COUNT(*) as total FROM feature_name WHERE is_active = 1`;
    const [countResult] = await query(countSql);
    
    return {
      data,
      pagination: {
        total: countResult.total,
        page,
        limit,
        pages: Math.ceil(countResult.total / limit)
      }
    };
  },

  async getById(id) {
    const item = await featureNameModel.findById(id);
    if (!item) throw new Error('Feature not found');
    return item;
  },

  async create(data, userId) {
    const result = await featureNameModel.create({
      ...data,
      created_by: userId
    });
    return result;
  },

  async update(id, data, userId) {
    const existing = await featureNameModel.findById(id);
    if (!existing) throw new Error('Feature not found');
    
    return await featureNameModel.update(id, {
      ...data,
      updated_by: userId
    });
  },

  async softDelete(id) {
    const existing = await featureNameModel.findById(id);
    if (!existing) throw new Error('Feature not found');
    
    return await featureNameModel.update(id, { is_active: 0 });
  },

  async updateStatus(id, status) {
    return await query(
      'UPDATE feature_name SET status = ? WHERE id = ?',
      [status, id]
    );
  }
};
```

### 2.4 Create Controller
```bash
touch backend/src/controllers/featureNameController.js
```

```javascript
// backend/src/controllers/featureNameController.js
import { featureNameService } from '../services/featureNameService.js';
import { ApiError } from '../utils/ApiError.js';

export const featureNameController = {
  async getAll(req, res, next) {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const result = await featureNameService.getAll(
        parseInt(page),
        parseInt(limit),
        search
      );
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const item = await featureNameService.getById(parseInt(req.params.id));
      res.json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const { name, description, status } = req.body;
      
      if (!name) {
        throw new ApiError(400, 'Name is required');
      }

      const result = await featureNameService.create(
        { name, description, status },
        req.user.id
      );
      res.status(201).json({ data: result, message: 'Created successfully' });
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const result = await featureNameService.update(
        parseInt(req.params.id),
        req.body,
        req.user.id
      );
      res.json({ data: result, message: 'Updated successfully' });
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await featureNameService.softDelete(parseInt(req.params.id));
      res.json({ message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      await featureNameService.updateStatus(parseInt(req.params.id), status);
      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      next(error);
    }
  }
};
```

### 2.5 Create Validation Rules
```javascript
// backend/src/utils/validation.js - add these exports

export const validateCreateFeatureName = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('description').optional().trim(),
  body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']),
  handleValidationErrors
];

export const validateUpdateFeatureName = [
  param('id').notEmpty().withMessage('Invalid ID'),
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('status').optional().isIn(['draft', 'active', 'completed', 'cancelled']),
  handleValidationErrors
];
```

### 2.6 Create Routes
```bash
touch backend/src/routes/featureNameRoutes.js
```

```javascript
// backend/src/routes/featureNameRoutes.js
import express from 'express';
import { authenticate, permit } from '../middleware/auth.js';
import { featureNameController } from '../controllers/featureNameController.js';
import { validateCreateFeatureName, validateUpdateFeatureName } from '../utils/validation.js';

const router = express.Router();

router.use(authenticate);

router.get('/', permit('featurename_view'), featureNameController.getAll);
router.get('/:id', permit('featurename_view'), featureNameController.getById);
router.post('/', permit('featurename_create'), validateCreateFeatureName, featureNameController.create);
router.put('/:id', permit('featurename_edit'), validateUpdateFeatureName, featureNameController.update);
router.delete('/:id', permit('featurename_delete'), featureNameController.delete);
router.put('/:id/status', permit('featurename_edit'), featureNameController.updateStatus);

export default router;
```

### 2.7 Register Routes in app.js
```javascript
// backend/src/app.js

// Add import at top
import featureNameRoutes from './routes/featureNameRoutes.js';

// Add route registration
app.use('/api/featurename', featureNameRoutes);
```

### 2.8 Add Permissions to Database
```javascript
// backend/src/config/database.js - inside initializeDatabase()
// Add to defaultPermissions array:
{ name: 'featurename_view', description: 'View feature name items', module: 'featurename' },
{ name: 'featurename_create', description: 'Create feature name items', module: 'featurename' },
{ name: 'featurename_edit', description: 'Edit feature name items', module: 'featurename' },
{ name: 'featurename_delete', description: 'Delete feature name items', module: 'featurename' },
```

Or run manually:
```sql
INSERT INTO permissions (name, description, module) VALUES 
  ('featurename_view', 'View feature name items', 'featurename'),
  ('featurename_create', 'Create feature name items', 'featurename'),
  ('featurename_edit', 'Edit feature name items', 'featurename'),
  ('featurename_delete', 'Delete feature name items', 'featurename');
```

---

## Phase 3: Frontend Development

### 3.1 Add Service to api.js
```javascript
// frontend/src/services/api.js - add export

export const featureNameService = {
  getAll: (params) => api.get('/featurename', { params }),
  getById: (id) => api.get(`/featurename/${id}`),
  create: (data) => api.post('/featurename', data),
  update: (id, data) => api.put(`/featurename/${id}`, data),
  delete: (id) => api.delete(`/featurename/${id}`),
  updateStatus: (id, data) => api.put(`/featurename/${id}/status`, data)
};
```

### 3.2 Create Frontend Page
```bash
touch frontend/src/pages/FeatureName.jsx
```

```jsx
// frontend/src/pages/FeatureName.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { featureNameService } from '../services/api';
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function FeatureName() {
  const { t } = useLanguage();
  const { hasPermission } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [search, page, limit]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await featureNameService.getAll({ page, limit, search });
      const data = res.data?.data || res.data || [];
      const totalVal = res.data?.pagination?.total || data.length || 0;
      setItems(data);
      setTotal(totalVal);
      setTotalPages(Math.ceil(totalVal / limit) || 1);
    } catch (error) {
      console.error('Failed to fetch:', error);
      setItems([]);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await featureNameService.update(editItem.id, formData);
      } else {
        await featureNameService.create(formData);
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({});
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('ConfirmDelete'))) return;
    try {
      await featureNameService.delete(id);
      fetchData();
    } catch (error) {
      alert(t('DeleteError'));
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        status: item.status || 'draft'
      });
    } else {
      setEditItem(null);
      setFormData({ name: '', description: '', status: 'draft' });
    }
    setShowModal(true);
  };

  return (
    <div>
      <div className="page-header">
        <h2>{t('FeatureName')}</h2>
        {hasPermission('featurename_create') && (
          <button className="btn btn-primary" onClick={() => openModal()}>
            <Plus size={18} /> {t('Add')}
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="search-bar">
            <Search size={18} />
            <input
              type="text"
              placeholder={t('Search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>{t('Name')}</th>
              <th>{t('Description')}</th>
              <th>{t('Status')}</th>
              <th>{t('Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">{t('Loading')}</td></tr>
            ) : !items || items.length === 0 ? (
              <tr><td colSpan="4">{t('NoDataFound')}</td></tr>
            ) : (
              items.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.description || '-'}</td>
                  <td><span className="badge badge-secondary">{item.status}</span></td>
                  <td>
                    {hasPermission('featurename_edit') && (
                      <button className="btn btn-sm" onClick={() => openModal(item)}>
                        <Pencil size={14} />
                      </button>
                    )}
                    {hasPermission('featurename_delete') && (
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          <ChevronLeft size={16} />
        </button>
        <span>{page} / {totalPages}</span>
        <button className="btn btn-sm btn-secondary" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
```

### 3.3 Add Route in App.jsx
```javascript
// frontend/src/App.jsx

// Add import
import FeatureName from './pages/FeatureName';

// Add route (inside PrivateRoute or PermissionRoute)
<Route path="/featurename" element={
  <PermissionRoute permission="featurename_view">
    <MainLayout><FeatureName /></MainLayout>
  </PermissionRoute>
} />
```

### 3.4 Add to Sidebar Navigation
```javascript
// frontend/src/components/layout/MainLayout.jsx

// Add icon import
import { IconName } from 'lucide-react';

// Add to navItems array
{ path: '/featurename', icon: IconName, labelKey: 'FeatureName', permission: 'featurename_view' },
```

### 3.5 Add Translation Keys
```javascript
// frontend/src/context/LanguageContext.jsx

// English section
FeatureName: 'Feature Name',
AddFeatureName: 'Add Feature',
EditFeatureName: 'Edit Feature',

// Bangla section
FeatureName: 'ফিচার নাম',
AddFeatureName: 'ফিচার যোগ করুন',
EditFeatureName: 'ফিচার সম্পাদনা',
```

---

## Phase 4: Testing & Verification

### 4.1 Restart Services
```bash
# Full restart (both backend + frontend)
npm run dev

# Or restart individually
npm run dev:backend
npm run dev:frontend
```

### 4.2 Test Backend Endpoints
```bash
# Health check
curl http://localhost:5000/api/health

# Get all items (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/featurename

# Create item
curl -X POST http://localhost:5000/api/featurename \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name": "Test Item", "description": "Test description"}'
```

### 4.3 Test Frontend
```bash
# Open browser
# Navigate to http://localhost:5173/featurename
# Check browser console (F12) for errors
# Verify CRUD operations work
```

### 4.4 Verify Permissions
```bash
# Login with different roles and verify access control
# Admin/System Admin should have full access
# Other roles should only see what their permissions allow
```

---

## Quick Reference Checklist

- [ ] Database table created (database.js or schema.sql)
- [ ] Model created (backend/src/models/FeatureName.js)
- [ ] Model exported from index.js
- [ ] Service created (backend/src/services/featureNameService.js)
- [ ] Controller created (backend/src/controllers/featureNameController.js)
- [ ] Validation rules added (backend/src/utils/validation.js)
- [ ] Routes created (backend/src/routes/featureNameRoutes.js)
- [ ] Routes registered in app.js
- [ ] Permissions added to database
- [ ] Frontend service added (api.js)
- [ ] Frontend page created (pages/FeatureName.jsx)
- [ ] Route added in App.jsx
- [ ] Sidebar item added (MainLayout.jsx)
- [ ] Translation keys added (LanguageContext.jsx)
- [ ] Backend restarted
- [ ] Frontend tested
- [ ] Permissions verified
- [ ] Bug fix MD created in .bug_fixes/ (if applicable)

---

## Naming Convention Quick Reference

| Layer | Pattern | Example |
|-------|---------|---------|
| Database table | `snake_case` | `feature_name` |
| Model file | `PascalCase.js` | `FeatureName.js` |
| Service file | `camelCaseService.js` | `featureNameService.js` |
| Controller file | `camelCaseController.js` | `featureNameController.js` |
| Route file | `camelCaseRoutes.js` | `featureNameRoutes.js` |
| Frontend page | `PascalCase.jsx` | `FeatureName.jsx` |
| API endpoint | `kebab-case` | `/api/feature-name` |
| Permission | `snake_case` | `featurename_view` |
| Translation key | `PascalCase` | `FeatureName` |
