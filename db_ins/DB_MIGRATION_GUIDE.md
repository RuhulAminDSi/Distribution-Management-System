# Manual Database Migration Guide

Migrate schema (tables, columns, keys, sequences) from one PostgreSQL database to another. Data is **not** included.

---

## Prerequisites

- PostgreSQL installed (version 14+)
- `pg_dump` and `psql` available in PATH, or use full path:  
  `C:\Program Files\PostgreSQL\18\bin\pg_dump.exe`
- Source DB credentials (user, password, host, port)
- Target DB must already exist (create with `CREATE DATABASE`)

---

## Option A: Schema-only (Recommended)

Dump schema **without data** and restore to target.

```bash
rem --- STEP 1: Dump schema from source ---
set PGPASSWORD=postgres
pg_dump -U postgres -h localhost -p 5432 -d dms_db ^
  --schema-only ^
  --no-owner ^
  --no-acl ^
  --no-comments ^
  -f schema_dump.sql

rem --- STEP 2: Restore to target ---
psql -U postgres -h localhost -p 5432 -d ruhana_enterprise -f schema_dump.sql
```

### Flags explained

| Flag | Purpose |
|------|---------|
| `--schema-only` | Export only table structure, no row data |
| `--no-owner` | Skip `ALTER OWNER` statements (avoids permission errors) |
| `--no-acl` | Skip access privilege grants |
| `--no-comments` | Skip comments (keeps dump smaller) |
| `-f` | Output / input file path |

---

## Option B: Full dump (schema + data)

Include data if needed:

```bash
pg_dump -U postgres -h localhost -p 5432 -d dms_db ^
  --no-owner ^
  --no-acl ^
  -f full_dump.sql

psql -U postgres -h localhost -p 5432 -d ruhana_enterprise -f full_dump.sql
```

---

## Option C: Specific tables only

Export only certain tables:

```bash
pg_dump -U postgres -h localhost -p 5432 -d dms_db ^
  --schema-only ^
  --table=users ^
  --table=roles ^
  --table=permissions ^
  -f partial_schema.sql
```

---

## Create target database

If the target database doesn't exist yet:

```bash
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE ruhana_enterprise;"
```

---

## Verify migration

Run these checks on **both** databases to confirm everything matches.

### Compare columns
```sql
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### Compare constraints
```sql
SELECT tc.table_name, tc.constraint_name, tc.constraint_type,
       kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;
```

### Compare sequences
```sql
SELECT schemaname, sequencename, start_value, increment_by, cache_size
FROM pg_sequences
WHERE schemaname = 'public'
ORDER BY sequencename;
```

---

## Rollback (if something goes wrong)

Drop all objects in the target database and start over:

```bash
psql -U postgres -h localhost -p 5432 -d ruhana_enterprise -c ^
  "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Then re-run the restore step.

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `psql` not recognized | Use full path: `"C:\Program Files\PostgreSQL\18\bin\psql.exe"` |
| Password prompt | Set `PGPASSWORD` env var before calling psql/pg_dump |
| `database "ruhana_enterprise" does not exist` | Create it first: `CREATE DATABASE ruhana_enterprise;` |
| Foreign key errors on restore | Use `--schema-only` and restore tables in dependency order |
| Permission denied | Add `--no-owner --no-acl` to pg_dump |
