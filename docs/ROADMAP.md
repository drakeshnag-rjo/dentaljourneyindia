# DentalJourneyIndia — Roadmap

## Completed (MVP)
- [x] Twenty CRM deployed (Docker, self-hosted)
- [x] Telegram bot with AI conversations (Ollama)
- [x] Bot <-> CRM integration (auto-creates leads, notes, tasks)
- [x] Website built and deployed (dentaljourneyindia.org)
- [x] Website contact form -> CRM lead capture
- [x] Website AI chat widget
- [x] Nginx reverse proxy + SSL
- [x] DNS (DDNS + ALIAS/CNAME)
- [x] PM2 process management
- [x] CRM backup script

## Immediate Next Steps
1. Fix chat widget timeout (add 120s Nginx proxy timeout)
2. Clinic partnership outreach (email templates, pitch deck)
3. SEO content strategy (10 blog posts for high-intent keywords)
4. Email integration in Twenty CRM

## Medium-Term
5. CRM pipeline customization (stages: New -> Qualified -> Booked -> Completed)
6. Website enhancements (treatment pages, testimonials, FAQ, analytics)
7. WhatsApp Business integration
8. Multi-language support
9. Tourism booking API integrations

## Long-Term
10. Formalize clinic commission structure (10-15%)
11. Payment processing (Stripe/Razorpay)
12. Expansion to more cities (Mumbai, Delhi, Bangalore)
13. Legal: terms of service, privacy policy, disclaimers

## Architecture Decisions
| Date | Decision | Reason |
|------|----------|--------|
| 2026-04-04 | Ollama over Anthropic API | Zero cost for MVP |
| 2026-04-04 | Twenty CRM over SaaS | Self-hosted, free, has API |
| 2026-04-04 | In-memory cache for lookup | Twenty filter API unreliable |
| 2026-04-04 | jobTitle for Telegram ID | Phone field validates strictly |
| 2026-04-04 | bodyV2.markdown for notes | Twenty uses bodyV2 not body |
| 2026-04-04 | targetPersonId for linking | Not personId |
| 2026-04-04 | Polling mode for Telegram | Works behind NAT |
| 2026-04-04 | DDNS + CNAME | Dynamic IP environment |
