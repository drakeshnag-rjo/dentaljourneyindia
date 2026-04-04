# DentalJourneyIndia — AI Assistant Prompt (Updated)

Copy this into new Claude conversations for full project context.

---

I am building DentalJourneyIndia — a zero-human, AI-only dental tourism startup. Here is the current state:

**What's live:**
- Website: https://dentaljourneyindia.org (HTML, contact form + AI chat widget)
- Telegram Bot: @DentalJourneyIndia_bot (Node.js + Telegraf, polling mode)
- CRM: Twenty CRM (Docker, 192.168.1.217:3000)
- AI: Ollama qwen3.5:9b for Telegram, qwen3:1.7b for web chat (192.168.1.196:11434)
- Web Lead API: Express port 3001 (proxied via Nginx at /api/)
- Email: Stalwart mail server (192.168.1.207, admin panel on port 8080)
- Email account: hello@dentaljourneyindia.org (SMTP port 587, STARTTLS + AUTH LOGIN)
- DNS: MX, SPF, DKIM, DMARC all configured and verified
- Email sending works (tested to Gmail, lands in spam — new server reputation)

**How lead capture works:**
- Website contact form POSTs to /api/leads -> creates CRM Person + follow-up tasks
- Website chat widget talks to Ollama via /api/chat/* -> extracts leads -> CRM
- Telegram bot creates CRM Person on /start -> AI conversations -> updates CRM
- Lead scoring: treatment(+25), country(+15), timeline(+25), email(+35). Score >= 50 triggers follow-ups.

**Infrastructure:**
| Component | IP | Port | Notes |
|-----------|-----|------|-------|
| VPS (bot + website + CRM) | 192.168.1.217 | 80, 3000, 3001 | Ubuntu, PM2, Docker |
| Ollama AI | 192.168.1.196 | 11434 | qwen3.5:9b + qwen3:1.7b |
| Email (Stalwart) | 192.168.1.207 | 25, 587, 993, 8080 | Stalwart mail server |
| Reverse Proxy | separate machine | 80, 443 | Nginx, SSL via Certbot |
| Domain | dentaljourneyindia.org | | ALIAS/CNAME -> fitlab.theworkpc.com (DDNS) |

**Bot code:** /var/www/dentaljourneyindia-bot/src/ (index.js, ai.js, crm.js, data.js, web-api.js)
**Website:** /var/www/dentaljourneyindia/website/index.html
**CRM Docker:** /opt/twenty/
**Email config:** /opt/stalwart/etc/config.toml
**DKIM key:** /opt/stalwart/etc/dkim/dentaljourneyindia.org.key
**Process manager:** PM2 (dentaljourneyindia-bot)

**Twenty CRM API quirks (important):**
- POST returns data.createPerson, data.createNote (not data directly)
- Notes: use bodyV2.markdown (not body)
- Linking notes/tasks: use targetPersonId (not personId)
- Filter API unreliable: using in-memory cache for person lookup
- Telegram ID stored in jobTitle as "tg:TELEGRAM_ID"

**Email server details:**
- Stalwart mail server on 192.168.1.207
- SMTP sending: port 587, STARTTLS, AUTH LOGIN, username "hello"
- Account: hello@dentaljourneyindia.org (credentials in .env)
- DKIM signing configured with RSA-2048 key, selector "default"
- DNS records: MX, SPF, DKIM (default._domainkey), DMARC all set
- Currently lands in spam — needs reputation building
- Config format: flat key-value (not TOML sections) in /opt/stalwart/etc/config.toml
- Stalwart admin: http://192.168.1.207:8080 (credentials stored securely)

**Clinic data:** Hardcoded in data.js — 5 clinics across Hyderabad, Vijayawada, Guntur with 8 treatment types. Real clinic list (18 clinics) in outreach/OUTREACH_KIT.md.

**Outreach kit ready:** Partnership pitch deck PDF + email/WhatsApp templates + 18 real clinic contacts with phone numbers.

**What's been completed:**
- [x] Twenty CRM deployed and integrated
- [x] Telegram bot with AI (Ollama)
- [x] Website with contact form + AI chat widget
- [x] Dual-channel lead capture -> CRM
- [x] Domain, DNS, SSL, reverse proxy
- [x] Stalwart email server deployed
- [x] DKIM, SPF, DMARC configured
- [x] Email sending verified
- [x] Clinic partnership outreach kit created
- [x] Project documentation (PROJECT_CONTEXT.md, ROADMAP.md, SETUP_GUIDE.md)

**What I need help with next:** Build the autonomous agent (Phase 2):
1. Cron-based Node.js agent running alongside the bot
2. Auto-send email follow-ups to leads from CRM (Day 1, 3, 7 drip sequence)
3. Daily digest email to me summarizing new leads and recommended actions
4. Auto-send clinic outreach emails to clinics not yet contacted
5. Integration: Twenty CRM API + Stalwart SMTP (port 587, STARTTLS)
6. Improve email deliverability (warm up sender reputation)

**GitHub repo:** https://github.com/drakeshnag-rjo/dentaljourneyindia

See docs/PROJECT_CONTEXT.md, ROADMAP.md, SETUP_GUIDE.md for full details.
