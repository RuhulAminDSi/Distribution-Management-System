# AGENTS.md - Coding Guidelines for DMS Repository

## Build & Run Commands

### Development
```bash
# Start entire system (both backend and frontend)
npm run dev

# Backend only (runs with --watch for hot reload)
npm run dev:backend
cd backend && npm run dev

# Frontend only (Vite dev server on http://localhost:5173)
npm run dev:frontend
cd frontend && npm run dev

# Production build
cd frontend && npm run build   # Creates dist/ folder
cd backend && node src/server.js
```

### Database & Services
```bash
# Start MySQL (Windows XAMPP)
npm run start:mysql

# Start Apache (Windows XAMPP)
npm run start:apache
```

### Health Check
```bash
curl http://localhost:5000/api/health
```

---

## Code Style Guidelines

### JavaScript / Node.js Backend

**Imports**
- Use ES Modules: `import ... from '...'` (not CommonJS `require`)
- Absolute imports are preferred over relative paths
- Group imports: external dependencies → local modules → middleware
- All controllers/services exported as named objects: `export const authController = { ... }`

**Naming Conventions**
- Controllers: `camelCase` with `Controller` suffix (e.g., `authController.js`)
- Services: `camelCase` with `Service` suffix (e.g., `invoiceService.js`)
- Routes: `camelCase` with `Routes` suffix (e.g., `authRoutes.js`)
- Model classes: `PascalCase` (e.g., `User.js`, `Role.js`)
- Variables/functions: `camelCase` (e.g., `const handleInvoiceCreation = ...`)
- Database columns: `snake_case` (e.g., `created_at`, `outstanding_balance`)

**Formatting**
- Indentation: 2 spaces (no tabs)
- Line length: Max 100 characters preferred
- Arrow functions for callbacks: `(req, res) => { ... }`
- Always use async/await (no callbacks)

**Error Handling**
- All async functions must use try/catch blocks
- Always pass errors to Express's `next(error)` middleware
- Return meaningful HTTP status codes (400, 401, 404, 500)
- Error responses use JSON: `{ message: 'error description' }`
- Development mode includes stack traces; production doesn't

**Types & Validation**
- Use express-validator for input validation in controllers
- No TypeScript; use JSDoc comments for complex functions if needed
- Validate before querying database (check `username`, `password`, etc.)
- Use MySQL placeholders (`?`) to prevent SQL injection

---

### React / Frontend

**Imports**
- Use ES Modules: `import ... from '...'`
- External libraries first, then relative components/services
- Example: `import { useAuth } from './context/AuthContext'`

**Naming Conventions**
- Components: `PascalCase` (e.g., `Dashboard.jsx`, `ProductList.jsx`)
- Pages: `PascalCase` in `/src/pages/` (e.g., `Sales.jsx`, `Reports.jsx`)
- Hooks: `camelCase` starting with `use` (e.g., `useAuth()`, `useLanguage()`)
- Services: `camelCase` objects (e.g., `authService`, `productService`)
- Variables/state: `camelCase` (e.g., `const [products, setProducts] = ...`)

**Formatting**
- Indentation: 2 spaces
- JSX element names: PascalCase for components, lowercase for HTML
- Use functional components with hooks (no class components)
- Props destructuring in function parameters: `function Card({ title, children }) { ... }`

**Error Handling**
- Wrap API calls in try/catch blocks
- Use `.catch()` chains if needed: `api.get(...).catch(err => handleError(err))`
- Display user-friendly error messages via context or state
- Console errors in development only

**Conventions**
- Authentication check via `useAuth()` hook (returns `{ user, loading, hasPermission() }`)
- Language support via `useLanguage()` hook (returns `{ t(), formatCurrency(), ... }`)
- Protected routes wrapped with `<PermissionRoute>` component
- All API calls through centralized `services/api.js` (Axios instance)
- Use Context API for state (no Redux/external state managers)

---

## Project Structure Quick Reference

```
backend/src/
├── controllers/      # Request handlers (export as objects)
├── services/        # Business logic
├── routes/          # API route definitions
├── models/          # Data access layer
├── middleware/      # Auth, error handling
├── config/          # Database setup
└── utils/           # Helpers

frontend/src/
├── pages/           # Full-page components (routable)
├── components/      # Reusable UI components
├── context/         # State providers (Auth, Language)
├── services/        # API client (api.js)
├── styles/          # CSS files
└── utils/           # Helper functions
```

---

## Key Technologies & Usage

| Layer | Tech | Usage |
|-------|------|-------|
| Backend | Express.js | Routes, middleware, CORS |
| Database | MySQL | 14 normalized tables, connection pooling (10 connections) |
| Auth | JWT + bcryptjs | 24-hour tokens, httpOnly cookies |
| Frontend | React 18 | Components, hooks, Context API |
| Build | Vite | HMR, fast builds, dev proxy to `/api` |
| HTTP | Axios | 30s timeout, auto-retry on 401 |
| Exports | XLSX/jsPDF | Excel & PDF generation |
| i18n | Custom Context | English & Bangla (500+ keys) |

---

## Testing & Quality

**Currently**: No test suite configured. When adding tests:
- Backend: Use Jest or Mocha
- Frontend: Use Vitest or Jest + React Testing Library
- Test commands will be added to package.json scripts

---

## Important Notes for Agents

1. **Soft Deletes**: Users, products, retailers use `is_active` field (no hard deletes)
2. **Role-Based Access**: 7 roles with 30 fine-grained permissions via `role_permissions` table
3. **Transactions**: Invoice creation uses database transactions for atomicity
4. **Stock Tracking**: All movements logged in `stock_logs` table (IN/OUT/ADJUSTMENT)
5. **Caching**: Role permissions cached in memory with 5-minute TTL
6. **Bilingual**: All text is translatable via LanguageContext (store in translations object)
7. **CORS**: Frontend port 5173 whitelisted; configure `FRONTEND_URL` in `.env`
