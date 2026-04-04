/**
 * Email sender — Stalwart SMTP with rate limiting & warm-up
 */
const nodemailer = require('nodemailer');

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
      rejectUnauthorized: false, // Local network
    },
  });
}

/**
 * Send an email with rate limiting and dry-run support
 * @param {Object} opts - { to, subject, text, html }
 * @returns {Object} - { success, messageId, dryRun, rateLimited }
 */
async function sendEmail({ to, subject, text, html }) {
  const maxPerHour = parseInt(process.env.MAX_EMAILS_PER_HOUR) || 5;
  const isDryRun = process.env.DRY_RUN === 'true';

  // Rate limit check
  if (emailsSentThisHour >= maxPerHour) {
    console.log(`[EMAIL] Rate limited — ${emailsSentThisHour}/${maxPerHour} sent this hour. Skipping: ${to}`);
    return { success: false, rateLimited: true };
  }

  const fromName = process.env.SMTP_FROM_NAME || 'DentalJourneyIndia';
  const fromAddr = process.env.SMTP_FROM || 'hello@dentaljourneyindia.org';

  const mailOptions = {
    from: `"${fromName}" <${fromAddr}>`,
    to,
    subject,
    text,
    html: html || undefined,
    headers: {
      'List-Unsubscribe': `<mailto:${fromAddr}?subject=unsubscribe>`,
      'X-Mailer': 'DentalJourneyIndia-Agent/1.0',
    },
  };

  if (isDryRun) {
    console.log(`[EMAIL][DRY RUN] Would send to: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Body preview: ${(text || '').substring(0, 120)}...`);
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

module.exports = { sendEmail, verifySmtp, resetHourlyCounter };
