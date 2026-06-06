# DMS — Azure App Service Operations Guide

## 1. Rename App Service (Change azurewebsites.net URL)

Azure App Service name cannot be renamed. You must create a new one and redeploy.

### Steps

```bash
# 1. Find current app and resource group
az webapp list --query "[].{name:name, rg:resourceGroup}"

# 2. Check if desired name is available
az webapp create --name <new-name> --resource-group <rg> --plan <plan-name> --runtime "NODE:22-lts" --query "defaultHostName"
# If name is taken, the command fails with "already exists" error.

# 3. Copy all env settings from old app to new app
az webapp config appsettings set --resource-group <rg> --name <new-name> --settings \
  NODE_ENV=production \
  FRONTEND_URL=https://<new-name>.azurewebsites.net \
  JWT_SECRET=<secret> \
  DB_HOST=<db-host> \
  DB_PORT=5432 \
  DB_USER=<db-user> \
  DB_PASSWORD=<db-password> \
  DB_NAME=<db-name> \
  SMTP_HOST=<smtp-host> \
  SMTP_PORT=<smtp-port> \
  SMTP_USER=<smtp-user> \
  SMTP_PASS=<smtp-pass> \
  SMTP_FROM="<smtp-from>" \
  SCM_DO_BUILD_DURING_DEPLOYMENT=true \
  PORT=8080 \
  WEBSITES_PORT=8080 \
  WEBSITE_HTTPLOGGING_RETENTION_DAYS=3

# 4. Set startup command and HTTPS-only
az webapp config set --resource-group <rg> --name <new-name> --startup-file "node src/server.js" --min-tls-version 1.2
az webapp update --resource-group <rg> --name <new-name> --https-only true

# 5. Build frontend
cd frontend
npm install && npm run build
cd ..

# 6. Copy frontend dist to backend
Remove-Item -Recurse -Force "backend/frontend-dist" -ErrorAction SilentlyContinue
Copy-Item -Recurse "frontend/dist" "backend/frontend-dist"

# 7. Create deployment zip
Remove-Item -Force "backend/deploy.zip" -ErrorAction SilentlyContinue
Push-Location backend
node create-zip.cjs
Pop-Location

# 8. Deploy to new app
az webapp deploy --name <new-name> --resource-group <rg> --type zip --src-path "backend/deploy.zip" --clean true

# 9. Verify site works
curl -s -o /dev/null -w "%{http_code}" https://<new-name>.azurewebsites.net/

# 10. (Optional) Delete old app
az webapp delete --name <old-name> --resource-group <rg>
```

### Key Notes
- `create-zip.cjs` (in `backend/`) controls what's included in the deployment ZIP.
- The `excludes` array skips folders/files during deployment.
- **IMPORTANT:** `uploads` folder should NOT be in excludes if you want profile pictures deployed.
- Run from project root directory.

---

## 2. Profile Picture Migration (Old → New App)

### Why Pictures Go Missing

`backend/create-zip.cjs` has an `excludes` list. If `'uploads'` is in the list, profile pictures are NOT deployed.

```javascript
const excludes = new Set([
  'node_modules', 'uploads', '.azure',  // ← 'uploads' here blocks profile pics
  // ...
]);
```

### How to Fix

**Step 1:** Remove `'uploads'` from the excludes array in `create-zip.cjs`.

**Step 2:** Find which profile pictures the database references:

```javascript
const pg = require('pg');
const pool = new pg.Pool({
  host: '<db-host>',
  port: 5432,
  user: '<db-user>',
  password: '<db-password>',
  database: '<db-name>',
  ssl: { rejectUnauthorized: false }
});
pool.query("SELECT id, username, profile_picture FROM users WHERE profile_picture IS NOT NULL AND profile_picture != ''", (err, result) => {
  if (err) { console.error(err.message); process.exit(1); }
  console.log(JSON.stringify(result.rows, null, 2));
  pool.end();
});
```

**Step 3:** Download each profile picture from the old server by filename:

```powershell
$oldSite = "https://<old-name>.azurewebsites.net"
$localDir = "backend\uploads\profile_pictures"
$files = @("user_1_xxx.png", "user_2_xxx.png", ...)  # from DB query

foreach ($f in $files) {
  $path = "$localDir\$f"
  if (-not (Test-Path $path)) {
    curl.exe -s -o $path "https://<old-name>.azurewebsites.net/uploads/profile_pictures/$f"
  }
}
```

**Step 4:** Rebuild and redeploy:

```bash
Remove-Item -Force "backend/deploy.zip"
Push-Location backend
node create-zip.cjs
Pop-Location
az webapp deploy --name <app-name> --resource-group <rg> --type zip --src-path "backend/deploy.zip" --clean true
```

**Step 5:** Verify:

```bash
curl -s -o /dev/null -w "%{http_code}" "https://<app-name>.azurewebsites.net/uploads/profile_pictures/<filename>"
```

### Alternative: Direct HTTP Download (if both apps share the same DB)

If the old app is still running, you can download pictures directly via HTTP:

```bash
curl.exe -s -o "backend/uploads/profile_pictures/user_1_xxx.png" "https://<old-app>.azurewebsites.net/uploads/profile_pictures/user_1_xxx.png"
```

### Best Practice

Store uploads in **Azure Blob Storage** instead of local filesystem. This way:
- All app instances share the same files
- Deployments don't wipe or miss files
- Scales better

---

## 3. Common Deployment Issues

### Issue: 429 Too Many Requests (Rate Limiter)

