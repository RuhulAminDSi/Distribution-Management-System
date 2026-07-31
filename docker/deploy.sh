#!/bin/bash
# ─── DMS Oracle Cloud Deployment Script ────────────────────────────────
# Run this ON your Oracle Cloud VM after initial setup
# Usage: bash deploy.sh

set -e

APP_DIR="/opt/dms"
REPO_URL="https://github.com/YOUR_USERNAME/distribution-management.git"  # CHANGE THIS

echo "=== DMS Oracle Cloud Deployment ==="

# 1. Install Docker if not present
if ! command -v docker &> /dev/null; then
  echo "Installing Docker..."
  sudo apt update
  sudo apt install -y docker.io docker-compose
  sudo systemctl enable docker
  sudo usermod -aG docker $USER
  echo "Docker installed. You may need to log out and back in."
fi

# 2. Clone or pull repo
if [ ! -d "$APP_DIR" ]; then
  echo "Cloning repository..."
  sudo git clone $REPO_URL $APP_DIR
  sudo chown -R $USER:$USER $APP_DIR
else
  echo "Pulling latest changes..."
  cd $APP_DIR
  git pull origin main
fi

cd $APP_DIR

# 3. Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

# 4. Copy frontend build to backend
rm -rf backend/frontend-dist
cp -r frontend/dist backend/frontend-dist

# 5. Generate JWT secret if not set
if grep -q "CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING" docker/.env 2>/dev/null; then
  NEW_SECRET=$(openssl rand -hex 32)
  sed -i "s/CHANGE_THIS_TO_A_RANDOM_64_CHAR_STRING/$NEW_SECRET/" docker/.env
  echo "Generated new JWT secret."
fi

# 6. Generate DB password if not set
if grep -q "CHANGE_THIS_TO_A_STRONG_PASSWORD" docker/.env 2>/dev/null; then
  NEW_PASS=$(openssl rand -hex 16)
  sed -i "s/CHANGE_THIS_TO_A_STRONG_PASSWORD/$NEW_PASS/" docker/.env
  echo "Generated new DB password."
fi

# 7. Build and start containers
echo "Building and starting containers..."
cd docker
docker-compose down
docker-compose up -d --build

# 8. Wait for health
echo "Waiting for app to start..."
sleep 10

# 9. Verify
if curl -sf http://localhost:8080/api/health > /dev/null; then
  echo ""
  echo "=== Deployment Successful! ==="
  echo "App URL: http://$(curl -s ifconfig.me)"
  echo "Health: http://$(curl -s ifconfig.me):8080/api/health"
  echo "Login: SystemAdmin / admin123"
  echo ""
  echo "To set up SSL with your domain:"
  echo "  1. Point your domain DNS to this server IP"
  echo "  2. Run: bash setup-ssl.sh"
else
  echo "ERROR: App health check failed. Check logs with:"
  echo "  docker-compose logs app"
fi
