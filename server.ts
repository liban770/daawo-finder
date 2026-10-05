import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// --- IN-MEMORY DATABASE & SEED DATA ---

interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'pharmacy';
  pharmacyId?: string;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

interface Medicine {
  id: string;
  slug: string;
  name: string;
  genericName: string;
  brandNames: string[];
  categorySlug: string;
  prescriptionRequired: boolean;
  dosage: string;
  indications: string;
  sideEffects: string;
  forms: string[];
  storage: string;
  tags: string[];
}

interface Pharmacy {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  hours: string;
  verified: boolean;
  latitude: number;
  longitude: number;
  rating: number;
  reviewCount: number;
  managerUsername: string;
}

interface StockItem {
  id: string;
  pharmacyId: string;
  medicineSlug: string;
  quantity: number;
  priceUSD: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  prescriptionRequired: boolean;
  lastUpdated: string;
  batchNumber?: string;
  expiryDate?: string;
}

interface Review {
  id: string;
  medicineSlug: string;
  username: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface StockWatch {
  id: string;
  medicineSlug: string;
  email: string;
  username?: string;
  pharmacyId?: string;
  notified: boolean;
  createdAt: string;
}

// Initial Data
const users: User[] = [
  { id: 'usr-admin', username: 'admin', passwordHash: 'admin12345', name: 'System Administrator', email: 'admin@daawofinder.so', role: 'admin' },
  { id: 'usr-demo', username: 'demo', passwordHash: 'demo12345', name: 'Liban Mohamed', email: 'demo@daawofinder.so', role: 'user' },
  { id: 'usr-ph1', username: 'pharmacy1', passwordHash: 'pharmacy12345', name: 'Dr. Ahmed (Hodan Central)', email: 'hodan@daawofinder.so', role: 'pharmacy', pharmacyId: 'pharma-1' },
  { id: 'usr-ph2', username: 'pharmacy2', passwordHash: 'pharmacy12345', name: 'Dr. Fatima (Banadir Care)', email: 'banadir@daawofinder.so', role: 'pharmacy', pharmacyId: 'pharma-2' },
  { id: 'usr-ph3', username: 'pharmacy3', passwordHash: 'pharmacy12345', name: 'Shafi Dispensary Team', email: 'shafi@daawofinder.so', role: 'pharmacy', pharmacyId: 'pharma-3' },
];

const categories: Category[] = [
  { id: 'cat-1', slug: 'pain-relief', name: 'Pain Relief & Analgesics', description: 'Pain management, fever reduction, and anti-inflammatory medicines', icon: 'Pill' },
  { id: 'cat-2', slug: 'antibiotics', name: 'Antibiotics & Antimicrobials', description: 'Bacterial infection treatments; prescription strictly enforced', icon: 'ShieldAlert' },
  { id: 'cat-3', slug: 'cold-flu', name: 'Cold, Flu & Respiratory', description: 'Decongestants, inhalers, cough remedies and allergy relief', icon: 'Wind' },
  { id: 'cat-4', slug: 'chronic-care', name: 'Cardiovascular & Chronic Care', description: 'Blood pressure, diabetic, cardiac and long-term care medications', icon: 'HeartPulse' },
  { id: 'cat-5', slug: 'digestive', name: 'Digestive & Gastrointestinal', description: 'Antacids, acid reducers, rehydration salts, anti-diarrheal care', icon: 'Activity' },
  { id: 'cat-6', slug: 'vitamins', name: 'Vitamins & Nutritional Care', description: 'Essential micronutrients, immune support supplements, and minerals', icon: 'Sparkles' },
  { id: 'cat-7', slug: 'first-aid', name: 'First Aid & Antiseptics', description: 'Antiseptics, disinfectant solutions, bandages and wound care', icon: 'Cross' },
];

const medicines: Medicine[] = [
  {
    id: 'med-1',
    slug: 'paracetamol-500mg',
    name: 'Paracetamol 500mg',
    genericName: 'Acetaminophen / Paracetamol',
    brandNames: ['Panadol', 'Calpol', 'Tylenol'],
    categorySlug: 'pain-relief',
    prescriptionRequired: false,
    dosage: '500mg to 1000mg every 4 to 6 hours as needed (maximum 4000mg in 24 hours)',
    indications: 'Relief of mild-to-moderate pain including headaches, muscle ache, toothache, and reduction of fever.',
    sideEffects: 'Generally very well tolerated. Severe liver injury can occur if maximum dosage is exceeded or combined with alcohol.',
    forms: ['Film-coated Tablets', 'Effervescent Tablets', 'Oral Suspension (Syrup)'],
    storage: 'Store below 25°C in a dry place protected from light.',
    tags: ['pain', 'fever', 'headache', 'otc', 'panadol']
  },
  {
    id: 'med-2',
    slug: 'amoxicillin-500mg',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    brandNames: ['Amoxil', 'Trimox', 'Moxatag'],
    categorySlug: 'antibiotics',
    prescriptionRequired: true,
    dosage: '500mg three times daily (every 8 hours) or 875mg twice daily for 7-10 days.',
    indications: 'Bacterial infections of the ear, nose, throat, lower respiratory tract, urinary tract, and skin.',
    sideEffects: 'Nausea, diarrhea, stomach cramps, skin rash. Do not use if allergic to Penicillin class drugs.',
    forms: ['Capsules', 'Oral Suspension (Pediatric drops)'],
    storage: 'Keep tightly closed at room temperature.',
    tags: ['antibiotic', 'infection', 'throat', 'chest', 'prescription']
  },
  {
    id: 'med-3',
    slug: 'ibuprofen-400mg',
    name: 'Ibuprofen 400mg',
    genericName: 'Ibuprofen (NSAID)',
    brandNames: ['Brufen', 'Advil', 'Motrin'],
    categorySlug: 'pain-relief',
    prescriptionRequired: false,
    dosage: '400mg every 6 to 8 hours with meals or a full glass of milk/water.',
    indications: 'Inflammation, joint pain, menstrual cramps, dental pain, backache, and soft tissue injuries.',
    sideEffects: 'Dyspepsia, heartburn, nausea. Caution in individuals with peptic ulcers or renal impairment.',
    forms: ['Coated Tablets', 'Softgel Liquid Capsules', 'Topical Gel'],
    storage: 'Store between 15°C and 30°C.',
    tags: ['pain', 'anti-inflammatory', 'joint', 'brufen', 'headache']
  },
  {
    id: 'med-4',
    slug: 'metformin-500mg',
    name: 'Metformin 500mg',
    genericName: 'Metformin Hydrochloride',
    brandNames: ['Glucophage', 'Diabex'],
    categorySlug: 'chronic-care',
    prescriptionRequired: true,
    dosage: '500mg once or twice daily with meals, gradually titrated by physician.',
    indications: 'Type 2 Diabetes Mellitus glycemic management, especially in overweight individuals.',
    sideEffects: 'Abdominal discomfort, diarrhea, metallic taste. Lactic acidosis in rare renal compromised cases.',
    forms: ['Immediate Release Tablets', 'Extended Release (XR) Tablets'],
    storage: 'Store at 20°C - 25°C away from moisture.',
    tags: ['diabetes', 'chronic', 'glucose', 'glucophage', 'prescription']
  },
  {
    id: 'med-5',
    slug: 'amlodipine-5mg',
    name: 'Amlodipine 5mg',
    genericName: 'Amlodipine Besylate',
    brandNames: ['Norvasc', 'Amlovas'],
    categorySlug: 'chronic-care',
    prescriptionRequired: true,
    dosage: '5mg once daily at the same time every day, may be increased to 10mg.',
    indications: 'Essential hypertension (high blood pressure) and coronary artery disease / chronic stable angina.',
    sideEffects: 'Peripheral edema (ankle swelling), headache, facial flushing, lightheadedness.',
    forms: ['Tablets'],
    storage: 'Store in dry container protected from direct sunlight.',
    tags: ['blood pressure', 'hypertension', 'heart', 'cardiac', 'prescription']
  },
  {
    id: 'med-6',
    slug: 'cetirizine-10mg',
    name: 'Cetirizine 10mg',
    genericName: 'Cetirizine Dihydrochloride',
    brandNames: ['Zyrtec', 'Cetrine'],
    categorySlug: 'cold-flu',
    prescriptionRequired: false,
    dosage: '10mg once daily, preferably taken in the evening.',
    indications: 'Allergic rhinitis, hay fever, sneezing, itching eyes, urticaria (hives), and allergic skin reactions.',
    sideEffects: 'Mild drowsiness, dry mouth, headache, fatigue.',
    forms: ['Film-coated Tablets', 'Oral Drops (Pediatric)'],
    storage: 'Store at room temperature below 25°C.',
    tags: ['allergy', 'antihistamine', 'sneezing', 'rash', 'otc']
  },
  {
    id: 'med-7',
    slug: 'omeprazole-20mg',
    name: 'Omeprazole 20mg',
    genericName: 'Omeprazole (PPI)',
    brandNames: ['Losec', 'Prilosec', 'Omez'],
    categorySlug: 'digestive',
    prescriptionRequired: false,
    dosage: '20mg once daily taken 30-60 minutes before breakfast on an empty stomach.',
    indications: 'Gastroesophageal reflux disease (GERD), acid reflux, heartburn, gastric & duodenal ulcers.',
    sideEffects: 'Headache, stomach pain, flatulence, nausea.',
    forms: ['Delayed-Release Capsules', 'Tablets'],
    storage: 'Store tightly sealed with desiccant cap.',
    tags: ['acid reflux', 'heartburn', 'stomach', 'ulcer', 'digestive']
  },
  {
    id: 'med-8',
    slug: 'ors-sachets',
    name: 'Oral Rehydration Salts (ORS)',
    genericName: 'Sodium Chloride, Trisodium Citrate, Potassium Chloride, Anhydrous Glucose',
    brandNames: ['WHO ORS Formula', 'Hydralyte'],
    categorySlug: 'digestive',
    prescriptionRequired: false,
    dosage: 'Reconstitute 1 packet in exactly 1 liter of safe drinking water; sip continuously.',
    indications: 'Dehydration and electrolyte depletion resulting from acute diarrhea, vomiting, or excessive perspiration.',
    sideEffects: 'Extremely safe. Ensure accurate water dilution volume to prevent salt imbalance.',
    forms: ['Powder Sachets (20.5g/sachet)'],
    storage: 'Store packets in a dry place. Discard prepared solution after 24 hours.',
    tags: ['dehydration', 'diarrhea', 'electrolytes', 'first-aid', 'otc']
  },
  {
    id: 'med-9',
    slug: 'azithromycin-500mg',
    name: 'Azithromycin 500mg',
    genericName: 'Azithromycin Dihydrate',
    brandNames: ['Zithromax', 'Azyth'],
    categorySlug: 'antibiotics',
    prescriptionRequired: true,
    dosage: '500mg once daily for 3 consecutive days, or 500mg on day 1 followed by 250mg on days 2-5.',
    indications: 'Community-acquired pneumonia, acute bacterial sinusitis, tonsillitis, urethritis, and skin infections.',
    sideEffects: 'Gastrointestinal upset, diarrhea, nausea, transient alteration in taste.',
    forms: ['Film-coated Tablets', 'Oral Suspension'],
    storage: 'Store at 15°C - 30°C.',
    tags: ['antibiotic', 'chest infection', 'sinus', 'prescription']
  },
  {
    id: 'med-10',
    slug: 'multivitamin-zinc',
    name: 'Multivitamin Complex + Zinc',
    genericName: 'Vitamin A, C, D3, E, B-Complex + Zinc Gluconate',
    brandNames: ['Supradyn', 'Pharmaton', 'Vitabiotics'],
    categorySlug: 'vitamins',
    prescriptionRequired: false,
    dosage: '1 tablet daily with a main meal.',
    indications: 'Micronutrient supplementation, immune system optimization, general vitality and convalescence.',
    sideEffects: 'Harmless bright yellow urine due to Vitamin B2 (Riboflavin).',
    forms: ['Effervescent Tablets', 'Softgels', 'Chewable Tablets'],
    storage: 'Keep tube closed tightly in cool dark place.',
    tags: ['vitamins', 'immune', 'zinc', 'energy', 'otc']
  },
  {
    id: 'med-11',
    slug: 'salbutamol-inhaler',
    name: 'Salbutamol Inhaler 100mcg',
    genericName: 'Salbutamol / Albuterol Sulfate',
    brandNames: ['Ventolin Inhaler', 'Asthalin'],
    categorySlug: 'cold-flu',
    prescriptionRequired: true,
    dosage: '1 to 2 inhalations as required for acute bronchospasm; maximum 8 puffs/day unless directed.',
    indications: 'Rapid relief of acute bronchospasm in asthma, chronic bronchitis, and exercise-induced wheeze.',
    sideEffects: 'Fine tremor of hands, palpitation, mild tachycardia, headache.',
    forms: ['Pressurised Metered-Dose Inhaler (200 actuations)'],
    storage: 'Store canister away from direct heat and sunlight. Do not puncture.',
    tags: ['asthma', 'inhaler', 'ventolin', 'respiratory', 'prescription']
  },
  {
    id: 'med-12',
    slug: 'povidone-iodine-10',
    name: 'Povidone-Iodine 10% Solution',
    genericName: 'Povidone-Iodine Antiseptic',
    brandNames: ['Betadine', 'Wokadine'],
    categorySlug: 'first-aid',
    prescriptionRequired: false,
    dosage: 'Apply directly to affected clean wound area once or twice daily.',
    indications: 'Topical skin disinfection, treatment of minor cuts, abrasions, burns, and surgical site prep.',
    sideEffects: 'Rare skin hypersensitivity. Do not use in large quantities over extensive burns.',
    forms: ['Topical Liquid Solution (100ml / 500ml)'],
    storage: 'Store upright below 30°C.',
    tags: ['antiseptic', 'wound', 'cuts', 'betadine', 'first-aid']
  }
];

const pharmacies: Pharmacy[] = [
  {
    id: 'pharma-1',
    name: 'Hodan Central Pharmacy',
    city: 'Mogadishu',
    district: 'Hodan',
    address: 'KM4 Maka Al-Mukarama Street, Near Digfeer Specialist Hospital',
    phone: '+252 61 5123456',
    email: 'hodan@daawofinder.so',
    hours: 'Open 24 Hours / 7 Days',
    verified: true,
    latitude: 2.0371,
    longitude: 45.3182,
    rating: 4.8,
    reviewCount: 128,
    managerUsername: 'pharmacy1'
  },
  {
    id: 'pharma-2',
    name: 'Banadir Healthcare Pharmacy',
    city: 'Mogadishu',
    district: 'Waberi',
    address: 'Airport Road, Opposite Peace Park & KM5 Gate',
    phone: '+252 61 5889900',
    email: 'banadir@daawofinder.so',
    hours: 'Daily 7:00 AM – 11:30 PM',
    verified: true,
    latitude: 2.0295,
    longitude: 45.3289,
    rating: 4.7,
    reviewCount: 94,
    managerUsername: 'pharmacy2'
  },
  {
    id: 'pharma-3',
    name: 'Shafi Community Dispensary',
    city: 'Mogadishu',
    district: 'Howlwadaag',
    address: 'Bakara Commercial Hub, North Avenue Gate 2',
    phone: '+252 61 5771122',
    email: 'shafi@daawofinder.so',
    hours: 'Daily 8:00 AM – 10:00 PM',
    verified: true,
    latitude: 2.0462,
    longitude: 45.3225,
    rating: 4.5,
    reviewCount: 61,
    managerUsername: 'pharmacy3'
  },
  {
    id: 'pharma-4',
    name: 'Al-Raxma Specialized Pharmacy',
    city: 'Hargeisa',
    district: 'Downtown',
    address: 'Independence Way, Near Hargeisa Group Hospital',
    phone: '+252 63 4455667',
    email: 'raxma@daawofinder.so',
    hours: 'Open 24 Hours / 7 Days',
    verified: true,
    latitude: 9.5624,
    longitude: 44.0650,
    rating: 4.9,
    reviewCount: 156,
    managerUsername: 'pharmacy4'
  },
  {
    id: 'pharma-5',
    name: 'Barwaaqo Health & Care Pharmacy',
    city: 'Garowe',
    district: 'Central Commercial',
    address: 'Garowe Airport Highway, Peace Plaza Block B',
    phone: '+252 90 7712345',
    email: 'barwaaqo@daawofinder.so',
    hours: 'Daily 7:30 AM – 11:00 PM',
    verified: true,
    latitude: 8.4064,
    longitude: 48.4845,
    rating: 4.6,
    reviewCount: 42,
    managerUsername: 'pharmacy5'
  }
];

const stocks: StockItem[] = [
  // Hodan Central
  { id: 'stk-1', pharmacyId: 'pharma-1', medicineSlug: 'paracetamol-500mg', quantity: 240, priceUSD: 1.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-2', pharmacyId: 'pharma-1', medicineSlug: 'amoxicillin-500mg', quantity: 85, priceUSD: 4.20, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-3', pharmacyId: 'pharma-1', medicineSlug: 'ibuprofen-400mg', quantity: 130, priceUSD: 2.00, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-4', pharmacyId: 'pharma-1', medicineSlug: 'omeprazole-20mg', quantity: 70, priceUSD: 3.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-5', pharmacyId: 'pharma-1', medicineSlug: 'salbutamol-inhaler', quantity: 14, priceUSD: 6.50, status: 'low_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-6', pharmacyId: 'pharma-1', medicineSlug: 'multivitamin-zinc', quantity: 95, priceUSD: 5.00, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-7', pharmacyId: 'pharma-1', medicineSlug: 'ors-sachets', quantity: 450, priceUSD: 0.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },

  // Banadir Care
  { id: 'stk-8', pharmacyId: 'pharma-2', medicineSlug: 'paracetamol-500mg', quantity: 180, priceUSD: 1.40, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-9', pharmacyId: 'pharma-2', medicineSlug: 'amoxicillin-500mg', quantity: 8, priceUSD: 4.50, status: 'low_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-10', pharmacyId: 'pharma-2', medicineSlug: 'metformin-500mg', quantity: 110, priceUSD: 3.80, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-11', pharmacyId: 'pharma-2', medicineSlug: 'amlodipine-5mg', quantity: 65, priceUSD: 3.20, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-12', pharmacyId: 'pharma-2', medicineSlug: 'cetirizine-10mg', quantity: 90, priceUSD: 2.20, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-13', pharmacyId: 'pharma-2', medicineSlug: 'azithromycin-500mg', quantity: 0, priceUSD: 6.00, status: 'out_of_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },

  // Shafi Dispensary
  { id: 'stk-14', pharmacyId: 'pharma-3', medicineSlug: 'paracetamol-500mg', quantity: 300, priceUSD: 1.25, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-15', pharmacyId: 'pharma-3', medicineSlug: 'ibuprofen-400mg', quantity: 5, priceUSD: 1.80, status: 'low_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-16', pharmacyId: 'pharma-3', medicineSlug: 'ors-sachets', quantity: 600, priceUSD: 0.40, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-17', pharmacyId: 'pharma-3', medicineSlug: 'povidone-iodine-10', quantity: 45, priceUSD: 2.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },

  // Al-Raxma (Hargeisa)
  { id: 'stk-18', pharmacyId: 'pharma-4', medicineSlug: 'paracetamol-500mg', quantity: 200, priceUSD: 1.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-19', pharmacyId: 'pharma-4', medicineSlug: 'amoxicillin-500mg', quantity: 70, priceUSD: 4.00, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-20', pharmacyId: 'pharma-4', medicineSlug: 'metformin-500mg', quantity: 95, priceUSD: 3.50, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-21', pharmacyId: 'pharma-4', medicineSlug: 'amlodipine-5mg', quantity: 80, priceUSD: 3.00, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-22', pharmacyId: 'pharma-4', medicineSlug: 'salbutamol-inhaler', quantity: 25, priceUSD: 6.00, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },

  // Barwaaqo (Garowe)
  { id: 'stk-23', pharmacyId: 'pharma-5', medicineSlug: 'paracetamol-500mg', quantity: 150, priceUSD: 1.60, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-24', pharmacyId: 'pharma-5', medicineSlug: 'cetirizine-10mg', quantity: 50, priceUSD: 2.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
  { id: 'stk-25', pharmacyId: 'pharma-5', medicineSlug: 'azithromycin-500mg', quantity: 30, priceUSD: 6.50, status: 'in_stock', prescriptionRequired: true, lastUpdated: new Date().toISOString() },
  { id: 'stk-26', pharmacyId: 'pharma-5', medicineSlug: 'multivitamin-zinc', quantity: 60, priceUSD: 5.50, status: 'in_stock', prescriptionRequired: false, lastUpdated: new Date().toISOString() },
];

const favorites: Record<string, string[]> = {
  'usr-demo': ['paracetamol-500mg', 'salbutamol-inhaler']
};

const stockWatches: StockWatch[] = [
  { id: 'wtch-1', medicineSlug: 'azithromycin-500mg', email: 'demo@daawofinder.so', username: 'demo', pharmacyId: 'pharma-2', notified: false, createdAt: new Date(Date.now() - 86400000).toISOString() }
];

const reviews: Review[] = [
  { id: 'rev-1', medicineSlug: 'paracetamol-500mg', username: 'demo', name: 'Liban M.', rating: 5, comment: 'Worked quickly for high fever and body ache. Hodan Pharmacy had it ready in 5 minutes.', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: 'rev-2', medicineSlug: 'salbutamol-inhaler', username: 'demo', name: 'Liban M.', rating: 5, comment: 'Crucial inhaler, genuine Ventolin batch. Very happy to locate stock via Daawo Finder.', createdAt: new Date(Date.now() - 86400000).toISOString() }
];

// Helper: Token generation & mock JWT validation
const generateToken = (user: User) => {
  const payload = {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    pharmacyId: user.pharmacyId,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    (req as any).user = decoded;
  } catch (err) {
    // invalid token, proceed without user
  }
  next();
};

app.use(authMiddleware);

// --- REST API ENDPOINTS ---

// Auth: Login / Token (SimpleJWT compatible)
app.post(['/api/auth/token', '/api/auth/token/'], (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ detail: 'Username and password are required' });
  }

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ detail: 'No active account found with the given credentials' });
  }

  const access = generateToken(user);
  res.json({
    access,
    refresh: access,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      pharmacyId: user.pharmacyId
    }
  });
});

