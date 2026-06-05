#!/bin/bash
# Azure App Service startup script
# Frontend already built and copied to frontend-dist by deploy script

echo "=== Starting backend server ==="
node src/server.js