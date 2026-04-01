# Backend API Commands

## Start Backend Development Server
```bash
npm run dev:backend
# or
cd backend && npm run dev
```

## Start Backend Production Server
```bash
cd backend && npm start
```

## Health Check
```bash
curl http://localhost:5000/api/health
```

---

## Common API Endpoints

### Authentication
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Logout
curl -X POST http://localhost:5000/api/auth/logout

# Get current user info
curl http://localhost:5000/api/auth/me

# Change password
curl -X POST http://localhost:5000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{"oldPassword": "old", "newPassword": "new"}'
```

### Products
```bash
# Get all products
curl http://localhost:5000/api/products?page=1&limit=20

# Get product by ID
curl http://localhost:5000/api/products/1

# Create product
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Product Name", "company_id": 1, "category_id": 1, "price": 100, "stock_quantity": 50}'

# Update product
curl -X PUT http://localhost:5000/api/products/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 120}'

# Get low stock products
curl http://localhost:5000/api/products/low-stock
```

### Retailers
```bash
# Get all retailers
curl http://localhost:5000/api/retailers?page=1&limit=20

# Create retailer
curl -X POST http://localhost:5000/api/retailers \
  -H "Content-Type: application/json" \
  -d '{"name": "Retailer Name", "phone": "01700000000", "credit_limit": 50000}'

# Get retailer balance
curl http://localhost:5000/api/retailers/1/balance
```

### Invoices
```bash
# Get all invoices
curl http://localhost:5000/api/invoices?page=1&limit=20

# Create invoice
curl -X POST http://localhost:5000/api/invoices \
  -H "Content-Type: application/json" \
  -d '{
    "retailer_id": 1,
    "items": [
      {"product_id": 1, "quantity": 10, "unit_price": 100}
    ]
  }'

# Get invoice by ID
curl http://localhost:5000/api/invoices/INV-001
```

### Payments
```bash
# Get all payments
curl http://localhost:5000/api/payments?page=1&limit=20

# Record payment
curl -X POST http://localhost:5000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"retailer_id": 1, "amount": 5000, "payment_method": "cash"}'

# Get retailer payments
curl http://localhost:5000/api/payments/retailer/1
```

### Reports
```bash
# Daily sales report
curl "http://localhost:5000/api/reports/daily-sales?start_date=2024-01-01&end_date=2024-01-31"

# Product sales report
curl "http://localhost:5000/api/reports/product-sales?start_date=2024-01-01"

# Profit report
curl "http://localhost:5000/api/reports/profit?month=1&year=2024"

# Stock report
curl http://localhost:5000/api/reports/stock

# Due report
curl http://localhost:5000/api/reports/due

# Expiry report
curl http://localhost:5000/api/reports/expiry
```

### Dashboard
```bash
# Get dashboard summary
curl http://localhost:5000/api/dashboard/summary
```

### Notifications
```bash
# Get all notifications
curl http://localhost:5000/api/notifications?page=1&limit=20

# Get unread notifications
curl http://localhost:5000/api/notifications/unread

# Mark notification as read
curl -X PUT http://localhost:5000/api/notifications/1/read
```

---

## Default Test Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: System Administrator
- **Port**: 5000
- **Environment**: development
