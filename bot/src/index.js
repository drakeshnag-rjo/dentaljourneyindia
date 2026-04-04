require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const Database = require('better-sqlite3');
const path = require('path');
const crm = require('./crm');
const { getClinicData } = require('./data');
const { ollamaChat, getFallbackResponse, checkOllamaHealth, OLLAMA_MODEL } = require('./ai');

const required = ['TELEGRAM_BOT_TOKEN', 'TWENTY_API_KEY'];
for (const key of required) {
  if (!process.env[key]) { console.error(`Missing: ${key}`); process.exit(1); }
}

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const db = new Database(path.join(__dirname, '..', 'data', 'bot.db'));
db.pragma('journal_mode = WAL');

db.exec(`CREATE TABLE IF NOT EXISTS conversations (
  telegram_id TEXT PRIMARY KEY, messages TEXT DEFAULT '[]', messages_count INTEGER DEFAULT 0,
  crm_person_id TEXT, first_name TEXT, last_name TEXT, username TEXT,
  country TEXT, treatment TEXT, timeline TEXT, lead_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`);

const SYSTEM_PROMPT = `You are the AI dental tourism concierge for DentalJourneyIndia. You help international patients find premium, affordable dental care in India and plan their trip.

YOUR PERSONALITY:
- Warm, professional, and knowledgeable
- Like a helpful friend who is an expert in dental tourism
- Ask smart follow-up questions to qualify leads
- Proactively suggest tourism experiences alongside dental treatment
- Keep responses concise for Telegram (under 300 words)

YOUR KNOWLEDGE (use for accurate recommendations):
${getClinicData()}

KEY BEHAVIORS:
1. Understand their needs: treatment, country, timeline
2. Provide India vs home country pricing to show savings
3. Recommend 1-2 specific clinics based on needs
4. Suggest tourism activities around treatment city
5. If ready to proceed, ask for email
6. Never make up pricing — use only the data above
7. Format for Telegram: bold (*text*), bullet points, emojis
8. If asked about non-dental topics, gently redirect

LEAD QUALIFICATION — extract and remember:
- Treatment needed
- Country of origin
- Timeline
- Budget range
- Email address

When you detect any above info, include at the very end:
<!--LEAD_DATA:{"treatment":"...","country":"...","timeline":"...","budget":"...","email":"..."}-->
Only include fields that were mentioned. This block will be hidden from the user.`;

async function getAIResponse(telegramId, userMessage) {
  const row = db.prepare('SELECT messages FROM conversations WHERE telegram_id = ?').get(telegramId);
  let messages = [];
  try { messages = JSON.parse(row?.messages || '[]'); } catch { messages = []; }
  messages.push({ role: 'user', content: userMessage });
  if (messages.length > 20) messages = messages.slice(-20);
  const aiText = await ollamaChat(SYSTEM_PROMPT, messages);
  const response = aiText || getFallbackResponse(userMessage);
  messages.push({ role: 'assistant', content: response });
  db.prepare('UPDATE conversations SET messages = ?, messages_count = messages_count + 1, updated_at = CURRENT_TIMESTAMP WHERE telegram_id = ?')
    .run(JSON.stringify(messages), telegramId);
  return response;
}

function extractLeadData(r) {
  const m = r.match(/<!--LEAD_DATA:(.*?)-->/);
  if (m) { try { return JSON.parse(m[1]); } catch { return null; } }
  return null;
}
function cleanResponse(r) { return r.replace(/<!--LEAD_DATA:.*?-->/g, '').trim(); }

