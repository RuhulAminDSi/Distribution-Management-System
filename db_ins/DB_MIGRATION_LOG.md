# Database Migration Log

| Date | Source | Target | Type | Status |
|------|--------|--------|------|--------|
| 05-Jun-2026 | `dms_db` | `ruhana_enterprise` | Schema-only | ✅ Done |
| 05-Jun-2026 | `dms_db` | `ruhul_dms` | Schema + Seed Data (via Node.js `initializeDatabase`) | ✅ Done |

---

## Migration: dms_db → ruhana_enterprise

**Date:** 05-Jun-2026  
**Type:** Schema-only (`pg_dump --schema-only`)

### Steps
1. `pg_dump -U postgres -d dms_db --schema-only --no-owner --no-acl -f schema.sql`
2. `psql -U postgres -d ruhana_enterprise -f schema.sql`

### Verified
- 17 tables, all columns, constraints, sequences match 100%

---

## Migration: dms_db → ruhul_dms

**Date:** 05-Jun-2026  
**Type:** Schema + Seed Data (via Node.js `backend/src/migrate.js`)

### Steps
1. Created database: `CREATE DATABASE ruhul_dms;`
2. Ran Node.js migration script that:
   - Created all 17 tables (CREATE TABLE IF NOT EXISTS)
   - Seeded permissions (33 entries)
   - Seeded roles (8: system_admin, admin, manager, salesman, accountant, driver, loader, shopkeeper)
   - Seeded users (SystemAdmin / admin123, shopkeeper1 / admin123)

### Connection
```
Host: localhost:5432
User: postgres
Pass: postgres
DB:   ruhul_dms
```

---

## How to Log a New Migration

When you run a migration in future, add an entry at the top of this table:

```markdown
| DD-Mon-YYYY | `source_db` | `target_db` | Schema-only / Full | ✅ Done |
```