// Auth: Register Regular User
app.post(['/api/auth/register', '/api/auth/register/'], (req: Request, res: Response) => {
  const { username, password, name, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ detail: 'Username, password, and email are required' });
  }

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ detail: 'A user with that username already exists.' });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    username,
    passwordHash: password,
    name: name || username,
    email,
    role: 'user'
  };
  users.push(newUser);

  const token = generateToken(newUser);
  res.status(201).json({
    access: token,
    refresh: token,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }
  });
});

// Auth: Register Pharmacy
app.post(['/api/auth/register-pharmacy', '/api/auth/register-pharmacy/'], (req: Request, res: Response) => {
  const { username, password, pharmacyName, email, city, district, address, phone } = req.body;
  if (!username || !password || !pharmacyName || !phone) {
    return res.status(400).json({ detail: 'Required pharmacy fields are missing.' });
  }

  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    return res.status(400).json({ detail: 'Username is already taken.' });
  }

  const newPharmaId = `pharma-${Date.now()}`;
  const newPharma: Pharmacy = {
    id: newPharmaId,
    name: pharmacyName,
    city: city || 'Mogadishu',
    district: district || 'Central',
    address: address || 'Main Commercial Road',
    phone,
    email: email || `${username}@daawofinder.so`,
    hours: '8:00 AM - 10:00 PM',
    verified: true,
    latitude: 2.0400 + (Math.random() - 0.5) * 0.02,
    longitude: 45.3200 + (Math.random() - 0.5) * 0.02,
    rating: 5.0,
    reviewCount: 0,
    managerUsername: username
  };
  pharmacies.push(newPharma);

  const newUser: User = {
    id: `usr-${Date.now()}`,
    username,
    passwordHash: password,
    name: pharmacyName,
    email: email || `${username}@daawofinder.so`,
    role: 'pharmacy',
    pharmacyId: newPharmaId
  };
  users.push(newUser);

  // Pre-seed common stock for the new pharmacy
  medicines.slice(0, 4).forEach((med, idx) => {
    stocks.push({
      id: `stk-${Date.now()}-${idx}`,
      pharmacyId: newPharmaId,
      medicineSlug: med.slug,
      quantity: 50,
      priceUSD: 2.00 + idx,
      status: 'in_stock',
      prescriptionRequired: med.prescriptionRequired,
      lastUpdated: new Date().toISOString()
    });
  });

  const token = generateToken(newUser);
  res.status(201).json({
    access: token,
    refresh: token,
    pharmacy: newPharma,
    user: {
      id: newUser.id,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      pharmacyId: newPharmaId
    }
  });
});

