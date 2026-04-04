const express = require('express');
const cors = require('cors');
const crm = require('./crm');
const { getClinicData } = require('./data');
const { ollamaChat, getFallbackResponse } = require('./ai');

const app = express();
const PORT = process.env.WEB_API_PORT || 3001;

app.use(cors());
app.use(express.json());

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

app.post('/api/leads', async (req, res) => {
  try {
    const { name, email, phone, country, treatment, message, source } = req.body;
    if (!name && !email) return res.status(400).json({ error: 'Name or email is required' });
    const nameParts = (name || '').trim().split(' ');
    const firstName = nameParts[0] || 'Website';
    const lastName = nameParts.slice(1).join(' ') || 'Lead';
    const person = await crm.createWebLead(firstName, lastName, email, phone, country, treatment, message, source || 'website');
    if (person && email && treatment) await crm.scheduleFollowups(person.id, firstName);
    res.json({ success: true, message: 'Thank you! Our AI concierge will be in touch shortly.' });
    console.log(`[WEB] Lead: ${firstName} ${lastName} (${email || 'no email'}) — ${treatment || 'general'}`);
  } catch (err) {
    console.error('[WEB] Lead error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

app.post('/api/chat/start', (req, res) => {
  const sessionId = 'web_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  chatSessions.set(sessionId, { messages: [], crmPersonId: null, created: Date.now() });
  res.json({ sessionId, welcome: "Hi! I'm your AI dental concierge. I can help you find affordable, premium dental care in India and plan your trip. What are you looking for?" });
});

app.post('/api/chat/message', async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message required' });
    let session = chatSessions.get(sessionId);
    if (!session) {
      session = { messages: [], crmPersonId: null, created: Date.now() };
      chatSessions.set(sessionId, session);
    }
    session.messages.push({ role: 'user', content: message });
    if (session.messages.length > 20) session.messages = session.messages.slice(-20);
    let aiText = await ollamaChat(SYSTEM_PROMPT, session.messages, 512);
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

setInterval(() => {
  const now = Date.now();
  for (const [id, session] of chatSessions) {
    if (now - session.created > 3600000) chatSessions.delete(id);
  }
}, 3600000);

function startWebAPI() { app.listen(PORT, () => console.log(`[WEB API] Running on port ${PORT}`)); }
module.exports = { startWebAPI, app };
