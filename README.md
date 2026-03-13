# Distribution Management System (DMS)

A complete web-based Distribution Management System for small distributors at the Upazila level in Bangladesh.

## Features

- **Product Management**: Add/edit/delete products with pricing (purchase, dealer, MRP), stock tracking, low stock alerts
- **Product Expiry Tracking**: Track product expiry dates, view expired and expiring soon products
- **Inventory/Stock Management**: Stock IN from companies, Stock OUT to retailers, automatic stock deduction, stock history
- **Retailer/Customer Management**: Retailer profiles with credit limits, outstanding balance tracking
- **Sales & Invoice System**: Create invoices with multiple products, discount support, auto stock deduction
- **Payment & Collection**: Record payments, track due amounts, payment history
- **Reports**: Daily sales, product-wise sales, company-wise sales, profit report, stock report, due report, expiry report
- **Dashboard**: Today's sales, total outstanding, low stock alerts, best selling products
- **User Management**: User accounts with role-based access, activate/deactivate users
- **Bilingual Support**: Full English and Bangla (Bengali) language support
- **Pagination**: All listing pages include pagination with 10/25/50/100 entries per page
- **Export Options**: PDF and Excel export for all reports

## Tech Stack

- **Frontend**: React.js with Vite
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT

## Project Structure

```
distribution-management-system/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Request handlers
│   │   ├── middleware/  # Auth, validation
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── utils/      # Helpers
│   └── package.json
├── frontend/            # React.js application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context
│   │   ├── services/   # API services
│   │   └── styles/     # CSS styles
│   └── package.json
└── README.md            # This file
```

## Setup Instructions

### 1. Database Setup

1. Install MySQL Server
2. Create a database:
   ```sql
   CREATE DATABASE dms_db;
   ```

### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Configure environment variables in `.env`:
   ```
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=dms_db
   JWT_SECRET=your_secret_key
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

### 3. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173 in your browser

### Default Login

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user
- GET `/api/auth/users` - List users (Admin)
- PUT `/api/auth/users/:id` - Update user (Admin)
- DELETE `/api/auth/users/:id` - Delete user (Admin)

### Products
- GET `/api/products` - List products (with pagination)
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)
- GET `/api/products/low-stock` - Get low stock products
- GET `/api/products/expired` - Get expired products
- GET `/api/products/expiring-soon` - Get products expiring soon

### Retailers
- GET `/api/retailers` - List retailers (with pagination)
- POST `/api/retailers` - Create retailer
- PUT `/api/retailers/:id` - Update retailer
- DELETE `/api/retailers/:id` - Delete retailer
- GET `/api/retailers/:id/balance` - Get retailer balance

### Invoices
- GET `/api/invoices` - List invoices (with pagination)
- POST `/api/invoices` - Create invoice
- PUT `/api/invoices/:id/payment` - Update payment

### Payments
- GET `/api/payments` - List payments (with pagination)
- POST `/api/payments` - Record payment

### Stock
- GET `/api/stock/history` - Stock history (with pagination)
- POST `/api/stock/purchase-orders` - Create purchase order
- GET `/api/stock/purchase-orders` - List purchase orders

### Reports
- GET `/api/reports/daily-sales` - Daily sales
- GET `/api/reports/product-sales` - Product-wise sales
- GET `/api/reports/company-sales` - Company-wise sales
- GET `/api/reports/profit` - Profit report
- GET `/api/reports/stock` - Stock report
- GET `/api/reports/due` - Due report
- GET `/api/reports/expiry` - Expiry report

### Companies
- GET `/api/companies` - List companies (with pagination)
- POST `/api/companies` - Create company
- PUT `/api/companies/:id` - Update company
- DELETE `/api/companies/:id` - Delete company

### Dashboard
- GET `/api/dashboard/summary` - Dashboard summary

## User Roles

- **System Admin**: Full access to all features, can manage other admins
- **Admin**: Full access to all features
- **Manager**: Can manage retailers, invoices, payments
- **Salesman**: Can manage retailers and create invoices
- **Accountant**: Can view reports and manage payments
- **Driver/Loader**: Limited access

## Key Features

### Product Expiry Tracking
- Add expiry date when creating/editing products
- View expiry status in product list (color-coded)
- Dedicated expiry report showing expired and expiring soon products
- Stock page shows expiry tab with all expired/expiring products

### Pagination
- All listing pages support pagination
- Options: 10, 25, 50, 100 entries per page
- Shows total entries count

### Language Support
- Toggle between English and Bangla (Bengali)
- Language toggle button in login page and sidebar
- All UI text, numbers, dates, and currency localized

### User Status Management
- Activate/deactivate user accounts
- Inactive users cannot login
- Clear error message shown for deactivated accounts

## License

MIT
