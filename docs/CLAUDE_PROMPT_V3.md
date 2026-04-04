# DentalJourneyIndia — AI Assistant Prompt (V3)

Copy this into new Claude conversations for full project context.

---

I am building DentalJourneyIndia — a zero-human, AI-only dental tourism startup. Here is the current state:

**What's live:**
- Website: https://dentaljourneyindia.org (15 pages — homepage, 9 SEO blog pages, 4 compliance pages, cookie consent)
- Telegram Bot: @DentalJourneyIndia_bot (Node.js + Telegraf, polling mode)
- CRM: Twenty CRM (Docker, 192.168.1.217:3000)
- AI: Ollama qwen3.5:9b for Telegram, qwen3:1.7b for web chat (192.168.1.196:11434)
- Web Lead API: Express port 3001 (proxied via Nginx at /api/)
- Autonomous Agent: Node.js + cron (PM2, lead follow-ups, clinic outreach, Telegram digest)
- Outbound Email: Brevo SMTP relay (smtp-relay.brevo.com:587, lands in Gmail inbox)
- Inbound Email: Stalwart mail server (192.168.1.207, hello@dentaljourneyindia.org)
- DNS: MX, SPF, DKIM (Stalwart + Brevo), DMARC all configured
- Google Search Console: verified, sitemap submitted

**How lead capture works:**
- Website contact form POSTs to /api/leads → creates CRM Person + follow-up tasks
- Website chat widget talks to Ollama via /api/chat/* → extracts leads → CRM
- Telegram bot creates CRM Person on /start → AI conversations → updates CRM
- Lead scoring: treatment(+25), country(+15), timeline(+25), email(+35). Score ≥ 50 triggers follow-ups.
- Agent sends Day 1/3/7 email drip sequence to leads with email addresses

**Autonomous Agent (PM2 process):**
- Lead follow-ups: every 2h (8am-8pm IST) — Day 1/3/7 drip emails via Brevo
- Daily digest: 8am IST — summary sent to admin via Telegram
- Clinic outreach: 10am IST weekdays — partnership emails to clinics (once emails added)
- Rate limiting + warm-up tracking + persistent state (data/state.json)
- CRM note dedup prevents duplicate follow-ups

**Website (15 pages):**
- Homepage with contact form + AI chat widget
- Blog index + 9 SEO articles (implants cost, tourism guide, Hyderabad, veneers, All-on-4, India vs Thailand vs Turkey, full mouth rehab, safety guide, smile makeover)
- Privacy Policy (GDPR/CCPA/UK/AU/CA), Cookie Policy, Terms of Service, Medical Disclaimer
- Cookie consent banner (js/consent.js) — GDPR opt-in, granular controls
- sitemap.xml + robots.txt, Google Search Console verified

**Infrastructure:**
| Component | IP | Port | Notes |
|-----------|-----|------|-------|
| VPS (bot + website + agent) | 192.168.1.217 | 80, 3000, 3001 | Ubuntu, PM2, Docker |
| Ollama AI | 192.168.1.196 | 11434 | qwen3.5:9b + qwen3:1.7b |
| Email inbound (Stalwart) | 192.168.1.207 | 25, 587, 993, 8080 | Stalwart mail server |
| Email outbound | smtp-relay.brevo.com | 587 | Brevo (300/day free) |
| Reverse Proxy | separate machine | 80, 443 | Nginx, SSL via Certbot |
| Domain | dentaljourneyindia.org | | ALIAS/CNAME → fitlab.theworkpc.com (DDNS) |

**Code locations (VPS):**
- Bot: /var/www/dentaljourneyindia-bot/src/ (index.js, ai.js, crm.js, data.js, web-api.js)
- Website: /var/www/dentaljourneyindia/website/
- Agent: /var/www/dentaljourneyindia-agent/src/ (index.js, email.js, crm.js, telegram.js, clinics.js, state.js)
- CRM: /opt/twenty/
- Stalwart: /opt/stalwart/etc/config.toml

**Twenty CRM API quirks:**
- POST returns data.createPerson, data.createNote (not data directly)
- Notes: use bodyV2.markdown (not body)
- Linking: use targetPersonId (not personId)
- Filter API unreliable: using in-memory cache
- Telegram ID stored in jobTitle as "tg:TELEGRAM_ID"

**Known issues:**
- CRM agent shows 0 people — API token may need updating
- Clinic outreach disabled — no real clinic emails configured yet
- Stalwart can't send outbound to Gmail (residential IP blocked) — using Brevo instead
- Chat widget can timeout if Ollama is slow — Nginx proxy_read_timeout set to 120s

**What's been completed:**
- [x] Twenty CRM deployed and integrated
- [x] Telegram bot with AI (Ollama)
- [x] Website with contact form + AI chat widget
- [x] Dual-channel lead capture → CRM
- [x] Domain, DNS, SSL, reverse proxy
- [x] Stalwart email server (inbound)
- [x] Brevo SMTP relay (outbound, inbox delivery)
- [x] DKIM, SPF, DMARC configured
- [x] Autonomous agent (lead follow-ups, clinic outreach, Telegram digest)
- [x] 9 SEO blog pages targeting dental tourism keywords
- [x] Full compliance (GDPR, CCPA, cookie consent, medical disclaimer)
- [x] Google Search Console + sitemap
- [x] Clinic partnership outreach kit (18 clinics)
- [x] GitHub repo updated

**What I need help with next:**
1. Debug CRM (agent shows 0 people)
2. Add real clinic email addresses and activate outreach
3. Website analytics (Plausible or Google Analytics)
4. More SEO content / blog posts
5. Google Ads for high-intent keywords
6. WhatsApp Business integration

**GitHub:** https://github.com/drakeshnag-rjo/dentaljourneyindia
**Docs:** docs/PROJECT_CONTEXT.md, ROADMAP.md, SETUP_GUIDE.md
