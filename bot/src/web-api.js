const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const crm = require('./crm');
const { getClinicData } = require('./data');
const { ollamaWebChat, getFallbackResponse } = require("./ai");

const app = express();
const PORT = process.env.WEB_API_PORT || 3001;

// Behind nginx — trust X-Forwarded-For for per-IP rate limiting
app.set('trust proxy', true);

// Only the website may call this API from a browser
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://dentaljourneyindia.org,https://www.dentaljourneyindia.org')
  .split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    // Allow non-browser clients (no Origin header) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    cb(null, false);
  },
}));
app.use(express.json({ limit: '16kb' }));

// --- Simple in-memory per-IP rate limiter (sliding window) ---
const rateBuckets = new Map();
function rateLimit(name, maxHits, windowMs) {
  return (req, res, next) => {
    const key = `${name}:${req.ip}`;
    const now = Date.now();
    let hits = rateBuckets.get(key) || [];
    hits = hits.filter(t => now - t < windowMs);
    if (hits.length >= maxHits) {
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }
    hits.push(now);
    rateBuckets.set(key, hits);
    next();
  };
}
// Purge stale buckets hourly
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of rateBuckets) {
    if (!hits.length || now - hits[hits.length - 1] > 60 * 60 * 1000) rateBuckets.delete(key);
  }
}, 60 * 60 * 1000);

const clip = (v, n) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

const chatSessions = new Map();

const SYSTEM_PROMPT = `You are the AI dental tourism concierge for DentalJourneyIndia. You help international patients find premium, affordable dental care in India and plan their trip.
Keep responses concise (under 200 words for chat widget). Ask smart follow-up questions to qualify leads.

YOUR KNOWLEDGE:
${getClinicData()}

LEAD QUALIFICATION — extract: Treatment needed, Country of origin, Timeline, Budget range, Name and email.
When you detect lead information, include at the end:
<!--LEAD_DATA:{"treatment":"...","country":"...","timeline":"...","budget":"...","email":"...","name":"..."}-->`;

function extractLeadData(text) {
  const match = text.match(/<!--LEAD_DATA:(.*?)-->/);
  if (match) { try { return JSON.parse(match[1]); } catch { return null; } }
  return null;
}
function cleanResponse(text) { return text.replace(/<!--LEAD_DATA:.*?-->/g, '').trim(); }

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DentalJourneyIndia Web API (Ollama)' });
});

