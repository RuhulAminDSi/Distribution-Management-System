# Latest Azure Deploy Commands

Run from Command Prompt.

## Switch To Main Branch (Always Deploy From Main)

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management"
git checkout main
git pull origin main
```

## Build Frontend

```cmd
cd frontend
npm.cmd install
npm.cmd run build
```

## Copy Frontend Build To Backend

```cmd
cd ..
if exist "backend\frontend-dist" rmdir /s /q "backend\frontend-dist"
xcopy "frontend\dist" "backend\frontend-dist" /E /I /Y
```

## Set Azure Build And Port Settings

```cmd
az webapp config appsettings set --name "dms-app-UHeY" --resource-group "dms-app-rg" --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITES_PORT=8080
```

## Set Azure Startup Command

```cmd
az webapp config set --name "dms-app-UHeY" --resource-group "dms-app-rg" --startup-file "node src/server.js"
```

## Install Dependencies (only if missing)

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend"
npm install
```

## Create Clean Deployment Zip

Uses `create-zip.cjs` (adm-zip) which guarantees POSIX `/` paths and excludes `node_modules`, `uploads`, etc.

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend"
node create-zip.cjs
```

## Deploy Zip To Azure

```cmd
az webapp deploy --name "dms-app-UHeY" --resource-group "dms-app-rg" --src-path "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend\deploy.zip" --type zip --clean true
```

## Restart App

```cmd
az webapp restart --name "dms-app-UHeY" --resource-group "dms-app-rg"
```

## Verify Deployment

```cmd
curl -i "https://dms-app-uhey.azurewebsites.net/api/health"
curl -i "https://dms-app-uhey.azurewebsites.net/"
```

## Check Logs If 503 Happens

```cmd
az webapp log tail --name "dms-app-UHeY" --resource-group "dms-app-rg"
```

## Important Notes

- Do not manually set Azure `PORT`.
- Keep `WEBSITES_PORT=8080`.
- Startup command must be `node src/server.js`.
- Deployment zip must not contain Windows backslash paths.
- `SCM_DO_BUILD_DURING_DEPLOYMENT=true` lets Azure install backend dependencies.



CMD:
```
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management"

:: Always deploy from main branch
git checkout main
git pull origin main

cd frontend
npm.cmd install
npm.cmd run build
cd ..

if exist "backend\frontend-dist" rmdir /s /q "backend\frontend-dist"
xcopy "frontend\dist" "backend\frontend-dist" /E /I /Y

az webapp config appsettings set --name "dms-app-UHeY" --resource-group "dms-app-rg" --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITES_PORT=8080 NODE_ENV=production

az webapp config set --name "dms-app-UHeY" --resource-group "dms-app-rg" --startup-file "node src/server.js"

cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend"
node create-zip.cjs

az webapp deploy --name "dms-app-UHeY" --resource-group "dms-app-rg" --src-path "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend\deploy.zip" --type zip --clean true

az webapp restart --name "dms-app-UHeY" --resource-group "dms-app-rg"
```