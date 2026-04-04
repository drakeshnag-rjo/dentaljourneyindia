# DentalJourneyIndia — Roadmap

> Last updated: April 4, 2026

## Completed

### Phase 1 — MVP (Done)
- [x] Twenty CRM deployed (Docker, self-hosted)
- [x] Telegram bot with AI conversations (Ollama qwen3.5:9b)
- [x] Bot ↔ CRM integration (auto-creates leads, notes, tasks)
- [x] Website built and deployed (dentaljourneyindia.org)
- [x] Website contact form → CRM lead capture
- [x] Website AI chat widget (Ollama qwen3:1.7b)
- [x] Nginx reverse proxy + SSL (Certbot)
- [x] DNS (DDNS + ALIAS/CNAME)
- [x] PM2 process management
- [x] CRM backup script

### Phase 2 — Autonomous Agent (Done)
- [x] Cron-based Node.js agent (separate PM2 process)
- [x] Email follow-ups: Day 1/3/7 drip sequence to leads
- [x] Daily digest via Telegram to admin
- [x] Clinic outreach email automation (Day 1/3/7 sequence)
- [x] Brevo SMTP relay for inbox delivery
- [x] Rate limiting + warm-up tracking
- [x] Persistent state (survives restarts)
- [x] CRM note dedup (prevents duplicate follow-ups)
- [x] Dry-run mode for testing

### Phase 2.5 — SEO & Compliance (Done)
- [x] 9 SEO blog pages targeting dental tourism keywords
- [x] Blog index page
- [x] Privacy Policy (GDPR, CCPA, UK GDPR, AU, CA)
- [x] Cookie Policy with manage preferences
- [x] Terms of Service
- [x] Medical Disclaimer
- [x] Cookie consent banner (granular, blocks before consent)
- [x] Google Search Console verified + sitemap submitted
- [x] robots.txt
- [x] Clean URLs via Nginx
- [x] Homepage footer with legal links

### Infrastructure (Done)
- [x] Stalwart mail server (inbound email)
- [x] DKIM, SPF, DMARC configured
- [x] Brevo SMTP relay (outbound email)
- [x] Domain verification with Brevo
- [x] Clinic partnership outreach kit (18 clinics)

---

## In Progress / Next Steps

### Immediate
- [ ] Debug CRM (agent shows 0 people — check API token)
- [ ] Add real clinic email addresses to agent/src/clinics.js
- [ ] Complete Brevo domain DNS verification
- [ ] Set up website analytics (Plausible or Google Analytics)
- [ ] Monitor Google Search Console indexing (check in 3-5 days)

### Short-Term (Next 2-4 weeks)
- [ ] Start clinic outreach (once emails added)
- [ ] Build sender reputation (warm-up schedule in agent README)
- [ ] Add Google Analytics / Plausible tracking
- [ ] Create treatment-specific landing pages (individual clinic profiles)
- [ ] Add before/after gallery section (once partner clinics provide photos)
- [ ] Set up Google Ads for high-intent keywords (optional, paid)

### Medium-Term (1-3 months)
- [ ] CRM pipeline customization (New → Qualified → Clinic Matched → Booked → Completed)
- [ ] WhatsApp Business integration (larger audience than Telegram)
- [ ] Multi-language support (Hindi, Arabic for Gulf patients)
- [ ] Appointment booking flow (integrate with clinic calendars)
- [ ] Patient testimonials section
- [ ] Improve AI conversation quality (fine-tune prompts, add clinic-specific data)

### Long-Term (3-6 months)
- [ ] Formalize clinic commission structure (10-15% per referral)
- [ ] Payment processing for deposits (Stripe/Razorpay)
- [ ] Expansion to more cities (Mumbai, Delhi, Bangalore, Chennai)
- [ ] AI-generated weekly reports for clinic partners
- [ ] Automated review collection from completed patients
- [ ] Tourism booking API integrations
- [ ] Patient follow-up satisfaction surveys
- [ ] Expansion to more source countries (Middle East, SE Asia)

---

## Cost Structure

| Item | Monthly Cost |
|------|-------------|
| VPS hosting | $0 (self-hosted) |
| AI (Ollama) | $0 (self-hosted) |
| Email outbound (Brevo) | $0 (300/day free tier) |
| Email inbound (Stalwart) | $0 (self-hosted) |
| Domain | ~$1/month |
| SSL | $0 (Let's Encrypt) |
| CRM (Twenty) | $0 (self-hosted) |
| **Total** | **~$1/month** |