async function sendResponse(ctx, text, buttons) {
  const opts = { parse_mode: 'Markdown' };
  if (buttons) opts.reply_markup = buttons.reply_markup;
  if (text.length > 4000) {
    const parts = text.match(/.{1,4000}/gs);
    for (let i = 0; i < parts.length; i++) {
      if (i === parts.length - 1 && buttons) await ctx.reply(parts[i], opts);
      else await ctx.reply(parts[i], { parse_mode: 'Markdown' });
    }
  } else {
    try { await ctx.reply(text, opts); }
    catch { await ctx.reply(text.replace(/[*_`\[\]]/g, ''), buttons ? { reply_markup: buttons.reply_markup } : {}); }
  }
}

async function processLeadData(telegramId, leadData, crmPersonId) {
  if (!leadData || !crmPersonId) return;
  try {
    await crm.updateLeadInfo(crmPersonId, leadData);
    const updates = [], params = [];
    if (leadData.country) { updates.push('country = ?'); params.push(leadData.country); }
    if (leadData.treatment) { updates.push('treatment = ?'); params.push(leadData.treatment); }
    if (leadData.timeline) { updates.push('timeline = ?'); params.push(leadData.timeline); }
    if (updates.length > 0) { params.push(telegramId); db.prepare(`UPDATE conversations SET ${updates.join(', ')} WHERE telegram_id = ?`).run(...params); }
    let score = 0;
    if (leadData.treatment) score += 25;
    if (leadData.country) score += 15;
    if (leadData.timeline) score += 25;
    if (leadData.email) score += 35;
    if (score > 0) db.prepare('UPDATE conversations SET lead_score = MAX(lead_score, ?) WHERE telegram_id = ?').run(score, telegramId);
    if (score >= 50) {
      const conv = db.prepare('SELECT first_name FROM conversations WHERE telegram_id = ?').get(telegramId);
      await crm.scheduleFollowups(crmPersonId, conv?.first_name || 'Patient');
    }
    console.log(`[LEAD] Updated ${telegramId}: score=${score}`, leadData);
  } catch (err) { console.error('[LEAD] Error:', err.message); }
}

bot.start(async (ctx) => {
  const tid = String(ctx.from.id), fn = ctx.from.first_name || '', ln = ctx.from.last_name || '', un = ctx.from.username || '';
  const person = await crm.getOrCreatePerson(tid, fn, ln, un);
  db.prepare('INSERT OR REPLACE INTO conversations (telegram_id, first_name, last_name, username, crm_person_id, messages, messages_count) VALUES (?, ?, ?, ?, ?, \'[]\', 0)')
    .run(tid, fn, ln, un, person?.id || null);
  await sendResponse(ctx, `👋 Welcome${fn ? ` ${fn}` : ''}! I'm your *AI Dental Concierge*.\n\nI help international patients get *premium dental care in India* at a fraction of the cost — and plan an amazing trip around it.\n\n🇮🇳 Save up to *70-90%* on dental treatments\n🏥 *Verified clinics* in Hyderabad, Vijayawada & Guntur\n✈️ *Tourism itineraries* built around your treatment\n🤖 *24/7 AI support* — I'm always here\n\nHow can I help you today?`,
    Markup.inlineKeyboard([
      [Markup.button.callback('💰 Get a Treatment Quote', 'action_quote')],
      [Markup.button.callback('🏥 Compare Clinics', 'action_compare')],
      [Markup.button.callback('✈️ Plan My Dental Trip', 'action_trip')],
      [Markup.button.callback('❓ Ask a Question', 'action_question')]
    ]));
  console.log(`[BOT] /start from ${fn} (@${un}) | CRM: ${person?.id}`);
});

const actionPrompts = {
  action_quote: "I'd like to get a treatment quote. What are the prices for dental treatments in India?",
  action_compare: "I want to compare dental clinics in India. Show me the top-rated ones.",
  action_trip: "I'm interested in planning a dental trip to India with tourism. Help me plan!",
  action_question: "I have some questions about getting dental work done in India."
};
Object.entries(actionPrompts).forEach(([action, prompt]) => {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery(); const tid = String(ctx.from.id); await ctx.sendChatAction('typing');
    const r = await getAIResponse(tid, prompt); await sendResponse(ctx, cleanResponse(r));
    const conv = db.prepare('SELECT crm_person_id FROM conversations WHERE telegram_id = ?').get(tid);
    const ld = extractLeadData(r); if (ld && conv?.crm_person_id) processLeadData(tid, ld, conv.crm_person_id);
  });
});

bot.action('show_treatments', async (ctx) => {
  await ctx.answerCbQuery();
  await sendResponse(ctx, 'What treatment are you interested in?', Markup.inlineKeyboard([
    [Markup.button.callback('🦷 Dental Implants', 'treat_implants')],
    [Markup.button.callback('✨ Porcelain Veneers', 'treat_veneers')],
    [Markup.button.callback('👑 Crowns & Root Canal', 'treat_rootcanal')],
    [Markup.button.callback('😁 Full Mouth / Smile Design', 'treat_fullmouth')],
    [Markup.button.callback('🤔 Not sure — help me decide', 'treat_unsure')]
  ]));
});

const treatmentPrompts = {
  treat_implants: "I need dental implants. Show me options and pricing compared to my country.",
  treat_veneers: "I'm interested in porcelain veneers for a smile makeover.",
  treat_rootcanal: "I need a root canal or dental crown. What does it cost in India?",
  treat_fullmouth: "I'm looking for full mouth rehabilitation or smile design.",
  treat_unsure: "I'm not sure what treatment I need. Can you help me figure it out?"
};
Object.entries(treatmentPrompts).forEach(([action, prompt]) => {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery(); const tid = String(ctx.from.id); await ctx.sendChatAction('typing');
    const r = await getAIResponse(tid, prompt);
    await sendResponse(ctx, cleanResponse(r), Markup.inlineKeyboard([
      [Markup.button.callback('🇺🇸 USA', 'country_us'), Markup.button.callback('🇬🇧 UK', 'country_uk')],
      [Markup.button.callback('🇨🇦 Canada', 'country_ca'), Markup.button.callback('🇦🇺 Australia', 'country_au')],
      [Markup.button.callback('🌍 Other Country', 'country_other')]
    ]));
    const conv = db.prepare('SELECT crm_person_id FROM conversations WHERE telegram_id = ?').get(tid);
    const ld = extractLeadData(r); if (ld && conv?.crm_person_id) processLeadData(tid, ld, conv.crm_person_id);
  });
});

const countries = { country_us: 'USA', country_uk: 'UK', country_ca: 'Canada', country_au: 'Australia', country_other: 'another country' };
Object.entries(countries).forEach(([action, country]) => {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery(); const tid = String(ctx.from.id); await ctx.sendChatAction('typing');
    db.prepare('UPDATE conversations SET country = ? WHERE telegram_id = ?').run(country, tid);
    const r = await getAIResponse(tid, `I'm from ${country}. Show me a pricing comparison — how much I'd save in India vs ${country}.`);
    await sendResponse(ctx, cleanResponse(r), Markup.inlineKeyboard([
      [Markup.button.callback('📅 Within 1 month', 'time_1month')], [Markup.button.callback('📅 1-3 months', 'time_3months')],
      [Markup.button.callback('📅 3-6 months', 'time_6months')], [Markup.button.callback('🔍 Just exploring', 'time_exploring')]
    ]));
    const conv = db.prepare('SELECT crm_person_id FROM conversations WHERE telegram_id = ?').get(tid);
    const ld = extractLeadData(r); if (ld && conv?.crm_person_id) processLeadData(tid, ld, conv.crm_person_id);
  });
});

const timelines = { time_1month: 'Within 1 month', time_3months: '1-3 months', time_6months: '3-6 months', time_exploring: 'Just exploring' };
Object.entries(timelines).forEach(([action, timeline]) => {
  bot.action(action, async (ctx) => {
    await ctx.answerCbQuery(); const tid = String(ctx.from.id); await ctx.sendChatAction('typing');
    db.prepare('UPDATE conversations SET timeline = ? WHERE telegram_id = ?').run(timeline, tid);
    const r = await getAIResponse(tid, `My timeline is: ${timeline}. What would you recommend as next steps?`);
    await sendResponse(ctx, cleanResponse(r));
    const conv = db.prepare('SELECT crm_person_id FROM conversations WHERE telegram_id = ?').get(tid);
    const ld = extractLeadData(r); if (ld && conv?.crm_person_id) processLeadData(tid, ld, conv.crm_person_id);
  });
});

bot.on('text', async (ctx) => {
  const tid = String(ctx.from.id), msg = ctx.message.text;
  const fn = ctx.from.first_name || '', ln = ctx.from.last_name || '', un = ctx.from.username || '';
  let conv = db.prepare('SELECT * FROM conversations WHERE telegram_id = ?').get(tid);
  if (!conv) {
    const person = await crm.getOrCreatePerson(tid, fn, ln, un);
    db.prepare('INSERT INTO conversations (telegram_id, first_name, last_name, username, crm_person_id) VALUES (?, ?, ?, ?, ?)').run(tid, fn, ln, un, person?.id || null);
    conv = db.prepare('SELECT * FROM conversations WHERE telegram_id = ?').get(tid);
  }
  await ctx.sendChatAction('typing');
  const r = await getAIResponse(tid, msg); await sendResponse(ctx, cleanResponse(r));
  const ld = extractLeadData(r); if (ld && conv.crm_person_id) processLeadData(tid, ld, conv.crm_person_id);
  if (conv.messages_count > 0 && conv.messages_count % 10 === 0 && conv.crm_person_id) {
    const summary = await ollamaChat('Summarize conversations concisely for a CRM note.',
      [{ role: 'user', content: `Summarize in 3-4 bullet points. Focus on: treatment interest, timeline, country, readiness.\n\n${conv.messages}` }], 300);
    if (summary) await crm.logConversationSummary(conv.crm_person_id, summary);
  }
});

bot.catch((err, ctx) => { console.error(`[BOT] Error for ${ctx.updateType}:`, err.message); });
process.once('SIGINT', () => { bot.stop('SIGINT'); db.close(); });
process.once('SIGTERM', () => { bot.stop('SIGTERM'); db.close(); });

async function start() {
  const fs = require('fs');
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  await checkOllamaHealth();
  const { startWebAPI } = require('./web-api');
  startWebAPI();
  console.log(`\n╔══════════════════════════════════════════╗\n║   DentalJourneyIndia Bot v2.0            ║\n║   AI: Ollama (${OLLAMA_MODEL})            ║\n║   CRM: Twenty CRM                       ║\n║   Web API: port ${process.env.WEB_API_PORT || 3001}                       ║\n║   API Cost: $0                           ║\n╚══════════════════════════════════════════╝\n`);
  await bot.launch();
  console.log('[BOT] Telegram bot running!');
  console.log('[WEB] Website lead API running!');
}
start();
