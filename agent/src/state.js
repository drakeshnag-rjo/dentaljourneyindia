/**
 * Persistent JSON state for the agent — survives restarts.
 *
 * Tracks:
 *  - sentFollowups: { [personId]: { day1: iso, day3: iso, day7: iso } }
 *  - clinicStatus:  { [clinicId]: { status, lastOutreachDate } }
 *
 * File: agent/data/state.json (override with STATE_FILE env).
 */
const fs = require('fs');
const path = require('path');

const STATE_FILE = process.env.STATE_FILE || path.join(__dirname, '..', 'data', 'state.json');

let state = null;

function load() {
  if (state) return state;
  try {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    state = {};
  }
  if (!state.sentFollowups) state.sentFollowups = {};
  if (!state.clinicStatus) state.clinicStatus = {};
  return state;
}

function save() {
  if (!state) return;
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state, null, 2));
  fs.renameSync(tmp, STATE_FILE);
}

function wasFollowUpSent(personId, stage) {
  const s = load();
  return Boolean(s.sentFollowups[personId] && s.sentFollowups[personId][stage]);
}

function recordFollowUpSent(personId, stage) {
  const s = load();
  if (!s.sentFollowups[personId]) s.sentFollowups[personId] = {};
  s.sentFollowups[personId][stage] = new Date().toISOString();
  save();
}

function getClinicState(clinicId) {
  const s = load();
  return s.clinicStatus[clinicId] || null;
}

function setClinicState(clinicId, status, lastOutreachDate) {
  const s = load();
  s.clinicStatus[clinicId] = { status, lastOutreachDate };
  save();
}

module.exports = { load, save, wasFollowUpSent, recordFollowUpSent, getClinicState, setClinicState, STATE_FILE };
