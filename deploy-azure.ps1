param(
  [Parameter(Mandatory=$true)]
  [string]$AppName,
  [Parameter(Mandatory=$false)]
  [string]$ResourceGroup = "$AppName-rg",
  [Parameter(Mandatory=$false)]
  [string]$Location = "southeastasia",
  [Parameter(Mandatory=$false)]
  [string]$Sku = "F1"
)

Write-Host "=== DMS - Azure App Service Deploy ===" -ForegroundColor Cyan

# Check Azure CLI
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  Write-Error "Azure CLI not found. Install from: https://aka.ms/installazurecliwindows"
  exit 1
}

# Check logged in
$account = az account show 2>$null
if (-not $account) {
  Write-Host "Logging in to Azure..." -ForegroundColor Yellow
  az login
}

# 1. Build frontend
Write-Host "`n=== Building frontend ===" -ForegroundColor Green
Push-Location frontend
npm install; if ($LASTEXITCODE -ne 0) { exit 1 }
npm run build; if ($LASTEXITCODE -ne 0) { exit 1 }
Pop-Location

# 2. Copy frontend dist into backend
Write-Host "`n=== Copying frontend dist ===" -ForegroundColor Green
if (Test-Path "backend/frontend-dist") {
  Remove-Item -Recurse -Force "backend/frontend-dist"
}
Copy-Item -Recurse "frontend/dist" "backend/frontend-dist"

# 3. Create Azure resources
Write-Host "`n=== Creating Resource Group ===" -ForegroundColor Green
az group create --name $ResourceGroup --location $Location

Write-Host "`n=== Creating App Service Plan (Free F1) ===" -ForegroundColor Green
az appservice plan create --name "$AppName-plan" --resource-group $ResourceGroup --sku $Sku --is-linux

Write-Host "`n=== Creating Web App ===" -ForegroundColor Green
az webapp create --name $AppName --resource-group $ResourceGroup --plan "$AppName-plan" --runtime "NODE:22-lts"

# 4. Configure Azure settings
Write-Host "`n=== Configuring startup command ===" -ForegroundColor Green
az webapp config set --name $AppName --resource-group $ResourceGroup --startup-file "node src/server.js"

Write-Host "`n=== Configuring app settings ===" -ForegroundColor Green
az webapp config appsettings set --name $AppName --resource-group $ResourceGroup --settings SCM_DO_BUILD_DURING_DEPLOYMENT=true WEBSITES_PORT=8080

# 5. Create deployment zip (uses adm-zip for POSIX paths)
Write-Host "`n=== Creating deployment zip ===" -ForegroundColor Green
Push-Location backend
npm install --omit=dev
node create-zip.cjs
Pop-Location

# 6. Deploy the zip
Write-Host "`n=== Deploying code ===" -ForegroundColor Green
az webapp deploy --name $AppName --resource-group $ResourceGroup --type zip --src-path "backend/deploy.zip" --clean true
Remove-Item "backend/deploy.zip"

# Cleanup
Remove-Item -Recurse -Force "backend/frontend-dist"

Write-Host "`n=== Deployment complete! ===" -ForegroundColor Cyan
Write-Host "App URL: https://$AppName.azurewebsites.net" -ForegroundColor Yellow
Write-Host ""
Write-Host "NEXT STEPS (do in Azure Portal or CLI):"
Write-Host "1. Set required App Settings:"
Write-Host "   NODE_ENV=production"
Write-Host "   FRONTEND_URL=https://$AppName.azurewebsites.net"
Write-Host "   JWT_SECRET=<strong-random-secret>"
Write-Host "   DB_HOST=<your-db>.postgres.database.azure.com"
Write-Host "   DB_PORT=5432"
Write-Host "   DB_USER=postgres"
Write-Host "   DB_PASSWORD=<database-password>"
Write-Host "   DB_NAME=dms_db"
Write-Host "   WHATSAPP_TOKEN=<meta-whatsapp-token>"
Write-Host "   WHATSAPP_PHONE_ID=<meta-phone-id>"
Write-Host "2. Create PostgreSQL database (Azure DB for PostgreSQL free tier)"
Write-Host "3. Allow 'Allow Azure services' in DB firewall"
Write-Host "4. Visit https://$AppName.azurewebsites.net"
Write-Host "   Login: SystemAdmin / admin123"