**File:** `backend/src/app.js`

```javascript
// Problem: max=100 is too low for 15 min window
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,         // ← Too low
    message: { message: 'Too many requests, please try again later' }
  });
  app.use('/api/', limiter);
}
```

Each page load makes ~5-10 API calls (`/api/auth/me`, `/api/roles`, `/api/dashboard/summary`, etc.). After 10-20 page loads, the user is locked out for 15 minutes.

**Fix:** Increase `max` to 1000 (or higher):

```javascript
max: 1000,
```

**After fix:** Rebuild zip and redeploy.

### Issue: 401 Unauthorized on /api/auth/me

**Causes:**
1. JWT token expired (24h expiry) → re-login
2. Cookie not sent (cross-domain, missing `withCredentials`)
3. Token missing from Authorization header

**Auth flow** (`backend/src/middleware/auth.js`):
1. First checks `req.cookies.token` (httpOnly cookie)
2. Falls back to `Authorization: Bearer <token>` header
3. Verifies JWT with `process.env.JWT_SECRET`

**Frontend** (`frontend/src/services/api.js`):
- Axios interceptor adds token from `localStorage` to `Authorization` header
- Login response has both `httpOnly` cookie and body `token`

### Issue: Profile Pictures Return HTML Instead of Images

The Express static file middleware at line 45 of `app.js`:

```javascript
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
```

If the `uploads/` folder doesn't exist or is empty, Express falls through to the SPA catch-all route, returning `index.html` instead of a 404 image.

**Fix:** Ensure `uploads/` folder exists and has the expected files. If files are missing, redeploy with `uploads` included in the ZIP.

---

## 4. Quick Deployment Checklist

| Step | Command | Notes |
|------|---------|-------|
| Build frontend | `cd frontend && npm install && npm run build` | |
| Copy dist | `Copy-Item -Recurse frontend/dist backend/frontend-dist` | |
| Create zip | `Push-Location backend; node create-zip.cjs; Pop-Location` | Check excludes first |
| Deploy | `az webapp deploy --name <app> --resource-group <rg> --type zip --src-path backend/deploy.zip --clean true` | Wait ~1 min |
| Verify | `curl -s -o /dev/null -w "%{http_code}" https://<app>.azurewebsites.net/` | Should get 200 |
| Check images | Browse to a user profile page or settings → profile | |

---

## 5. Useful Azure CLI Commands

```bash
# List all web apps
az webapp list --query "[].{name:name, rg:resourceGroup, hostNames:hostNames}"

# Check app settings
az webapp config appsettings list --resource-group <rg> --name <app>

# View logs (streaming)
az webapp log tail --resource-group <rg> --name <app>

# Download logs
az webapp log download --resource-group <rg> --name <app> --log-file logs.zip

# Get publishing profile (for Kudu/FTP access)
az webapp deployment list-publishing-profiles --resource-group <rg> --name <app>

# Check app status
az webapp show --resource-group <rg> --name <app> --query "state"

# Delete app
az webapp delete --name <app> --resource-group <rg>
```

---

## 6. SMTP / Email Setup

### How It Works

**File:** `backend/src/services/emailService.js`

```
nodemailer (Nodemailer) → Gmail SMTP (smtp.gmail.com:587)
```

### Required Environment Variables

| Variable | Value (current) | Purpose |
|----------|----------------|---------|
| `SMTP_HOST` | `smtp.gmail.com` | Gmail SMTP server |
| `SMTP_PORT` | `587` | STARTTLS port |
| `SMTP_USER` | `dms.service.ra@gmail.com` | Gmail address |
| `SMTP_PASS` | App password (16 chars) | Gmail App Password |
| `SMTP_FROM` | `DMS <noreply@dms.com>` | Sender name/address |

### How to Create a Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Select app → "Mail", device → "Other" → name it "DMS"
3. Copy the 16-character password generated
4. Set it as `SMTP_PASS` in Azure App Settings

### SMTP Auto-Disable Logic

```javascript
// emailService.js line 3-6
const isSmtpConfigured = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  return user && pass && user !== 'your-email@gmail.com' && pass !== 'your-app-password';
};
```

- If SMTP_USER or SMTP_PASS is missing → email sending skipped
- If NODE_ENV is `development` → sends reset link in response instead of email
- In production with valid SMTP → sends actual email

### Password Reset Flow

```
User clicks "Forgot Password"
  → POST /api/auth/forgot-password  (email)
    → userService.createPasswordReset()  (generates token, stores in DB)
      → sendPasswordResetEmail()
        → Dev: returns resetLink in response
        → Prod: sends email via Gmail SMTP
```

### Testing Without Email

In dev mode (`NODE_ENV=development`), the forgot-password API returns the reset link directly in the response body, no email needed.

---

## 7. Architecture Overview

```
User → https://<app>.azurewebsites.net
         │
         ├── Frontend (React + Vite, SPA)
         │     └── Proxy via Vite (dev) or Express static (prod)
         │
         └── Backend (Node.js + Express)
               ├── /api/auth      → Authentication
               ├── /api/products  → Products
               ├── /api/roles     → Roles & permissions
               ├── /uploads       → Static files (profile pics)
               └── PostgreSQL     → Azure DB for PostgreSQL
```

- **Database:** Shared between old and new apps (same connection string)
- **Uploads:** Local filesystem (per-app instance) — migrate to Blob Storage for production
- **JWT:** 24h expiry, httpOnly cookie + Bearer header fallback
