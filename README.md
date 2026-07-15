# DentalJourneyIndia

**Free, open-source dental tourism guidance for international patients — [dentaljourneyindia.org](https://dentaljourneyindia.org)**

Dental care in the US, UK, Canada, and Australia is expensive enough that many
people simply put it off. The same treatments — implants, veneers, crowns, full
mouth rehabilitation — typically cost 70–90% less in India, performed by
dentists with 5-year BDS degrees (and 3-year MDS specializations) registered
with the Dental Council of India.

This project exists to help people navigate that option safely: honest cost
guides, safety checklists, trip planning, and free personalized quotes from
verified clinics. **We never charge patients for our help.** The whole platform
is open source so anyone can see exactly how it works, suggest improvements, or
reuse it.

## What's in this repo

| Directory | What it is |
|---|---|
| `website/` | The public site — plain static HTML served by Nginx. No build step, no frameworks, no CDN dependencies; every page is fully self-contained (inline CSS + JS). |
| `bot/` | Telegram concierge bot ([@DentalJourneyIndia_bot](https://t.me/DentalJourneyIndia_bot)). |
| `agent/` | Backend agent: lead intake (`POST /api/leads`), CRM sync, and email follow-up jobs. |
| `docs/` | Setup guides and project documentation. |
| `marketing/` | Content drafts and campaign material. |

## Principles

- **Free for patients.** Quotes, clinic comparisons, and trip planning cost
  nothing and carry no obligation.
- **Honest by policy.** No invented testimonials, ratings, patient counts, or
  outcome promises. Verified clinics exist only in Hyderabad, Vijayawada, and
  Guntur — other destinations are described as optional trip extensions, never
  treatment locations. Medical questions defer to dentists.
- **No medical advice.** The site helps people plan and compare; treatment
  decisions belong with the patient and their dentist. See the
  [medical disclaimer](https://dentaljourneyindia.org/medical-disclaimer).
- **Zero-cost architecture.** Static HTML, deliberately boring: cheap to host,
  fast to load, easy to audit.

## Running the website locally

No tooling needed — it's static HTML with clean URLs (`/page` → `page.html`):

```bash
cd website
python3 -m http.server 8000
# then open http://localhost:8000/index.html
```

## Contributing

Issues and pull requests are welcome — especially corrections to costs,
safety information, or accessibility. Please keep the honesty principles
above: no unverifiable claims, no fabricated social proof, and prices only
change everywhere at once (all pages + JSON-LD in the same commit).

## License

[MIT](LICENSE) — free to use, copy, modify, and redistribute.
