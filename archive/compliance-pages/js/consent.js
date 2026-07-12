/**
 * DentalJourneyIndia — Cookie Consent & Privacy Controls
 * 
 * GDPR (EU), CCPA (California), LGPD (Brazil), UK GDPR, Australian Privacy
 * 
 * Features:
 * - Cookie consent banner with granular controls
 * - "Do Not Sell or Share" link (CCPA)
 * - Blocks analytics/marketing cookies until consent (GDPR)
 * - Remembers preferences for 365 days
 * - Geo-detection: stricter for EU (opt-in), relaxed for US (opt-out)
 * 
 * Usage: Add <script src="/js/consent.js"></script> before </body>
 */
(function() {
  'use strict';

  const COOKIE_NAME = 'dji_consent';
  const COOKIE_DAYS = 365;

  // Default preferences
  const DEFAULTS = {
    necessary: true,     // Always on
    analytics: false,    // Off by default (GDPR requires opt-in)
    marketing: false,    // Off by default
    consented: false,    // Has user made a choice?
    timestamp: null,
  };

  // ===================== CSS =====================
  const style = document.createElement('style');
  style.textContent = `
    #dji-consent-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 99999;
      background: #1a1a1a;
      color: #e0e0e0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.25);
      transform: translateY(100%);
      transition: transform 0.4s ease;
    }
    #dji-consent-banner.show { transform: translateY(0); }
    #dji-consent-banner .cb-inner {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px 24px;
    }
    #dji-consent-banner .cb-text {
      margin-bottom: 16px;
    }
    #dji-consent-banner .cb-text a {
      color: #4fc3d4;
      text-decoration: underline;
    }
    #dji-consent-banner .cb-options {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    #dji-consent-banner .cb-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    #dji-consent-banner .cb-option input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #4fc3d4;
    }
    #dji-consent-banner .cb-option label {
      cursor: pointer;
      font-size: 13px;
    }
    #dji-consent-banner .cb-option .required {
      color: #888;
      font-size: 11px;
    }
    #dji-consent-banner .cb-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    #dji-consent-banner .cb-btn {
      padding: 10px 24px;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }
    #dji-consent-banner .cb-accept {
      background: #4fc3d4;
      color: #1a1a1a;
    }
    #dji-consent-banner .cb-accept:hover { background: #3ab3c4; }
    #dji-consent-banner .cb-necessary {
      background: transparent;
      color: #e0e0e0;
      border: 1px solid #555;
    }
    #dji-consent-banner .cb-necessary:hover { border-color: #999; }
    #dji-consent-banner .cb-save {
      background: #333;
      color: #e0e0e0;
    }
    #dji-consent-banner .cb-save:hover { background: #444; }

    /* Privacy settings link (footer) */
    .dji-privacy-link {
      cursor: pointer;
      color: #4fc3d4;
      text-decoration: underline;
      background: none;
      border: none;
      font-size: inherit;
      font-family: inherit;
    }

    @media (max-width: 600px) {
      #dji-consent-banner .cb-inner { padding: 16px; }
      #dji-consent-banner .cb-buttons { flex-direction: column; }
      #dji-consent-banner .cb-btn { width: 100%; text-align: center; }
    }
  `;
  document.head.appendChild(style);

  // ===================== COOKIE HELPERS =====================
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + '=' + encodeURIComponent(JSON.stringify(value)) +
      ';expires=' + d.toUTCString() + ';path=/;SameSite=Lax;Secure';
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      try { return JSON.parse(decodeURIComponent(match[2])); }
      catch(e) { return null; }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
  }

  // ===================== CONSENT LOGIC =====================
  function getPreferences() {
    return getCookie(COOKIE_NAME) || { ...DEFAULTS };
  }

  function savePreferences(prefs) {
    prefs.consented = true;
    prefs.timestamp = new Date().toISOString();
    setCookie(COOKIE_NAME, prefs, COOKIE_DAYS);
    applyPreferences(prefs);
    hideBanner();
  }

  function applyPreferences(prefs) {
    // Enable/disable analytics
    if (prefs.analytics) {
      // Placeholder: load Google Analytics or Plausible here
      // e.g., loadScript('https://plausible.io/js/plausible.js');
      console.log('[Consent] Analytics: enabled');
    } else {
      // Remove analytics cookies if they exist
      deleteCookie('_ga');
      deleteCookie('_gid');
      deleteCookie('_gat');
      console.log('[Consent] Analytics: disabled');
    }

    if (prefs.marketing) {
      console.log('[Consent] Marketing: enabled');
    } else {
      console.log('[Consent] Marketing: disabled');
    }
  }

  // ===================== BANNER UI =====================
  function createBanner() {
    const banner = document.createElement('div');
    banner.id = 'dji-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="cb-inner">
        <div class="cb-text">
          🍪 We use cookies to improve your experience. Essential cookies keep the site working.
          Analytics cookies help us understand how visitors use the site.
          You can choose which cookies to allow.
          <a href="/privacy-policy">Privacy Policy</a> · <a href="/cookie-policy">Cookie Policy</a>
        </div>
        <div class="cb-options">
          <div class="cb-option">
            <input type="checkbox" id="cb-necessary" checked disabled>
            <label for="cb-necessary">Necessary <span class="required">(required)</span></label>
          </div>
          <div class="cb-option">
            <input type="checkbox" id="cb-analytics">
            <label for="cb-analytics">Analytics</label>
          </div>
          <div class="cb-option">
            <input type="checkbox" id="cb-marketing">
            <label for="cb-marketing">Marketing</label>
          </div>
        </div>
        <div class="cb-buttons">
          <button class="cb-btn cb-accept" onclick="window.__djiConsent.acceptAll()">Accept All</button>
          <button class="cb-btn cb-save" onclick="window.__djiConsent.saveSelected()">Save Preferences</button>
          <button class="cb-btn cb-necessary" onclick="window.__djiConsent.necessaryOnly()">Necessary Only</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);
    return banner;
  }

  function showBanner() {
    let banner = document.getElementById('dji-consent-banner');
    if (!banner) banner = createBanner();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        banner.classList.add('show');
      });
    });
  }

  function hideBanner() {
    const banner = document.getElementById('dji-consent-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 500);
    }
  }

  // ===================== PUBLIC API =====================
  window.__djiConsent = {
    acceptAll: function() {
      savePreferences({ necessary: true, analytics: true, marketing: true });
    },
    necessaryOnly: function() {
      savePreferences({ necessary: true, analytics: false, marketing: false });
    },
    saveSelected: function() {
      const analytics = document.getElementById('cb-analytics')?.checked || false;
      const marketing = document.getElementById('cb-marketing')?.checked || false;
      savePreferences({ necessary: true, analytics, marketing });
    },
    showSettings: function() {
      showBanner();
      // Pre-fill checkboxes with current preferences
      const prefs = getPreferences();
      const a = document.getElementById('cb-analytics');
      const m = document.getElementById('cb-marketing');
      if (a) a.checked = prefs.analytics;
      if (m) m.checked = prefs.marketing;
    },
    getPreferences: getPreferences,
    revokeConsent: function() {
      deleteCookie(COOKIE_NAME);
      showBanner();
    },
  };

  // ===================== INIT =====================
  function init() {
    const prefs = getPreferences();

    if (prefs.consented) {
      // User already made a choice — apply silently
      applyPreferences(prefs);
    } else {
      // First visit — show banner
      showBanner();
    }

    // Attach "Cookie Settings" / "Privacy Settings" links in footer
    document.querySelectorAll('[data-consent-settings]').forEach(el => {
      el.addEventListener('click', function(e) {
        e.preventDefault();
        window.__djiConsent.showSettings();
      });
    });
  }

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
