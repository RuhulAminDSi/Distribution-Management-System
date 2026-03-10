# Distribution Management System (DMS) - Technical Specification

## 1. Project Overview

**Project Name:** Upazila Distribution Management System (DMS)
**Type:** Full-stack Web Application
**Core Functionality:** Stock, Sales, and Payment Management for Small Distributors
**Target Users:** Admin, Salesman, Accountant at Upazila-level distributors in Bangladesh

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (React.js)                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │Dashboard│ │Products │ │Retailers│ │  Sales  │ │ Reports │           │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘           │
│       └──────────┴──────────┴──────────┴──────────┘                   │
│                              │                                          │
│                    ┌──────────▼──────────┐                              │
│                    │   React Router      │                              │
│                    │   Context API       │                              │
│                    │   Axios Client     │                              │
│                    └──────────┬──────────┘                              │
└───────────────────────────────┼─────────────────────────────────────────┘
                                │ HTTPS/REST
┌───────────────────────────────▼─────────────────────────────────────────┐
│                         SERVER (Node.js + Express)                      │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Middleware Layer                          │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │    │
│  │  │ Auth     │  │ Validation│  │ Logger   │  │ Error    │       │    │
│  │  │ JWT      │  │          │  │          │  │ Handler  │       │    │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Controller Layer                           │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │Product │ │Retailer│ │  Sales │ │Payment │ │ Report │        │    │
│  │  │Controller    │Controller    │Controller    │Controller       │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      Service Layer                              │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │    │
│  │  │Product │ │Retailer│ │  Sales │ │Payment │ │ Report │        │    │
│  │  │Service │ │Service │ │Service │ │Service │ │Service │        │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────────┐
│                      DATABASE (MySQL)                                    │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │  Users  │ │Products │ │Retailers│ │Invoices │ │Payments │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                                   │
│  │Companies│ │Categories│ │StockLog │                                   │
│  └─────────┘ └─────────┘ └─────────┘                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Database Schema

### 3.1 Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role ENUM('admin', 'salesman', 'accountant') NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.2 Companies Table
```sql
CREATE TABLE companies (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(20) UNIQUE,
  contact_person VARCHAR(100),
  phone VARCHAR(20),
  address TEXT,
  due_limit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.3 Categories Table
```sql
CREATE TABLE categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  company_id INT,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
```

### 3.4 Products Table
```sql
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE,
  category_id INT,
  company_id INT,
  purchase_price DECIMAL(10,2) NOT NULL,
  dealer_price DECIMAL(10,2) NOT NULL,
  mrp DECIMAL(10,2) NOT NULL,
  stock_quantity INT DEFAULT 0,
  low_stock_alert INT DEFAULT 10,
  unit VARCHAR(20) DEFAULT 'piece',
  pack_size INT DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);
