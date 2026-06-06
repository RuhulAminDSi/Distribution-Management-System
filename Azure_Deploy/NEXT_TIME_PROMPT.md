# Next Time Prompt

Future deploy request:

```text
Deploy latest DMS code to Azure using the Azure_Deploy instructions.
Build the latest frontend, copy it into backend/frontend-dist, create a clean POSIX-path zip without node_modules/uploads, set Azure app settings/startup command, deploy to dms-app-UHeY, restart, and verify /api/health plus homepage.
```

Short version you can type:

```text
Deploy latest DMS code to Azure.
```

When you say this, the expected workflow is:

1. `git checkout main && git pull origin main` (always deploy from main).
2. Build frontend from `frontend/`.
3. Replace `backend/frontend-dist` with the latest `frontend/dist` output.
4. Create clean deployment zip by running `node create-zip.cjs` from `backend/` — uses adm-zip for POSIX paths, excludes `node_modules` and `uploads`.
5. Ensure Azure settings include `SCM_DO_BUILD_DURING_DEPLOYMENT=true` and `WEBSITES_PORT=8080`.
6. Ensure Azure startup command is `node src/server.js` (not `startup.sh`).
7. Deploy zip to `dms-app-UHeY` in `dms-app-rg`.
8. Restart app.
9. Verify:

```text
https://dms-app-uhey.azurewebsites.net/api/health
https://dms-app-uhey.azurewebsites.net/
```

Important reminders:

- Do not use a Windows zip that stores paths with `\`.
- Do not manually set `PORT` in Azure App Settings.
- Do not use `node server.js`; startup must be `node src/server.js`.
- If 503 happens, check `az webapp log tail` first.
