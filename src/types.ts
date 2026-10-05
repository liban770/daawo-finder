export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'pharmacy';
  pharmacyId?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
}

export interface PharmacyLocation {
  stockId: string;
  pharmacyId: string;
  pharmacyName: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  priceUSD: number;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
  latitude: number;
  longitude: number;
}

export interface Medicine {
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
  category?: Category;
  totalInStock: number;
  pharmacyCount: number;
  minPrice: number | null;
  maxPrice: number | null;
  pharmacies: PharmacyLocation[];
}

export interface Pharmacy {
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
  totalMedicationsCount?: number;
  inStockCount?: number;
}

export interface Review {
  id: string;
  medicineSlug: string;
  username: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface StockWatch {
  id: string;
  medicineSlug: string;
  email: string;
  username?: string;
  pharmacyId?: string;
  notified: boolean;
  createdAt: string;
}

export interface AiRecommendation {
  medicine: Medicine;
  rationale: string;
  urgency: 'routine' | 'important' | 'urgent' | 'prescription_required';
  advice: string;
  availablePharmaciesCount: number;
  pharmacies: {
    pharmacyName: string;
    city: string;
    district: string;
    phone: string;
    priceUSD: number;
    quantity: number;
    hours: string;
  }[];
}

export interface AiSuggestResponse {
  symptomsEntered: string;
  analysisSummary: string;
  recommendations: AiRecommendation[];
  safetyFlags: string[];
  disclaimer: string;
}
