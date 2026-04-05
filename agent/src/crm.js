/**
 * Twenty CRM integration — fetch leads, update status, add notes
 *
 * Twenty CRM API quirks handled here:
 *  - Uses /rest/ endpoints (not /api/objects/)
 *  - POST returns data directly (not nested in data.createPerson)
 *  - Notes use bodyV2.markdown (not body)
 *  - Linking: noteTargets with personId
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
    const res = await axios.get(`${BASE_URL}/rest/people?limit=200`, { headers: headers() });
    // /rest/ returns { data: [...] } or just [...]
    const records = res.data?.data?.people || res.data?.data || [];
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
 */
async function getLeadsForFollowUp() {
  const people = await getAllPeople(true);
  const now = new Date();

  return people
    .filter(p => {
      const email = p.emails?.primaryEmail;
      if (!email) return false;

      const job = (p.jobTitle || '').toLowerCase();
      if (job.includes('clinic:') || job.includes('dentist') || job.includes('doctor')) return false;

      return true;
    })
    .map(p => {
      const createdAt = new Date(p.createdAt);
      const daysSinceCreated = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

      return {
        id: p.id,
        name: `${p.name?.firstName || ''} ${p.name?.lastName || ''}`.trim() || 'Unknown',
        email: p.emails?.primaryEmail,
        phone: p.phones?.primaryPhoneNumber || null,
        source: p.jobTitle || 'unknown',
        city: p.city || null,
        createdAt: p.createdAt,
        daysSinceCreated,
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
  return null;
}

/**
 * Get notes for a person (to check if follow-up already sent)
 */
async function getNotesForPerson(personId) {
  try {
    const res = await axios.get(`${BASE_URL}/rest/notes?limit=50`, { headers: headers() });
    const allNotes = res.data?.data?.notes || res.data?.data || [];
    // Filter in memory by checking note targets
    return allNotes.filter(n => {
      const targets = n.noteTargets || [];
      return targets.some(t => t.personId === personId || t.targetPersonId === personId);
    });
  } catch (err) {
    console.error(`[CRM] Failed to fetch notes for ${personId}:`, err.message);
    return [];
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
    // Step 1: Create the note
    const res = await axios.post(`${BASE_URL}/rest/notes`, {
      bodyV2: { markdown },
    }, { headers: headers() });
    const noteId = res.data?.data?.createNote?.id || res.data?.id;
    // Step 2: Link note to person via noteTargets
    await axios.post(`${BASE_URL}/rest/noteTargets`, {
      noteId: noteId,
      targetPerson: { connect: { id: personId } },
    }, { headers: headers() });
    console.log(`[CRM] Note created and linked to ${personId}`);
    return { id: noteId };
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
    const res = await axios.post(`${BASE_URL}/rest/tasks`, {
      title,
      status: 'TODO',
      dueAt: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      taskTargets: [{ personId }],
    }, { headers: headers() });
    const task = res.data?.data || res.data;
    return task;
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
