/**
 * Test script — verify SMTP and send a test email
 * 
 * Usage: node src/test-email.js
 */
require('dotenv').config();

const { sendEmail, verifySmtp } = require('./email');

async function main() {
  console.log('🧪 Testing SMTP connection...\n');

  const ok = await verifySmtp();
  if (!ok) {
    console.error('❌ SMTP verification failed. Check .env settings.');
    process.exit(1);
  }

  const to = process.env.ADMIN_EMAIL;
  if (!to) {
    console.error('❌ Set ADMIN_EMAIL in .env to receive test email');
    process.exit(1);
  }

  console.log(`\n📧 Sending test email to ${to}...`);

  const result = await sendEmail({
    to,
    subject: '🧪 DentalJourneyIndia Agent — Test Email',
    text: `This is a test email from the DentalJourneyIndia autonomous agent.\n\nIf you received this, your SMTP configuration is working correctly!\n\nTimestamp: ${new Date().toISOString()}`,
    html: `
      <div style="font-family: Arial; padding: 20px; max-width: 500px; margin: auto;">
        <h2 style="color: #0ea5e9;">🧪 Test Email</h2>
        <p>This is a test email from the <strong>DentalJourneyIndia autonomous agent</strong>.</p>
        <p>If you received this, your SMTP configuration is working correctly!</p>
        <p style="color: #999; font-size: 12px;">Timestamp: ${new Date().toISOString()}</p>
      </div>
    `,
  });

  if (result.success) {
    console.log(`✅ Test email sent! Message ID: ${result.messageId}`);
    console.log('Check your inbox (and spam folder).');
  } else {
    console.error(`❌ Failed: ${result.error}`);
  }

  process.exit(0);
}

main();
