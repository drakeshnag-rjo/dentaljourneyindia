const clinics = [
  { id: 1, name: 'Hyderabad Smiles Dental Clinic', city: 'Hyderabad', rating: 4.8, specialties: ['Implants', 'Veneers', 'Smile Design', 'Full Mouth Rehab'], priceRange: 'Premium', languages: ['English', 'Hindi', 'Telugu'], accreditation: 'NABH Accredited', yearsEstablished: 15, highlights: 'State-of-the-art facility with 3D imaging and CAD/CAM technology' },
  { id: 2, name: 'Apollo Dental Centre', city: 'Hyderabad', rating: 4.7, specialties: ['Implants', 'Root Canal', 'Crowns', 'Orthodontics'], priceRange: 'Premium', languages: ['English', 'Hindi', 'Telugu', 'Arabic'], accreditation: 'JCI Accredited', yearsEstablished: 25, highlights: 'Part of Apollo Hospitals network, international patient department' },
  { id: 3, name: 'Vijayawada Dental Hospital', city: 'Vijayawada', rating: 4.6, specialties: ['Implants', 'Veneers', 'Root Canal', 'Extractions'], priceRange: 'Mid-range', languages: ['English', 'Hindi', 'Telugu'], accreditation: 'ISO Certified', yearsEstablished: 12, highlights: 'Best value for money in Andhra Pradesh, modern equipment' },
  { id: 4, name: 'Guntur Advanced Dental Care', city: 'Guntur', rating: 4.5, specialties: ['Implants', 'Crowns', 'Bridges', 'Dentures'], priceRange: 'Budget-friendly', languages: ['English', 'Hindi', 'Telugu'], accreditation: 'ISO Certified', yearsEstablished: 8, highlights: 'Most affordable option with experienced implant specialists' },
  { id: 5, name: 'Clove Dental', city: 'Hyderabad', rating: 4.5, specialties: ['Implants', 'Veneers', 'Aligners', 'Root Canal', 'Smile Design'], priceRange: 'Mid-range', languages: ['English', 'Hindi', 'Telugu'], accreditation: 'NABH Accredited', yearsEstablished: 10, highlights: 'India\'s largest dental chain, standardized quality protocols' }
];

const treatments = {
  'Dental Implant (single)': { india: '$300-$800', us: '$3,000-$6,000', uk: '$2,500-$4,500', canada: '$3,000-$5,500', australia: '$3,500-$6,500', savings: '80-90%' },
  'Porcelain Veneer (per tooth)': { india: '$150-$400', us: '$1,000-$2,500', uk: '$800-$1,500', canada: '$1,000-$2,000', australia: '$1,200-$2,500', savings: '75-85%' },
  'Root Canal + Crown': { india: '$100-$300', us: '$1,500-$3,000', uk: '$1,000-$2,000', canada: '$1,200-$2,500', australia: '$1,500-$3,000', savings: '80-90%' },
  'Full Mouth Rehab': { india: '$3,000-$8,000', us: '$25,000-$50,000', uk: '$20,000-$40,000', canada: '$22,000-$45,000', australia: '$25,000-$50,000', savings: '85-90%' },
  'Smile Design (8 veneers)': { india: '$1,200-$3,000', us: '$8,000-$20,000', uk: '$6,000-$12,000', canada: '$8,000-$16,000', australia: '$9,000-$20,000', savings: '80-85%' },
  'Teeth Whitening': { india: '$80-$200', us: '$500-$1,000', uk: '$400-$800', canada: '$500-$900', australia: '$500-$1,000', savings: '75-80%' },
  'Dental Crown (Zirconia)': { india: '$80-$200', us: '$800-$1,500', uk: '$600-$1,200', canada: '$800-$1,400', australia: '$900-$1,500', savings: '85-90%' },
  'All-on-4 Implants': { india: '$2,500-$5,000', us: '$20,000-$30,000', uk: '$15,000-$25,000', canada: '$18,000-$28,000', australia: '$20,000-$30,000', savings: '85-90%' }
};

const tourism = {
  'Hyderabad': [
    { name: 'Charminar', type: 'Historical', description: 'Iconic 16th-century monument and mosque' },
    { name: 'Golconda Fort', type: 'Historical', description: 'Medieval fort with acoustic marvels and panoramic views' },
    { name: 'Ramoji Film City', type: 'Entertainment', description: 'World\'s largest film studio complex with theme parks' },
    { name: 'Hussain Sagar Lake', type: 'Leisure', description: 'Beautiful lake with a giant Buddha statue, boating available' },
    { name: 'Birla Mandir', type: 'Spiritual', description: 'Stunning white marble temple on a hilltop' }
  ],
  'Vijayawada': [
    { name: 'Kanaka Durga Temple', type: 'Spiritual', description: 'Ancient hilltop temple with stunning river views' },
    { name: 'Prakasam Barrage', type: 'Scenic', description: 'Picturesque dam across the Krishna River' },
    { name: 'Undavalli Caves', type: 'Historical', description: '4th-century rock-cut cave temples with monolithic Buddha' },
    { name: 'Bhavani Island', type: 'Leisure', description: 'River island with gardens, water sports, and resorts' }
  ],
  'Guntur': [
    { name: 'Amaravati', type: 'Historical', description: 'Ancient Buddhist site and upcoming capital city of AP' },
    { name: 'Kondaveedu Fort', type: 'Historical', description: '14th-century hilltop fort with trekking trails' },
    { name: 'Nagarjuna Sagar Dam', type: 'Scenic', description: 'World\'s tallest masonry dam with Buddhist island museum' },
    { name: 'Mangalagiri', type: 'Spiritual', description: 'Sacred temple town with the Panakala Narasimha Swamy temple' }
  ]
};

function getClinicData() { return JSON.stringify({ clinics, treatments, tourism }, null, 2); }
function getClinicsForCity(city) { return clinics.filter(c => c.city.toLowerCase() === city.toLowerCase()); }
function getTreatmentPricing(treatment) {
  const key = Object.keys(treatments).find(k => k.toLowerCase().includes(treatment.toLowerCase()));
  return key ? { name: key, ...treatments[key] } : null;
}

module.exports = { clinics, treatments, tourism, getClinicData, getClinicsForCity, getTreatmentPricing };