// Auth: Me
app.get(['/api/auth/me', '/api/auth/me/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided.' });
  }
  const fullUser = users.find(u => u.id === user.id);
  if (!fullUser) {
    return res.status(404).json({ detail: 'User not found' });
  }
  res.json({
    id: fullUser.id,
    username: fullUser.username,
    name: fullUser.name,
    email: fullUser.email,
    role: fullUser.role,
    pharmacyId: fullUser.pharmacyId
  });
});

// Categories list
app.get(['/api/categories', '/api/categories/'], (_req: Request, res: Response) => {
  res.json(categories);
});

// Medicines list with filters (q, category, city, in_stock)
app.get(['/api/medicines', '/api/medicines/'], (req: Request, res: Response) => {
  const { q, category, city, in_stock } = req.query as Record<string, string>;

  let results = medicines.map(med => {
    // Find all stocks for this medicine
    const medStocks = stocks.filter(s => s.medicineSlug === med.slug);
    const availableStocks = medStocks.filter(s => s.quantity > 0 && s.status !== 'out_of_stock');
    
    // Calculate price range
    const prices = medStocks.map(s => s.priceUSD).filter(p => p > 0);
    const minPrice = prices.length ? Math.min(...prices) : null;
    const maxPrice = prices.length ? Math.max(...prices) : null;

    // Attached pharmacy details
    const pharmacyLocations = medStocks.map(s => {
      const ph = pharmacies.find(p => p.id === s.pharmacyId);
      return {
        stockId: s.id,
        pharmacyId: s.pharmacyId,
        pharmacyName: ph ? ph.name : 'Unknown Pharmacy',
        city: ph ? ph.city : '',
        district: ph ? ph.district : '',
        address: ph ? ph.address : '',
        phone: ph ? ph.phone : '',
        hours: ph ? ph.hours : '',
        priceUSD: s.priceUSD,
        quantity: s.quantity,
        status: s.status,
        lastUpdated: s.lastUpdated,
        latitude: ph ? ph.latitude : 0,
        longitude: ph ? ph.longitude : 0,
      };
    });

    return {
      ...med,
      category: categories.find(c => c.slug === med.categorySlug),
      totalInStock: availableStocks.reduce((sum, s) => sum + s.quantity, 0),
      pharmacyCount: availableStocks.length,
      minPrice,
      maxPrice,
      pharmacies: pharmacyLocations,
    };
  });

  // Filter by query (name, generic name, brand names, tags)
  if (q) {
    const query = q.toLowerCase().trim();
    results = results.filter(m => 
      m.name.toLowerCase().includes(query) ||
      m.genericName.toLowerCase().includes(query) ||
      m.brandNames.some(b => b.toLowerCase().includes(query)) ||
      m.tags.some(t => t.toLowerCase().includes(query)) ||
      m.indications.toLowerCase().includes(query)
    );
  }

  // Filter by category
  if (category && category !== 'all') {
    results = results.filter(m => m.categorySlug === category);
  }

  // Filter by city
  if (city && city !== 'all') {
    results = results.filter(m => m.pharmacies.some(p => p.city.toLowerCase() === city.toLowerCase() && p.quantity > 0));
  }

  // Filter in_stock
  if (in_stock === 'true' || in_stock === '1') {
    results = results.filter(m => m.totalInStock > 0);
  }

  res.json(results);
});

