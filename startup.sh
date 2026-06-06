#!/bin/bash
# Azure App Service startup script (reference only)
# Azure startup command is set to: node src/server.js
# Frontend already built and copied to frontend-dist by deploy script

echo "=== Starting backend server ==="
node src/server.js