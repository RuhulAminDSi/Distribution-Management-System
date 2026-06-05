# Schema Incremental Migration Guide

When `dms_db` (development database) te kono column, table, ya constraint er change hoy, she change onno database e (e.g. `ruhul_dms`, `ruhana_enterprise`) migrate korar jonno ei guide follow koro.

---

## Method 1: Schema Diff & Sync (Recommended for incremental)

Two databases er moddhe schema diff ber kore, target DB te ALTER statement run kora.

### Step 1: Schema dump from both DBs
```bash
set PGPASSWORD=postgres
pg_dump -U postgres -h localhost -p 5432 -d dms_db --schema-only --no-owner --no-acl -f dms_db_schema.sql
pg_dump -U postgres -h localhost -p 5432 -d ruhul_dms --schema-only --no-owner --no-acl -f target_db_schema.sql
```

### Step 2: Compare schemas side by side
```bash
fc dms_db_schema.sql target_db_schema.sql
```
Ya diff tool use koro (e.g. WinMerge, VS Code Compare).

### Step 3: Missing column detect kora
```sql
-- Source DB te ache kintu target DB te nai shei columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
  AND (column_name, data_type) NOT IN (
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'users'
  );
```

### Step 4: ALTER TABLE statement generate
```sql
-- Target DB te ALTER TABLE chalano
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP;
```

---

## Method 2: Full Schema Reset (Simple but Destructive)

Target DB er public schema drop kore, source theke fresh schema restore kore.

```bash
rem --- Reset target schema ---
"c:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ruhul_dms -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

rem --- Dump schema from source ---
"c:\Program Files\PostgreSQL\18\bin\pg_dump.exe" -U postgres -d dms_db --schema-only --no-owner --no-acl -f schema.sql

rem --- Restore to target ---
"c:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d ruhul_dms -f schema.sql
```

⚠️ **Warning:** This drops all existing data in target DB. Only use if target DB te kono important data nei.

---

## Method 3: Selective Schema Dump

Shudhu matro specific tables dump kora:

```bash
rem --- Dump only changed tables ---
pg_dump -U postgres -d dms_db --schema-only --table=users --table=invoices --no-owner --no-acl -f changes.sql

rem --- Restore only those tables (CREATE TABLE IF NOT EXISTS + ALTER) ---
psql -U postgres -d ruhul_dms -f changes.sql
```

---

## Method 4: psql metacommand diye direct compare

```bash
rem --- Compare table list ---
psql -U postgres -d dms_db -c "\dt" > dms_tables.txt
psql -U postgres -d ruhul_dms -c "\dt" > target_tables.txt
fc dms_tables.txt target_tables.txt

rem --- Compare columns of a specific table ---
psql -U postgres -d dms_db -c "\d users" > dms_users.txt
psql -U postgres -d ruhul_dms -c "\d users" > target_users.txt
fc dms_users.txt target_users.txt
```

---

## Method 5: Using a custom Node.js migration script

Incremental migration er jonno ekta reusable Node script:

```js
// migrate_changes.js — run with: node backend/src/migrate_changes.js
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  host: 'localhost', port: 5432,
  user: 'postgres', password: 'postgres',
  database: 'ruhul_dms'
});

const changes = [
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_expires TIMESTAMP`,
];

async function run() {
  for (const sql of changes) {
    try {
      await pool.query(sql);
      console.log(`OK: ${sql.slice(0, 60)}...`);
    } catch (err) {
      console.error(`FAIL: ${sql} -> ${err.message}`);
    }
  }
  await pool.end();
}
run();
```

---

## Quick Reference: Common Schema Changes

| Change | SQL Command |
|--------|-------------|
| New column add | `ALTER TABLE table_name ADD COLUMN IF NOT EXISTS col_name TYPE;` |
| Column type change | `ALTER TABLE table_name ALTER COLUMN col_name TYPE new_type;` |
| Column rename | `ALTER TABLE table_name RENAME COLUMN old_name TO new_name;` |
| Column drop | `ALTER TABLE table_name DROP COLUMN IF EXISTS col_name;` |
| New table | `CREATE TABLE IF NOT EXISTS ...` |
| New index | `CREATE INDEX IF NOT EXISTS idx_name ON table_name (col);` |
| New constraint | `ALTER TABLE table_name ADD CONSTRAINT name UNIQUE (col);` |
| Drop constraint | `ALTER TABLE table_name DROP CONSTRAINT IF EXISTS constraint_name;` |

---

## Target Database List (এই প্রজেক্টে)

| Database Name | Purpose |
|---------------|---------|
| `dms_db` | Main development database |
| `ruhul_dms` | For client/alternate environment |
| `ruhana_enterprise` | For client/alternate environment |

---

## Common Issues

| Problem | Solution |
|---------|----------|
| `relation already exists` | Use `IF NOT EXISTS` / `IF EXISTS` |
| `column "x" of relation "y" already exists` | Use `IF NOT EXISTS` |
| Password prompt every time | Set `set PGPASSWORD=postgres` before command |
| `psql` not recognized | Use full path or add to PATH |
| Foreign key maane error | Tables dependency order e restore koro |
