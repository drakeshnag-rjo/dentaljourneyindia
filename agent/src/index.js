/**
 * DentalJourneyIndia — Autonomous Email Agent
 * 
 * Cron-based Node.js agent that runs alongside the Telegram bot.
 * 
 * Jobs:
 *  1. Lead follow-ups — Day 1, 3, 7 drip sequence (every 2 hours)
 *  2. Daily digest — Summary email to admin (daily at 8am IST)
 *  3. Clinic outreach — Partnership emails to clinics (daily at 10am IST)
 * 
 * Start:   pm2 start src/index.js --name dentaljourneyindia-agent
 * Dry run: DRY_RUN=true node src/index.js
 * Logs:    pm2 logs dentaljourneyindia-agent
 */
require('dotenv').config();

const cron = require('node-cron');
const { verifySmtp } = require('./email');
const { getAllPeople } = require('./crm');
const { runLeadFollowUps } = require('./jobs/lead-followup');
const { runDailyDigest } = require('./jobs/daily-digest');
const { runClinicOutreach } = require('./jobs/clinic-outreach');
const { getOutreachStats } = require('./clinics');

const TZ = process.env.TZ || 'Asia/Kolkata';

async function startup() {
  console.log(`
╔══════════════════════════════════════════════╗
║   🤖 DentalJourneyIndia Agent v1.0           ║
║   Autonomous Email Follow-Up System          ║
╚══════════════════════════════════════════════╝
  `);

  const isDryRun = process.env.DRY_RUN === 'true';
  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE — No emails will actually be sent\n');
  }

  // === Pre-flight checks ===
  console.log('[STARTUP] Running pre-flight checks...\n');

  // 1. SMTP
  const smtpOk = await verifySmtp();
  console.log(`  SMTP:     ${smtpOk ? '✅ Connected' : '❌ Failed'} (${process.env.SMTP_HOST}:${process.env.SMTP_PORT})`);

  // 2. CRM
  let crmOk = false;
  try {
    const people = await getAllPeople(true);
    crmOk = true;
    console.log(`  CRM:      ✅ Connected (${people.length} people)`);
  } catch (err) {
    console.log(`  CRM:      ❌ Failed (${err.message})`);
  }

  // 3. Clinic data
  const outreach = getOutreachStats();
  console.log(`  Clinics:  ✅ ${outreach.total} clinics loaded (${outreach.withEmail} with email)`);

  // 4. Config
  console.log(`  Admin TG: ${process.env.ADMIN_TELEGRAM_ID ? '✅ ' + process.env.ADMIN_TELEGRAM_ID : '⚠️  Not set'}`);
  console.log(`  Rate:     ${process.env.MAX_EMAILS_PER_HOUR || 5} emails/hour`);
  console.log(`  Timezone: ${TZ}`);
  console.log(`  Dry Run:  ${isDryRun ? 'YES' : 'NO'}`);
  console.log('');

  if (!smtpOk && !isDryRun) {
    console.error('❌ SMTP connection failed — agent will not start');
    console.error('   Fix SMTP settings in .env or run with DRY_RUN=true');
    process.exit(1);
  }

  if (!crmOk) {
    console.warn('⚠️  CRM connection failed — lead follow-ups will retry each cycle');
  }

  // === Schedule Jobs ===
  console.log('[STARTUP] Scheduling jobs...\n');

  // Job 1: Lead follow-ups — every 2 hours from 8am to 8pm IST
  cron.schedule('0 8,10,12,14,16,18,20 * * *', async () => {
    try {
      await runLeadFollowUps();
    } catch (err) {
      console.error('[CRON] Lead follow-up error:', err.message);
    }
  }, { timezone: TZ });
  console.log('  📧 Lead follow-ups:   Every 2h (8am-8pm IST)');

  // Job 2: Daily digest — 8:00 AM IST
  cron.schedule('0 8 * * *', async () => {
    try {
      await runDailyDigest();
    } catch (err) {
      console.error('[CRON] Daily digest error:', err.message);
    }
  }, { timezone: TZ });
  console.log('  📊 Daily digest:      8:00 AM IST');

  // Job 3: Clinic outreach — 10:00 AM IST (weekdays only)
  cron.schedule('0 10 * * 1-5', async () => {
    try {
      await runClinicOutreach();
    } catch (err) {
      console.error('[CRON] Clinic outreach error:', err.message);
    }
  }, { timezone: TZ });
  console.log('  🏥 Clinic outreach:   10:00 AM IST (Mon-Fri)');

  console.log('\n[STARTUP] ✅ Agent is running. Waiting for scheduled jobs...');

  // Run initial cycle if DRY_RUN (useful for testing)
  if (isDryRun) {
    console.log('\n[STARTUP] Dry-run mode — running all jobs once now...');
    await runLeadFollowUps().catch(e => console.error(e.message));
    await runDailyDigest().catch(e => console.error(e.message));
    await runClinicOutreach().catch(e => console.error(e.message));
    console.log('\n[STARTUP] Dry-run complete. Agent will continue on schedule.');
  }
}

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n[AGENT] Shutting down...');
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\n[AGENT] Shutting down...');
  process.exit(0);
});

startup().catch(err => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
