# Distribution Management System (DMS) - Project Architecture

## 1. OVERALL PROJECT STRUCTURE

The Distribution Management System is a full-stack web application built with modern JavaScript frameworks. The project follows a monorepo structure with clearly separated frontend and backend applications.

```
distribution-management/
├── backend/              # Node.js/Express REST API
│   ├── src/
│   │   ├── app.js       # Express app configuration
│   │   ├── server.js    # Server entry point
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Request handlers (11 controllers)
│   │   ├── models/      # Data models (6 models)
│   │   ├── routes/      # API route definitions (11 routes)
│   │   ├── services/    # Business logic (10 services)
│   │   ├── middleware/  # Auth, error handling (2 files)
│   │   ├── utils/       # Helper functions
│   │   ├── validations/ # Input validation
│   │   └── [seed files] # Database seeding scripts
│   ├── package.json
│   ├── .env            # Environment configuration
│   └── dms.db          # SQLite database (development)
│
├── frontend/            # React.js SPA
│   ├── src/
│   │   ├── App.jsx      # Main routing component
│   │   ├── main.jsx     # React entry point
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # 15 page components
│   │   ├── context/     # State management (Auth, Language)
│   │   ├── services/    # API client (api.js)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── utils/       # Helper utilities
│   │   └── styles/      # Global CSS (index.css)
│   ├── index.html       # HTML entry point
│   ├── package.json
│   ├── vite.config.js   # Vite configuration
│   └── dist/            # Production build
│
├── database/
│   └── schema.sql       # Database schema definition
│
├── scripts/
│   └── start-servers.js # Service startup orchestration
│
└── package.json         # Root package (npm scripts)
```

---

## 2. TECHNOLOGY STACK AND FRAMEWORKS

### **Backend (Node.js/Express)**
- **Runtime**: Node.js (ES Modules, `--watch` mode for development)
- **Framework**: Express.js 4.18.2
  - CORS support for cross-origin requests
  - Cookie parser for session management
  - Rate limiting (configured but disabled for development)
- **Database**: MySQL 2 (mysql2 library)
  - Connection pooling with 10 connections
  - Support for retries on lock timeouts
- **Authentication**: JWT (jsonwebtoken) with 24-hour expiration
- **Security**:
  - bcryptjs for password hashing
  - httpOnly, secure cookies
  - Role-based access control (RBAC)
  - Permission-based authorization
- **Email**: Nodemailer 8.0.2 for password reset functionality
- **Utilities**: 
  - uuid for generating unique identifiers
  - dotenv for environment management
  - express-validator for input validation

### **Frontend (React/Vite)**
- **Build Tool**: Vite 5.0.8 (fast HMR, ES modules)
- **Framework**: React 18.2.0
  - Context API for state management
  - React Router 6.21.0 for client-side routing
  - Custom hooks for reusable logic
- **UI Components**: Lucide React (icon library)
- **Styling**: Plain CSS (no CSS framework like Bootstrap)
- **Data Handling**:
  - Axios 1.6.2 for HTTP requests
  - JSON format for API communication
- **Localization**:
  - Bilingual support (English & Bangla/Bengali)
  - Custom translation system in LanguageContext
- **Export Features**:
  - XLSX (xlsx 0.18.5) for Excel exports
  - PDF generation (jspdf, jspdf-autotable, html2pdf.js)
  - html2canvas for screenshot functionality
- **Fonts**: Noto Sans Bengali (@fontsource) for Bengali text support
- **File Handling**: file-saver for client-side downloads

### **Development Tools**
- **Root Scripts**: concurrently for running backend and frontend simultaneously
- **Database**: MySQL 5.7+ (XAMPP stack)
- **Version Control**: Git

---

## 3. KEY MODULES AND THEIR RESPONSIBILITIES

### **BACKEND MODULES**

#### **Controllers (11 files)**
Handles HTTP request/response and calls appropriate services:

1. **authController.js** (429 lines)
   - Login, logout, user registration
   - User management (CRUD operations)
   - Password change and reset
   - Account status validation

