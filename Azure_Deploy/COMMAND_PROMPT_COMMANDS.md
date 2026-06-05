# Azure Deployment Commands

Run these commands from the project root:

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management"
```

## Login And Select Subscription

```cmd
az login
az account set --subscription "Azure for Students"
```

## Configure App Settings

Replace `<database-password>` and `<strong-random-secret>` before running.

```cmd
az webapp config appsettings set --name "dms-app-UHeY" --resource-group "dms-app-rg" --settings NODE_ENV=production FRONTEND_URL=https://dms-app-uhey.azurewebsites.net JWT_SECRET=<strong-random-secret> DB_HOST=dms-db.postgres.database.azure.com DB_PORT=5432 DB_USER=postgres DB_PASSWORD=<database-password> DB_NAME=dms_db WEBSITES_PORT=8080 SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

## Set Correct Startup Command

```cmd
az webapp config set --name "dms-app-UHeY" --resource-group "dms-app-rg" --startup-file "node src/server.js"
```

## Build Frontend

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\frontend"
npm install
npm run build
```

## Copy Frontend Build Into Backend

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management"
if exist "backend\frontend-dist" rmdir /s /q "backend\frontend-dist"
xcopy "frontend\dist" "backend\frontend-dist" /E /I /Y
```

## Create Clean Deployment Zip

PowerShell is safer for creating the zip because it can force forward-slash zip entries. Run this from Command Prompt:

```cmd
powershell -ExecutionPolicy Bypass -Command "$src='C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend'; $zip='C:\Users\RUHULA~1\AppData\Local\Temp\opencode\dms-backend-clean.zip'; if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force}; Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; $archive=[System.IO.Compression.ZipFile]::Open($zip,[System.IO.Compression.ZipArchiveMode]::Create); try{$base=(Resolve-Path -LiteralPath $src).Path.TrimEnd('\'); $files=[System.IO.Directory]::EnumerateFiles($base,'*',[System.IO.SearchOption]::AllDirectories); foreach($file in $files){$rel=$file.Substring($base.Length+1); if($rel -like 'node_modules\*' -or $rel -like 'uploads\*'){continue}; $entryName=$rel.Replace('\','/'); [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file,$entryName,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}} finally{$archive.Dispose()}; Write-Host $zip"
```

## Deploy Clean Zip

```cmd
az webapp deploy --name "dms-app-UHeY" --resource-group "dms-app-rg" --src-path "C:\Users\RUHULA~1\AppData\Local\Temp\opencode\dms-backend-clean.zip" --type zip --clean true
```

## Restart App

```cmd
az webapp restart --name "dms-app-UHeY" --resource-group "dms-app-rg"
```

## Verify Site

```cmd
curl -i "https://dms-app-uhey.azurewebsites.net/api/health"
curl -i "https://dms-app-uhey.azurewebsites.net/"
```

## View Logs

```cmd
az webapp log tail --name "dms-app-UHeY" --resource-group "dms-app-rg"
```

## Check Current Config

```cmd
az webapp config show --name "dms-app-UHeY" --resource-group "dms-app-rg" --query "{startup:appCommandLine,runtime:linuxFxVersion}" -o json
az webapp config appsettings list --name "dms-app-UHeY" --resource-group "dms-app-rg" --query "[?name=='SCM_DO_BUILD_DURING_DEPLOYMENT' || name=='NODE_ENV' || name=='WEBSITES_PORT' || name=='PORT' || name=='DB_HOST' || name=='DB_NAME'].{name:name,value:value}" -o table
```