// Single Medicine Details
app.get(['/api/medicines/:slug', '/api/medicines/:slug/'], (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const med = medicines.find(m => m.slug === slug);
  if (!med) {
    return res.status(404).json({ detail: 'Medicine not found' });
  }

  const medStocks = stocks.filter(s => s.medicineSlug === slug).map(s => {
    const ph = pharmacies.find(p => p.id === s.pharmacyId);
    return {
      ...s,
      pharmacy: ph
    };
  });

  const medReviews = reviews.filter(r => r.medicineSlug === slug);
  const avgRating = medReviews.length > 0 
    ? (medReviews.reduce((sum, r) => sum + r.rating, 0) / medReviews.length).toFixed(1)
    : null;

  res.json({
    ...med,
    category: categories.find(c => c.slug === med.categorySlug),
    stocks: medStocks,
    reviews: medReviews,
    avgRating: avgRating ? parseFloat(avgRating) : null,
    inStockPharmaciesCount: medStocks.filter(s => s.quantity > 0).length
  });
});

// Toggle Favorite Medicine
app.post(['/api/medicines/:slug/favorite', '/api/medicines/:slug/favorite/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ detail: 'Authentication required to manage favorites.' });
  }

  const slug = req.params.slug as string;
  const userFavs = favorites[user.id] || [];
  const index = userFavs.indexOf(slug);

  let isFavorite = false;
  if (index > -1) {
    userFavs.splice(index, 1);
    isFavorite = false;
  } else {
    userFavs.push(slug);
    isFavorite = true;
  }
  favorites[user.id] = userFavs;

  res.json({ isFavorite, favorites: userFavs });
});