2. **productController.js** (86 lines)
   - CRUD operations for products
   - Low stock filtering
   - Expiry tracking (expired, expiring soon)
   - Pagination and filtering support

3. **invoiceController.js** (1321 lines)
   - Invoice creation with line items
   - Payment updates
   - Invoice listing with filters
   - Automatic stock deduction

4. **paymentController.js** (1251 lines)
   - Payment recording
   - Payment history
   - Retailer balance calculations

5. **stockController.js** (1200 lines)
   - Stock movement tracking (IN/OUT/ADJUSTMENT)
   - Purchase order management
   - Stock history and reports

6. **retailerController.js** (1705 lines)
   - Retailer CRUD operations
   - Credit limit management
   - Outstanding balance tracking
   - Area-wise filtering

7. **companyController.js** (2488 lines)
   - Company management
   - Category management
   - Due limit configuration

8. **reportController.js** (3326 lines)
   - Daily sales reports
   - Product-wise sales analysis
   - Company-wise sales analysis
   - Profit reports
   - Stock and due reports
   - Product expiry reports

9. **dashboardController.js** (291 lines)
   - Summary statistics
   - Today's sales
   - Total outstanding
   - Low stock alerts
   - Recent invoices

10. **notificationController.js** (3180 lines)
    - Notification CRUD
    - Mark as read functionality
    - Notification filtering by category

11. **roleController.js** (2756 lines)
    - Role management
    - Permission assignment
    - Role listing and filtering

#### **Services (10 files)**
Contains business logic and database operations:

1. **invoiceService.js** - Invoice creation with transaction handling
2. **paymentService.js** - Payment processing and balance updates
3. **productService.js** - Product management and stock validation
4. **retailerService.js** - Retailer operations
5. **companyService.js** - Company and category management
6. **stockService.js** - Stock movement and purchase orders
7. **reportService.js** - Complex report generation with aggregations
8. **dashboardService.js** - Dashboard data aggregation
9. **emailService.js** - Email notifications (SMTP)
10. **notificationService.js** - In-app notification creation

#### **Models (6 files)**
Data access abstraction:

1. **baseModel.js** - Abstract base class with common CRUD methods
   - findAll, findById, create, update, delete, count
   - Supports conditions and ordering

2. **User.js** - User model with password hashing/verification
3. **Role.js** - Role model with permission management
4. **Permission.js** - Permission model
5. **Notification.js** - Notification model
6. **index.js** - Model exports

#### **Routes (11 files)**
API endpoint definitions with authentication/authorization:

| Route | Purpose | Auth | Permissions |
|-------|---------|------|-------------|
| `/api/auth/*` | Authentication | JWT | Various |
| `/api/products/*` | Product management | Required | products_view, create, edit, delete |
| `/api/retailers/*` | Retailer management | Required | retailers_view, create, edit, delete |
| `/api/invoices/*` | Sales/invoicing | Required | sales_view, sales_create, payments_create |
| `/api/payments/*` | Payment recording | Required | payments_view, payments_create |
| `/api/stock/*` | Stock management | Required | stock_view, stock_create, stock_edit |
| `/api/reports/*` | Reporting | Required | reports_view |
| `/api/dashboard/*` | Dashboard data | Required | dashboard_view |
| `/api/companies/*` | Company/category mgmt | Required | companies_view, create, edit, delete |
| `/api/roles/*` | Role management | Required | roles_manage |
| `/api/notifications/*` | Notifications | Required | notifications_view |

#### **Middleware (2 files)**

1. **auth.js** (126 lines)
   - JWT verification with cookie/header support
   - User activation status check
   - Permission loading with caching (5-minute TTL)
   - Role-based authorization (`authorize`)
   - Permission-based authorization (`permit`)
   - Permission cache clearing mechanism

2. **errorHandler.js** (24 lines)
   - Global error handling
   - MySQL error mapping
   - Development mode stack traces
   - JSON parsing error handling

#### **Database Configuration**

**config/database.js** (390 lines)
- MySQL connection pooling (10 connections, queue-based)
- Automatic retry logic for lock timeouts
- Database initialization with table creation
- Default roles seeding (7 roles with color coding)
- Default permissions seeding (30 permissions)
- Default admin user creation (admin/admin123)

