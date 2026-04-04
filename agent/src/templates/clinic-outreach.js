/**
 * Email templates for clinic partnership outreach
 * Day 1 (cold), Day 3 (follow-up), Day 7 (final)
 */

const SITE_URL = 'https://dentaljourneyindia.org';

/**
 * Day 1 — Initial partnership pitch
 */
function clinicDay1(clinic) {
  const clinicName = clinic.name || 'your clinic';
  const city = clinic.city || 'your city';
  const subject = `Partnership Opportunity — International Patients for ${clinicName}`;

  const text = `Dear Dr. ${clinic.doctorName || 'Doctor'} / Team,

I'm Rakesh, founder of DentalJourneyIndia (${SITE_URL}), an AI-powered dental tourism platform that connects international patients from the US, UK, Canada, and Australia with premium dental clinics in India.

I came across ${clinicName} and was impressed by your reputation in ${city}. I'd like to propose a simple partnership:

What we bring:
- Pre-qualified international patients actively seeking dental treatment in India
- Complete patient management — inquiry handling, treatment coordination, travel logistics
- AI-powered 24/7 patient communication in multiple languages

What we ask:
- Competitive pricing for international patients
- Quality assurance and treatment guarantees
- A point of contact for patient coordination

How it works:
- We send you ready-to-book patients
- You provide treatment
- You only pay a referral commission (10-15%) on completed treatments
- No upfront cost, no minimum commitment, non-exclusive

Would you be open to a brief 10-minute call this week? I'd love to discuss how we can bring international patients to ${clinicName}.

Best regards,
Rakesh
Founder, DentalJourneyIndia
${SITE_URL}`;

  return { subject, text };
}

/**
 * Day 3 — Follow-up
 */
function clinicDay3(clinic) {
  const clinicName = clinic.name || 'your clinic';
  const city = clinic.city || 'your city';
  const subject = `Re: Partnership Opportunity — International Patients for ${clinicName}`;

  const text = `Dear Dr. ${clinic.doctorName || 'Doctor'} / Team,

I wanted to follow up on my earlier email about partnering with DentalJourneyIndia to bring international dental tourism patients to ${clinicName}.

I'll keep this brief:
- We have a live platform (${SITE_URL}) receiving inquiries from international patients
- We're selecting 2-3 partner clinics in ${city} for our pilot program
- Zero cost to join — you only pay a commission on patients we successfully refer

Would a quick 10-minute call work this week?

Alternatively, you can simply reply with:
- Your treatment pricing for international patients
- A point of contact for patient coordination

Looking forward to hearing from you.

Best regards,
Rakesh
DentalJourneyIndia
${SITE_URL}`;

  return { subject, text };
}

/**
 * Day 7 — Final follow-up
 */
function clinicDay7(clinic) {
  const clinicName = clinic.name || 'your clinic';
  const city = clinic.city || 'your city';
  const subject = `Last note — international patient referrals for ${clinicName}`;

  const text = `Dear Dr. ${clinic.doctorName || 'Doctor'} / Team,

This is my final follow-up regarding the DentalJourneyIndia partnership opportunity.

We're finalizing our partner clinic selection in ${city} and would love to include ${clinicName} based on your excellent reputation.

If the timing isn't right, no problem at all. But if you're interested in receiving pre-qualified international patient referrals at zero cost, I'd be happy to share everything you need.

Just reply "interested" and I'll send the details.

Best regards,
Rakesh
DentalJourneyIndia
${SITE_URL}`;

  return { subject, text };
}

module.exports = { clinicDay1, clinicDay3, clinicDay7 };
