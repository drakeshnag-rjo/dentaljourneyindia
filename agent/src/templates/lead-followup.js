/**
 * Email templates for lead follow-up drip sequence
 * Each template returns { subject, text, html }
 */

const SITE_URL = 'https://dentaljourneyindia.org';
const BOT_URL = 'https://t.me/DentalJourneyIndia_bot';

/**
 * Day 1 — Welcome + value proposition
 */
function day1(lead) {
  const name = lead.name?.split(' ')[0] || 'there';
  const subject = `Welcome to DentalJourneyIndia, ${name}!`;

  const text = `Hi ${name},

Thank you for reaching out to DentalJourneyIndia! We received your inquiry and wanted to follow up personally.

We help patients from the US, UK, Canada, and Australia save 50-80% on dental treatments by connecting them with top-rated clinics in India — without compromising on quality.

Here's how we make it easy:
- Free treatment plan comparison from verified clinics
- Transparent pricing with no hidden costs  
- Full support: airport pickup, hotel booking, clinic coordination
- All partner clinics use international-standard equipment and materials

What treatment are you considering? Simply reply to this email with a few details and we'll get you a personalized quote within 24 hours.

Or chat with our AI assistant anytime:
- Website: ${SITE_URL}
- Telegram: ${BOT_URL}

Looking forward to helping you!

Best regards,
Rakesh
Founder, DentalJourneyIndia
${SITE_URL}`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🦷 Welcome to DentalJourneyIndia!</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi ${name},</p>
    <p>Thank you for reaching out! We received your inquiry and wanted to follow up personally.</p>
    <p>We help patients from the US, UK, Canada, and Australia <strong>save 50-80%</strong> on dental treatments by connecting them with top-rated clinics in India.</p>
    
    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="margin: 0 0 8px; font-weight: bold;">Here's what we offer:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Free treatment plan comparison from verified clinics</li>
        <li>Transparent pricing — no hidden costs</li>
        <li>Full support: airport pickup, hotel, clinic coordination</li>
        <li>International-standard equipment and materials</li>
      </ul>
    </div>

    <p><strong>What treatment are you considering?</strong> Reply to this email with a few details and we'll get you a personalized quote within 24 hours.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${SITE_URL}" style="background: #0ea5e9; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Visit Our Website</a>
      <span style="margin: 0 8px; color: #999;">or</span>
      <a href="${BOT_URL}" style="background: #0088cc; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">Chat on Telegram</a>
    </div>

    <p>Looking forward to helping you!</p>
    <p>Best regards,<br><strong>Rakesh</strong><br>Founder, DentalJourneyIndia</p>
  </div>
  <div style="text-align: center; padding: 12px; font-size: 12px; color: #999;">
    <p>DentalJourneyIndia — Premium Dental Care in India | <a href="${SITE_URL}" style="color: #0ea5e9;">${SITE_URL}</a></p>
    <p><a href="mailto:hello@dentaljourneyindia.org?subject=unsubscribe" style="color: #999;">Unsubscribe</a></p>
  </div>
</div>`;

  return { subject, text, html };
}

/**
 * Day 3 — Social proof + nudge
 */
function day3(lead) {
  const name = lead.name?.split(' ')[0] || 'there';
  const subject = `${name}, here's what dental care in India really looks like`;

  const text = `Hi ${name},

I wanted to share some quick facts that might help with your decision:

Why patients choose dental treatment in India:
- The same implant that costs $3,000-$5,000 in the US costs $500-$800 in India
- India has 300,000+ dentists — many trained in the US, UK, and Europe
- Clinics in our network use Straumann, Nobel Biocare, and other top brands
- Many patients combine treatment with a vacation — Hyderabad is known for incredible food and culture

The process is simpler than you'd think:
1. Tell us what treatment you need
2. We get you quotes from 2-3 verified clinics
3. You pick the best option
4. We coordinate everything — flights, hotel, clinic, follow-up

No obligations, no pressure. Just reply to this email with your treatment needs and we'll prepare a free comparison for you.

Best regards,
Rakesh
DentalJourneyIndia
${SITE_URL}`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🦷 What Dental Care in India Really Looks Like</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi ${name},</p>
    <p>I wanted to share some quick facts that might help:</p>
    
    <div style="background: #f0f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="font-weight: bold; margin: 0 0 12px;">💰 Real Cost Comparison:</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr style="background: #e0f2fe;">
          <td style="padding: 8px; font-weight: bold;">Treatment</td>
          <td style="padding: 8px; font-weight: bold;">US/UK Price</td>
          <td style="padding: 8px; font-weight: bold;">India Price</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Dental Implant</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$3,000–$5,000</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #0ea5e9; font-weight: bold;">$500–$800</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">Zirconia Crown</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">$1,000–$1,500</td>
          <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; color: #0ea5e9; font-weight: bold;">$150–$250</td>
        </tr>
        <tr>
          <td style="padding: 8px;">Full Mouth Rehab</td>
          <td style="padding: 8px;">$30,000+</td>
          <td style="padding: 8px; color: #0ea5e9; font-weight: bold;">$4,000–$8,000</td>
        </tr>
      </table>
    </div>

    <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="font-weight: bold; margin: 0 0 8px;">How it works:</p>
      <ol style="margin: 0; padding-left: 20px;">
        <li>Tell us your treatment needs</li>
        <li>We get quotes from 2-3 verified clinics</li>
        <li>You pick the best option</li>
        <li>We coordinate everything</li>
      </ol>
    </div>

    <p>No obligations. Just reply with your treatment needs and we'll prepare a <strong>free comparison</strong>.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="mailto:hello@dentaljourneyindia.org?subject=Treatment%20Quote%20Request" style="background: #0ea5e9; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Reply for Free Quote</a>
    </div>

    <p>Best regards,<br><strong>Rakesh</strong><br>DentalJourneyIndia</p>
  </div>
  <div style="text-align: center; padding: 12px; font-size: 12px; color: #999;">
    <p><a href="mailto:hello@dentaljourneyindia.org?subject=unsubscribe" style="color: #999;">Unsubscribe</a></p>
  </div>
</div>`;

  return { subject, text, html };
}

/**
 * Day 7 — Final nudge + urgency
 */
function day7(lead) {
  const name = lead.name?.split(' ')[0] || 'there';
  const subject = `Last check-in — still considering dental treatment, ${name}?`;

  const text = `Hi ${name},

This is my last follow-up — I don't want to be a bother!

I just wanted to let you know that our free quote service is always available whenever you're ready. There's no expiry and no pressure.

If you've been thinking about dental treatment abroad, here are some things our patients tell us helped them decide:
- Speaking directly with the clinic before committing
- Seeing before/after photos of actual patients
- Getting a detailed treatment plan with exact costs upfront
- Knowing they have support throughout the entire process

We offer all of this, completely free.

Whenever you're ready — whether it's today or six months from now — just reply to this email or visit ${SITE_URL}.

Wishing you the best,
Rakesh
DentalJourneyIndia`;

  const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
  <div style="background: linear-gradient(135deg, #0ea5e9, #0284c7); padding: 24px; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🦷 Still Considering Dental Treatment?</h1>
  </div>
  <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi ${name},</p>
    <p>This is my last follow-up — I don't want to be a bother!</p>
    <p>Our free quote service is always available whenever you're ready. No expiry, no pressure.</p>

    <div style="background: #fefce8; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #eab308;">
      <p style="font-weight: bold; margin: 0 0 8px;">What our patients appreciated most:</p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Speaking directly with the clinic before committing</li>
        <li>Seeing before/after photos of actual patients</li>
        <li>Getting exact costs upfront — no surprises</li>
        <li>Having support throughout the entire process</li>
      </ul>
    </div>

    <p>We offer all of this, completely free.</p>
    <p>Whenever you're ready — today or six months from now — just reply or visit our website.</p>

    <div style="text-align: center; margin: 24px 0;">
      <a href="${SITE_URL}" style="background: #0ea5e9; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Get a Free Quote</a>
    </div>

    <p>Wishing you the best,<br><strong>Rakesh</strong><br>DentalJourneyIndia</p>
  </div>
  <div style="text-align: center; padding: 12px; font-size: 12px; color: #999;">
    <p><a href="mailto:hello@dentaljourneyindia.org?subject=unsubscribe" style="color: #999;">Unsubscribe</a></p>
  </div>
</div>`;

  return { subject, text, html };
}

module.exports = { day1, day3, day7 };
