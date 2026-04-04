/**
 * Clinic database for automated outreach
 * Source: outreach/OUTREACH_KIT.md (18 clinics)
 * 
 * NOTE: Update emails once you confirm real clinic email addresses.
 * Currently uses placeholder emails — replace before enabling auto-outreach.
 */

const clinics = [
  // === HYDERABAD (8 clinics) ===
  {
    id: 'hyd-1',
    name: 'FMS Dental',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null, // TODO: Add real email
    phone: null, // Add from OUTREACH_KIT.md
    rating: 4.8,
    priority: 'HIGH',
    specialties: ['implants', 'cosmetic', 'full-mouth'],
    outreachStatus: 'not_started', // not_started | day1_sent | day3_sent | day7_sent | responded | declined
    lastOutreachDate: null,
  },
  {
    id: 'hyd-2',
    name: 'Partha Dental',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.7,
    priority: 'HIGH',
    specialties: ['implants', 'orthodontics', 'cosmetic'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-3',
    name: 'Smiline Dental Hospitals',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.6,
    priority: 'HIGH',
    specialties: ['implants', 'cosmetic', 'pediatric'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-4',
    name: 'Clove Dental',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.5,
    priority: 'MEDIUM',
    specialties: ['general', 'implants', 'orthodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-5',
    name: 'Apollo Dental Clinic',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.5,
    priority: 'HIGH',
    specialties: ['implants', 'cosmetic', 'oral-surgery'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-6',
    name: 'Dental and Cosmetic Zone',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.6,
    priority: 'MEDIUM',
    specialties: ['cosmetic', 'veneers', 'whitening'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-7',
    name: 'Sri Balaji Dental Hospital',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.4,
    priority: 'MEDIUM',
    specialties: ['general', 'implants', 'endodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'hyd-8',
    name: 'Hyderabad Smiles',
    city: 'Hyderabad',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.5,
    priority: 'MEDIUM',
    specialties: ['cosmetic', 'orthodontics', 'implants'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },

  // === VIJAYAWADA (5 clinics) ===
  {
    id: 'vjw-1',
    name: 'Raju Dental Care',
    city: 'Vijayawada',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.7,
    priority: 'HIGH',
    specialties: ['implants', 'cosmetic', 'general'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'vjw-2',
    name: 'Smile Dental Clinic',
    city: 'Vijayawada',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.5,
    priority: 'MEDIUM',
    specialties: ['general', 'orthodontics', 'endodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'vjw-3',
    name: 'Dr. Reddy\'s Dental Clinic',
    city: 'Vijayawada',
    doctorName: 'Dr. Reddy',
    email: null,
    phone: null,
    rating: 4.6,
    priority: 'MEDIUM',
    specialties: ['implants', 'cosmetic', 'prosthodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'vjw-4',
    name: 'Pearl Dental Hospital',
    city: 'Vijayawada',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.4,
    priority: 'MEDIUM',
    specialties: ['general', 'pediatric', 'oral-surgery'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'vjw-5',
    name: 'Vijayawada Dental Centre',
    city: 'Vijayawada',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.3,
    priority: 'LOW',
    specialties: ['general', 'endodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },

  // === GUNTUR (5 clinics) ===
  {
    id: 'gnt-1',
    name: 'Sri Sai Dental Clinic',
    city: 'Guntur',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.6,
    priority: 'HIGH',
    specialties: ['implants', 'cosmetic', 'general'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'gnt-2',
    name: 'Guntur Dental Hospital',
    city: 'Guntur',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.5,
    priority: 'MEDIUM',
    specialties: ['general', 'implants', 'orthodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'gnt-3',
    name: 'Bright Smile Dental',
    city: 'Guntur',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.4,
    priority: 'MEDIUM',
    specialties: ['cosmetic', 'whitening', 'veneers'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'gnt-4',
    name: 'Dr. Krishna\'s Dental Care',
    city: 'Guntur',
    doctorName: 'Dr. Krishna',
    email: null,
    phone: null,
    rating: 4.3,
    priority: 'LOW',
    specialties: ['general', 'endodontics', 'pediatric'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
  {
    id: 'gnt-5',
    name: 'Guntur Smiles',
    city: 'Guntur',
    doctorName: 'Doctor',
    email: null,
    phone: null,
    rating: 4.2,
    priority: 'LOW',
    specialties: ['general', 'orthodontics'],
    outreachStatus: 'not_started',
    lastOutreachDate: null,
  },
];

/**
 * Get clinics ready for outreach (have email, not yet completed sequence)
 */
function getClinicsForOutreach() {
  return clinics.filter(c => {
    if (!c.email) return false; // No email = can't outreach
    if (c.outreachStatus === 'responded' || c.outreachStatus === 'declined') return false;
    if (c.outreachStatus === 'day7_sent') return false; // Sequence complete
    return true;
  });
}

/**
 * Get next outreach step for a clinic
 */
function getNextOutreachStep(clinic) {
  const now = new Date();
  const lastDate = clinic.lastOutreachDate ? new Date(clinic.lastOutreachDate) : null;
  const daysSinceLast = lastDate ? Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)) : null;

  switch (clinic.outreachStatus) {
    case 'not_started':
      return 'day1';
    case 'day1_sent':
      return daysSinceLast >= 2 ? 'day3' : null; // Wait 2+ days
    case 'day3_sent':
      return daysSinceLast >= 3 ? 'day7' : null; // Wait 3+ days
    default:
      return null;
  }
}

/**
 * Update clinic outreach status (in-memory — persists via file rewrite in production)
 */
function updateClinicStatus(clinicId, status) {
  const clinic = clinics.find(c => c.id === clinicId);
  if (clinic) {
    clinic.outreachStatus = status;
    clinic.lastOutreachDate = new Date().toISOString();
  }
}

/**
 * Get outreach summary stats
 */
function getOutreachStats() {
  return {
    total: clinics.length,
    withEmail: clinics.filter(c => c.email).length,
    notStarted: clinics.filter(c => c.outreachStatus === 'not_started').length,
    inProgress: clinics.filter(c => ['day1_sent', 'day3_sent'].includes(c.outreachStatus)).length,
    completed: clinics.filter(c => c.outreachStatus === 'day7_sent').length,
    responded: clinics.filter(c => c.outreachStatus === 'responded').length,
  };
}

module.exports = { clinics, getClinicsForOutreach, getNextOutreachStep, updateClinicStatus, getOutreachStats };
