# AGENTS.md — DMS

## Quick Start

```bash
npm run dev              # both backend + frontend
npm run dev:backend      # backend only (auto-restart via node --watch)
npm run dev:frontend     # frontend only (Vite, http://localhost:5173)
```

Default login: `SystemAdmin` / `admin123`

## Database

- **PostgreSQL** (`pg` lib), **not MySQL** despite README saying MySQL. Tables auto-create + seed on startup.
- Default connection: `postgres`/`postgres`@`localhost:5432`/`dms_db`. Create it: `CREATE DATABASE dms_db;`
- `query()` helper in `config/database.js` converts `?` → PG `$N` placeholders — always use `?` in SQL.
- Transactions: use `getConnection()` → `.beginTransaction()`, `.commit()`, `.rollback()`.
- All tables soft-delete via `is_active SMALLINT DEFAULT 1`.
- `updated_at` does NOT auto-update (PG has no `ON UPDATE`); set explicitly.
- PG `LIKE` is case-sensitive — searches match exact case.
- **Unique columns**: `email`, `phone`. Username is NOT unique (multiple users can share one).

## Backend

| Layer | Convention | File Pattern |
|-------|-----------|-------------|
| Controllers | Named export object | `camelCaseController.js` |
| Services | Named export object | `camelCaseService.js` |
| Routes | Named export default | `camelCaseRoutes.js` |
| Models | Named export class | `PascalCase.js` |
| DB columns | `snake_case` |

- ES Modules (`"type": "module"`). 2-space indent.
- All async route handlers use `try/catch` + `next(error)`.
- Input validation via `express-validator`.
- Entrypoint: `backend/src/server.js` → inits DB, starts notification scanner.
- JWT: 24h expiry, stored in httpOnly cookie + Authorization Bearer fallback.
- Role permissions cached in memory (5-min TTL). Clear with `clearPermissionCache()`.
- Rate limiter disabled in dev (commented out in `app.js`).
- File uploads: multer saves to `backend/uploads/profile_pictures/`. Served at `/uploads` via `express.static`.
- No test suite. If adding: Jest/Mocha for backend.

## Frontend

- Vite + React 18, functional components + hooks only.
- Components: `PascalCase.jsx` in `src/components/`. Pages: `PascalCase.jsx` in `src/pages/`.
- Hooks: `camelCase` prefixed with `use` (e.g., `useAuth`, `useLanguage`).
- API calls: centralized `services/api.js` (Axios instance, 30s timeout, `/api` base).
  - No default `Content-Type` header — FormData uploads rely on browser-set `multipart/form-data` boundary.
- Auth: `useAuth()` → `user`, `hasPermission(perm)`, `hasRole(...roles)`, `refreshRoles()`.
- Route guards: `PermissionRoute` component in `App.jsx`. Sidebar nav items declare `permission`.
- Language: `useLanguage()` → `t('key')`. English + Bangla translations in `LanguageContext.jsx`.
- Vite proxies `/api` and `/uploads` to `http://localhost:5000`.
- If adding tests: Vitest + React Testing Library.

## Permissions

- `system_admin` and `admin` bypass all permission checks (`hasPermission` returns `true`).
- Creating/updating roles requires `roles_manage` permission.
- When adding a new permission: seed it in `config/database.js` `initializeDatabase()` (INSERT + role_permissions entries), then restart backend.

## Architecture

- 15 tables, all with `id SERIAL PRIMARY KEY`, `created_at`, `updated_at`.
- Stock movements logged to `stock_logs` (type: IN/OUT/ADJUSTMENT).
- Invoice creation runs in a DB transaction (atomic).
- Notification scanner runs every 5 min (startup + interval), cleanup old notifications daily.
- `.commands/` directory contains detailed markdown docs: DATABASE.md, BACKEND_API.md, FRONTEND.md, CODE_PATTERNS.md, PERMISSIONS.md, FEATURE_DEV.md, DEBUGGING.md.

## Gotchas

- Backend restarts automatically with `node --watch` (file changes trigger reload).
- Vite dev server needs restart to pick up config changes (proxy routes, etc.).
- Profile picture paths stored as `/uploads/profile_pictures/xxx.png` — resolved through Vite proxy to backend.
- Hard refresh the browser after backend changes if auth tokens or roles seem stale.
- PostgreSQL error 23505 = unique violation; `err.detail` contains the column name.
- email/phone uniqueness checked both at DB level and explicitly in `userService` for friendly messages.
