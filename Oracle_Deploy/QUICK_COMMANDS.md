# Oracle Cloud Quick Deploy Commands

Run these on your Oracle Cloud VM via SSH.

## First-Time Setup

```bash
# Install Docker
sudo apt update && sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker && sudo usermod -aG docker $USER
newgrp docker

# Clone repo
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/distribution-management.git dms
sudo chown -R $USER:$USER /opt/dms
cd /opt/dms

# Build frontend
cd frontend && npm install && npm run build && cd ..
mkdir -p backend/frontend-dist && cp -r frontend/dist/* backend/frontend-dist/

# Set secrets
cd docker
nano .env   # Edit: DB_PASSWORD, JWT_SECRET, FRONTEND_URL

# Start
docker-compose up -d --build

# Verify
curl http://localhost:8080/api/health
```

## Redeploy (After Code Changes)

```bash
cd /opt/dms
git pull origin main
cd frontend && npm run build && cd ..
rm -rf backend/frontend-dist && cp -r frontend/dist backend/frontend-dist/
cd docker
docker-compose up -d --build
```

## Check Status

```bash
docker ps
docker-compose logs app --tail 50
docker-compose logs db --tail 50
```

## Restart

```bash
cd /opt/dms/docker
docker-compose restart
```

## Stop

```bash
cd /opt/dms/docker
docker-compose down
```