**Tables (14 tables)**:
1. users
2. roles
3. role_permissions
4. permissions
5. companies
6. categories
7. products (with expiry_date field)
8. retailers
9. invoices
10. invoice_items
11. payments
12. stock_logs
13. purchase_orders
14. purchase_order_items
15. notifications

---

### **FRONTEND MODULES**

#### **Pages (15 components)**
Full-page components mounted via router:

1. **Dashboard.jsx** - Summary statistics and widgets
2. **Companies.jsx** - Company management
3. **Products.jsx** - Product listing/CRUD
4. **Retailers.jsx** - Retailer management
5. **Sales.jsx** - Invoice creation and listing
6. **Payments.jsx** - Payment recording
7. **Stock.jsx** - Stock management and purchase orders
8. **Reports.jsx** - Multi-tab reporting interface
9. **Users.jsx** - User management
10. **Settings.jsx** - System settings
11. **Notifications.jsx** - Notification center
12. **Login.jsx** - Authentication page
13. **ResetPassword.jsx** - Password recovery
14. **Landing.jsx** - Public homepage
15. **NotFound.jsx** - 404/unauthorized handler

#### **Components (2 layout components)**

1. **MainLayout.jsx** (209 lines)
   - Sidebar navigation with permission checking
   - Top navigation bar
   - Mobile responsiveness
   - Password change modal
   - User menu with settings

2. **TopNav.jsx**
   - Header with app logo
   - User profile menu
   - Language toggle
   - Notification icon with badge

#### **Context Providers (2)**

1. **AuthContext.jsx** (119 lines)
   - User authentication state
   - Token management (localStorage)
   - Permission checking with role hierarchy
   - User role management
   - Token expiry (8 hours)
   - useAuth() hook for component access

2. **LanguageContext.jsx** (635 lines)
   - Bilingual translations (English & Bangla)
   - 500+ translation keys
   - Language persistence in localStorage
   - Utility functions:
     - formatCurrency() - Taka formatting
     - formatNumber() - Number localization
     - formatDate() - Date formatting
     - formatDateTime() - DateTime formatting
     - toBanglaNumber() - Number translation
   - Cross-tab synchronization

#### **API Service Layer (services/api.js)**

Modular API client with separate services:

```javascript
- authService: login, logout, user management
- productService: product CRUD, stock checks
- retailerService: retailer operations, balance
- invoiceService: invoice CRUD
- paymentService: payment recording
- stockService: stock history, purchase orders
- reportService: 7 report types
- dashboardService: summary data
- companyService: company and category management
- roleService: role management
- notificationService: notification operations
```

All services use a base axios instance with:
- Credentials enabled
- 30-second timeout
- Automatic proxy to backend (/api)

---

## 4. FILE ORGANIZATION AND NAMING CONVENTIONS

### **Backend Naming Conventions**

- **Controllers**: `[entity]Controller.js` (e.g., productController.js)
- **Services**: `[entity]Service.js` (e.g., invoiceService.js)
- **Models**: `[Entity].js` (PascalCase, e.g., User.js)
- **Routes**: `[entity]Routes.js` (e.g., productRoutes.js)
- **Database**: `database.js` in config folder
- **Middleware**: camelCase (e.g., auth.js)
- **Utilities**: `helpers.js` (general-purpose functions)
- **Seed scripts**: `seed*.js` (database population)

### **Frontend Naming Conventions**

- **Pages**: `[Feature].jsx` (e.g., Dashboard.jsx, Products.jsx)
- **Components**: Folder-based organization with same-name file
- **Contexts**: `[Context].jsx` (e.g., AuthContext.jsx)
- **Services**: `api.js` (single centralized API client)
- **Styles**: `index.css` (global styles)
- **Hooks**: camelCase in dedicated folder (future use)

### **File Structure Patterns**

