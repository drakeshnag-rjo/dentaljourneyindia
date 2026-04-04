# DentalJourneyIndia — Project Context

> Last updated: April 4, 2026

## Overview

DentalJourneyIndia is a zero-human, AI-only dental tourism startup that connects international patients (US, UK, Canada, Australia) with verified dental clinics in India. The platform handles lead capture, AI-powered patient communication, automated email follow-ups, clinic outreach, and trip coordination — all without human intervention.

## Live Services

| Service | URL / Access | Stack |
|---------|-------------|-------|
| Website | https://dentaljourneyindia.org | Static HTML, Nginx |
| Telegram Bot | @DentalJourneyIndia_bot | Node.js + Telegraf, Ollama AI |
| CRM | http://192.168.1.217:3000 | Twenty CRM (Docker) |
| Email Agent | PM2 process on VPS | Node.js + cron + Brevo SMTP |
| Email Server | 192.168.1.207 (inbound only) | Stalwart Mail Server |
| AI | 192.168.1.196:11434 | Ollama (qwen3.5:9b + qwen3:1.7b) |

## Infrastructure

| Component | IP | Port | Notes |
|-----------|-----|------|-------|
| VPS (bot + website + agent) | 192.168.1.217 | 80, 3000, 3001 | Ubuntu, PM2, Docker |
| Ollama AI | 192.168.1.196 | 11434 | qwen3.5:9b (Telegram), qwen3:1.7b (web chat) |
| Email (Stalwart) | 192.168.1.207 | 25, 587, 993, 8080 | Inbound email only |
| Outbound Email | smtp-relay.brevo.com | 587 | Brevo SMTP relay (300/day free) |
| Reverse Proxy | separate machine | 80, 443 | Nginx, SSL via Certbot |
| Domain | dentaljourneyindia.org | | ALIAS/CNAME → fitlab.theworkpc.com (DDNS) |

## Code Locations (VPS)

| Component | Path |
|-----------|------|
| Bot source | /var/www/dentaljourneyindia-bot/src/ |
| Website | /var/www/dentaljourneyindia/website/ |
| Agent | /var/www/dentaljourneyindia-agent/src/ |
| CRM Docker | /opt/twenty/ |
| Stalwart config | /opt/stalwart/etc/config.toml |
| DKIM key | /opt/stalwart/etc/dkim/dentaljourneyindia.org.key |

## GitHub Repository

https://github.com/drakeshnag-rjo/dentaljourneyindia

```
dentaljourneyindia/
├── website/                    # Static website (15 pages)
│   ├── index.html              # Homepage
│   ├── blog.html               # Blog index
│   ├── dental-implants-india-cost.html
│   ├── dental-tourism-india-guide.html
│   ├── dental-implants-hyderabad.html
│   ├── veneers-india-cost.html
│   ├── all-on-4-india.html
│   ├── dental-tourism-india-vs-thailand.html
│   ├── full-mouth-rehab-india.html
│   ├── is-dental-tourism-india-safe.html
│   ├── smile-makeover-india.html
│   ├── privacy-policy.html
│   ├── cookie-policy.html
│   ├── terms.html
│   ├── medical-disclaimer.html
│   ├── sitemap.xml
│   ├── robots.txt
│   └── js/consent.js           # Cookie consent banner
├── agent/                      # Autonomous email agent
│   ├── src/
│   │   ├── index.js            # Entry point + cron scheduler
│   │   ├── email.js            # Brevo SMTP with rate limiting
│   │   ├── crm.js              # Twenty CRM integration
│   │   ├── telegram.js         # Telegram notifications to admin
│   │   ├── clinics.js          # 18 clinic database + outreach tracking
│   │   ├── state.js            # JSON file persistence
│   │   ├── test-email.js       # SMTP test script
│   │   ├── test-crm.js         # CRM test script
│   │   ├── jobs/
│   │   │   ├── lead-followup.js    # Day 1/3/7 drip emails
│   │   │   ├── clinic-outreach.js  # Partnership outreach
│   │   │   └── daily-digest.js     # Telegram summary to admin
│   │   └── templates/
│   │       ├── lead-followup.js    # Lead email templates
│   │       └── clinic-outreach.js  # Clinic email templates
│   ├── package.json
│   └── .env.example
├── docs/
│   ├── PROJECT_CONTEXT.md      # This file
│   ├── ROADMAP.md
│   ├── SETUP_GUIDE.md
│   └── CLAUDE_PROMPT_V3.md
└── outreach/
    └── OUTREACH_KIT.md         # 18 clinic contacts + templates
```

## How Lead Capture Works

1. **Website contact form** → POST /api/leads → creates CRM Person + follow-up tasks
2. **Website chat widget** → Ollama AI via /api/chat/* → extracts leads → CRM
3. **Telegram bot** → creates CRM Person on /start → AI conversations → updates CRM
4. **Lead scoring**: treatment(+25), country(+15), timeline(+25), email(+35). Score ≥ 50 triggers follow-ups.

## Autonomous Agent

The agent runs alongside the bot as a separate PM2 process. It handles:

| Job | Schedule | Channel |
|-----|----------|---------|
| Lead follow-ups (Day 1/3/7) | Every 2h, 8am–8pm IST | Email (Brevo) |
| Daily digest | 8:00 AM IST | Telegram |
| Clinic outreach | 10:00 AM IST, Mon–Fri | Email (Brevo) |

Features: rate limiting, warm-up tracking, persistent state (data/state.json), CRM note dedup, dry-run mode.

## Email Setup

- **Outbound**: Brevo SMTP relay (smtp-relay.brevo.com:587). Lands in Gmail inbox.
- **Inbound**: Stalwart mail server (192.168.1.207). Receives replies to hello@dentaljourneyindia.org.
- **Why Brevo?**: VPS has residential IP (108.39.142.93) which Gmail blocks for direct sending. Brevo has established sender reputation.
- **DNS**: MX, SPF, DKIM (Stalwart + Brevo), DMARC all configured.

## Twenty CRM API Quirks

- POST returns `data.createPerson`, `data.createNote` (not data directly)
- Notes: use `bodyV2.markdown` (not body)
- Linking notes/tasks: use `targetPersonId` (not personId)
- Filter API unreliable: using in-memory cache for person lookup
- Telegram ID stored in `jobTitle` as "tg:TELEGRAM_ID"

## Website (15 pages)

- Homepage with contact form + AI chat widget
- 9 SEO blog pages targeting high-intent dental tourism keywords
- 4 compliance pages (privacy, cookies, terms, medical disclaimer)
- Cookie consent banner (GDPR/CCPA compliant)
- Google Search Console verified, sitemap submitted
- Clean URLs via Nginx try_files

## Clinic Data

- 5 clinics hardcoded in bot's data.js (Hyderabad, Vijayawada, Guntur)
- 18 real clinics in agent's clinics.js and outreach/OUTREACH_KIT.md
- Clinic outreach is disabled until real email addresses are added

## Process Management

```bash
pm2 status                              # Check all processes
pm2 logs dentaljourneyindia-bot         # Bot logs
pm2 logs dentaljourneyindia-agent       # Agent logs
pm2 restart dentaljourneyindia-agent    # Restart agent
```

## Key Credentials (.env locations)

- Bot: /var/www/dentaljourneyindia-bot/.env
- Agent: /var/www/dentaljourneyindia-agent/.env
- Never commit .env files to git
