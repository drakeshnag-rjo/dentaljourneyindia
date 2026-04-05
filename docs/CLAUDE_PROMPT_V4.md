# DentalJourneyIndia — AI Assistant Prompt (V4)

Copy this into new Claude conversations for full project context.

---

I am building DentalJourneyIndia — a zero-human, AI-only dental tourism startup. Here is the current state:

**What's live:**
- Website: https://dentaljourneyindia.org (15 pages — homepage, 9 SEO blog pages, 4 compliance pages, cookie consent)
- Google Analytics 4: G-HT3RVLE6YS (all 15 pages, GDPR consent-integrated)
- Animated logo: SVG globe with rotating continents, tooth, orbiting airplane, India pin (img/logo.svg + favicon.svg)
- Telegram Bot: @DentalJourneyIndia_bot (Node.js + Telegraf, polling mode)
- CRM: Twenty CRM (Docker, 192.168.1.217:3000, REST API at /rest/)
- AI: Ollama qwen3.5:9b for Telegram, qwen3:1.7b for web chat (192.168.1.196:11434)
- Web Lead API: Express port 3001 (proxied via Nginx at /api/)
- Autonomous Agent: Node.js + cron (PM2, lead follow-ups, clinic outreach, Telegram digest)
- Outbound Email: Brevo SMTP relay (smtp-relay.brevo.com:587, lands in Gmail inbox)
- Inbound Email: Stalwart mail server (192.168.1.207, hello@dentaljourneyindia.org)
- DNS: MX, SPF, DKIM (Stalwart + Brevo), DMARC all configured
- Google Search Console: verified, sitemap submitted
- SEO: optimized title/meta/OG tags, Schema.org structured data (Organization, WebSite, MedicalBusiness)

**Website pages (15 total):**
- index.html — Homepage with animated logo, contact form, AI chat widget, SEO meta tags, Schema.org
- blog.html — Blog index listing all 9 articles
- dental-implants-india-cost.html — "Dental Implants in India: Cost Guide" (top keyword)
- dental-tourism-india-guide.html — "Complete Guide for International Patients"
- dental-implants-hyderabad.html — "Best Clinics in Hyderabad for Foreigners"
- veneers-india-cost.html — "Porcelain Veneers: Save 85%"
- all-on-4-india.html — "All-on-4 Dental Implants Guide & Pricing"
- dental-tourism-india-vs-thailand.html — "India vs Thailand vs Turkey Comparison"
- full-mouth-rehab-india.html — "Full Mouth Rehabilitation Costs & Clinics"
- is-dental-tourism-india-safe.html — "Safety Guide for Foreign Patients"
- smile-makeover-india.html — "Smile Makeover: Veneers, Crowns & Design"
- privacy-policy.html — GDPR, CCPA, UK GDPR, AU Privacy Act, PIPEDA
- cookie-policy.html — Cookie details + manage preferences button
- terms.html — Terms of service
- medical-disclaimer.html — Medical/dental disclaimer
- js/consent.js — Cookie consent banner (GDPR opt-in, granular controls, GA4 integration)
- img/logo.svg — Animated globe-tooth-airplane logo
- img/favicon.svg — Animated compact favicon
- sitemap.xml + robots.txt

**Google Analytics 4 setup:**
- Measurement ID: G-HT3RVLE6YS
- Added to all 15 HTML pages
- Uses Google Consent Mode v2 (loads denied by default)
- Integrates with cookie consent banner (consent.js fires cookieConsent event)
- Only tracks after user accepts analytics cookies (GDPR compliant)
- anonymize_ip enabled

**How lead capture works:**
- Website contact form POSTs to /api/leads → creates CRM Person + follow-up tasks
- Website chat widget talks to Ollama via /api/chat/* → extracts leads → CRM
- Telegram bot creates CRM Person on /start → AI conversations → updates CRM
- Lead scoring: treatment(+25), country(+15), timeline(+25), email(+35). Score ≥ 50 triggers follow-ups
- Agent sends Day 1/3/7 email drip sequence to leads with email addresses

**Full pipeline (verified working):**
1. Visitor fills website form → POST /api/leads
2. Bot creates CRM Person + Note + Day 1/3/7 Tasks
3. Agent checks CRM every 2h → finds leads with email
4. Agent sends follow-up email via Brevo → lands in Gmail inbox
5. Agent creates CRM Note linked to person (two-step: create note + link via noteTargets)
6. Note contains marker [agent:followup:dayN] to prevent duplicate sends

**Autonomous Agent (PM2 process):**
- Lead follow-ups: every 2h (8am-8pm IST) — Day 1/3/7 drip emails via Brevo
- Daily digest: 8am IST — summary sent to admin via Telegram (chat ID: 6643647509)
- Clinic outreach: 10am IST weekdays — partnership emails to clinics (once emails added)
- Rate limiting + warm-up tracking + persistent state (data/state.json)
- CRM note dedup prevents duplicate follow-ups
- Telegram notifications module (src/telegram.js)

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
- Agent jobs: src/jobs/ (lead-followup.js, clinic-outreach.js, daily-digest.js)
- Agent templates: src/templates/ (lead-followup.js, clinic-outreach.js)
- CRM: /opt/twenty/
- Stalwart: /opt/stalwart/etc/config.toml
- Nginx: /etc/nginx/sites-available/dentaljourneyindia

**Nginx config key rule:**
```
location / { try_files $uri $uri.html $uri/ /index.html; }
```

**Twenty CRM API (current — uses /rest/ endpoints):**
- GET /rest/people — list all people
- POST /rest/people — create person
- PATCH /rest/people/:id — update person
- DELETE /rest/people/:id — delete person
- POST /rest/notes — create note (body: { bodyV2: { markdown: "..." } })
- POST /rest/noteTargets — link note to person (body: { noteId, targetPerson: { connect: { id: personId } } })
- POST /rest/tasks — create task
- POST /rest/taskTargets — link task to person
- Telegram ID stored in jobTitle as "tg:TELEGRAM_ID"
- Web leads stored with jobTitle as "web:TIMESTAMP"

**Email setup:**
- Outbound: Brevo SMTP relay. Residential IP (108.39.142.93) blocked by Gmail for direct sending.
- Inbound: Stalwart on 192.168.1.207. Receives replies to hello@dentaljourneyindia.org.
- Agent .env: SMTP_HOST=smtp-relay.brevo.com, SMTP_PORT=587, SMTP_USER=brevo login email, SMTP_PASS=brevo SMTP key

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
- [x] SEO meta tags, OG tags, Schema.org structured data
- [x] Animated globe-tooth-airplane logo + favicon
- [x] Clinic partnership outreach kit (18 clinics)
- [x] GitHub repo updated with all docs
- [x] Google Analytics 4 (GDPR consent-integrated, all 15 pages)
- [x] CRM agent fixed (REST API endpoints, note linking)
- [x] Website form fixed (API_URL corrected)
- [x] Full pipeline verified (form → CRM → agent → email → CRM note)
- [x] CRM cleaned (test/demo entries removed)

**What I need help with next:**
1. Add real clinic email addresses and activate outreach
2. More SEO content / blog posts
3. Google Ads for high-intent keywords
4. WhatsApp Business integration
5. Expand to more Asian countries (future vision)

**GitHub:** https://github.com/drakeshnag-rjo/dentaljourneyindia
**Docs:** docs/PROJECT_CONTEXT.md, ROADMAP.md, SETUP_GUIDE.md
