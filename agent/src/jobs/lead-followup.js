/**
 * Lead Follow-Up Job
 * 
 * Runs on schedule, checks CRM for leads needing follow-up emails,
 * sends the appropriate drip email (Day 1, 3, or 7), and logs to CRM.
 */
const crm = require('../crm');
const { sendEmail } = require('../email');
const templates = require('../templates/lead-followup');

async function runLeadFollowUps() {
  console.log('\n[FOLLOWUP] === Lead Follow-Up Job Started ===');
  
  const leads = await crm.getLeadsForFollowUp();
  console.log(`[FOLLOWUP] ${leads.length} leads due for follow-up`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  for (const lead of leads) {
    const stage = lead.followUpDue; // 'day1', 'day3', or 'day7'
    
    // Check if this follow-up was already sent
    const alreadySent = await crm.wasFollowUpSent(lead.id, stage);
    if (alreadySent) {
      skipped++;
      continue;
    }

    // Get the right template
    const templateFn = templates[stage];
    if (!templateFn) {
      console.warn(`[FOLLOWUP] No template for stage: ${stage}`);
      continue;
    }

    const email = templateFn(lead);

    console.log(`[FOLLOWUP] Sending ${stage} to ${lead.name} (${lead.email})`);

    const result = await sendEmail({
      to: lead.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    });

    if (result.success) {
      sent++;

      // Log to CRM as a note
      const marker = `[agent:followup:${stage}]`;
      const noteText = `${marker}\n\n**Auto Follow-Up (${stage.toUpperCase()})** sent to ${lead.email}\nSubject: ${email.subject}\nStatus: ${result.dryRun ? 'DRY RUN' : 'Sent'}\nMessage ID: ${result.messageId || 'n/a'}`;
      await crm.addNote(lead.id, noteText);

      console.log(`[FOLLOWUP] ✅ ${stage} sent to ${lead.name}`);
    } else if (result.rateLimited) {
      console.log(`[FOLLOWUP] ⏸ Rate limited — stopping for this cycle`);
      break; // Stop processing, will resume next cycle
    } else {
      errors++;
      console.error(`[FOLLOWUP] ❌ Failed for ${lead.name}: ${result.error}`);
    }

    // Small delay between emails (deliverability best practice)
    await sleep(3000);
  }

  console.log(`[FOLLOWUP] Done — Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
  return { sent, skipped, errors };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runLeadFollowUps };
