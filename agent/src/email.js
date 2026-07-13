/**
 * Email sender — Brevo SMTP relay with rate limiting, suppression list,
 * and unsubscribe footers.
 */
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Suppression list shared with the bot's /api/unsubscribe endpoint.
const SUPPRESSION_FILE = process.env.SUPPRESSION_FILE || path.join(__dirname, '..', 'data', 'suppression.json');

// Rate limiting state
let emailsSentThisHour = 0;
let hourResetTimer = null;

function resetHourlyCounter() {
  emailsSentThisHour = 0;
}

// Reset counter every hour
if (!hourResetTimer) {
  hourResetTimer = setInterval(resetHourlyCounter, 60 * 60 * 1000);
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // STARTTLS
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      // Verify certificates by default (Brevo relay is on the public
      // internet). Set SMTP_TLS_INSECURE=true only for a local test relay.
      rejectUnauthorized: process.env.SMTP_TLS_INSECURE !== 'true',
    },
  });
}

function isSuppressed(email) {
  if (!email) return false;
  try {
    const list = JSON.parse(fs.readFileSync(SUPPRESSION_FILE, 'utf8'));
    return Array.isArray(list) && list.includes(String(email).toLowerCase().trim());
  } catch {
    return false; // No file yet = nobody unsubscribed
  }
}

/**
 * HMAC token so unsubscribe links can't be forged to unsubscribe others.
 * The bot's /api/unsubscribe endpoint verifies with the same UNSUB_SECRET.
 */
function unsubscribeToken(email) {
  const secret = process.env.UNSUB_SECRET || '';
  return crypto.createHmac('sha256', secret).update(String(email).toLowerCase().trim()).digest('hex').slice(0, 32);
}

function unsubscribeUrl(email) {
  const base = process.env.PUBLIC_BASE_URL || 'https://dentaljourneyindia.org';
  return `${base}/api/unsubscribe?e=${encodeURIComponent(String(email).toLowerCase().trim())}&t=${unsubscribeToken(email)}`;
}

/**
 * Send an email with rate limiting, suppression check, and dry-run support.
 * @param {Object} opts - { to, subject, text, html, withUnsubscribe }
 *   withUnsubscribe (default true): append an unsubscribe footer + headers.
 * @returns {Object} - { success, messageId, dryRun, rateLimited, suppressed }
 */
async function sendEmail({ to, subject, text, html, withUnsubscribe = true }) {
  const maxPerHour = parseInt(process.env.MAX_EMAILS_PER_HOUR) || 5;
  const isDryRun = process.env.DRY_RUN === 'true';

  if (isSuppressed(to)) {
    console.log(`[EMAIL] Suppressed (unsubscribed) — skipping: ${to}`);
    return { success: false, suppressed: true };
  }

  // Rate limit check
  if (emailsSentThisHour >= maxPerHour) {
    console.log(`[EMAIL] Rate limited — ${emailsSentThisHour}/${maxPerHour} sent this hour. Skipping: ${to}`);
    return { success: false, rateLimited: true };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'DentalJourneyIndia';
  const fromAddr = process.env.SMTP_FROM || 'hello@dentaljourneyindia.org';

  let finalText = text;
  let finalHtml = html;
  const headers = { 'X-Mailer': 'DentalJourneyIndia-Agent/1.1' };

  if (withUnsubscribe) {
    const url = unsubscribeUrl(to);
    finalText = `${text || ''}\n\n—\nTo stop receiving these emails: ${url}\nOr reply with "unsubscribe".`;
    if (html) {
      finalHtml = `${html}<p style="color:#888;font-size:12px;margin-top:24px;border-top:1px solid #eee;padding-top:12px">Don't want these emails? <a href="${url}">Unsubscribe</a> or reply with "unsubscribe".</p>`;
    }
    headers['List-Unsubscribe'] = `<${url}>, <mailto:${fromAddr}?subject=unsubscribe>`;
    headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
  } else {
    headers['List-Unsubscribe'] = `<mailto:${fromAddr}?subject=unsubscribe>`;
  }

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to,
    subject,
    text: finalText,
    html: finalHtml || undefined,
    headers,
  };

  if (isDryRun) {
    console.log(`[EMAIL][DRY RUN] Would send to: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body preview: ${(finalText || '').substring(0, 120)}...`);
    return { success: true, dryRun: true, messageId: 'dry-run' };
  }

  try {
    const transporter = createTransport();
    const info = await transporter.sendMail(mailOptions);
    emailsSentThisHour++;
    console.log(`[EMAIL] Sent to ${to} — MessageID: ${info.messageId} (${emailsSentThisHour}/${maxPerHour} this hour)`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Failed to send to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Verify SMTP connection
 */
async function verifySmtp() {
  try {
    const transporter = createTransport();
    await transporter.verify();
    console.log('[EMAIL] SMTP connection verified');
    return true;
  } catch (err) {
    console.error('[EMAIL] SMTP verification failed:', err.message);
    return false;
  }
}

module.exports = { sendEmail, verifySmtp, resetHourlyCounter, isSuppressed, unsubscribeToken, unsubscribeUrl, SUPPRESSION_FILE };