// Get User Favorites
app.get(['/api/favorites', '/api/favorites/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ detail: 'Authentication required.' });
  }

  const userFavs = favorites[user.id] || [];
  const favMeds = medicines.filter(m => userFavs.includes(m.slug)).map(med => {
    const medStocks = stocks.filter(s => s.medicineSlug === med.slug);
    const available = medStocks.filter(s => s.quantity > 0);
    return {
      ...med,
      category: categories.find(c => c.slug === med.categorySlug),
      inStockCount: available.length,
      minPrice: medStocks.length ? Math.min(...medStocks.map(s => s.priceUSD)) : null
    };
  });

  res.json(favMeds);
});

// Add Review to Medicine
app.post(['/api/medicines/:slug/review', '/api/medicines/:slug/review/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  const { rating, comment, name } = req.body;
  const slug = req.params.slug as string;

  if (!rating || !comment) {
    return res.status(400).json({ detail: 'Rating and comment are required.' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    medicineSlug: slug,
    username: user ? user.username : 'Guest Patient',
    name: user ? user.name : (name || 'Anonymous Patient'),
    rating: Math.min(5, Math.max(1, parseInt(rating, 10) || 5)),
    comment,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(newReview);
  res.status(201).json(newReview);
});

// Pharmacies List
app.get(['/api/pharmacies', '/api/pharmacies/'], (_req: Request, res: Response) => {
  const pharmaList = pharmacies.map(ph => {
    const phStocks = stocks.filter(s => s.pharmacyId === ph.id);
    return {
      ...ph,
      totalMedicationsCount: phStocks.length,
      inStockCount: phStocks.filter(s => s.quantity > 0).length
    };
  });
  res.json(pharmaList);
});

// Pharmacy Stock Management (GET /api/pharmacy/stocks)
app.get(['/api/pharmacy/stocks', '/api/pharmacy/stocks/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  const pharmacyIdParam = req.query.pharmacyId as string;

  let targetPharmacyId = pharmacyIdParam;
  if (!targetPharmacyId && user && user.role === 'pharmacy') {
    targetPharmacyId = user.pharmacyId;
  }

  if (!targetPharmacyId) {
    // Return all stocks for admin or public directory
    const all = stocks.map(s => {
      const med = medicines.find(m => m.slug === s.medicineSlug);
      const pharma = pharmacies.find(p => p.id === s.pharmacyId);
      return { ...s, medicine: med, pharmacy: pharma };
    });
    return res.json(all);
  }

  const pharmaStocks = stocks
    .filter(s => s.pharmacyId === targetPharmacyId)
    .map(s => {
      const med = medicines.find(m => m.slug === s.medicineSlug);
      return { ...s, medicine: med };
    });

  res.json(pharmaStocks);
});

// Pharmacy: Add / Update Stock
app.post(['/api/pharmacy/stocks', '/api/pharmacy/stocks/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  const { medicineSlug, quantity, priceUSD, pharmacyId: explicitPharmaId, prescriptionRequired, batchNumber } = req.body;

  const targetPharmaId = explicitPharmaId || (user ? user.pharmacyId : 'pharma-1');
  if (!targetPharmaId) {
    return res.status(400).json({ detail: 'Pharmacy ID is required.' });
  }

  if (!medicineSlug || quantity === undefined || priceUSD === undefined) {
    return res.status(400).json({ detail: 'medicineSlug, quantity, and priceUSD are required.' });
  }

  const existingIdx = stocks.findIndex(s => s.pharmacyId === targetPharmaId && s.medicineSlug === medicineSlug);
  const qty = parseInt(quantity, 10);
  const status: 'in_stock' | 'low_stock' | 'out_of_stock' = qty === 0 ? 'out_of_stock' : qty < 15 ? 'low_stock' : 'in_stock';

  if (existingIdx > -1) {
    stocks[existingIdx] = {
      ...stocks[existingIdx],
      quantity: qty,
      priceUSD: parseFloat(priceUSD),
      status,
      prescriptionRequired: prescriptionRequired !== undefined ? !!prescriptionRequired : stocks[existingIdx].prescriptionRequired,
      batchNumber: batchNumber || stocks[existingIdx].batchNumber,
      lastUpdated: new Date().toISOString()
    };
    return res.json(stocks[existingIdx]);
  }

  const newStock: StockItem = {
    id: `stk-${Date.now()}`,
    pharmacyId: targetPharmaId,
    medicineSlug,
    quantity: qty,
    priceUSD: parseFloat(priceUSD),
    status,
    prescriptionRequired: !!prescriptionRequired,
    batchNumber,
    lastUpdated: new Date().toISOString()
  };

  stocks.push(newStock);
  res.status(201).json(newStock);
});

// Pharmacy: Update Stock by ID
app.put(['/api/pharmacy/stocks/:id', '/api/pharmacy/stocks/:id/'], (req: Request, res: Response) => {
  const id = req.params.id as string;
  const { quantity, priceUSD, status } = req.body;

  const itemIdx = stocks.findIndex(s => s.id === id);
  if (itemIdx === -1) {
    return res.status(404).json({ detail: 'Stock record not found' });
  }

  const current = stocks[itemIdx];
  const newQty = quantity !== undefined ? parseInt(quantity, 10) : current.quantity;
  const newStatus = status || (newQty === 0 ? 'out_of_stock' : newQty < 15 ? 'low_stock' : 'in_stock');

  stocks[itemIdx] = {
    ...current,
    quantity: newQty,
    priceUSD: priceUSD !== undefined ? parseFloat(priceUSD) : current.priceUSD,
    status: newStatus,
    lastUpdated: new Date().toISOString()
  };

  res.json(stocks[itemIdx]);
});

// Pharmacy: Delete Stock
app.delete(['/api/pharmacy/stocks/:id', '/api/pharmacy/stocks/:id/'], (req: Request, res: Response) => {
  const id = req.params.id as string;
  const idx = stocks.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ detail: 'Stock record not found' });
  }
  stocks.splice(idx, 1);
  res.status(204).send();
});