**Backend**: Feature-oriented (organized by function)
```
controllers/          (all request handlers)
services/            (all business logic)
routes/              (all API definitions)
models/              (all data models)
middleware/          (cross-cutting concerns)
config/              (environment & setup)
utils/               (shared utilities)
```

**Frontend**: Page-centric with shared components
```
pages/               (routable components)
components/          (reusable components)
context/             (global state providers)
services/            (API integration)
styles/              (CSS)
utils/               (helpers)
```

---

## 5. DATA FLOW AND RELATIONSHIPS BETWEEN COMPONENTS

### **Authentication Flow**

```
Client Login Page
    ↓
axios POST /api/auth/login (username, password)
    ↓
authController.login()
    ↓
userModel.findByUsername() → MySQL users table
    ↓
bcrypt.verifyPassword()
    ↓
JWT token generated
    ↓
Cookie set (httpOnly, 8-hour expiry)
    ↓
AuthContext updates user state
    ↓
Redirect to /dashboard
```

### **Invoice Creation Flow (with Transaction)**

```
Frontend: Sales.jsx (invoice form)
    ↓
POST /api/invoices
    ↓
invoiceController.create()
    ↓
invoiceService.create() [TRANSACTION]
    ├─ Validate retailer credit limit
    ├─ Create invoice record
    ├─ Create invoice_items
    ├─ Deduct stock from products (stock_logs)
    ├─ Update retailer outstanding_balance
    └─ Commit or rollback
    ↓
Response with invoice_no, status
    ↓
Frontend updates state, shows success
```

### **Product Stock Management**

```
Products Table
    ↓ (has)
├─ stock_quantity (denormalized)
└─ low_stock_alert threshold
    ↓
stock_logs Table
├─ Tracks all IN/OUT/ADJUSTMENT
├─ References invoices, purchase orders
└─ Audit trail

Invoice Creation → stock_logs record + stock_quantity update
Purchase Order Receipt → stock_logs record + stock_quantity update
Product Expiry Tracking → expiry_date field in products table
```

### **Permission and Role System**

```
Users Table
    ↓
role_id → Roles Table
    ↓
name (system_admin, admin, manager, salesman, accountant, driver, loader)
    ↓
role_permissions (junction table)
    ↓
permissions (name: 'dashboard_view', 'products_create', etc.)

Authentication Middleware:
├─ Load user
├─ Fetch role permissions (cached 5 minutes)
├─ Attach to req.user.permissions
└─ Route-level checks via permit() middleware
```

### **Report Generation Flow**

```
Frontend: Reports.jsx (select filters: date range, company, etc.)
    ↓
GET /api/reports/[type] (dailySales, productSales, profit, etc.)
    ↓
reportController.[method]()
    ↓
reportService.[method]()
    ├─ Query invoices with filters
    ├─ Join with products, retailers, companies
    ├─ Aggregate/calculate values
    └─ Return formatted data
    ↓
Frontend displays table + export buttons
    ├─ PDF export (jsPDF)
    └─ Excel export (XLSX)
```

### **Notification System**

```
System Events (low stock, payment due, expiry)
    ↓
notificationService.create()
    ↓
INSERT notifications table
    ↓
Frontend: notificationService.getUnread()
    ↓
GET /api/notifications/unread (periodically)
    ↓
Display badge count + notification list
```

### **Language Toggle Flow**

```
LanguageContext
├─ localStorage.dms_language
├─ Current language state
└─ t() function for translations

MainLayout: Language toggle button
    ↓
setLanguage('en' or 'bn')
    ↓
localStorage updated
    ↓
All useLanguage() hooks re-render
    ↓
formatCurrency, formatNumber apply language rules
    ↓
UI updated (English numbers ↔ Bangla numbers)
```

---

## 6. CONFIGURATION FILES AND THEIR PURPOSES

### **Backend Configuration**

**`.env` (25 lines)**
- PORT: 5000
- NODE_ENV: development
- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME: MySQL connection
- JWT_SECRET: Token signing key
- JWT_EXPIRES_IN: 24h expiration
- FRONTEND_URL: CORS whitelist
- SMTP configuration: Email service

