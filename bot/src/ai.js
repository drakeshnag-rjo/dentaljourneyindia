const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';
const OLLAMA_WEB_MODEL = process.env.OLLAMA_WEB_MODEL || 'qwen3:1.7b';

async function ollamaChatWithModel(model, systemPrompt, messages, maxTokens) {
  try {
    var ollamaMessages = [{ role: 'system', content: systemPrompt }].concat(messages);
    var res = await fetch(OLLAMA_URL + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: model, messages: ollamaMessages, stream: false, options: { num_predict: maxTokens, temperature: 0.7, top_p: 0.9 } })
    });
    if (!res.ok) { console.error('[AI] Ollama error (' + res.status + '):', await res.text()); return null; }
    var content = data.message && data.message.content ? data.message.content : null;
    if (content) { content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim(); } return content;
  } catch (err) {
    console.error('[AI] Ollama request failed:', err.message);
    return null;
  }
}

async function ollamaChat(systemPrompt, messages, maxTokens) {
  return ollamaChatWithModel(OLLAMA_MODEL, systemPrompt, messages, maxTokens || 1024);
}

async function ollamaWebChat(systemPrompt, messages, maxTokens) {
  return ollamaChatWithModel(OLLAMA_WEB_MODEL, systemPrompt, messages, maxTokens || 512);
}

function getFallbackResponse(userMessage) {
  var msg = userMessage.toLowerCase();
  if (msg.includes('implant')) {
    return 'Dental Implants in India\n\nDental implants in India cost $300-$800 compared to $3,000-$6,000 in the US - up to 90% savings!\n\nWe partner with verified clinics in Hyderabad, Vijayawada and Guntur.\n\nWould you like a detailed quote? Tell me:\n- How many implants do you need?\n- Which country are you from?\n- When are you planning to travel?';
  }
  if (msg.includes('veneer')) {
    return 'Porcelain Veneers in India\n\nVeneers in India cost $150-$400 per tooth vs $1,000-$2,500 in the US - save up to 85%!\n\nTell me more about what you are looking for and I will recommend the best clinics.';
  }
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    return 'Treatment Pricing in India\n\n- Dental Implant: $300-$800 (vs $3,000-$6,000 US)\n- Porcelain Veneer: $150-$400 (vs $1,000-$2,500 US)\n- Root Canal + Crown: $100-$300 (vs $1,500-$3,000 US)\n- Full Mouth Rehab: $3,000-$8,000 (vs $25,000-$50,000 US)\n\nWhich treatment interests you?';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return 'Welcome to DentalJourneyIndia!\n\nI help international patients find premium dental care in India at a fraction of the cost.\n\nSave up to 70-90% on treatments\nVerified clinics in top cities\nTourism planning included\n\nWhat treatment are you interested in?';
  }
  return 'Thanks for your message! I would love to help you explore dental care options in India.\n\nCould you tell me:\n- What dental treatment are you looking for?\n- Which country are you from?\n- When are you planning to travel?';
}

async function checkOllamaHealth() {
  try {
    var res = await fetch(OLLAMA_URL + '/api/tags');
    if (res.ok) {
      var data = await res.json();
      var models = data.models ? data.models.map(function(m) { return m.name; }) : [];
      console.log('[AI] Ollama connected at ' + OLLAMA_URL);
      console.log('[AI] Available models: ' + models.join(', '));
      console.log('[AI] Telegram model: ' + OLLAMA_MODEL);
      console.log('[AI] Web chat model: ' + OLLAMA_WEB_MODEL + ' (fast)');
      return true;
    }
    return false;
  } catch (err) {
    console.error('[AI] Cannot reach Ollama at ' + OLLAMA_URL + ': ' + err.message);
    return false;
  }
}

module.exports = { ollamaChat: ollamaChat, ollamaWebChat: ollamaWebChat, getFallbackResponse: getFallbackResponse, checkOllamaHealth: checkOllamaHealth, OLLAMA_URL: OLLAMA_URL, OLLAMA_MODEL: OLLAMA_MODEL };
