# Common Development Tasks

## Setting Up New Feature Development

### 1. Create New Database Table
```sql
-- In database/schema.sql
CREATE TABLE my_feature (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

Then run database migration:
```bash
mysql -u root -p dms < database/schema.sql
```

### 2. Create Model
```javascript
// backend/src/models/MyFeature.js
import { query } from '../config/database.js';
import BaseModel from './baseModel.js';

class MyFeature extends BaseModel {
  constructor() {
    super('my_feature');
  }

  async someCustomMethod(id) {
    const [result] = await query(
      'SELECT * FROM my_feature WHERE id = ? AND is_active = 1',
      [id]
    );
    return result;
  }
}

export default new MyFeature();
```

### 3. Create Service
```javascript
// backend/src/services/myFeatureService.js
import { query } from '../config/database.js';

export const myFeatureService = {
  async getAll(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [data] = await query(
      'SELECT * FROM my_feature WHERE is_active = 1 LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return data;
  },

  async create(data) {
    const [result] = await query(
      'INSERT INTO my_feature (name, description, created_by) VALUES (?, ?, ?)',
      [data.name, data.description, data.createdBy]
    );
    return result.insertId;
  }
};
```

### 4. Create Controller
```javascript
// backend/src/controllers/myFeatureController.js
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
      const { name, description } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: 'Name required' });
      }

      const id = await myFeatureService.create({
        name,
        description,
        createdBy: req.user.id
      });
      res.status(201).json({ id, message: 'Created successfully' });
    } catch (error) {
      next(error);
    }
  }
};
```

### 5. Create Routes
```javascript
// backend/src/routes/myFeatureRoutes.js
import express from 'express';
import { authorize, permit } from '../middleware/auth.js';
import { myFeatureController } from '../controllers/myFeatureController.js';

const router = express.Router();

router.use(authorize);

router.get('/', permit('myfeature_view'), myFeatureController.getAll);
router.post('/', permit('myfeature_create'), myFeatureController.create);

export default router;
```

### 6. Register Routes in app.js
```javascript
// backend/src/app.js
import myFeatureRoutes from './routes/myFeatureRoutes.js';

app.use('/api/myfeature', myFeatureRoutes);
```

### 7. Create Frontend Service
```javascript
// frontend/src/services/api.js (add to existing file)
export const myFeatureService = {
  getAll: (params) => api.get('/myfeature', { params }),
  getById: (id) => api.get(`/myfeature/${id}`),
  create: (data) => api.post('/myfeature', data),
  update: (id, data) => api.put(`/myfeature/${id}`, data),
  delete: (id) => api.delete(`/myfeature/${id}`)
};
```

### 8. Create Frontend Page
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

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const response = await myFeatureService.getAll({ page: 1, limit: 20 });
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div>
      <h1>{t('my_feature')}</h1>
      {/* Render data here */}
    </div>
  );
}

export default MyFeaturePage;
```

### 9. Add to Navigation
```javascript
// frontend/src/components/layout/MainLayout.jsx
// Add to sidebar menu
{hasPermission('myfeature_view') && (
  <NavItem
    label={t('my_feature')}
    icon={<Icon />}
    path="/myfeature"
  />
)}
```

### 10. Add to Router
```javascript
// frontend/src/App.jsx
import MyFeaturePage from './pages/MyFeature';

// Add route
<PermissionRoute permission="myfeature_view">
  <MyFeaturePage />
</PermissionRoute>
```

---

## Adding New Permissions

### 1. Create Permission in Database
```sql
INSERT INTO permissions (name) VALUES ('myfeature_view');
INSERT INTO permissions (name) VALUES ('myfeature_create');
INSERT INTO permissions (name) VALUES ('myfeature_edit');
INSERT INTO permissions (name) VALUES ('myfeature_delete');
```

### 2. Or Add via API
```bash
curl -X POST http://localhost:5000/api/roles/permissions \
  -H "Content-Type: application/json" \
  -d '{"name": "myfeature_view"}'
```

### 3. Assign to Roles
```sql
-- Get permission IDs
SELECT id FROM permissions WHERE name LIKE 'myfeature_%';

-- Assign to role (e.g., manager = role_id 2)
INSERT INTO role_permissions (role_id, permission_id) VALUES (2, 31);
```

---

## Testing New Changes

### Backend
```bash
# Start backend in watch mode
npm run dev:backend

# Test endpoint
curl http://localhost:5000/api/myfeature

# Check logs for errors
# Backend logs appear in terminal
```

### Frontend
```bash
# Start frontend in dev mode
npm run dev:frontend

# Open http://localhost:5173
# Check browser console (F12) for errors
# Network tab shows all API calls
```

### Full Stack
```bash
# Start everything together
npm run dev

# Test in browser
# Monitor both backend and frontend logs
```

---

## Database Migration Checklist

- [ ] Created table in schema.sql
- [ ] Set `is_active` field for soft deletes
- [ ] Added `created_at` timestamp
- [ ] Added `created_by` user reference
- [ ] Added foreign key constraints
- [ ] Created corresponding Model class
- [ ] Created corresponding Service
- [ ] Created corresponding Controller
- [ ] Created corresponding Routes
- [ ] Registered routes in app.js
- [ ] Added permissions (if protected)
- [ ] Cleared permission cache on startup
- [ ] Created frontend Service
- [ ] Created frontend Page/Component
- [ ] Added to navigation menu
- [ ] Added to Router with PermissionRoute
- [ ] Added translation keys to LanguageContext