**`package.json` (26 lines)**
```json
{
  "type": "module",           // ES Modules
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": [...]       // 11 packages
}
```

### **Frontend Configuration**

**`vite.config.js` (15 lines)**
```javascript
- port: 5173
- proxy: /api → http://localhost:5000 (development proxy)
- React plugin enabled
```

**`package.json` (31 lines)**
```json
{
  "type": "module",           // ES Modules
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": [...]       // 9 packages + 1 font
}
```

**`index.html` (entry point)**
- Mounts React to `<div id="root">`
- Loads main.jsx

### **Database Configuration**

**`database/schema.sql` (180 lines)**
- Complete database schema
- Table relationships (14 tables)
- Constraints and indexes

**`src/config/database.js` (390 lines)**
- Connection pool setup
- Automatic initialization
- Seeding logic for roles, permissions, users

### **Root Package**

**Root `package.json`**
```json
{
  "scripts": {
    "dev": "start both servers concurrently",
    "dev:backend": "npm --prefix backend run dev",
    "dev:frontend": "npm --prefix frontend run dev",
    "start:mysql": "Start XAMPP MySQL",
    "start:apache": "Start XAMPP Apache"
  },
  "devDependencies": ["concurrently"]
}
```

---

## 7. ARCHITECTURAL PATTERNS AND DESIGN PATTERNS

### **Backend Patterns**

#### **1. MVC (Model-View-Controller)**
- **Models**: Direct database access abstraction
- **Controllers**: Route handlers
- **Views**: JSON responses (REST API)

#### **2. Service/Business Logic Layer**
- Controllers delegate to Services
- Services contain complex business logic
- Separation of concerns

#### **3. Repository Pattern (Partial)**
- BaseModel provides abstract repository methods
- Each entity extends or uses BaseModel
- Direct query execution in services (not fully abstracted)

#### **4. Middleware Chain Pattern**
- Authentication middleware for all protected routes
- Error handling middleware at the end
- Rate limiting middleware (configured)

#### **5. Factory/Generator Pattern**
- Helper functions for generating unique IDs
  - generateInvoiceNo()
  - generatePaymentNo()
  - generatePONo()
  - generateCode()

#### **6. Transaction Pattern**
- Invoice creation uses database connections
- Atomic operations (create invoice, items, stock logs)
- Rollback on failure

#### **7. Caching Pattern**
- Permission cache in memory
- 5-minute TTL for role permissions
- Manual invalidation via clearPermissionCache()

#### **8. Role-Based Access Control (RBAC)**
- 7 predefined roles with hierarchies
- 30 granular permissions
- Junction table for role-permission mapping
- permit() middleware for fine-grained authorization

#### **9. Soft Delete Pattern (Implicit)**
- is_active field in users, products, retailers, companies
- No actual deletion, just deactivation
- allows for data retention and audit trails

### **Frontend Patterns**

#### **1. Single Page Application (SPA)**
- React Router for client-side routing
- No page reloads
- Dynamic content switching

#### **2. Component-Based Architecture**
- Reusable UI components
- Page components for routes
- Layout components for structure

#### **3. Context API for State Management**
- AuthContext for user/auth state
- LanguageContext for i18n
- No Redux or external state library
- useContext hooks for access

#### **4. Custom Hooks**
- useAuth() for authentication state
- useLanguage() for translations
- Can be extended with useProducts(), useRetailers(), etc.

#### **5. Centralized API Client (api.js)**
- Axios instance with common config
- Service objects (authService, productService, etc.)
- Consistent error handling
- Request/response interceptors possible

#### **6. Layout Pattern**
- MainLayout wrapper for authenticated pages
- PermissionRoute component for authorization
- PrivateRoute component for authentication

#### **7. Higher-Order Component (HOC) Style**
- PermissionRoute wrapping children
- LoginWithAnimation wrapper for transitions

#### **8. Unidirectional Data Flow**
```
API Response → Axios → Service → Component State
Component State → Render UI
User Interaction → API Call → Update State
```

#### **9. Separation of Concerns**
- Styles in styles/
- API logic in services/
- State in context/
- UI in components/ and pages/

