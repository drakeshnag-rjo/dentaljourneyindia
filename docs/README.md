# 🦷 DentalJourneyIndia

**AI-powered dental tourism platform connecting international patients with verified clinics in India.**

Save 70-90% on dental implants, veneers, crowns, and full mouth rehabilitation — with an AI concierge that handles everything from quotes to travel coordination.

🌐 [dentaljourneyindia.org](https://dentaljourneyindia.org) · 💬 [Telegram Bot](https://t.me/DentalJourneyIndia_bot)

---

## What Is This?

DentalJourneyIndia is a zero-human, fully automated dental tourism startup. Every component — from patient communication to lead follow-ups to clinic outreach — runs on AI and automation.

**For patients:** Get instant quotes, clinic comparisons, and travel planning via our website or Telegram bot.

**For clinics:** Receive pre-qualified international patient referrals at zero upfront cost.

## Architecture

```
Patient → Website / Telegram Bot
              ↓
         Ollama AI (qwen3.5:9b)
              ↓
         Twenty CRM (lead capture)
              ↓
         Autonomous Agent (cron)
           ├── Email follow-ups (Brevo SMTP)
           ├── Clinic outreach emails
           └── Daily digest (Telegram)
```

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| AI | Ollama (qwen3.5:9b, qwen3:1.7b) | $0 (self-hosted) |
| Bot | Node.js + Telegraf | $0 |
| CRM | Twenty CRM (Docker) | $0 (self-hosted) |
| Website | Static HTML + CSS + JS | $0 |
| Agent | Node.js + node-cron | $0 |
| Email out | Brevo SMTP relay | $0 (300/day free) |
| Email in | Stalwart Mail Server | $0 (self-hosted) |
| Proxy | Nginx + Let's Encrypt | $0 |
| **Total** | | **~$1/month** (domain only) |

## Website

15 pages live at [dentaljourneyindia.org](https://dentaljourneyindia.org):

- Homepage with contact form + AI chat widget
- 9 SEO blog articles targeting dental tourism keywords
- 4 compliance pages (Privacy, Cookies, Terms, Medical Disclaimer)
- Cookie consent banner (GDPR/CCPA compliant)

## Autonomous Agent

A cron-based Node.js service that runs 24/7:

| Job | Schedule | Channel |
|-----|----------|---------|
| Lead follow-ups (Day 1/3/7) | Every 2h, 8am-8pm IST | Email (Brevo) |
| Daily digest | 8:00 AM IST | Telegram |
| Clinic outreach | 10:00 AM IST, Mon-Fri | Email (Brevo) |

## Quick Start

See [docs/SETUP_GUIDE.md](docs/SETUP_GUIDE.md) for full deployment instructions.

```bash
# Clone
git clone https://github.com/drakeshnag-rjo/dentaljourneyindia.git
cd dentaljourneyindia

# Bot
cd /var/www/dentaljourneyindia-bot
cp .env.example .env && nano .env
npm install && pm2 start src/index.js --name dentaljourneyindia-bot

# Agent
cd /var/www/dentaljourneyindia-agent
cp .env.example .env && nano .env
npm install && pm2 start src/index.js --name dentaljourneyindia-agent
```

## Documentation

- [PROJECT_CONTEXT.md](docs/PROJECT_CONTEXT.md) — Full technical context
- [ROADMAP.md](docs/ROADMAP.md) — What's done, what's next
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) — Deployment instructions
- [CLAUDE_PROMPT_V3.md](docs/CLAUDE_PROMPT_V3.md) — AI assistant context prompt

## Cities

Currently covering clinics in:
- 🏙️ Hyderabad (primary — 8 clinics)
- 🌊 Vijayawada (5 clinics)
- 🏛️ Guntur (5 clinics)

## License

All rights reserved. © 2026 DentalJourneyIndia.
