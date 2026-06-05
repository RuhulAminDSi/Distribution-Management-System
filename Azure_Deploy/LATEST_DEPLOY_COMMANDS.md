# Latest Azure Deploy Commands

Run from Command Prompt.

## Go To Project

```cmd
cd /d "C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management"
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

## Create Clean Deployment Zip

This creates a clean zip with Linux/POSIX `/` paths and excludes `node_modules` and `uploads`.

```cmd
powershell -ExecutionPolicy Bypass -Command "$src='C:\Users\Ruhul Amin\Desktop\PROJECTS\Distribution Management\backend'; $zip='C:\Users\RUHULA~1\AppData\Local\Temp\opencode\dms-backend-clean.zip'; if(Test-Path -LiteralPath $zip){Remove-Item -LiteralPath $zip -Force}; Add-Type -AssemblyName System.IO.Compression; Add-Type -AssemblyName System.IO.Compression.FileSystem; $archive=[System.IO.Compression.ZipFile]::Open($zip,[System.IO.Compression.ZipArchiveMode]::Create); try{$base=(Resolve-Path -LiteralPath $src).Path.TrimEnd('\'); $files=[System.IO.Directory]::EnumerateFiles($base,'*',[System.IO.SearchOption]::AllDirectories); foreach($file in $files){$rel=$file.Substring($base.Length+1); if($rel -like 'node_modules\*' -or $rel -like 'uploads\*'){continue}; $entryName=$rel.Replace('\','/'); [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive,$file,$entryName,[System.IO.Compression.CompressionLevel]::Optimal) | Out-Null}} finally{$archive.Dispose()}; Write-Host $zip"
```

## Deploy Zip To Azure

```cmd
az webapp deploy --name "dms-app-UHeY" --resource-group "dms-app-rg" --src-path "C:\Users\RUHULA~1\AppData\Local\Temp\opencode\dms-backend-clean.zip" --type zip --clean true
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
