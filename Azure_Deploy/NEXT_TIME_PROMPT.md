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

1. Build frontend from `frontend/`.
2. Replace `backend/frontend-dist` with the latest `frontend/dist` output.
3. Create clean deployment zip from `backend/` with `/` paths, excluding `node_modules` and `uploads`.
4. Ensure Azure settings include `SCM_DO_BUILD_DURING_DEPLOYMENT=true` and `WEBSITES_PORT=8080`.
5. Ensure Azure startup command is `node src/server.js`.
6. Deploy zip to `dms-app-UHeY` in `dms-app-rg`.
7. Restart app.
8. Verify:

```text
https://dms-app-uhey.azurewebsites.net/api/health
https://dms-app-uhey.azurewebsites.net/
```

Important reminders:

- Do not use a Windows zip that stores paths with `\`.
- Do not manually set `PORT` in Azure App Settings.
- Do not use `node server.js`; startup must be `node src/server.js`.
- If 503 happens, check `az webapp log tail` first.
