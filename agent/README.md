# DentalJourneyIndia — Autonomous Email Agent

Cron-based Node.js agent that automates email follow-ups, clinic outreach, and daily reporting.

## What It Does

| Job | Schedule | Description |
|-----|----------|-------------|
| Lead Follow-ups | Every 2h (8am-8pm IST) | Sends Day 1/3/7 drip emails to CRM leads |
| Daily Digest | 8:00 AM IST | Sends lead stats + action items to admin |
| Clinic Outreach | 10:00 AM Mon-Fri | Auto-emails partnership pitches to clinics |

## Architecture

```
Agent (this service)
├── CRM (Twenty) ← Reads leads, writes notes
├── SMTP (Stalwart) ← Sends emails  
└── Cron scheduler ← Triggers jobs
```

Runs alongside the existing Telegram bot as a separate PM2 process.

## Quick Start

### 1. Copy to server

```bash
# From your local machine
scp -r dentaljourneyindia-agent/ root@YOUR_VPS:/var/www/

# Or clone from repo
cd /var/www
git clone https://github.com/drakeshnag-rjo/dentaljourneyindia.git
cd dentaljourneyindia/agent
```

### 2. Configure

```bash
cd /var/www/dentaljourneyindia-agent
cp .env.example .env
nano .env
# Fill in: CRM_API_TOKEN, SMTP_PASS, ADMIN_EMAIL
```

### 3. Install & Test

```bash
npm install

# Test SMTP connection
npm run test-email

# Test CRM connection  
npm run test-crm

# Dry run (logs what would happen, sends nothing)
npm run dry-run
```

### 4. Deploy with PM2

```bash
# Start agent
pm2 start src/index.js --name dentaljourneyindia-agent

# Save PM2 config
pm2 save

# View logs
pm2 logs dentaljourneyindia-agent

# Monitor
pm2 monit
```

## Email Deliverability Warm-Up Plan

Your Stalwart server is new and has no reputation. Follow this plan:

| Week | MAX_EMAILS_PER_HOUR | Notes |
|------|---------------------|-------|
| 1 | 3 | Test emails only — send to your own accounts |
| 2 | 5 | Start lead follow-ups, monitor spam placement |
| 3 | 8 | Add clinic outreach if deliverability is good |
| 4+ | 15 | Increase gradually as reputation builds |

**Tips:**
- Send to your own Gmail/Outlook first and mark as "Not Spam"
- Reply to your own emails from Gmail (builds conversation history)
- Keep bounce rate under 2%
- Monitor with [mail-tester.com](https://www.mail-tester.com)

## Clinic Outreach Setup

Clinic auto-outreach is disabled by default (no emails configured). To enable:

1. Edit `src/clinics.js`
2. Add real email addresses for each clinic
3. Set `MAX_EMAILS_PER_HOUR` appropriately
4. Restart agent: `pm2 restart dentaljourneyindia-agent`

## Files

```
src/
├── index.js              # Entry point + cron scheduler
├── email.js              # SMTP sender with rate limiting
├── crm.js                # Twenty CRM integration
├── clinics.js            # Clinic database + outreach tracking
├── test-email.js         # SMTP test script
├── test-crm.js           # CRM test script
├── jobs/
│   ├── lead-followup.js  # Drip sequence processor
│   ├── clinic-outreach.js # Clinic outreach processor
│   └── daily-digest.js   # Admin summary email
└── templates/
    ├── lead-followup.js  # Day 1/3/7 lead email templates
    └── clinic-outreach.js # Clinic partnership templates
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| CRM_BASE_URL | Yes | http://192.168.1.217:3000 | Twenty CRM URL |
| CRM_API_TOKEN | Yes | — | Twenty CRM API token |
| SMTP_HOST | Yes | 192.168.1.207 | Stalwart SMTP host |
| SMTP_PORT | Yes | 587 | SMTP port |
| SMTP_USER | Yes | hello | SMTP username |
| SMTP_PASS | Yes | — | SMTP password |
| SMTP_FROM | No | hello@dentaljourneyindia.org | From address |
| ADMIN_EMAIL | Yes | — | Your personal email for digests |
| DRY_RUN | No | false | Log emails without sending |
| MAX_EMAILS_PER_HOUR | No | 5 | Rate limit |
| TZ | No | Asia/Kolkata | Timezone |
