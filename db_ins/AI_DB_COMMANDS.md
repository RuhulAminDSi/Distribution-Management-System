# AI-Assisted Database Commands

Commands/প্রম্পট যা দিলে আমি (AI) ডাটাবেস সম্পর্কিত কাজ করে দেব।

---

## Migration

| আপনি বলবেন | আমি করব |
|------------|---------|
| `dms_db theke ruhul_dms e schema migrate koro` | Schema-only migration (tables, columns, keys, sequences) |
| `dms_db theke ruhana_enterprise te schema migrate koro` | Schema-only migration |
| `dms_db theke ruhul_dms e data saha migrate koro` | Full migration (schema + data) |
| `shudhu [table_name] table ta migrate koro [source] → [target]` | নির্দিষ্ট টেবিল মাইগ্রেট করা |
| `[source_db] theke [target_db] te migrate koro` | যে কোন দুটি DB-র মধ্যে মাইগ্রেশন |
| `dms_db r ruhul_dms er schema compare koro` | Schema diff দেখাবে, কোন column/table আলাদা |
| `dms_db theke ruhul_dms e incremental migrate koro` | শুধু changes গুলো apply করবে (যা dms_db তে নতুন) |

## Schema Sync

| আপনি বলবেন | আমি করব |
|------------|---------|
| `ruhul_dms e [table] table e [column] add koro [type]` | Target DB তে নতুন কলাম যোগ করবে |
| `dms_db te je change hoyeche sheta ruhul_dms e sync koro` | ALTER statements generate করে target DB te run করবে |
| `duita DB er column list compare koro` | কোন column কোন DB তে নেই তা দেখাবে |
| `dms_db theke ruhul_dms e shudhu schema structure sync koro` | Full schema reset + restore |

## Backup & Restore

| আপনি বলবেন | আমি করব |
|------------|---------|
| `dms_db er backup nao` | সম্পূর্ণ DB backup (schema + data) |
| `dms_db er shudhu schema backup nao` | Schema-only backup |
| `[file].sql theke [db_name] e restore koro` | Backup থেকে restore |

## Database Info

| আপনি বলবেন | আমি করব |
|------------|---------|
| `kon kon DB ache dekhao` | সব database লিস্ট দেখাবে |
| `dms_db er table list dekhao` | টেবিল লিস্ট দেখাবে |
| `dms_db er schema details dekhao` | columns, types, constraints সহ বিস্তারিত |
| `dms_db r [target_db] er schema compare koro` | দুটি DB-র schema তুলনা করবে |

## Modify Schema

| আপনি বলবেন | আমি করব |
|------------|---------|
| `[db] er [table] e [column] add koro [type]` | নতুন কলাম যোগ করবে |
| `[db] er [table] theke [column] remove koro` | কলাম ডিলিট করবে |
| `[db] er [table] e [column] er type change koro [new_type]` | কলামের ডাটা টাইপ পরিবর্তন |
| `[db] er [table] e [constraint] add koro` | নতুন constraint (PK/FK/UNIQUE) যোগ করবে |
| `dms_db te joto change ache, shegulo ruhul_dms e batch apply koro` | সব pending change একবারে sync করবে |

## Cleanup

| আপনি বলবেন | আমি করব |
|------------|---------|
| `[db] er shob table drop koro` | সব টেবিল ড্রপ করবে |
| `[db] er public schema reset koro` | `DROP SCHEMA public CASCADE; CREATE SCHEMA public;` |
| `[db] er [table] table truncate koro` | টেবিলের সব ডেটা মুছে ফেলবে (structure থাকবে) |

## 3-Step Sync Workflow (Recommended)

যখনই `dms_db` তে কোনো schema change করবেন, এই ৩ টি ধাপ follow করুন:

```
Step 1: "dms_db r ruhul_dms er schema compare koro"
Step 2: "ALTER statements generate koro changes gulor jonno"
Step 3: "dms_db theke ruhul_dms e incremental migrate koro"
```

## Format

```
Bengali + English mix এ বলতে পারবেন। যেমন:
- "dms_db er schema backup nao and ruhul_dms e migrate koro"
- "ruhul_dms theke shudhu users table ta export koro"
- "dms_db te je change ache shegulo ruhul_dms e sync koro"

কোন নির্দিষ্ট প্যারামিটার (host, port, user, password) উল্লেখ না করলে
default value নেব: localhost:5432 / postgres / postgres
```
