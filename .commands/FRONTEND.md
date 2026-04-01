# Frontend Development Commands

## Start Frontend Development Server
```bash
npm run dev:frontend
# or
cd frontend && npm run dev
```

Frontend runs on **http://localhost:5173** with hot module reloading (HMR).

## Build for Production
```bash
cd frontend && npm run build
# Creates optimized dist/ folder
```

## Preview Production Build
```bash
cd frontend && npm run preview
```

## Development Server Features
- **Hot Module Reloading (HMR)**: Changes auto-refresh in browser
- **API Proxy**: `/api` requests proxy to `http://localhost:5000`
- **Port**: 5173
- **Build Tool**: Vite (fast, modern ES modules)

---

## Frontend Architecture

### Pages (15 routable components)
Located in `frontend/src/pages/`
- `Dashboard.jsx` - Summary statistics and widgets
- `Companies.jsx` - Company/manufacturer management
- `Products.jsx` - Product catalog management
- `Retailers.jsx` - Retailer account management
- `Sales.jsx` - Invoice creation and listing
- `Payments.jsx` - Payment recording
- `Stock.jsx` - Stock management and purchase orders
- `Reports.jsx` - Multi-tab reporting interface
- `Users.jsx` - User management
- `Settings.jsx` - System settings
- `Notifications.jsx` - Notification center
- `Login.jsx` - Authentication page
- `ResetPassword.jsx` - Password recovery
- `Landing.jsx` - Public homepage
- `NotFound.jsx` - 404 and unauthorized handler

### Context Providers (State Management)
Located in `frontend/src/context/`
- **AuthContext.jsx** - User authentication state, permissions, token management
  - Hook: `useAuth()` returns `{ user, loading, hasPermission(), logout() }`
- **LanguageContext.jsx** - Bilingual support (English & Bangla)
  - Hook: `useLanguage()` returns `{ t(), formatCurrency(), formatNumber(), ... }`

### API Services
Located in `frontend/src/services/api.js`
```javascript
authService, productService, retailerService, invoiceService,
paymentService, stockService, reportService, dashboardService,
companyService, roleService, notificationService
```

All services use Axios instance with:
- Base URL: `/api` (proxied to backend)
- Credentials: Enabled (cookies)
- Timeout: 30 seconds
- Content-Type: application/json

---

## Common Development Patterns

### Using AuthContext
```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, hasPermission, logout } = useAuth();
  
  if (!hasPermission('products_view')) {
    return <div>Access Denied</div>;
  }
  
  return <div>Welcome {user.full_name}</div>;
}
```

### Using LanguageContext
```javascript
import { useLanguage } from './context/LanguageContext';

function MyComponent() {
  const { t, formatCurrency, formatNumber } = useLanguage();
  
  return (
    <div>
      <h1>{t('products')}</h1>
      <p>{formatCurrency(5000)}</p>
      <p>{formatNumber(1234.56)}</p>
    </div>
  );
}
```

### API Calls
```javascript
import { productService } from './services/api';

async function getProducts() {
  try {
    const response = await productService.getAll({ page: 1, limit: 20 });
    setProducts(response.data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
}
```

### Protected Routes
```javascript
<PermissionRoute permission="products_view">
  <Products />
</PermissionRoute>
```

---

## Translation Keys

LanguageContext contains 500+ translation keys for:
- Common actions (save, delete, cancel, search)
- Module names (products, retailers, invoices, reports)
- Form labels and placeholders
- Error messages
- Status indicators

Use `t('key_name')` to access translations. Keys auto-switch between English and Bangla.

---

## Export Functionality

### PDF Export
```javascript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const doc = new jsPDF();
doc.autoTable({
  head: [['Column 1', 'Column 2']],
  body: [[data1, data2]]
});
doc.save('report.pdf');
```

### Excel Export
```javascript
import * as XLSX from 'xlsx';

const workbook = XLSX.utils.book_new();
const worksheet = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
XLSX.writeFile(workbook, 'report.xlsx');
```

---

## Port Configuration
- **Frontend**: 5173
- **Backend**: 5000
- **MySQL**: 3306
- **CORS**: http://localhost:5173 whitelisted on backend
