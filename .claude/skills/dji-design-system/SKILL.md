---
name: dji-design-system
description: The DentalJourneyIndia website design system and page-building playbook. Use this skill whenever creating, editing, restyling, or reviewing ANY page or visual element of the website in this repo — new landing pages, SEO articles, sections, CTAs, animations, meta tags, or copy tweaks. Also use it when asked to "make it look better", "add a page", "improve UI/UX", "polish", or "add animations", even if the user doesn't mention design explicitly. It encodes the brand tokens, required page boilerplate, tracking, honesty rules, and verification steps that every page must follow.
---

# DentalJourneyIndia Design System

Static-HTML site at `website/`, served by Nginx with clean URLs (`/page` → `page.html`).
Live domain: `https://dentaljourneyindia.org`. No build step, no frameworks, no npm —
every page is fully self-contained (inline CSS + JS). Never introduce React, bundlers,
or CDN dependencies; the architecture is deliberately zero-cost and zero-maintenance.

## Brand tokens

```css
--navy:#0B1426  --navy-light:#121E36  --navy-mid:#1A2A4A
--gold:#C9A84C  --teal:#2EC4B6  --teal-dark:#1A9E92
--coral:#E07A5F --white:#F8F6F0 --gray-400:#8A8880 --gray-600:#5A5850
```

- Fonts: **Playfair Display** (display/headings) + **DM Sans** (body), Google Fonts with
  `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin) before the stylesheet.
- Homepage (`index.html`): dark navy theme, teal primary CTAs, gold accents.
- Article/guide pages: light theme (copy conventions from `dental-tourism-india-guide.html`),
  nav logo sits on a navy chip for legibility.
- Motion: `riseIn` keyframes + `.reveal` IntersectionObserver pattern, spring-ish easing
  `cubic-bezier(.22,1,.36,1)`, staggered `transition-delay` on grids, and ALWAYS a
  `prefers-reduced-motion: reduce` block that disables animations and forces content visible.

## Every page's required head

1. `<title>` ≤ 60 chars, unique; meta description ~150 chars, unique.
2. `<link rel="canonical">` — clean URL, https, no `.html`.
3. Full OG set (`og:title/description/url/site_name/type`) + `og:image`
   `https://dentaljourneyindia.org/img/og-image.png` with `og:image:width` 1200 /
   `og:image:height` 630 + `twitter:card summary_large_image` + `twitter:image`.
4. Favicon `/img/favicon.svg`; viewport meta.
5. GA4 snippet (`G-HT3RVLE6YS`) with consent mode: default **denied**, `cookieConsent`
   event listener with BOTH granted and denied branches, `dji_consent` cookie check.
   Copy it verbatim from an existing page — do not re-derive it.
6. JSON-LD: Article pages get `Article` (image, publisher DentalJourneyIndia,
   mainEntityOfPage); FAQ sections get a matching `FAQPage` whose text mirrors the
   visible Q&A exactly. Every block must pass `JSON.parse`.

## Every page's required body

- Nav: `/img/logo.svg` linking to `/`, plus a "Get a Free Quote" CTA to `/#contact`;
  usable on a 375px screen (hamburger or fitting links — never hide all navigation).
- CTA boxes mid-page and at the end: link `/#contact` and
  `https://t.me/DentalJourneyIndia_bot`. Articles must never dead-end.
- "Related Guides" card near the end: 3-5 sibling links, clean URLs.
- Footer: `/privacy-policy`, `/cookie-policy`, `/terms`, `/medical-disclaimer`, and a
  Cookie Settings link with `data-consent-settings`.
- Scripts before `</body>`: `/js/consent.js`, `/chat-widget.js` (with `data-api`
  attribute), and a gtag-guarded `telegram_click` listener
  (`if (typeof gtag === 'function')` — never call gtag unguarded).

## Honesty rules (non-negotiable — this is a medical-adjacent business)

- NEVER invent testimonials, reviews, ratings, patient counts, named doctors,
  certifications, awards, or statistics. The company is new; fabricated social proof is
  unethical and legally dangerous.
- Verified clinics exist ONLY in Hyderabad, Vijayawada, and Guntur. Other destinations
  are trip extensions — say so explicitly.
- No medical advice, outcome promises, or superlatives ("painless", "guaranteed",
  "100% safe"). Recovery/timing questions defer to "ask your dentist" and the clinic.
- Hedge unverifiable specifics ("around", "roughly") or omit them.

## Canonical prices (single source of truth — use EXACTLY these)

| Treatment | India | US |
|---|---|---|
| Single implant | $300 - $800 | $3,000 - $6,000 |
| Porcelain veneer (per tooth) | $150 - $400 | $1,000 - $2,500 |
| Root canal + crown | $100 - $300 | $1,500 - $3,000 |
| Full mouth rehab | $3,000 - $8,000 | $25,000 - $50,000 |
| Smile design (8 veneers) | $1,200 - $3,000 | $8,000 - $20,000 |
| All-on-4 implants | $2,500 - $5,000 | $20,000 - $30,000 |

If a price must change, change it EVERYWHERE (all pages + JSON-LD) in the same commit.

## New-page integration checklist

1. Add `<url>` to `sitemap.xml` (articles 0.8-0.9, legal 0.3, lastmod = today).
2. Add a card to `blog.html` if it's a guide/article.
3. Add "Related Guides" links from 1-2 sibling pages back to the new page.
4. Consider a homepage footer link for high-value landing pages.

## Verify before finishing (run, don't assume)

```bash
node -e "
const html=require('fs').readFileSync('website/PAGE.html','utf8');
const re=/<script(?![^>]*src=)([^>]*)>([\s\S]*?)<\/script>/gi;let m,bad=0;
while((m=re.exec(html))){try{/ld\+json/.test(m[1])?JSON.parse(m[2]):new Function(m[2])}catch(e){bad++;console.log('FAIL',e.message)}}
console.log(bad===0?'scripts OK':'FAILURES: '+bad);"
```

Also check: every internal link target exists as a file (clean URLs, no `.html` suffix),
exactly one `h1`, no banned claims (`grep -icE "testimonial|guarantee|painless"` → 0),
and the page renders sensibly at 375px width (read the mobile media queries).

The lead API (`POST /api/leads`) accepts `{name,email,phone,country,treatment,message,source}`
plus a honeypot field `company` that must stay hidden and empty for humans.