// Stock Watch: Subscribe to notifications when out of stock
app.post(['/api/stock/watch', '/api/stock/watch/'], (req: Request, res: Response) => {
  const user = (req as any).user;
  const { medicineSlug, email, pharmacyId } = req.body;

  if (!medicineSlug) {
    return res.status(400).json({ detail: 'medicineSlug is required' });
  }

  const targetEmail = email || (user ? user.email : null);
  if (!targetEmail) {
    return res.status(400).json({ detail: 'Email address is required for stock alerts.' });
  }

  const existing = stockWatches.find(w => w.medicineSlug === medicineSlug && w.email.toLowerCase() === targetEmail.toLowerCase());
  if (existing) {
    return res.json({ message: 'You are already watching stock for this medicine.', watch: existing });
  }

  const newWatch: StockWatch = {
    id: `wtch-${Date.now()}`,
    medicineSlug,
    email: targetEmail,
    username: user ? user.username : undefined,
    pharmacyId,
    notified: false,
    createdAt: new Date().toISOString()
  };

  stockWatches.push(newWatch);
  res.status(201).json({ message: 'Stock alert registered! We will notify you when available.', watch: newWatch });
});

// List watches
app.get(['/api/stock/watches', '/api/stock/watches/'], (_req: Request, res: Response) => {
  res.json(stockWatches);
});

