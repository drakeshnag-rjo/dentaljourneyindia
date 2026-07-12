# Compliance Integration Guide
# ================================

## Files Created

```
compliance-pages/
├── js/consent.js           # Cookie consent banner (drop-in script)
├── privacy-policy.html     # GDPR/CCPA/UK/AU/CA privacy policy
├── cookie-policy.html      # Cookie details + manage preferences
├── terms.html              # Terms of service
├── medical-disclaimer.html # Medical/dental disclaimer (critical for health)
```

## Step 1: Copy files to your website directory

```bash
cd /var/www/dentaljourneyindia/website

# Create JS directory
mkdir -p js

# Copy all files
cp /path/to/compliance-pages/js/consent.js js/
cp /path/to/compliance-pages/privacy-policy.html .
cp /path/to/compliance-pages/cookie-policy.html .
cp /path/to/compliance-pages/terms.html .
cp /path/to/compliance-pages/medical-disclaimer.html .
```

## Step 2: Add cookie consent script to your main index.html

Add this line just before the closing </body> tag:

```html
<script src="/js/consent.js"></script>
```

## Step 3: Update your footer in index.html

Replace or add to your existing footer links:

```html
<!-- Legal Links -->
<p style="margin-top: 16px; font-size: 12px;">
  <a href="/privacy-policy">Privacy Policy</a> · 
  <a href="/cookie-policy">Cookie Policy</a> · 
  <a href="/terms">Terms of Service</a> · 
  <a href="/medical-disclaimer">Medical Disclaimer</a> · 
  <a href="#" data-consent-settings>Cookie Settings</a> · 
  <a href="/privacy-policy#ccpa">Do Not Sell or Share My Personal Information</a>
</p>
```

## Step 4: Add Nginx clean URL rules

Add to your Nginx server block:

```nginx
location /privacy-policy { try_files /privacy-policy.html =404; }
location /cookie-policy { try_files /cookie-policy.html =404; }
location /terms { try_files /terms.html =404; }
location /medical-disclaimer { try_files /medical-disclaimer.html =404; }
```

Or use the simpler approach:

```nginx
location / {
    try_files $uri $uri.html $uri/ =404;
}
```

Then: `nginx -t && systemctl reload nginx`

## Step 5: Add to all blog pages

Add this before </body> on every blog page:

```html
<script src="/js/consent.js"></script>
```

## What's Covered

| Regulation | Region | Requirement | Status |
|------------|--------|-------------|--------|
| GDPR | EU/EEA | Opt-in cookie consent, privacy policy, data rights | ✅ |
| UK GDPR | UK | Same as GDPR + UK-specific language | ✅ |
| CCPA/CPRA | California | "Do Not Sell" link, privacy rights, opt-out | ✅ |
| Australian Privacy Act | Australia | Privacy policy, data handling disclosures | ✅ |
| PIPEDA | Canada | Consent, access, correction rights | ✅ |
| Medical disclaimer | Global | Not healthcare provider, no medical advice | ✅ |
| Cookie consent | Global | Granular consent, block before consent | ✅ |
| Terms of Service | Global | Liability limits, IP, governing law | ✅ |
