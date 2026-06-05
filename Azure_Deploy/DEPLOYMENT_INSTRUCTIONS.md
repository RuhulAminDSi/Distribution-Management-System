# Azure Deployment Instructions

This project is deployed to Azure App Service as a single Node.js web app. The Express backend serves the built React frontend from `backend/frontend-dist` in production.

## Azure Resources

- Resource group: `dms-app-rg`
- App Service plan: `dms-app-plan`
- Web app: `dms-app-UHeY`
- Region: `centralindia`
- Runtime: `NODE|22-lts`
- Public URL: `https://dms-app-uhey.azurewebsites.net`
- PostgreSQL server: `dms-db.postgres.database.azure.com`
- PostgreSQL database: `dms_db`

## Required App Settings

Set these in Azure App Service Configuration:

```text
NODE_ENV=production
FRONTEND_URL=https://dms-app-uhey.azurewebsites.net
JWT_SECRET=<strong-random-secret>
DB_HOST=dms-db.postgres.database.azure.com
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<database-password>
DB_NAME=dms_db
WEBSITES_PORT=8080
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

Do not set `PORT` manually. Azure injects `PORT` for Linux App Service.

## Startup Command

The correct startup command is:

```text
node src/server.js
```

If Azure is configured with `node server.js`, the app will fail with 503 because this project does not have `server.js` at the web root.

## Deployment Package Rules

- Deploy from the `backend` folder contents.
- Do not include `node_modules` in the zip.
- Do not include `uploads` in the zip.
- The zip must use Linux/POSIX paths with `/`, not Windows paths with `\`.
- Use `SCM_DO_BUILD_DURING_DEPLOYMENT=true` so Azure/Oryx installs backend dependencies.

## Important Fixes Applied

- Backend serves production frontend static files from `backend/frontend-dist`.
- Backend PostgreSQL config uses SSL in production.
- Azure startup command is `node src/server.js`.
- `WEBSITES_PORT=8080` is configured.
- Deployment package is created with forward-slash zip entries to avoid Kudu/Linux path errors.

## Verification

After deployment, check:

```text
https://dms-app-uhey.azurewebsites.net/api/health
https://dms-app-uhey.azurewebsites.net/
```

Expected health response:

```json
{
  "status": "OK",
  "timestamp": "..."
}
```

## Troubleshooting

If the site shows 503:

1. Check the startup command is `node src/server.js`.
2. Check `SCM_DO_BUILD_DURING_DEPLOYMENT=true` before deployment.
3. Check `WEBSITES_PORT=8080` exists and `PORT` is not manually set.
4. Check Azure logs with `az webapp log tail`.
5. If logs show `MODULE_NOT_FOUND`, dependencies were not installed or the wrong startup command is being used.
6. If logs show invalid paths like `node_modules\...`, recreate the zip with forward-slash paths.
