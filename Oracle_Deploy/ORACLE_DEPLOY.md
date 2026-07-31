# Oracle Cloud Free Tier - DMS Deployment Guide

## What You Get (Always Free)

- 1 AMD VM (OCPU, 1 GB RAM) OR up to 4 ARM cores + 24 GB RAM
- 200 GB block storage
- 10 GB object storage
- 2 Autonomous Databases (20 GB each)
- **Always free — no credit card charges, no expiry**

## Step 1: Create Oracle Cloud Account

1. Go to **https://cloud.oracle.com/free**
2. Click **"Start for free"**
3. Sign up with your email
4. Verify email and complete registration
5. You'll land in the Oracle Cloud Console

## Step 2: Create a VM Instance

1. In the Console, click **"Create a VM Instance"**
   - Or go to: **Compute → Instances → Create Instance**

2. **Configure:**
   - Name: `dms-server`
   - Image: **Canonical Ubuntu 24.04** (or latest)
   - Shape: **VM.Standard.E2.1.Micro** (Always Free eligible) or **VM.Standard.A1.Flex** (ARM, 4 cores free)
   - SSH Keys: **Upload your SSH public key** (see below)
   - VCN: Create new (default)
   - Subnet: Public (default)

3. **Create SSH Key (if you don't have one):**

   Open PowerShell and run:
   ```powershell
   ssh-keygen -t ed25519 -C "dms-deploy" -f "$env:USERPROFILE\.ssh\oracle_dms" -N ""
   ```

   This creates:
   - Private key: `~/.ssh/oracle_dms` (keep this safe!)
   - Public key: `~/.ssh/oracle_dms.pub` (upload this to Oracle)

   View and copy your public key:
   ```powershell
   type $env:USERPROFILE\.ssh\oracle_dms.pub
   ```

4. Click **Create** and wait 2-3 minutes for the instance to start

5. **Note down the Public IP** (e.g., `129.154.xx.xx`)

## Step 3: Connect to Your VM

```powershell
# For Ubuntu image (uses ubuntu user):
ssh -i $env:USERPROFILE\.ssh\oracle_dms ubuntu@YOUR_PUBLIC_IP

# For Oracle Linux image (uses opc user):
ssh -i $env:USERPROFILE\.ssh\oracle_dms opc@YOUR_PUBLIC_IP
```

Replace `YOUR_PUBLIC_IP` with your instance's public IP.

## Step 4: Open Ports in Security List

1. Go to **Networking → Virtual Cloud Networks → your VCN**
2. Click **Public Subnet**
3. Under **Security Lists**, click the default security list
4. **Add Ingress Rules:**

   | Port | Protocol | Source | Purpose |
   |------|----------|--------|---------|
   | 22 | TCP | Your IP/32 | SSH access |
   | 80 | TCP | 0.0.0.0/0 | HTTP |
   | 443 | TCP | 0.0.0.0/0 | HTTPS |
   | 8080 | TCP | 0.0.0.0/0 | App direct access (optional) |

## Step 5: Deploy DMS

Once connected to your VM via SSH:

```bash
# 1. Install Docker
sudo apt update
sudo apt install -y docker.io docker-compose git
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone your repo (replace with your actual GitHub repo URL)
cd /opt
sudo git clone https://github.com/YOUR_USERNAME/distribution-management.git dms
sudo chown -R $USER:$USER /opt/dms
cd /opt/dms

# 3. Build frontend
cd frontend
npm install
npm run build
cd ..

# 4. Copy frontend build to backend
mkdir -p backend/frontend-dist
cp -r frontend/dist/* backend/frontend-dist/

# 5. Edit docker/.env — set your DB password and other secrets
nano docker/.env

# 6. Start everything
cd docker
docker-compose up -d --build

# 7. Verify
curl http://localhost:8080/api/health
```

## Step 6: Verify Deployment

Open browser and go to:
```
http://YOUR_PUBLIC_IP
```

Or check health endpoint:
```
http://YOUR_PUBLIC_IP:8080/api/health
```

**Login:** `SystemAdmin` / `admin123`

## Step 7 (Optional): Set Up Custom Domain + SSL

1. Point your domain DNS to your server IP:
   ```
   A Record: @ → YOUR_PUBLIC_IP
   A Record: www → YOUR_PUBLIC_IP
   ```

2. Install Nginx on the VM:
   ```bash
   sudo apt install -y nginx
   sudo ufw allow 'Nginx Full'
   ```

3. Get SSL certificate:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

4. Configure Nginx reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/dms
   ```

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       return 301 https://$host$request_uri;
   }

   server {
       listen 443 ssl;
       server_name yourdomain.com www.yourdomain.com;

       ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

       client_max_body_size 10M;

       location / {
           proxy_pass http://127.0.0.1:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/dms /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. Update FRONTEND_URL in docker/.env:
   ```
   FRONTEND_URL=https://yourdomain.com
   ```

   ```bash
   cd /opt/dms/docker
   docker-compose down
   docker-compose up -d
   ```

## Troubleshooting

### App won't start
```bash
cd /opt/dms/docker
docker-compose logs app
```

### Database connection error
```bash
docker-compose logs db
# Check if PostgreSQL is running:
docker ps | grep dms-db
```

### Port already in use
```bash
# Check what's using port 80:
sudo lsof -i :80
# Kill it or change ports in docker-compose.yml
```

### Re-deploy after code changes
```bash
cd /opt/dms
git pull origin main
cd frontend && npm run build && cd ..
rm -rf backend/frontend-dist
cp -r frontend/dist backend/frontend-dist
cd docker
docker-compose up -d --build
```

## Cost

| Resource | Cost |
|----------|------|
| VM.Standard.E2.1.Micro | **Free forever** |
| VM.Standard.A1.Flex (4 OCPU + 24GB) | **Free forever** |
| 200 GB Block Storage | **Free forever** |
| Public IP (ephemeral) | **Free** |
| **Total** | **$0/month** |
