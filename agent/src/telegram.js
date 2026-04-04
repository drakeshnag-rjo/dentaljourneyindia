const axios = require('axios');
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.ADMIN_TELEGRAM_ID;

async function sendTelegram(text, opts = {}) {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) {
    console.warn('[TELEGRAM] Missing TELEGRAM_BOT_TOKEN or ADMIN_TELEGRAM_ID');
    return { success: false, error: 'Not configured' };
  }
  const isDryRun = process.env.DRY_RUN === 'true';
  if (isDryRun) {
    console.log(`[TELEGRAM][DRY RUN] Would send to ${ADMIN_CHAT_ID}:`);
    console.log(`  ${text.substring(0, 150)}...`);
    return { success: true, dryRun: true };
  }
  try {
    const chunks = text.length <= 4000 ? [text] : text.match(/[\s\S]{1,4000}/g);
    for (const chunk of chunks) {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID, text: chunk,
        parse_mode: opts.parse_mode || 'Markdown',
        disable_web_page_preview: true,
      });
    }
    console.log(`[TELEGRAM] Message sent to ${ADMIN_CHAT_ID}`);
    return { success: true };
  } catch (err) {
    const errMsg = err.response?.data?.description || err.message;
    console.error(`[TELEGRAM] Failed:`, errMsg);
    try {
      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID, text: text.replace(/[*_`\[\]]/g, ''),
        disable_web_page_preview: true,
      });
      return { success: true };
    } catch (e) { return { success: false, error: e.message }; }
  }
}

async function verifyTelegram() {
  if (!BOT_TOKEN || !ADMIN_CHAT_ID) return false;
  try {
    const res = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    console.log(`[TELEGRAM] Bot verified: @${res.data.result.username}`);
    return true;
  } catch (err) { console.error('[TELEGRAM] Failed:', err.message); return false; }
}

module.exports = { sendTelegram, verifyTelegram };
