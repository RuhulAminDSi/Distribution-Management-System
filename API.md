# DMS API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except login) use JWT token stored in HTTP-only cookie.
- Token is automatically sent with cookies
- No need to manually add Authorization header

---

## Auth Routes

### POST /auth/login
Login user and get JWT token in cookie.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "System Admin",
    "email": "admin@example.com",
    "role": "system_admin",
    "role_id": 1,
    "phone": "01700000000"
  }
}
```

**Cookie Set:**
```
Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; HttpOnly; SameSite=Lax; Max-Age=28800
```

### POST /auth/logout
Logout user and clear cookie.

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me
Get current user info.

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "System Admin",
    "email": "admin@example.com",
    "role": "system_admin",
    "role_id": 1,
    "phone": "01700000000",
    "permissions": ["all", "dashboard_view", ...]
  }
}
```

### POST /auth/register
Register new user.

**Request:**
```json
{
  "username": "newuser",
  "password": "password123",
  "full_name": "New User",
  "email": "newuser@example.com",
  "phone": "01712345678",
  "role_id": 4
}
```

### GET /auth/users
Get all users with pagination.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` (optional)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "username": "admin",
      "full_name": "System Admin",
      "email": "admin@example.com",
      "role": "system_admin",
      "role_id": 1,
      "is_active": 1,
      "created_at": "2026-03-30T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "totalPages": 1
  }
}
```

### PUT /auth/users/:id
Update user.

**Request:**
```json
{
  "full_name": "Updated Name",
  "email": "updated@example.com",
  "role_id": 3,
  "phone": "01712345678",
  "is_active": 1,
  "password": "newpassword123"
}
```

### DELETE /auth/users/:id
Delete (deactivate) user.

**Response:**
```json
{
  "message": "User deleted successfully"
}
```

### POST /auth/change-password
Change current user password.

**Request:**
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123"
}
```

---

## Role Routes

### GET /roles
Get all roles with permissions.

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "system_admin",
      "description": "Full system access with all permissions",
      "color": "#ef4444",
      "is_active": 1,
      "permissions": ["all", "dashboard_view", "companies_view", ...]
    }
  ]
}
```

### GET /roles/permissions
Get all available permissions grouped by module.

**Response:**
```json
{
  "data": {
    "system": [{ "id": 1, "name": "all", "description": "Full system access", "module": "system" }],
    "dashboard": [{ "id": 2, "name": "dashboard_view", "description": "View dashboard", "module": "dashboard" }],
    "companies": [...],
    "products": [...],
    "retailers": [...],
    "sales": [...],
    "payments": [...],
    "stock": [...],
    "reports": [...],
    "users": [...],
    "roles": [...],
    "settings": [...],
    "deliveries": [...]
  }
}
```

### GET /roles/:id
Get specific role.

### POST /roles
Create new role.

**Request:**
```json
{
  "name": "custom_role",
  "description": "Custom role description",
  "color": "#ff0000",
  "permissions": ["dashboard_view", "products_view", "sales_create"]
}
```

### PUT /roles/:id
Update role.

### DELETE /roles/:id
Delete role.

---

## Company Routes

### GET /companies
Get all companies.

### POST /companies
Create company.

**Request:**
```json
{
  "name": "New Company",
  "code": "NC001",
  "contact_person": "Jane Doe",
  "phone": "01712345678",
  "address": "Dhaka, Bangladesh",
  "due_limit": 50000
}
```

### PUT /companies/:id
Update company.

### DELETE /companies/:id
Delete company.

---

## Category Routes

### GET /categories
Get all categories.

### POST /categories
Create category.

**Request:**
```json
{
  "name": "Category Name",
  "company_id": 1,
  "description": "Category description"
}
```

### PUT /categories/:id
Update category.

### DELETE /categories/:id
Delete category.

---

## Product Routes

### GET /products
Get all products.

**Query Params:**
- `company_id`
- `category_id`
- `search`

### GET /products/low-stock
Get low stock products.

### GET /products/expired
Get expired products.

### GET /products/expiring-soon
Get products expiring soon.

### GET /products/:id
Get specific product.

### POST /products
Create product.

**Request:**
```json
{
  "name": "Product Name",
  "code": "PN001",
  "category_id": 1,
  "company_id": 1,
  "pack_size": "500ml",
  "unit": "piece",
  "price": 100,
  "cost_price": 80,
  "quantity": 100,
  "expiry_date": "2026-12-31"
}
```

### PUT /products/:id
Update product.

### DELETE /products/:id
Delete product.

---

## Retailer Routes

### GET /retailers
Get all retailers.

### GET /retailers/areas
Get all unique areas.

### GET /retailers/:id
Get specific retailer.

