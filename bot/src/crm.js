const TWENTY_URL = process.env.TWENTY_CRM_URL || 'http://localhost:3000';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${TWENTY_API_KEY}`
};

async function twentyRequest(method, endpoint, body = null) {
  try {
    const options = { method, headers };
    if (body) options.body = JSON.stringify(body);
    const res = await fetch(`${TWENTY_URL}/rest/${endpoint}`, options);
    if (!res.ok) {
      const errText = await res.text();
      console.error(`[CRM] ${method} ${endpoint} failed (${res.status}):`, errText);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error(`[CRM] Request error (${method} ${endpoint}):`, err.message);
    return null;
  }
}

function extractRecord(response) {
  if (!response?.data) return null;
  const d = response.data;
  if (d.id) return d;
  const keys = Object.keys(d);
  for (const key of keys) {
    if (typeof d[key] === 'object' && d[key]?.id) return d[key];
  }
  return null;
}

// Simple in-memory cache: telegramId -> crmPersonId
const personCache = new Map();

async function findPersonByTelegramId(telegramId) {
  // Check local cache only — Twenty filter is unreliable
  if (personCache.has(telegramId)) {
    return { id: personCache.get(telegramId) };
  }
  return null;
}

async function createPerson(telegramId, firstName, lastName, username) {
  const response = await twentyRequest('POST', 'people', {
    name: { firstName: firstName || username || 'Telegram', lastName: lastName || 'User' },
    jobTitle: `tg:${telegramId}`,
    city: username ? `@${username}` : '',
  });
  const person = extractRecord(response);
  if (person) {
    personCache.set(telegramId, person.id);
    console.log(`[CRM] Created person: ${person.id} (${firstName || username})`);
    await createNote(person.id,
      `Lead captured via Telegram Bot\nTelegram ID: ${telegramId}\nUsername: @${username || 'N/A'}\nSource: Telegram Bot\nFirst contact: ${new Date().toISOString()}`
    );
  } else {
    console.error('[CRM] Failed to create person. Response:', JSON.stringify(response));
  }
  return person;
}

async function updatePerson(personId, updates) {
  const response = await twentyRequest('PATCH', `people/${personId}`, updates);
  return extractRecord(response);
}

async function createNote(personId, body) {
  const response = await twentyRequest('POST', 'notes', {
    title: `Bot Conversation - ${new Date().toLocaleDateString()}`,
    bodyV2: { markdown: body }
  });
  const note = extractRecord(response);
  if (note) {
    await twentyRequest('POST', 'noteTargets', { noteId: note.id, targetPersonId: personId });
    console.log(`[CRM] Note created for person ${personId}`);
  }
  return note;
}

async function createTask(personId, title, dueDate) {
  const response = await twentyRequest('POST', 'tasks', {
    title: title, dueAt: dueDate, status: 'TODO'
  });
  const task = extractRecord(response);
  if (task) {
    await twentyRequest('POST', 'taskTargets', { taskId: task.id, targetPersonId: personId });
    console.log(`[CRM] Task created for person ${personId}: ${title}`);
  }
  return task;
}

async function getOrCreatePerson(telegramId, firstName, lastName, username) {
  let person = await findPersonByTelegramId(telegramId);
  if (!person) person = await createPerson(telegramId, firstName, lastName, username);
  return person;
}

async function logConversationSummary(personId, summary) {
  await createNote(personId, `Conversation Summary\n\n${summary}`);
}

async function updateLeadInfo(personId, info) {
  const updates = {};
  if (info.email) updates.emails = { primaryEmail: info.email, additionalEmails: null };
  if (Object.keys(updates).length > 0) await updatePerson(personId, updates);
  const details = [];
  if (info.treatment) details.push(`Treatment: ${info.treatment}`);
  if (info.country) details.push(`Country: ${info.country}`);
  if (info.timeline) details.push(`Timeline: ${info.timeline}`);
  if (info.budget) details.push(`Budget: ${info.budget}`);
  if (details.length > 0) await createNote(personId, `AI-Extracted Lead Details\n\n${details.join('\n')}`);
}

async function scheduleFollowups(personId, patientName) {
  const now = new Date();
  const day1 = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await createTask(personId, `Follow up with ${patientName} - Day 1`, day1.toISOString());
  const day3 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  await createTask(personId, `Follow up with ${patientName} - Day 3`, day3.toISOString());
  const day7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await createTask(personId, `Follow up with ${patientName} - Day 7`, day7.toISOString());
}

async function createWebLead(firstName, lastName, email, phone, country, treatment, message, source) {
  const personPayload = {
    name: { firstName: firstName || 'Website', lastName: lastName || 'Lead' },
    jobTitle: `web:${Date.now()}`,
  };
  if (email) personPayload.emails = { primaryEmail: email, additionalEmails: null };
  if (country) personPayload.city = country;
  const response = await twentyRequest('POST', 'people', personPayload);
  const person = extractRecord(response);
  if (person) {
    console.log(`[CRM] Web lead created: ${person.id} (${firstName} - ${source})`);
    const noteLines = [
      `Lead captured from: ${source}`,
      `Name: ${firstName} ${lastName}`,
      email ? `Email: ${email}` : null,
      phone ? `Phone: ${phone}` : null,
      country ? `Country: ${country}` : null,
      treatment ? `Treatment: ${treatment}` : null,
      message ? `Message: ${message}` : null,
      `Captured: ${new Date().toISOString()}`
    ].filter(Boolean);
    await createNote(person.id, noteLines.join('\n'));
  }
  return person;
}

module.exports = { findPersonByTelegramId, createPerson, updatePerson, createNote, createTask, getOrCreatePerson, logConversationSummary, updateLeadInfo, scheduleFollowups, createWebLead };
