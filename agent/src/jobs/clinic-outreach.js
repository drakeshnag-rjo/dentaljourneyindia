/**
 * Clinic Outreach Job
 * 
 * Processes clinics through the outreach drip sequence.
 * Only sends to clinics with confirmed email addresses.
 */
const { sendEmail } = require('../email');
const { getClinicsForOutreach, getNextOutreachStep, updateClinicStatus } = require('../clinics');
const templates = require('../templates/clinic-outreach');

async function runClinicOutreach() {
  console.log('\n[OUTREACH] === Clinic Outreach Job Started ===');

  const clinics = getClinicsForOutreach();
  console.log(`[OUTREACH] ${clinics.length} clinics eligible for outreach`);

  let sent = 0;
  let skipped = 0;
  let errors = 0;

  // Process HIGH priority first, then MEDIUM, then LOW
  const sorted = clinics.sort((a, b) => {
    const priority = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return (priority[a.priority] || 2) - (priority[b.priority] || 2);
  });

  for (const clinic of sorted) {
    const step = getNextOutreachStep(clinic);
    if (!step) {
      skipped++;
      continue;
    }

    // Map step to template
    const templateMap = {
      day1: templates.clinicDay1,
      day3: templates.clinicDay3,
      day7: templates.clinicDay7,
    };

    const templateFn = templateMap[step];
    if (!templateFn) continue;

    const email = templateFn(clinic);

    console.log(`[OUTREACH] Sending ${step} to ${clinic.name} (${clinic.email})`);

    const result = await sendEmail({
      to: clinic.email,
      subject: email.subject,
      text: email.text,
    });

    if (result.success) {
      sent++;

      // Update status
      const statusMap = { day1: 'day1_sent', day3: 'day3_sent', day7: 'day7_sent' };
      updateClinicStatus(clinic.id, statusMap[step]);

      console.log(`[OUTREACH] ✅ ${step} sent to ${clinic.name}`);
    } else if (result.rateLimited) {
      console.log(`[OUTREACH] ⏸ Rate limited — stopping for this cycle`);
      break;
    } else {
      errors++;
      console.error(`[OUTREACH] ❌ Failed for ${clinic.name}: ${result.error}`);
    }

    // Delay between emails
    await sleep(5000);
  }

  console.log(`[OUTREACH] Done — Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
  return { sent, skipped, errors };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { runClinicOutreach };
