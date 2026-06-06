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
WHATSAPP_TOKEN=<meta-whatsapp-token>
WHATSAPP_PHONE_ID=<meta-phone-id>
```

Do not set `PORT` manually. Azure injects `PORT` for Linux App Service.

## Startup Command

The correct startup command is:

```text
node src/server.js
```

If Azure is configured with `node server.js` or `startup.sh`, the app will fail with 503 because this project does not have `server.js` at the web root.

## Deployment Steps

1. **Checkout main branch** — always deploy from `main`:
   ```bash
   git checkout main && git pull origin main
   ```

2. **Build frontend** — see steps below.

## Deployment Package Rules

- Deploy from the `backend` folder contents.
- Do not include `node_modules` in the zip.
- Do not include `uploads` in the zip.
- The zip must use Linux/POSIX paths with `/`, not Windows paths with `\`.
- Use `SCM_DO_BUILD_DURING_DEPLOYMENT=true` so Azure/Oryx installs backend dependencies.
- Use `backend/create-zip.cjs` (adm-zip) to create the zip — it guarantees POSIX paths.

## Zip Creation

Run from the `backend` directory:

```bash
npm install --omit=dev
node create-zip.cjs
```

This creates `deploy.zip` with relative POSIX paths, excluding `node_modules`, `uploads`, and config files.

## Deploy Command

```bash
az webapp deploy --name "dms-app-UHeY" --resource-group "dms-app-rg" --src-path "backend/deploy.zip" --type zip --clean true
az webapp restart --name "dms-app-UHeY" --resource-group "dms-app-rg"
```

## Important Fixes Applied

- Backend serves production frontend static files from `backend/frontend-dist`.
- Backend PostgreSQL config uses SSL in production.
- Azure startup command is `node src/server.js` (not `startup.sh`).
- `WEBSITES_PORT=8080` is configured (Azure injects `PORT` dynamically; do not set `PORT`).
- Deployment package uses `create-zip.cjs` with `adm-zip` for forward-slash zip entries.
- Frontend OTP flow with WhatsApp Cloud API delivery, animated countdown timer, resend blocking.

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

1. Check the startup command is `node src/server.js` (not `startup.sh`).
2. Check `SCM_DO_BUILD_DURING_DEPLOYMENT=true` before deployment.
3. Check `WEBSITES_PORT=8080` exists and `PORT` is not manually set.
4. Check Azure logs with `az webapp log tail`.
5. If logs show `MODULE_NOT_FOUND`, dependencies were not installed or the wrong startup command is being used.
6. If logs show invalid paths like `node_modules\...`, recreate the zip with `create-zip.cjs` (which only writes POSIX paths).
