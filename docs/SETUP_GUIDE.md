# DentalJourneyIndia — Setup Guide

## Prerequisites
- Ubuntu 22.04/24.04 with 8GB+ RAM
- Ollama on separate machine (OLLAMA_HOST=0.0.0.0)
- Docker & Docker Compose
- Node.js 20+, Nginx, PM2

## 1. Twenty CRM
```bash
cd /opt/twenty
# Create .env with APP_SECRET, PG_DATABASE_PASSWORD, SERVER_URL
docker compose up -d
# If unhealthy: docker start twenty-worker-1
# Get API key: Settings -> Advanced -> API & Webhooks
```

## 2. Bot
```bash
cd /var/www/dentaljourneyindia-bot
npm install --production
cp .env.example .env  # Fill in tokens
mkdir -p data
node src/index.js     # Test
pm2 start src/index.js --name dentaljourneyindia-bot
pm2 save && pm2 startup
```

## 3. Website
```bash
# Files in /var/www/dentaljourneyindia/website/
# Nginx: proxy /api/ to localhost:3001
# Reverse proxy: forward to VPS:80 with 120s timeout
# SSL: certbot --nginx -d dentaljourneyindia.org
```

## 4. DNS
ALIAS  @   -> fitlab.theworkpc.com
CNAME  www -> fitlab.theworkpc.com

## Health Checks
```bash
curl http://localhost:3000/healthz
curl http://localhost:3001/api/health
curl http://192.168.1.196:11434/api/tags
pm2 status
```
