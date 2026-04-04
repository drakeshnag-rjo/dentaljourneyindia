# AI Assistant Prompt

Copy this into new Claude conversations for full project context:

---

I am building DentalJourneyIndia — a zero-human, AI-only dental tourism startup.

**Live now:**
- Website: https://dentaljourneyindia.org (HTML, contact form + AI chat widget)
- Telegram Bot: @DentalJourneyIndia_bot (Node.js + Telegraf, polling)
- CRM: Twenty CRM (Docker, 192.168.1.217:3000)
- AI: Ollama qwen3.5:9b (192.168.1.196:11434)
- Web API: Express port 3001 (proxied at /api/)

**How it works:**
- Contact form POSTs to /api/leads -> creates CRM Person + follow-up tasks
- Chat widget talks to Ollama via /api/chat/* -> extracts leads -> CRM
- Telegram bot creates CRM Person on /start -> AI conversations -> updates CRM
- Lead scoring: treatment(+25), country(+15), timeline(+25), email(+35). >=50 triggers follow-ups.

**Twenty CRM API quirks:**
- POST returns data.createPerson (not data directly)
- Notes: bodyV2.markdown (not body)
- Linking: targetPersonId (not personId)
- Filter unreliable: using in-memory cache
- Telegram ID in jobTitle as "tg:ID"

**Code:** /var/www/dentaljourneyindia-bot/src/ (index.js, ai.js, crm.js, data.js, web-api.js)
**Website:** /var/www/dentaljourneyindia/website/
**CRM Docker:** /opt/twenty/
**Domain DNS:** ALIAS @ -> fitlab.theworkpc.com (DDNS, behind NAT with reverse proxy)

See docs/PROJECT_CONTEXT.md, ROADMAP.md, SETUP_GUIDE.md for full details.

**What I need help with next:** [describe task here]