#### **10. Language Localization**
- Translations object in context
- t() function for key lookup
- formatCurrency(), formatNumber() for data
- localStorage for persistence
- Cross-tab synchronization

### **Database Patterns**

#### **1. Normalization**
- 14 normalized tables
- Foreign key constraints
- Junction table for many-to-many (role_permissions)

#### **2. Audit Trail**
- created_at timestamps on all tables
- updated_at on mutable tables
- Stock logs for tracking changes
- created_by user tracking

#### **3. Enum Types**
- invoice.status: 'due', 'partial', 'paid'
- stock_logs.type: 'IN', 'OUT', 'ADJUSTMENT'
- purchase_orders.status: 'pending', 'received', 'cancelled'
- notifications.type: 'info', 'warning', 'error', 'success'

#### **4. Denormalization**
- stock_quantity in products table (cached from stock_logs)
- outstanding_balance in retailers (cached from invoices)
- Improves query performance

---

## 8. KEY ARCHITECTURAL HIGHLIGHTS

### **Security Features**
1. JWT authentication with 24-hour expiration
2. httpOnly cookies to prevent XSS
3. Password hashing with bcryptjs (10 salt rounds)
4. Role-based access control (RBAC)
5. Permission-based authorization (fine-grained)
6. User account activation/deactivation
7. CORS restrictions
8. Input validation via express-validator

### **Scalability Considerations**
1. Database connection pooling (10 connections)
2. Permission caching (5-minute TTL)
3. Pagination on all list endpoints (default 20, configurable)
4. Indexed queries (user_id, created_at in notifications)
5. Async/await throughout backend
6. Modular service layer for horizontal scaling
7. REST API design for statelessness

### **Reliability Features**
1. Transaction handling for invoice creation
2. Retry logic for database lock timeouts
3. Comprehensive error handling middleware
4. Validation at controller level
5. Error messages in JSON format
6. Stack traces in development mode

### **User Experience Features**
1. Bilingual support (English & Bangla)
2. Responsive mobile layout
3. Language persistence across sessions
4. Real-time permission checking
5. Page transition animations
6. Export to PDF/Excel
7. Pagination with configurable page sizes
8. Search functionality across modules
9. Low stock and expiry alerts

### **Development Experience**
1. Hot module reloading (Vite)
2. Node --watch for backend auto-restart
3. npm scripts for coordinated startup
4. Environment variables for configuration
5. Seed scripts for test data
6. Clear error messages
7. Modular code organization
8. Service-oriented architecture

---

## 9. TECHNOLOGY SUMMARY TABLE

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | Node.js | Runtime environment |
| | Express.js | HTTP server & routing |
| | MySQL2 | Database driver |
| | JWT | Authentication |
| | bcryptjs | Password hashing |
| | Nodemailer | Email notifications |
| **Frontend** | React 18 | UI framework |
| | React Router 6 | Client-side routing |
| | Vite | Build tool & dev server |
| | Axios | HTTP client |
| | Lucide React | Icons |
| | XLSX | Excel export |
| | jsPDF | PDF generation |
| | Context API | State management |
| **Database** | MySQL | Relational database |
| | SQLite | Dev fallback (dms.db) |
| **Development** | concurrently | Multi-process runner |
| | dotenv | Environment config |

---

## 10. DEPLOYMENT CONSIDERATIONS

### **Production Readiness**
- Rate limiting (currently disabled, should enable)
- HTTPS enforcement needed
- Environment-specific configurations required
- Database backups strategy needed
- Static file serving configuration
- PM2 or similar process manager for Node.js
- Nginx reverse proxy recommended

### **Database**
- MySQL 5.7+ required
- Connection pool settings may need tuning for production
- Query optimization for large datasets
- Backup/restore procedures

### **Frontend Build**
- `npm run build` creates optimized dist/
- Static files can be served via CDN
- API proxy must point to production backend

---

## Summary

This is a well-structured, modern web application with clear separation of concerns, robust authentication/authorization, and user-centric features. The architecture supports scalability and maintainability through modular design patterns and best practices.
