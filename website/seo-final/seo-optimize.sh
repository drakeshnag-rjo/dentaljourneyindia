#!/bin/bash
# SEO Optimization Script for DentalJourneyIndia Homepage
# Run on VPS: bash seo-optimize.sh

FILE="/var/www/dentaljourneyindia/website/index.html"
BACKUP="/var/www/dentaljourneyindia/website/index.html.bak"

# Backup first
cp "$FILE" "$BACKUP"
echo "✅ Backup saved to $BACKUP"

# 1. Update <title> tag with target keywords
sed -i 's|<title>DentalJourneyIndia — Premium Dental Care & Tourism in India</title>|<title>Dental Implants in India \| Dental Tourism \& Affordable Dental Care — DentalJourneyIndia</title>|' "$FILE"
echo "✅ Title tag updated"

# 2. Update meta description with keywords
sed -i 's|<meta name="description" content="Save 70-90% on dental treatments in India. AI-powered dental tourism concierge. Verified clinics in Hyderabad, Vijayawada & Guntur.">|<meta name="description" content="Save 70-90% on dental implants, veneers \& crowns in India. Trusted dental tourism platform connecting international patients with verified clinics in Hyderabad. Get a free quote today.">|' "$FILE"
echo "✅ Meta description updated"

# 3. Add comprehensive meta tags after the google-site-verification tag
sed -i '/<meta name="google-site-verification"/a \
<meta name="keywords" content="dental tourism india, dental implants india, dental care india, affordable dental treatment india, dental implants cost india, best dental clinics india, dental tourism packages, veneers india, all on 4 implants india, dental travel india, dentist in india for foreigners, dental holiday india">\
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">\
<meta name="author" content="DentalJourneyIndia">\
<link rel="canonical" href="https://dentaljourneyindia.org/">\
<link rel="icon" type="image/svg+xml" href="/img/favicon.svg">\
<meta property="og:type" content="website">\
<meta property="og:title" content="Dental Implants in India | Dental Tourism &amp; Affordable Dental Care">\
<meta property="og:description" content="Save 70-90% on dental implants, veneers &amp; crowns in India. AI-powered dental tourism with verified clinics in Hyderabad.">\
<meta property="og:url" content="https://dentaljourneyindia.org/">\
<meta property="og:site_name" content="DentalJourneyIndia">\
<meta property="og:locale" content="en_US">\
<meta name="twitter:card" content="summary_large_image">\
<meta name="twitter:title" content="Dental Implants in India | Save 70-90% — DentalJourneyIndia">\
<meta name="twitter:description" content="AI-powered dental tourism platform. Get affordable dental implants, veneers &amp; dental care in India from verified clinics.">' "$FILE"
echo "✅ Meta tags added (OG, Twitter, keywords, canonical, favicon)"

# 4. Add Schema.org structured data before </head>
sed -i '/<\/head>/i \
<script type="application/ld+json">\
{\
  "@context": "https://schema.org",\
  "@type": "Organization",\
  "name": "DentalJourneyIndia",\
  "url": "https://dentaljourneyindia.org",\
  "description": "AI-powered dental tourism platform connecting international patients with verified dental clinics in India. Save 70-90% on dental implants, veneers, and dental care.",\
  "contactPoint": {\
    "@type": "ContactPoint",\
    "email": "hello@dentaljourneyindia.org",\
    "contactType": "customer service",\
    "availableLanguage": "English"\
  },\
  "sameAs": ["https://t.me/DentalJourneyIndia_bot"],\
  "areaServed": ["US", "GB", "CA", "AU"],\
  "serviceType": ["Dental Tourism", "Dental Implants", "Dental Care", "Medical Tourism"]\
}\
</script>\
<script type="application/ld+json">\
{\
  "@context": "https://schema.org",\
  "@type": "WebSite",\
  "name": "DentalJourneyIndia",\
  "url": "https://dentaljourneyindia.org",\
  "description": "Dental tourism in India — affordable dental implants, veneers, and dental care for international patients",\
  "potentialAction": {\
    "@type": "SearchAction",\
    "target": "https://dentaljourneyindia.org/blog?q={search_term_string}",\
    "query-input": "required name=search_term_string"\
  }\
}\
</script>\
<script type="application/ld+json">\
{\
  "@context": "https://schema.org",\
  "@type": "MedicalBusiness",\
  "name": "DentalJourneyIndia",\
  "url": "https://dentaljourneyindia.org",\
  "description": "Dental tourism facilitator connecting international patients with dental clinics in India for implants, veneers, crowns, and full mouth rehabilitation.",\
  "medicalSpecialty": "Dentistry",\
  "areaServed": [\
    {"@type": "Country", "name": "United States"},\
    {"@type": "Country", "name": "United Kingdom"},\
    {"@type": "Country", "name": "Canada"},\
    {"@type": "Country", "name": "Australia"}\
  ],\
  "hasOfferCatalog": {\
    "@type": "OfferCatalog",\
    "name": "Dental Treatments in India",\
    "itemListElement": [\
      {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Dental Implants"}, "priceRange": "$300-$800"},\
      {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Porcelain Veneers"}, "priceRange": "$150-$400"},\
      {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "All-on-4 Implants"}, "priceRange": "$2500-$5000"},\
      {"@type": "Offer", "itemOffered": {"@type": "MedicalProcedure", "name": "Full Mouth Rehabilitation"}, "priceRange": "$3000-$8000"}\
    ]\
  }\
}\
</script>' "$FILE"
echo "✅ Schema.org structured data added (Organization, WebSite, MedicalBusiness)"

echo ""
echo "🎉 SEO optimization complete!"
echo "Verify: https://dentaljourneyindia.org"
echo "Test structured data: https://search.google.com/test/rich-results"
echo "Backup at: $BACKUP"
