# DMS Diagrams

Three Mermaid diagrams generated from full project analysis at `.commands/`:

| File | Diagram | Use case |
|------|---------|----------|
| `dms-architecture.mmd` | System architecture | High-level 3-tier view (browser → frontend → backend → DB) |
| `dms-erd.mmd` | Entity Relationship Diagram | All 15 tables + 19 relationships, rendered as `erDiagram` |
| `dms-process-flow.mmd` | Process flow | User journey from landing → login → sale transaction → background notifications |

## How to view

1. **VS Code** — install the "Mermaid Preview" extension, open any `.mmd` file.
2. **GitHub** — push the file; GitHub renders Mermaid natively in markdown.
3. **Online** — paste content at https://mermaid.live
4. **ToDiagram MCP** — if your MCP server is connected, ask opencode to convert these into visual system/code diagrams.

## Architecture summary

- **Frontend**: Vite + React 18 (`frontend/src`, 15 pages, 2 contexts, 5 hooks)
- **Backend**: Express + ES Modules (`backend/src`, 13 route groups)
- **Database**: PostgreSQL `dms_db` (15 tables, all SERIAL PK + `is_active` + timestamps)
- **Auth**: JWT (24h) in httpOnly cookie + Bearer; permission cache 5-min TTL
- **Background**: `notificationScanner` runs at boot + every 5 min + daily cleanup