// Simulate Notify Stock (matches manage.py notify_stock from original README)
app.post(['/api/stock/notify', '/api/stock/notify/'], (_req: Request, res: Response) => {
  const notificationsSent: any[] = [];

  stockWatches.forEach(watch => {
    // Check if the watched medicine now has available stock
    const matchingStock = stocks.find(s => s.medicineSlug === watch.medicineSlug && s.quantity > 0);
    if (matchingStock && !watch.notified) {
      const med = medicines.find(m => m.slug === watch.medicineSlug);
      const ph = pharmacies.find(p => p.id === matchingStock.pharmacyId);
      watch.notified = true;
      notificationsSent.push({
        email: watch.email,
        medicine: med?.name,
        pharmacy: ph?.name,
        quantity: matchingStock.quantity,
        priceUSD: matchingStock.priceUSD,
        message: `Good news! ${med?.name || 'Your requested medicine'} is now back in stock at ${ph?.name || 'a nearby pharmacy'} for $${matchingStock.priceUSD}.`
      });
    }
  });

  res.json({
    status: 'success',
    dispatchedCount: notificationsSent.length,
    notifications: notificationsSent,
    pendingWatchesCount: stockWatches.filter(w => !w.notified).length
  });
});

// AI Symptom Advisor (/api/ai/suggest/)
app.post(['/api/ai/suggest', '/api/ai/suggest/'], async (req: Request, res: Response) => {
  const { symptoms, notes } = req.body;

  if (!symptoms || typeof symptoms !== 'string' || !symptoms.trim()) {
    return res.status(400).json({ detail: 'Please provide description of symptoms.' });
  }

  const query = symptoms.toLowerCase();

  // Clinical Rule-Based Symptom Analyzer & Medicine Recommender
  const recommendations: any[] = [];
  const flags: string[] = [];

  // Headache & fever
  if (query.includes('headache') || query.includes('fever') || query.includes('kulayl') || query.includes('madax')) {
    const med = medicines.find(m => m.slug === 'paracetamol-500mg');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Paracetamol is first-line antipyretic and analgesic for mild-to-moderate fever and headaches with high safety margin.',
        urgency: 'routine',
        advice: 'Stay hydrated with plenty of fluids, rest in a cool room, and monitor temperature.'
      });
    }
  }

  // Pain / inflammation / joints / dental
  if (query.includes('joint') || query.includes('muscle') || query.includes('tooth') || query.includes('sprain') || query.includes('backache') || query.includes('xanuun')) {
    const med = medicines.find(m => m.slug === 'ibuprofen-400mg');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Ibuprofen provides anti-inflammatory and pain relief. Must be taken with or after food.',
        urgency: 'routine',
        advice: 'Avoid taking on an empty stomach. If you have asthma or a history of stomach ulcers, use Paracetamol instead.'
      });
    }
  }

  // Cold, runny nose, allergy, sneezing
  if (query.includes('cold') || query.includes('allergy') || query.includes('sneeze') || query.includes('runny') || query.includes('hives') || query.includes('cuncun')) {
    const med = medicines.find(m => m.slug === 'cetirizine-10mg');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Cetirizine effectively blocks H1 histamine receptors to reduce sneezing, runny nose, and allergic itching.',
        urgency: 'routine',
        advice: 'Best taken in the evening. Avoid operating heavy machinery if feeling drowsy.'
      });
    }
  }

  // Stomach acid, heartburn, GERD
  if (query.includes('acid') || query.includes('heartburn') || query.includes('gerd') || query.includes('stomach burn') || query.includes('laabjeex')) {
    const med = medicines.find(m => m.slug === 'omeprazole-20mg');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Omeprazole reduces gastric acid secretion for lasting relief of persistent heartburn and acid reflux.',
        urgency: 'routine',
        advice: 'Take 30-60 minutes before breakfast. Avoid spicy, acidic foods and late-night heavy meals.'
      });
    }
  }

  // Diarrhea, dehydration, vomiting
  if (query.includes('diarrhea') || query.includes('vomit') || query.includes('dehydration') || query.includes('shuban') || query.includes('fuub-bax')) {
    const med = medicines.find(m => m.slug === 'ors-sachets');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Oral Rehydration Salts (ORS) restore vital sodium, potassium, and fluid balance to prevent life-threatening dehydration.',
        urgency: 'important',
        advice: 'Dissolve in exactly 1 liter of safe drinking water. Drink small sips continuously.'
      });
    }
  }

  // Wheezing, asthma, shortness of breath
  if (query.includes('wheez') || query.includes('asthma') || query.includes('neef') || query.includes('shortness of breath')) {
    const med = medicines.find(m => m.slug === 'salbutamol-inhaler');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Salbutamol is a rapid-acting bronchodilator for prompt relief of chest tightness and airway constriction.',
        urgency: 'urgent',
        advice: 'Seek emergency medical attention immediately if breathing difficulty does not improve within 5 minutes of inhaler use.'
      });
    }
    flags.push('Respiratory symptoms require close monitoring. If severe chest pain or blue lips occur, seek emergency care immediately.');
  }

  // Bacterial infection indicators
  if (query.includes('throat infection') || query.includes('strep') || query.includes('pus') || query.includes('sinusitis') || query.includes('urinary')) {
    flags.push('Bacterial infections require physician assessment and formal prescription before antibiotic dispensing.');
    const med = medicines.find(m => m.slug === 'amoxicillin-500mg');
    if (med) {
      recommendations.push({
        medicine: med,
        rationale: 'Amoxicillin is a common prescription antibiotic for susceptible bacterial infections.',
        urgency: 'prescription_required',
        advice: 'Consult a qualified doctor for diagnosis and dosage. Never self-medicate with antibiotics without prescription.'
      });
    }
  }

  // Default fallback if no specific trigger
  if (recommendations.length === 0) {
    const defaultMed = medicines.find(m => m.slug === 'paracetamol-500mg');
    if (defaultMed) {
      recommendations.push({
        medicine: defaultMed,
        rationale: 'General pain and discomfort relief. Please see a healthcare provider for personalized diagnosis.',
        urgency: 'routine',
        advice: 'Rest well and stay hydrated. Visit a local clinic if symptoms persist for more than 48 hours.'
      });
    }
  }

  // Attach live stock availability across verified pharmacies for the recommended medicines
  const enrichedRecommendations = recommendations.map(rec => {
    const medStocks = stocks.filter(s => s.medicineSlug === rec.medicine.slug && s.quantity > 0);
    const nearbyPharmacies = medStocks.map(s => {
      const ph = pharmacies.find(p => p.id === s.pharmacyId);
      return {
        pharmacyName: ph ? ph.name : 'Verified Pharmacy',
        city: ph ? ph.city : '',
        district: ph ? ph.district : '',
        phone: ph ? ph.phone : '',
        priceUSD: s.priceUSD,
        quantity: s.quantity,
        hours: ph ? ph.hours : ''
      };
    });

    return {
      ...rec,
      availablePharmaciesCount: nearbyPharmacies.length,
      pharmacies: nearbyPharmacies
    };
  });

  res.json({
    symptomsEntered: symptoms,
    analysisSummary: `Evaluated ${enrichedRecommendations.length} potential medical solutions for: "${symptoms}".`,
    recommendations: enrichedRecommendations,
    safetyFlags: flags,
    disclaimer: 'Medical Disclaimer: This AI tool is for informational and educational triage only and does NOT replace professional medical diagnosis, prescription, or clinical consultation. In case of acute chest pain, uncontrolled bleeding, severe shortness of breath, or emergency, contact emergency medical services immediately.'
  });
});

