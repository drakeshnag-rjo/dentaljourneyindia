# DentalJourneyIndia — Setup Guide

> Last updated: April 4, 2026

Complete setup instructions for deploying DentalJourneyIndia from scratch.

## Prerequisites

- Ubuntu 22.04/24.04 server (VPS)
- Node.js 20+
- Docker & Docker Compose
- Nginx
- PM2 (`npm install -g pm2`)
- Domain with DNS access
- Separate machine for Ollama AI (8GB+ RAM recommended)

## 1. Website

```bash
# Clone repo
cd /var/www
git clone https://github.com/drakeshnag-rjo/dentaljourneyindia.git
cd dentaljourneyindia

# Website is static HTML — just point Nginx to it
# Files are in website/
```

### Nginx Config (/etc/nginx/sites-available/dentaljourneyindia)

```nginx
server {
    listen 80;
    server_name dentaljourneyindia.org www.dentaljourneyindia.org;
    root /var/www/dentaljourneyindia/website;
    index index.html;

    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }

    location ~* \.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
}
```

```bash
ln -s /etc/nginx/sites-available/dentaljourneyindia /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

## 2. Telegram Bot

```bash
cd /var/www/dentaljourneyindia-bot
cp .env.example .env
nano .env  # Fill in TELEGRAM_BOT_TOKEN, OLLAMA_URL, TWENTY_CRM_URL, TWENTY_API_KEY

npm install --production
pm2 start src/index.js --name dentaljourneyindia-bot
pm2 save
```

## 3. Twenty CRM

```bash
cd /opt/twenty
# Follow Twenty CRM Docker setup docs
docker compose up -d

# Verify
curl http://localhost:3000/healthz
```

## 4. Autonomous Agent

```bash
cd /var/www/dentaljourneyindia-agent
cp .env.example .env
nano .env
```

Required .env values:

```
# CRM
CRM_BASE_URL=http://192.168.1.217:3000
CRM_API_TOKEN=your_twenty_crm_api_token

# Brevo SMTP (outbound email)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_brevo_login_email
SMTP_PASS=your_brevo_smtp_key
SMTP_FROM=hello@dentaljourneyindia.org
SMTP_FROM_NAME=DentalJourneyIndia

# Telegram (admin notifications)
TELEGRAM_BOT_TOKEN=your_bot_token
ADMIN_TELEGRAM_ID=your_chat_id

# Settings
ADMIN_EMAIL=your_email@gmail.com
DRY_RUN=false
MAX_EMAILS_PER_HOUR=5
TZ=Asia/Kolkata
```

```bash
npm install

# Test connections
npm run test-email    # Verify Brevo SMTP
npm run test-crm      # Verify CRM access
npm run dry-run       # Preview what agent would do

# Go live
pm2 start src/index.js --name dentaljourneyindia-agent
pm2 save
```

## 5. Email Server (Stalwart — Inbound Only)

Stalwart handles incoming email to hello@dentaljourneyindia.org. Outbound goes through Brevo.

- Config: /opt/stalwart/etc/config.toml
- DKIM key: /opt/stalwart/etc/dkim/dentaljourneyindia.org.key
- Admin panel: http://192.168.1.207:8080
- Service: `systemctl status stalwart`

## 6. DNS Records

| Type | Name | Value |
|------|------|-------|
| A/ALIAS | @ | Your public IP or DDNS |
| CNAME | www | dentaljourneyindia.org |
| MX | @ | mail.dentaljourneyindia.org (priority 10) |
| TXT | @ | v=spf1 include:spf.brevo.com ~all |
| TXT | default._domainkey | v=DKIM1; k=rsa; p=... (Stalwart key) |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:hello@dentaljourneyindia.org |
| TXT | (Brevo DKIM) | As provided by Brevo domain verification |

## 7. Useful Commands

```bash
# Process management
pm2 status
pm2 logs dentaljourneyindia-bot --lines 30
pm2 logs dentaljourneyindia-agent --lines 30
pm2 restart dentaljourneyindia-bot
pm2 restart dentaljourneyindia-agent

# CRM
curl http://localhost:3000/healthz
docker compose -f /opt/twenty/docker-compose.yml ps

# Ollama
curl http://192.168.1.196:11434/api/tags

# Stalwart
systemctl status stalwart
journalctl -u stalwart --since "1 hour ago"
tail -50 /opt/stalwart/logs/stalwart.log.*

# Website
curl -s -o /dev/null -w "%{http_code}" https://dentaljourneyindia.org
curl -s -o /dev/null -w "%{http_code}" https://dentaljourneyindia.org/blog
```

## 8. Google Search Console

- Verified with HTML meta tag in index.html
- Sitemap: https://dentaljourneyindia.org/sitemap.xml
- Dashboard: https://search.google.com/search-console
