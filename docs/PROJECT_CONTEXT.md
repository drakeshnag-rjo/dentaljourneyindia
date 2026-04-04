# DentalJourneyIndia — Project Context for AI Assistant

## Overview
DentalJourneyIndia is a zero-human, AI-only dental tourism startup targeting international travelers seeking affordable, high-quality dental care in India.

## Tech Stack ($0 Running Cost)
| Component | Tech | Location | Port |
|-----------|------|----------|------|
| AI Engine | Ollama qwen3.5:9b | 192.168.1.196 | 11434 |
| CRM | Twenty CRM (Docker) | 192.168.1.217 | 3000 |
| Telegram Bot | Node.js + Telegraf | 192.168.1.217 | polling |
| Web Lead API | Express | 192.168.1.217 | 3001 |
| Website | Static HTML + Nginx | 192.168.1.217 | 80 |
| Database | SQLite (cache) | 192.168.1.217 | — |
| Process Mgr | PM2 | 192.168.1.217 | — |
| Reverse Proxy | Nginx (separate machine) | Behind NAT | 80/443 |

## Domain & DNS
- Domain: dentaljourneyindia.org
- DNS: ALIAS @ -> fitlab.theworkpc.com, CNAME www -> fitlab.theworkpc.com
- DDNS: fitlab.theworkpc.com (dynamic IP)
- SSL: Certbot on reverse proxy

## Telegram Bot: @DentalJourneyIndia_bot (polling mode)

## Directory Structure on VPS
cd ~/git-repo/dentaljourneyindia

# Create PROJECT_CONTEXT.md
cat > docs/PROJECT_CONTEXT.md << 'DOCEOF'
# DentalJourneyIndia — Project Context for AI Assistant

## Overview
DentalJourneyIndia is a zero-human, AI-only dental tourism startup targeting international travelers seeking affordable, high-quality dental care in India.

## Tech Stack ($0 Running Cost)
| Component | Tech | Location | Port |
|-----------|------|----------|------|
| AI Engine | Ollama qwen3.5:9b | 192.168.1.196 | 11434 |
| CRM | Twenty CRM (Docker) | 192.168.1.217 | 3000 |
| Telegram Bot | Node.js + Telegraf | 192.168.1.217 | polling |
| Web Lead API | Express | 192.168.1.217 | 3001 |
| Website | Static HTML + Nginx | 192.168.1.217 | 80 |
| Database | SQLite (cache) | 192.168.1.217 | — |
| Process Mgr | PM2 | 192.168.1.217 | — |
| Reverse Proxy | Nginx (separate machine) | Behind NAT | 80/443 |

## Domain & DNS
- Domain: dentaljourneyindia.org
- DNS: ALIAS @ -> fitlab.theworkpc.com, CNAME www -> fitlab.theworkpc.com
- DDNS: fitlab.theworkpc.com (dynamic IP)
- SSL: Certbot on reverse proxy

## Telegram Bot: @DentalJourneyIndia_bot (polling mode)

## Directory Structure on VPS
/var/www/dentaljourneyindia-bot/     <- Bot + Web API
src/index.js, ai.js, crm.js, data.js, web-api.js
public/chat-widget.js
data/bot.db
.env
/var/www/dentaljourneyindia/website/ <- Website
index.html, chat-widget.js
/opt/twenty/                         <- CRM Docker
docker-compose.yml, .env, backup.sh
## Lead Capture Flow
- Website Form -> POST /api/leads -> CRM Person + follow-up Tasks
- Website Chat -> /api/chat/* -> Ollama AI -> extract lead data -> CRM
- Telegram /start -> CRM Person -> AI conversation -> extract + update CRM

## Lead Scoring
- Treatment mentioned: +25
- Country identified: +15
- Timeline shared: +25
- Email provided: +35
- Score >= 50 triggers follow-up tasks (Day 1, 3, 7)

## Twenty CRM API Quirks (IMPORTANT)
1. POST responses: data nested as data.createPerson, data.createNote etc.
2. Note body: use bodyV2.markdown (NOT body)
3. Linking notes/tasks: use targetPersonId (NOT personId)
4. Filter API unreliable: using in-memory cache for person lookup
5. Telegram ID stored in jobTitle as "tg:TELEGRAM_ID" (phone field validates strictly)
6. Soft deletes only via API

## Clinic Data (hardcoded in data.js)
Cities: Hyderabad, Vijayawada, Guntur
5 clinics, 8 treatment types with India vs international pricing

## Environment Variables (.env)
TELEGRAM_BOT_TOKEN=<secret>
OLLAMA_URL=http://192.168.1.196:11434
OLLAMA_MODEL=qwen3.5:9b
TWENTY_CRM_URL=http://localhost:3000
TWENTY_API_KEY=<secret>
WEB_API_PORT=3001
NODE_ENV=production
## Useful Commands
```bash
pm2 status / logs / restart dentaljourneyindia-bot
cd /opt/twenty && docker compose ps
curl http://localhost:3001/api/health
curl http://localhost:3000/healthz
curl http://192.168.1.196:11434/api/tags
```
