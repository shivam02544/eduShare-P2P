#!/bin/bash
# EC2 Ubuntu setup script for EduShare
# Run as: bash ec2-setup.sh

set -e

echo "=== Updating system ==="
sudo apt update && sudo apt upgrade -y

echo "=== Installing Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

echo "=== Installing PM2 ==="
sudo npm install -g pm2

echo "=== Installing Nginx ==="
sudo apt install -y nginx

echo "=== Copying Nginx config ==="
sudo cp nginx.conf /etc/nginx/sites-available/edushare
sudo ln -sf /etc/nginx/sites-available/edushare /etc/nginx/sites-enabled/edushare
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

echo "=== Installing app dependencies ==="
npm install --production

echo "=== Building Next.js app ==="
npm run build

echo "=== Starting app with PM2 ==="
pm2 start ecosystem.config.js
pm2 save

echo "=== Enable PM2 on reboot ==="
pm2 startup systemd -u $USER --hp $HOME
# Run the command output by pm2 startup manually

echo "=== Done! App running on port 3000, Nginx on port 80 ==="
