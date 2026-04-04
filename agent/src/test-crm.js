/**
 * Test script — verify CRM connection and show lead data
 * 
 * Usage: node src/test-crm.js
 */
require('dotenv').config();

const crm = require('./crm');

async function main() {
  console.log('🧪 Testing CRM connection...\n');

  try {
    const people = await crm.getAllPeople(true);
    console.log(`✅ Connected — ${people.length} people in CRM\n`);

    // Show recent leads
    const recent = await crm.getRecentLeads(7);
    console.log(`📋 Leads from last 7 days: ${recent.length}`);
    recent.forEach(p => {
      const name = `${p.name?.firstName || ''} ${p.name?.lastName || ''}`.trim();
      const email = p.emails?.primaryEmail || 'no email';
      console.log(`  • ${name} (${email}) — ${p.jobTitle || 'unknown source'} — ${p.createdAt}`);
    });

    // Show stats
    const stats = await crm.getLeadStats();
    console.log(`\n📊 Stats:`);
    console.log(`  Total: ${stats.totalLeads}`);
    console.log(`  With email: ${stats.withEmail}`);
    console.log(`  Last 24h: ${stats.last24h}`);
    console.log(`  Last 7d: ${stats.last7d}`);

    // Show follow-up queue
    const followUps = await crm.getLeadsForFollowUp();
    console.log(`\n📧 Leads due for follow-up: ${followUps.length}`);
    followUps.forEach(l => {
      console.log(`  • ${l.name} (${l.email}) — Day ${l.daysSinceCreated} — Next: ${l.followUpDue}`);
    });

  } catch (err) {
    console.error('❌ CRM test failed:', err.message);
  }

  process.exit(0);
}

main();
