#!/bin/bash
# ─── SSL Setup with Let's Encrypt ──────────────────────────────────────
# Run after your domain DNS points to this server
# Usage: bash setup-ssl.sh your-domain.com

set -e

DOMAIN=${1:-"dms.yourdomain.com"}
EMAIL=${2:-"your-email@gmail.com"}

echo "=== Setting up SSL for $DOMAIN ==="

# Install certbot
sudo apt install -y certbot

# Get certificate (standalone mode)
sudo certbot certonly --standalone -d $DOMAIN --email $EMAIL --agree-tos --no-eff-email

# Update nginx.conf with domain
sed -i "s/dms.yourdomain.com/$DOMAIN/g" nginx.conf

# Restart nginx
docker-compose restart nginx

echo "=== SSL Setup Complete! ==="
echo "Your site is now live at https://$DOMAIN"
