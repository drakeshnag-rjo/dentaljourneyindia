const crm = require('../crm');
const { sendTelegram } = require('../telegram');
const { getOutreachStats } = require('../clinics');

async function runDailyDigest() {
  console.log('\n[DIGEST] === Daily Digest Job Started ===');
  const stats = await crm.getLeadStats();
  const recentLeads = await crm.getRecentLeads(1);
  const outreachStats = getOutreachStats();
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Kolkata',
  });

  let leadDetails = '';
  if (recentLeads.length > 0) {
    leadDetails = recentLeads.map(l => {
      const name = `${l.name?.firstName || ''} ${l.name?.lastName || ''}`.trim() || 'Unknown';
      const email = l.emails?.primaryEmail || 'no email';
      return `  • *${name}* (${email})`;
    }).join('\n');
  } else {
    leadDetails = '  No new leads in the last 24 hours.';
  }

  const actions = [];
  if (stats.withEmail < stats.totalLeads * 0.5 && stats.totalLeads > 0) actions.push('⚠️ <50% leads have emails');
  if (outreachStats.withEmail === 0) actions.push('📧 No clinic emails configured');
  if (stats.last24h === 0 && stats.last7d === 0) actions.push('📢 No new leads this week');
  if (outreachStats.responded > 0) actions.push(`🤝 ${outreachStats.responded} clinic(s) responded!`);
  if (actions.length === 0) actions.push('✅ Everything looks good!');

  const message = `📊 *DentalJourneyIndia Daily Digest*
${today}

📈 *LEAD STATS*
  Total: *${stats.totalLeads}* | With email: *${stats.withEmail}*
  New 24h: *${stats.last24h}* | New 7d: *${stats.last7d}*

🆕 *NEW LEADS (24h)*
${leadDetails}

🏥 *CLINIC OUTREACH*
  Total: ${outreachStats.total} | With email: ${outreachStats.withEmail}
  In progress: ${outreachStats.inProgress} | Done: ${outreachStats.completed}

🎯 *ACTIONS*
${actions.map(a => `  ${a}`).join('\n')}

_Agent v1.0_`;

  const result = await sendTelegram(message);
  if (result.success) console.log('[DIGEST] ✅ Sent via Telegram');
  else console.error(`[DIGEST] ❌ Failed: ${result.error}`);
  return result;
}

module.exports = { runDailyDigest };
