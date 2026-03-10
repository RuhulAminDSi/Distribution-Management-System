# Distribution Management System (DMS)

A complete web-based Distribution Management System for small distributors at the Upazila level in Bangladesh.

## Features

- **Product Management**: Add/edit/delete products with pricing (purchase, dealer, MRP), stock tracking, low stock alerts
- **Inventory/Stock Management**: Stock IN from companies, Stock OUT to retailers, automatic stock deduction, stock history
- **Retailer/Customer Management**: Retailer profiles with credit limits, outstanding balance tracking
- **Sales & Invoice System**: Create invoices with multiple products, discount support, auto stock deduction
- **Payment & Collection**: Record payments, track due amounts, payment history
- **Reports**: Daily sales, product-wise sales, company-wise sales, profit report, stock report, due report
- **Dashboard**: Today's sales, total outstanding, low stock alerts, best selling products

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
├── database/           # SQL schema
│   └── schema.sql
└── SPEC.md            # Technical specification
```

## Setup Instructions

### 1. Database Setup

1. Install MySQL Server
2. Create a database:
   ```sql
   CREATE DATABASE dms_db;
   ```
3. Run the schema:
   ```bash
   mysql -u root -p dms_db < database/schema.sql
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

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open http://localhost:5173 in your browser

### Default Login

- Username: `admin`
- Password: `admin123`

## API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- GET `/api/auth/me` - Get current user

### Products
- GET `/api/products` - List products
- POST `/api/products` - Create product (Admin)
- PUT `/api/products/:id` - Update product (Admin)
- DELETE `/api/products/:id` - Delete product (Admin)
- GET `/api/products/low-stock` - Get low stock products

### Retailers
- GET `/api/retailers` - List retailers
- POST `/api/retailers` - Create retailer
- PUT `/api/retailers/:id` - Update retailer
- DELETE `/api/retailers/:id` - Delete retailer
- GET `/api/retailers/:id/balance` - Get retailer balance

### Invoices
- GET `/api/invoices` - List invoices
- POST `/api/invoices` - Create invoice
- PUT `/api/invoices/:id/payment` - Update payment

### Payments
- GET `/api/payments` - List payments
- POST `/api/payments` - Record payment

### Reports
- GET `/api/reports/daily-sales` - Daily sales
- GET `/api/reports/product-sales` - Product-wise sales
- GET `/api/reports/company-sales` - Company-wise sales
- GET `/api/reports/profit` - Profit report
- GET `/api/reports/stock` - Stock report
- GET `/api/reports/due` - Due report

### Dashboard
- GET `/api/dashboard/summary` - Dashboard summary

## User Roles

- **Admin**: Full access to all features
- **Salesman**: Can manage retailers and create invoices
- **Accountant**: Can view reports and manage payments

## License

MIT
