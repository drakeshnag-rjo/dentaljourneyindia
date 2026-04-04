const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:9b';

async function ollamaChat(systemPrompt, messages, maxTokens = 1024) {
  try {
    const ollamaMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];
    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: ollamaMessages,
        stream: false,
        options: { num_predict: maxTokens, temperature: 0.7, top_p: 0.9 }
      })
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[AI] Ollama error (${res.status}):`, errText);
      return null;
    }
    const data = await res.json();
    return data.message?.content || null;
  } catch (err) {
    console.error('[AI] Ollama request failed:', err.message);
    console.error('[AI] Is Ollama running at', OLLAMA_URL, '?');
    return null;
  }
}

function getFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase();
  if (msg.includes('implant')) {
    return '🦷 *Dental Implants in India*\n\nDental implants in India cost *$300–$800* compared to $3,000–$6,000 in the US — that\'s up to *90% savings*!\n\nWe partner with verified clinics in Hyderabad, Vijayawada & Guntur.\n\nWould you like a detailed quote? Tell me:\n• How many implants do you need?\n• Which country are you from?\n• When are you planning to travel?';
  }
  if (msg.includes('veneer')) {
    return '✨ *Porcelain Veneers in India*\n\nVeneers in India cost *$150–$400 per tooth* vs $1,000–$2,500 in the US — save up to *85%*!\n\nTell me more about what you\'re looking for and I\'ll recommend the best clinics.';
  }
  if (msg.includes('price') || msg.includes('cost') || msg.includes('how much')) {
    return '💰 *Treatment Pricing in India*\n\n• Dental Implant: *$300–$800* (vs $3,000–$6,000 US)\n• Porcelain Veneer: *$150–$400* (vs $1,000–$2,500 US)\n• Root Canal + Crown: *$100–$300* (vs $1,500–$3,000 US)\n• Full Mouth Rehab: *$3,000–$8,000* (vs $25,000–$50,000 US)\n\nWhich treatment interests you?';
  }
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('start')) {
    return '👋 Welcome to *DentalJourneyIndia*!\n\nI help international patients find premium dental care in India at a fraction of the cost.\n\n🇮🇳 Save up to *70-90%* on treatments\n🏥 Verified clinics in top cities\n✈️ Tourism planning included\n\nWhat treatment are you interested in?';
  }
  return 'Thanks for your message! I\'d love to help you explore dental care options in India.\n\nCould you tell me:\n• What dental treatment are you looking for?\n• Which country are you from?\n• When are you planning to travel?\n\nThis helps me give you the best recommendations! 🦷';
}

async function checkOllamaHealth() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models?.map(m => m.name) || [];
      console.log(`[AI] Ollama connected at ${OLLAMA_URL}`);
      console.log(`[AI] Available models: ${models.join(', ')}`);
      if (!models.some(m => m.includes(OLLAMA_MODEL.split(':')[0]))) {
        console.warn(`[AI] WARNING: Model "${OLLAMA_MODEL}" not found. Available: ${models.join(', ')}`);
        console.warn(`[AI] Run: ollama pull ${OLLAMA_MODEL}`);
      }
      return true;
    }
    return false;
  } catch (err) {
    console.error(`[AI] Cannot reach Ollama at ${OLLAMA_URL}: ${err.message}`);
    console.error('[AI] Make sure Ollama is running and OLLAMA_HOST=0.0.0.0 is set.');
    return false;
  }
}

module.exports = { ollamaChat, getFallbackResponse, checkOllamaHealth, OLLAMA_URL, OLLAMA_MODEL };
