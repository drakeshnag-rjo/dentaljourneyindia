/**
 * Twenty CRM integration — fetch leads, update status, add notes
 * 
 * Twenty CRM API quirks handled here:
 *  - POST returns data.createPerson / data.createNote
 *  - Notes use bodyV2.markdown (not body)
 *  - Linking: targetPersonId (not personId)
 *  - Filter API unreliable: using in-memory fetch + filter
 *  - Telegram ID stored in jobTitle as "tg:TELEGRAM_ID"
 */
const axios = require('axios');

const BASE_URL = process.env.CRM_BASE_URL || 'http://192.168.1.217:3000';
const API_TOKEN = process.env.CRM_API_TOKEN;

const headers = () => ({
  Authorization: `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
});

// In-memory cache (refreshed each agent cycle)
let personCache = [];
let lastCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 min

/**
 * Fetch all people from CRM (with caching)
 */
async function getAllPeople(forceRefresh = false) {
  if (!forceRefresh && personCache.length && Date.now() - lastCacheTime < CACHE_TTL) {
    return personCache;
  }

  try {
    const res = await axios.get(`${BASE_URL}/api/objects/people?limit=200`, { headers: headers() });
    const records = res.data?.data?.people || [];
    personCache = records;
    lastCacheTime = Date.now();
    console.log(`[CRM] Fetched ${records.length} people`);
    return records;
  } catch (err) {
    console.error('[CRM] Failed to fetch people:', err.message);
    return personCache; // Return stale cache on error
  }
}

/**
 * Get leads that need email follow-ups
 * A "lead" is a person with an email and a non-empty source (website_form, telegram, chat_widget)
 * 
 * Returns leads with computed follow-up stage based on creation date
 */
async function getLeadsForFollowUp() {
  const people = await getAllPeople(true);
  const now = new Date();

  return people
    .filter(p => {
      // Must have an email
      const email = p.emails?.primaryEmail;
      if (!email) return false;

      // Check jobTitle for source or any indicator they're a lead
      // Exclude clinic contacts (we handle those separately)
      const job = (p.jobTitle || '').toLowerCase();
      if (job.includes('clinic:') || job.includes('dentist') || job.includes('doctor')) return false;

      return true;
    })
    .map(p => {
      const createdAt = new Date(p.createdAt);
      const daysSinceCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

      // Determine follow-up stage
      // Stage tracking via CRM notes (we'll check notes to avoid re-sending)
      return {
        id: p.id,
        name: `${p.name?.firstName || ''} ${p.name?.lastName || ''}`.trim() || 'Unknown',
        email: p.emails?.primaryEmail,
        phone: p.phones?.primaryPhoneNumber || null,
        source: p.jobTitle || 'unknown',
        city: p.city || null,
        createdAt: p.createdAt,
        daysSinceCreated,
        // Follow-up schedule: Day 1, Day 3, Day 7
        followUpDue: daysSinceCreated >= 0 ? getNextFollowUp(daysSinceCreated) : null,
      };
    })
    .filter(l => l.followUpDue !== null);
}

/**
 * Determine next follow-up based on days since lead created
 */
function getNextFollowUp(days) {
  if (days >= 0 && days < 1) return 'day1';
  if (days >= 2 && days < 4) return 'day3';
  if (days >= 6 && days < 8) return 'day7';
  return null; // Outside follow-up windows
}

/**
 * Get notes for a person (to check if follow-up already sent)
 */
async function getNotesForPerson(personId) {
  try {
    const res = await axios.get(
      `${BASE_URL}/api/objects/notes?filter={"noteTargets":{"personId":{"eq":"${personId}"}}}`,
      { headers: headers() }
    );
    return res.data?.data?.notes || [];
  } catch (err) {
    // Filter API unreliable — try fetching all notes
    try {
      const res = await axios.get(`${BASE_URL}/api/objects/notes?limit=50`, { headers: headers() });
      const allNotes = res.data?.data?.notes || [];
      // Filter in memory by checking note targets
      return allNotes.filter(n => {
        const targets = n.noteTargets || [];
        return targets.some(t => t.personId === personId);
      });
    } catch (err2) {
      console.error(`[CRM] Failed to fetch notes for ${personId}:`, err2.message);
      return [];
    }
  }
}

/**
 * Check if a specific follow-up has already been sent
 */
async function wasFollowUpSent(personId, stage) {
  const notes = await getNotesForPerson(personId);
  const marker = `[agent:followup:${stage}]`;
  return notes.some(n => {
    const body = n.bodyV2?.markdown || n.body || '';
    return body.includes(marker);
  });
}

/**
 * Add a note to a person (used to track sent follow-ups)
 */
async function addNote(personId, markdown) {
  try {
    const res = await axios.post(`${BASE_URL}/api/objects/notes`, {
      bodyV2: { markdown },
      noteTargets: [{ personId }],
    }, { headers: headers() });
    return res.data?.data?.createNote || res.data;
  } catch (err) {
    console.error(`[CRM] Failed to add note for ${personId}:`, err.message);
    return null;
  }
}

/**
 * Create a task for a person
 */
async function createTask(personId, title, dueDate) {
  try {
    const res = await axios.post(`${BASE_URL}/api/objects/tasks`, {
      title,
      status: 'TODO',
      dueAt: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      taskTargets: [{ personId }],
    }, { headers: headers() });
    return res.data?.data?.createTask || res.data;
  } catch (err) {
    console.error(`[CRM] Failed to create task for ${personId}:`, err.message);
    return null;
  }
}

/**
 * Get recent leads (created in last N days) for daily digest
 */
async function getRecentLeads(days = 1) {
  const people = await getAllPeople(true);
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return people.filter(p => new Date(p.createdAt) >= cutoff);
}

/**
 * Get lead count and basic stats
 */
async function getLeadStats() {
  const people = await getAllPeople();
  const now = new Date();

  const totalLeads = people.length;
  const withEmail = people.filter(p => p.emails?.primaryEmail).length;
  const last24h = people.filter(p => (now - new Date(p.createdAt)) < 24 * 60 * 60 * 1000).length;
  const last7d = people.filter(p => (now - new Date(p.createdAt)) < 7 * 24 * 60 * 60 * 1000).length;

  return { totalLeads, withEmail, last24h, last7d };
}

module.exports = {
  getAllPeople,
  getLeadsForFollowUp,
  wasFollowUpSent,
  addNote,
  createTask,
  getRecentLeads,
  getLeadStats,
};