app.post('/api/leads', rateLimit('leads', 5, 60 * 60 * 1000), async (req, res) => {
  try {
    // Honeypot: the visible form has a hidden "company" field humans never
    // fill. Bots that fill it get a fake success and no CRM record.
    if (req.body.company) {
      return res.json({ success: true, message: 'Thank you! Our AI concierge will be in touch shortly.' });
    }
    const name = clip(req.body.name, 120);
    const email = clip(req.body.email, 200);
    const phone = clip(req.body.phone, 40);
    const country = clip(req.body.country, 60);
    const treatment = clip(req.body.treatment, 80);
    const message = clip(req.body.message, 2000);
    const source = clip(req.body.source, 40) || 'website';
    if (!name && !email) return res.status(400).json({ error: 'Name or email is required' });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Website';
    const lastName = nameParts.slice(1).join(' ') || 'Lead';
    const person = await crm.createWebLead(firstName, lastName, email, phone, country, treatment, message, source);
    if (person && email && treatment) await crm.scheduleFollowups(person.id, firstName);
    res.json({ success: true, message: 'Thank you! Our AI concierge will be in touch shortly.' });
    console.log(`[WEB] Lead: ${firstName} ${lastName} (${email || 'no email'}) — ${treatment || 'general'}`);
  } catch (err) {
    console.error('[WEB] Lead error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/chat/start', rateLimit('chat-start', 10, 60 * 60 * 1000), (req, res) => {
  const sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  chatSessions.set(sessionId, { messages: [], crmPersonId: null, lastActive: Date.now() });
  res.json({ sessionId, welcome: "Hi! I'm your AI dental concierge. I can help you find affordable, premium dental care in India and plan your trip. What are you looking for?" });
});

app.post('/api/chat/message', rateLimit('chat-msg', 20, 60 * 1000), async (req, res) => {
  try {
    const sessionId = clip(req.body.sessionId, 64);
    const message = clip(req.body.message, 2000);
    if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message required' });
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = { messages: [], crmPersonId: null, lastActive: Date.now() };
      chatSessions.set(sessionId, session);
    }
    session.lastActive = Date.now();
    session.messages.push({ role: 'user', content: message });
    if (session.messages.length > 20) session.messages = session.messages.slice(-20);
    let aiText = await ollamaWebChat(SYSTEM_PROMPT, session.messages, 512);
    if (!aiText) aiText = getFallbackResponse(message);
    const leadData = extractLeadData(aiText);
    const cleaned = cleanResponse(aiText);
    session.messages.push({ role: 'assistant', content: aiText });
    if (leadData && !session.crmPersonId && (leadData.name || leadData.email)) {
      const nameParts = (leadData.name || '').split(' ');
      const person = await crm.createWebLead(nameParts[0] || 'Website', nameParts.slice(1).join(' ') || 'Chat User', leadData.email, null, leadData.country, leadData.treatment, 'Via website chat widget', 'website_chat');
      if (person) session.crmPersonId = person.id;
    } else if (leadData && session.crmPersonId) {
      await crm.updateLeadInfo(session.crmPersonId, leadData);
    }
    res.json({ reply: cleaned });
  } catch (err) {
    console.error('[WEB] Chat error:', err.message);
    res.json({ reply: "I'm having a brief moment — could you try again?" });
  }
});

// --- Unsubscribe (linked from every agent email; RFC 8058 one-click) ---
const SUPPRESSION_FILE = process.env.SUPPRESSION_FILE || path.join(__dirname, '..', 'data', 'suppression.json');

function unsubscribeToken(email) {
  const secret = process.env.UNSUB_SECRET || '';
  return crypto.createHmac('sha256', secret).update(String(email).toLowerCase().trim()).digest('hex').slice(0, 32);
}

function addToSuppressionList(email) {
  const normalized = String(email).toLowerCase().trim();
  let list = [];
  try { list = JSON.parse(fs.readFileSync(SUPPRESSION_FILE, 'utf8')); } catch { list = []; }
  if (!Array.isArray(list)) list = [];
  if (!list.includes(normalized)) {
    list.push(normalized);
    const dir = path.dirname(SUPPRESSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SUPPRESSION_FILE, JSON.stringify(list, null, 2));
  }
}

function handleUnsubscribe(req, res) {
  const email = clip(req.query.e, 200);
  const token = clip(req.query.t, 64);
  if (!email || !token || !process.env.UNSUB_SECRET || token !== unsubscribeToken(email)) {
    return res.status(400).send('<html><body style="font-family:sans-serif;text-align:center;padding:48px"><h2>Invalid unsubscribe link</h2><p>Please email hello@dentaljourneyindia.org and we will remove you manually.</p></body></html>');
  }
  try {
    addToSuppressionList(email);
    console.log(`[WEB] Unsubscribed: ${email}`);
    res.send('<html><body style="font-family:sans-serif;text-align:center;padding:48px"><h2>You\'re unsubscribed</h2><p>You will not receive further emails from DentalJourneyIndia.</p></body></html>');
  } catch (err) {
    console.error('[WEB] Unsubscribe error:', err.message);
    res.status(500).send('Something went wrong — please email hello@dentaljourneyindia.org.');
  }
}

app.get('/api/unsubscribe', rateLimit('unsub', 20, 60 * 60 * 1000), handleUnsubscribe);
// One-click unsubscribe (mail clients POST with no body semantics we need)
app.post('/api/unsubscribe', rateLimit('unsub', 20, 60 * 60 * 1000), handleUnsubscribe);

// Expire chat sessions after 1h of inactivity (was: 1h after creation,
// which cut off long conversations mid-chat)
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of chatSessions) {
    if (now - session.lastActive > 3600000) chatSessions.delete(id);
  }
}, 15 * 60 * 1000);

function startWebAPI() { app.listen(PORT, () => console.log(`[WEB API] Running on port ${PORT}`)); }
module.exports = { startWebAPI, app };