### GET /retailers/:id/balance
Get retailer balance.

### POST /retailers
Create retailer.

**Request:**
```json
{
  "name": "Retailer Name",
  "phone": "01712345678",
  "address": "Dhaka, Bangladesh",
  "area": "Area Name",
  "company_id": 1,
  "due_limit": 50000
}
```

### PUT /retailers/:id
Update retailer.

### DELETE /retailers/:id
Delete retailer.

---

## Invoice/Sales Routes

### GET /invoices
Get all invoices.

### GET /invoices/:id
Get specific invoice with items.

### POST /invoices
Create invoice/sale.

**Request:**
```json
{
  "retailer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 10, "rate": 100, "amount": 1000 }
  ],
  "discount": 0,
  "notes": "Sale notes"
}
```

### PUT /invoices/:id/payment
Update payment status.

---

## Payment Routes

### GET /payments
Get all payments.

### GET /payments/:id
Get specific payment.

### POST /payments
Create payment.

**Request:**
```json
{
  "retailer_id": 1,
  "invoice_id": 1,
  "amount": 1000,
  "payment_method": "cash",
  "date": "2026-03-30",
  "notes": "Payment notes"
}
```

### GET /payments/retailer/:retailerId
Get all payments for a retailer.

---

## Stock Routes

### GET /stock/history
Get stock history.

### GET /stock/purchase-orders
Get purchase orders.

### POST /stock/purchase-orders
Create purchase order.

**Request:**
```json
{
  "company_id": 1,
  "items": [
    { "product_id": 1, "quantity": 100, "rate": 80, "amount": 8000 }
  ],
  "notes": "PO notes"
}
```

### PUT /stock/purchase-orders/:id/receive
Receive purchase order.

---

## Report Routes

### GET /reports/daily-sales
Daily sales report.

### GET /reports/product-sales
Product-wise sales report.

### GET /reports/company-sales
Company-wise sales report.

### GET /reports/profit
Profit report.

### GET /reports/stock
Stock report.

### GET /reports/due
Due report.

### GET /reports/expiry
Expiry report.

---

## Dashboard Routes

### GET /dashboard/summary
Get dashboard summary.

**Response:**
```json
{
  "todaySales": 50000,
  "totalSales": 500000,
  "totalOutstanding": 150000,
  "totalProducts": 100,
  "totalRetailers": 50,
  "dueInvoices": 10
}
```

---

## Permissions List

| Permission | Description | Module |
|------------|-------------|--------|
| all | Full system access | system |
| dashboard_view | View dashboard | dashboard |
| companies_view | View companies | companies |
| companies_create | Create companies | companies |
| companies_edit | Edit companies | companies |
| companies_delete | Delete companies | companies |
| products_view | View products | products |
| products_create | Create products | products |
| products_edit | Edit products | products |
| products_delete | Delete products | products |
| retailers_view | View retailers | retailers |
| retailers_create | Create retailers | retailers |
| retailers_edit | Edit retailers | retailers |
| retailers_delete | Delete retailers | retailers |
| sales_view | View sales | sales |
| sales_create | Create sales | sales |
| payments_view | View payments | payments |
| payments_create | Create payments | payments |
| stock_view | View stock | stock |
| stock_create | Create stock | stock |
| stock_edit | Edit stock | stock |
| reports_view | View reports | reports |
| users_view | View users | users |
| users_create | Create users | users |
| users_edit | Edit users | users |
| users_delete | Delete users | users |
| roles_manage | Manage roles | roles |
| settings_view | View settings | settings |
| settings_edit | Edit settings | settings |
| view_deliveries | View deliveries | deliveries |

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 400 Bad Request
```json
{
  "message": "Invalid request data"
}
```

---

## Database Schema

### users
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| username | VARCHAR(255) | Unique username |
| password_hash | VARCHAR(255) | Bcrypt hashed password |
| full_name | VARCHAR(255) | User's full name |
| email | VARCHAR(255) | Email address |
| phone | VARCHAR(50) | Phone number |
| is_active | TINYINT | Account status (1=active) |
| role_id | INT | Foreign key to roles |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### roles
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(50) | Unique role name |
| description | TEXT | Role description |
| color | VARCHAR(20) | Role color (hex) |
| is_active | TINYINT | Role status |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### permissions
| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| name | VARCHAR(50) | Unique permission name |
| description | TEXT | Permission description |
| module | VARCHAR(50) | Module category |
| created_at | DATETIME | Creation timestamp |

### role_permissions
| Column | Type | Description |
|--------|------|-------------|
| permission_id | INT | Primary key |
| role_id | INT | Foreign key to roles |
| permission | VARCHAR(50) | Foreign key to permissions |