```

### 3.5 Retailers Table
```sql
CREATE TABLE retailers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  code VARCHAR(50) UNIQUE,
  owner_name VARCHAR(100),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  area VARCHAR(100),
  credit_limit DECIMAL(12,2) DEFAULT 0,
  outstanding_balance DECIMAL(12,2) DEFAULT 0,
  due_limit DECIMAL(12,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3.6 Invoices Table
```sql
CREATE TABLE invoices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_no VARCHAR(50) UNIQUE NOT NULL,
  retailer_id INT NOT NULL,
  created_by INT NOT NULL,
  subtotal DECIMAL(12,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('due', 'partial', 'paid') DEFAULT 'due',
  notes TEXT,
  invoice_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (retailer_id) REFERENCES retailers(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3.7 Invoice Items Table
```sql
CREATE TABLE invoice_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  invoice_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.8 Payments Table
```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  payment_no VARCHAR(50) UNIQUE NOT NULL,
  retailer_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_method ENUM('cash', 'bank', 'mobile_banking', 'cheque') DEFAULT 'cash',
  reference_no VARCHAR(100),
  notes TEXT,
  collected_by INT NOT NULL,
  payment_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (retailer_id) REFERENCES retailers(id),
  FOREIGN KEY (collected_by) REFERENCES users(id)
);
```

### 3.9 Stock Logs Table
```sql
CREATE TABLE stock_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  type ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  reference_type VARCHAR(50),
  reference_id INT,
  notes TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3.10 Purchase Orders Table (Stock In)
```sql
CREATE TABLE purchase_orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  po_no VARCHAR(50) UNIQUE NOT NULL,
  company_id INT NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  due_amount DECIMAL(12,2) DEFAULT 0,
  status ENUM('pending', 'received', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  order_date DATE NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (company_id) REFERENCES companies(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 3.11 Purchase Order Items Table
```sql
CREATE TABLE purchase_order_items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  purchase_order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  rate DECIMAL(10,2) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  received_quantity INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

---

## 4. API Endpoints

### 4.1 Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/logout | User logout | Auth |
| GET | /api/auth/me | Get current user | Auth |

### 4.2 Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/products | List all products | Auth |
| GET | /api/products/:id | Get product details | Auth |
| POST | /api/products | Create product | Admin |
| PUT | /api/products/:id | Update product | Admin |
| DELETE | /api/products/:id | Delete product | Admin |
| GET | /api/products/low-stock | Get low stock products | Auth |
| GET | /api/products/categories | Get product categories | Auth |

### 4.3 Companies
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/companies | List companies | Auth |
| POST | /api/companies | Create company | Admin |
| PUT | /api/companies/:id | Update company | Admin |
| DELETE | /api/companies/:id | Delete company | Admin |

### 4.4 Categories
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/categories | List categories | Auth |
| POST | /api/categories | Create category | Admin |
| PUT | /api/categories/:id | Update category | Admin |
| DELETE | /api/categories/:id | Delete category | Admin |

### 4.5 Retailers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/retailers | List retailers | Auth |
| GET | /api/retailers/:id | Get retailer details | Auth |
| POST | /api/retailers | Create retailer | Admin/Salesman |
| PUT | /api/retailers/:id | Update retailer | Admin/Salesman |
| DELETE | /api/retailers/:id | Delete retailer | Admin |
| GET | /api/retailers/:id/balance | Get retailer balance | Auth |

### 4.6 Sales/Invoices
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/invoices | List invoices | Auth |
| GET | /api/invoices/:id | Get invoice details | Auth |
| POST | /api/invoices | Create invoice | Auth |
| GET | /api/invoices/:id/print | Get printable invoice | Auth |
| PUT | /api/invoices/:id/status | Update invoice status | Auth |

### 4.7 Payments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/payments | List payments | Auth |
| GET | /api/payments/:id | Get payment details | Auth |
| POST | /api/payments | Record payment | Auth |
| GET | /api/payments/retailer/:id | Get retailer payments | Auth |

### 4.8 Stock/Purchase
| Method | Endpoint | Description | Access|
|--------|----------|-------------|--------|
| GET | /api/stock | Stock report | Auth |
| GET | /api/stock/history | Stock history log | Auth |
| POST | /api/purchase-orders | Create purchase order | Admin |
| PUT | /api/purchase-orders/:id/receive | Receive stock | Admin |

### 4.9 Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/reports/daily-sales | Daily sales report | Auth |
| GET | /api/reports/product-sales | Product-wise sales | Auth |
| GET | /api/reports/company-sales | Company-wise sales | Auth |
| GET | /api/reports/profit | Profit report | Auth |
| GET | /api/reports/due | Due report | Auth |
| GET | /api/reports/stock | Stock report | Auth |

### 4.10 Dashboard
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | /api/dashboard/summary | Dashboard summary | Auth |

---

## 5. Folder Structure

```
distribution-management-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── env.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validation.js
│   │   │   └── errorHandler.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── retailerController.js
│   │   │   ├── invoiceController.js
│   │   │   ├── paymentController.js
│   │   │   ├── stockController.js
│   │   │   ├── reportController.js
│   │   │   └── dashboardController.js
│   │   ├── services/
│   │   │   ├── productService.js
│   │   │   ├── retailerService.js
│   │   │   ├── invoiceService.js
│   │   │   ├── paymentService.js
│   │   │   ├── stockService.js
│   │   │   └── reportService.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Retailer.js
│   │   │   ├── Invoice.js
│   │   │   └── Payment.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── retailerRoutes.js
│   │   │   ├── invoiceRoutes.js
│   │   │   ├── paymentRoutes.js
│   │   │   ├── stockRoutes.js
│   │   │   ├── reportRoutes.js
│   │   │   └── dashboardRoutes.js
│   │   ├── utils/
│   │   │   ├── generateCode.js
│   │   │   └── helpers.js
│   │   ├── validations/
│   │   │   ├── productValidation.js
│   │   │   ├── retailerValidation.js
│   │   │   └── invoiceValidation.js
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx
│   │   │   │   └── Header.jsx
│   │   │   ├── products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductForm.jsx
│   │   │   │   └── ProductCard.jsx
│   │   │   ├── retailers/
│   │   │   │   ├── RetailerList.jsx
│   │   │   │   ├── RetailerForm.jsx
│   │   │   │   └── RetailerDetails.jsx
│   │   │   ├── sales/
│   │   │   │   ├── InvoiceList.jsx
│   │   │   │   ├── InvoiceForm.jsx
│   │   │   │   └── InvoicePrint.jsx
│   │   │   ├── payments/
│   │   │   │   ├── PaymentList.jsx
│   │   │   │   └── PaymentForm.jsx
│   │   │   └── reports/
│   │   │       ├── SalesReport.jsx
│   │   │       ├── StockReport.jsx
│   │   │       └── DueReport.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   ├── Retailers.jsx
│   │   │   ├── Sales.jsx
│   │   │   ├── Payments.jsx
│   │   │   ├── Stock.jsx
│   │   │   ├── Reports.jsx
│   │   │   ├── Settings.jsx
│   │   │   └── Login.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── AppContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── productService.js
│   │   │   ├── retailerService.js
│   │   │   └── reportService.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   └── constants.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── database/
│   └── schema.sql
├── docs/
│   └── API.md
└── README.md
```

---

## 6. UI/UX Design Specification

### 6.1 Color Palette
- **Primary:** #1976D2 (Blue - Trust/Business)
- **Primary Dark:** #0D47A1
- **Primary Light:** #BBDEFB
- **Secondary:** #388E3C (Green - Money/Profit)
- **Secondary Dark:** #1B5E20
- **Accent:** #FF6F00 (Orange - Alerts)
- **Danger:** #D32F2F (Red - Due/Alert)
- **Warning:** #FFA000 (Amber - Warning)
- **Background:** #F5F5F5
- **Surface:** #FFFFFF
- **Text Primary:** #212121
- **Text Secondary:** #757575
- **Border:** #E0E0E0

### 6.2 Typography
- **Font Family:** 'IBM Plex Sans', 'Noto Sans Bengali', sans-serif
- **Heading 1:** 28px, 600 weight
- **Heading 2:** 24px, 600 weight
- **Heading 3:** 20px, 500 weight
- **Body:** 14px, 400 weight
- **Small:** 12px, 400 weight

### 6.3 Layout Structure

#### Main Layout
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (64px)                                              │
│  ┌─────────────────────────────────────────────────────────┤
│  │ Logo │ Search │ Notifications │ User Menu               │
├────────────┬────────────────────────────────────────────────┤
│            │                                                │
│  SIDEBAR   │  MAIN CONTENT AREA                            │
│  (240px)   │                                                │
│            │  ┌──────────────────────────────────────────┐  │
│  • Dashboard   │  Page Title                      │  │
│  • Products    │  ├──────────────────────────────────────────┤  │
│  • Retailers   │                                          │  │
│  • Sales       │  Content                                  │  │
│  • Payments    │                                          │  │
│  • Stock       │                                          │  │
│  • Reports     │                                          │  │
│  • Settings    │                                          │  │
│            │  └──────────────────────────────────────────┘  │
│            │                                                │
└────────────┴────────────────────────────────────────────────┘
```

### 6.4 Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Welcome, Admin                                              │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │ Today's  │ │ Outstanding│ │ Low Stock │ │ Products │        │
│  │ Sales    │ │          │ │ Alerts    │ │ Count    │        │
│  │ ৳45,000  │ │ ৳2,50,000│ │ 5         │ │ 130      │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────────────┐ ┌────────────────────────┐     │
│  │ Recent Sales           │ │ Low Stock Products     │     │
│  │ ─────────────────────  │ │ ─────────────────────  │     │
│  │ #INV001 | Shop A | ৳5000  │ │ Product A | 5 pcs   │     │
│  │ #INV002 | Shop B | ৳3500  │ │ Product B | 3 pcs   │     │
│  │ #INV003 | Shop C | ৳7200  │ │ Product C | 8 pcs   │     │
│  └────────────────────────┘ └────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 6.5 Responsive Breakpoints
- **Mobile:** < 768px (Single column, collapsible sidebar)
- **Tablet:** 768px - 1024px (Two columns)
- **Desktop:** > 1024px (Full layout)

---

## 7. Implementation Phases

### Phase 1: Foundation (Week 1)
- Project setup (React + Express)
- Database setup and schema
- Authentication system
- Basic UI layout

### Phase 2: Core Features (Week 2)
- Product management
- Retailer management
- Basic inventory

### Phase 3: Sales & Payments (Week 3)
- Invoice system
- Payment collection
- Stock management

### Phase 4: Reports & Dashboard (Week 4)
- Dashboard widgets
- Report generation
- Export features

### Phase 5: Polish & Deploy (Week 5)
- UI refinements
- Testing
- Deployment

---

## 8. Security Requirements

1. **Password:** bcrypt hashing with salt rounds 10
2. **Authentication:** JWT with 24h expiry
3. **Role-based Access:** Admin, Salesman, Accountant
4. **Input Validation:** All inputs sanitized
5. **SQL Injection:** Parameterized queries
6. **CORS:** Configured for frontend origin
7. **Rate Limiting:** API rate limiting enabled
