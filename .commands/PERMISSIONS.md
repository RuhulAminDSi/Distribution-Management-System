# Permissions & Roles Reference

## 7 Predefined Roles

| Role | Description | Typical User |
|------|-------------|--------------|
| `system_admin` | Full system access, all permissions | Owner/Admin |
| `admin` | Administrative access, manage users and settings | Manager |
| `manager` | Manage products, retailers, inventory | Store Manager |
| `salesman` | Create invoices and manage sales | Sales Staff |
| `accountant` | Record payments and view reports | Finance Staff |
| `driver` | View stock and assignments only | Delivery Driver |
| `loader` | Stock handling operations only | Warehouse Staff |

---

## 30 Permissions

### Dashboard Permissions
- `dashboard_view` - Access to dashboard and summary statistics

### Product Permissions
- `products_view` - View product list
- `products_create` - Create new products
- `products_edit` - Edit product details
- `products_delete` - Delete/deactivate products

### Retailer Permissions
- `retailers_view` - View retailer list
- `retailers_create` - Create new retailers
- `retailers_edit` - Edit retailer details
- `retailers_delete` - Delete/deactivate retailers

### Sales & Invoice Permissions
- `sales_view` - View invoices
- `sales_create` - Create invoices
- `sales_edit` - Edit invoices
- `sales_delete` - Delete invoices

### Payment Permissions
- `payments_view` - View payment records
- `payments_create` - Record payments
- `payments_edit` - Edit payment records
- `payments_delete` - Delete payment records

### Stock Permissions
- `stock_view` - View stock history
- `stock_create` - Record stock in/out
- `stock_edit` - Edit stock movements
- `stock_delete` - Delete stock records

### Report Permissions
- `reports_view` - View all reports
- `reports_daily_sales` - View daily sales report
- `reports_product_sales` - View product-wise sales
- `reports_profit` - View profit reports
- `reports_due` - View due reports
- `reports_expiry` - View expiry reports

### Company Permissions
- `companies_view` - View companies/categories
- `companies_create` - Create companies
- `companies_edit` - Edit companies
- `companies_delete` - Delete companies

### Notification Permissions
- `notifications_view` - View notifications

### Role Management Permissions
- `roles_manage` - Manage roles and permissions

---

## Permission Assignment to Roles

### system_admin (Full Access)
All 30 permissions

### admin (Administrative)
- All product, retailer, company, role permissions
- Dashboard, sales, payment, stock, report, notification views
- Can manage users and settings

### manager (Inventory Management)
- products_* (all)
- retailers_view, retailers_edit
- stock_* (all)
- sales_view
- dashboard_view
- reports_view

### salesman (Sales Operations)
- products_view
- retailers_view
- sales_create, sales_view
- payments_create, payments_view
- dashboard_view
- notifications_view

### accountant (Finance)
- payments_* (all)
- sales_view
- retailers_view
- reports_* (all)
- dashboard_view

### driver (View Only)
- products_view
- retailers_view
- stock_view
- sales_view
- dashboard_view

### loader (Warehouse)
- stock_create, stock_view
- products_view
- dashboard_view

---

## How to Check Permissions in Code

### Backend - Route Level
```javascript
// Protect entire route
router.get('/', permit('products_view'), controller.getAll);

// Multiple permissions (OR logic)
router.post('/', permit(['products_create', 'admin']), controller.create);
```

### Backend - Controller/Service Level
```javascript
export const someController = {
  async someAction(req, res, next) {
    try {
      // req.user.permissions is array of permission names
      if (!req.user.permissions.includes('products_edit')) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Continue with operation
    } catch (error) {
      next(error);
    }
  }
};
```

### Frontend
```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { hasPermission, user } = useAuth();
  
  // Check single permission
  if (!hasPermission('products_view')) {
    return <div>You don't have access</div>;
  }
  
  // Check multiple permissions
  if (!hasPermission('products_view') || !hasPermission('sales_view')) {
    return <div>Insufficient permissions</div>;
  }
  
  return <div>You have access</div>;
}
```

### Frontend - Route Protection
```javascript
<PermissionRoute permission="products_view">
  <ProductsPage />
</PermissionRoute>
```

---

## Permission Caching

Permissions are cached in memory with a 5-minute TTL:
- Backend loads permissions on first request
- Cached to avoid repeated database queries
- Automatically invalidated after 5 minutes
- Can be manually cleared with `clearPermissionCache()`

```javascript
// In auth middleware
const permissions = await loadPermissions(user.role_id);  // Cached
req.user.permissions = permissions;
```

---

## Assigning Permissions to Custom Roles

### Via Database
```sql
-- Create custom role
INSERT INTO roles (name, color) VALUES ('supervisor', 'purple');

-- Get role ID
SELECT id FROM roles WHERE name = 'supervisor';

-- Assign permissions to role
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 5, id FROM permissions WHERE name IN ('products_view', 'sales_view', 'payments_create');
```

### Via API
```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "supervisor",
    "color": "purple",
    "permissions": [1, 2, 3, 4, 5]  # Permission IDs
  }'
```

---

## Default Admin User

**Automatically created on first startup:**
- **Username**: admin
- **Password**: admin123
- **Role**: system_admin (full access)
- **Status**: active

Change password after first login!