// Analytics & Trends
app.get(['/api/trends', '/api/trends/'], (_req: Request, res: Response) => {
  const mostInStock = [...medicines].sort((a, b) => {
    const aStock = stocks.filter(s => s.medicineSlug === a.slug).reduce((acc, s) => acc + s.quantity, 0);
    const bStock = stocks.filter(s => s.medicineSlug === b.slug).reduce((acc, s) => acc + s.quantity, 0);
    return bStock - aStock;
  }).slice(0, 5);

  const lowStockAlerts = stocks.filter(s => s.quantity < 15).map(s => {
    const med = medicines.find(m => m.slug === s.medicineSlug);
    const ph = pharmacies.find(p => p.id === s.pharmacyId);
    return {
      stockId: s.id,
      medicineName: med?.name,
      medicineSlug: s.medicineSlug,
      pharmacyName: ph?.name,
      city: ph?.city,
      quantity: s.quantity,
      status: s.status
    };
  });

  res.json({
    topMedicines: mostInStock,
    lowStockAlerts,
    totalPharmacies: pharmacies.length,
    totalMedicines: medicines.length,
    totalStockUnits: stocks.reduce((sum, s) => sum + s.quantity, 0),
    activeWatchAlerts: stockWatches.filter(w => !w.notified).length
  });
});

// --- VITE DEV MIDDLEWARE OR STATIC SERVING ---
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Daawo Finder] Server active and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start Daawo Finder server:', err);
  process.exit(1);
});
