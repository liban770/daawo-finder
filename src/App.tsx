import React, { useState, useEffect } from 'react';
import { 
  Pill, Sparkles, MapPin, Search, Filter, ShieldCheck, Heart, 
  Building2, AlertCircle, ArrowUpDown, Check, RefreshCw 
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { MedicineCard } from './components/MedicineCard';
import { MedicineDetailModal } from './components/MedicineDetailModal';
import { StockWatchModal } from './components/StockWatchModal';
import { PharmacyDirectory } from './components/PharmacyDirectory';
import { AiSymptomAdvisor } from './components/AiSymptomAdvisor';
import { PharmacyPortal } from './components/PharmacyPortal';
import { AdminPanel } from './components/AdminPanel';
import { Category, Medicine, User } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-demo',
    username: 'demo',
    name: 'Liban Mohamed',
    email: 'demo@daawofinder.so',
    role: 'user'
  });
  const [token, setToken] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('medicines');
  const [categories, setCategories] = useState<Category[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [rxFilter, setRxFilter] = useState<'all' | 'otc' | 'rx'>('all');

  // Modals
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [watchMedicine, setWatchMedicine] = useState<Medicine | null>(null);
  const [favorites, setFavorites] = useState<string[]>(['paracetamol-500mg', 'salbutamol-inhaler']);

  // Fetch initial data
  useEffect(() => {
    // Attempt demo login
    fetch('/api/auth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'demo', password: 'demo12345' })
    })
      .then(res => res.json())
      .then(authData => {
        if (authData.access) {
          setToken(authData.access);
          setCurrentUser(authData.user);
        }
      })
      .catch(() => {});

    fetch('/api/categories/')
      .then(res => res.json())
      .then(cats => setCategories(cats))
      .catch(() => {});

    loadMedicines();
  }, []);

  const loadMedicines = () => {
    setLoading(true);
    let url = '/api/medicines/?';
    if (selectedCategory !== 'all') url += `category=${selectedCategory}&`;
    if (selectedCity !== 'all') url += `city=${selectedCity}&`;
    if (inStockOnly) url += `in_stock=true&`;
    if (searchQuery.trim()) url += `q=${encodeURIComponent(searchQuery.trim())}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setMedicines(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMedicines();
  }, [selectedCategory, selectedCity, inStockOnly, searchQuery]);

  const handleLoginAs = async (username: string) => {
    let password = 'demo12345';
    if (username === 'admin') password = 'admin12345';
    if (username.startsWith('pharmacy')) password = 'pharmacy12345';

    try {
      const res = await fetch('/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.access) {
        setToken(data.access);
        setCurrentUser(data.user);
        if (data.user.role === 'pharmacy') {
          setActiveTab('pharmacy-portal');
        } else if (data.user.role === 'admin') {
          setActiveTab('admin');
        } else {
          setActiveTab('medicines');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    setActiveTab('medicines');
  };

  const handleToggleFavorite = async (slug: string) => {
    if (!token) {
      // Local toggle for guest
      setFavorites(prev => 
        prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      );
      return;
    }

    try {
      const res = await fetch(`/api/medicines/${slug}/favorite/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Filter medicines by prescription client-side
  const displayedMedicines = medicines.filter(med => {
    if (rxFilter === 'otc' && med.prescriptionRequired) return false;
    if (rxFilter === 'rx' && !med.prescriptionRequired) return false;
    return true;
  });

  const favoriteMedicinesList = medicines.filter(m => favorites.includes(m.slug));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Top Banner Notice */}
      <div className="bg-emerald-900 text-emerald-100 text-[11px] py-1.5 px-4 text-center font-medium border-b border-emerald-800">
        <span className="font-bold text-white">Daawo Finder Live Network</span> — Somalia's unified digital medicine search, prescription verification & real-time dispensary stock locator.
      </div>

      {/* Main App Bar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLoginAs={handleLoginAs}
        onLogout={handleLogout}
        favoritesCount={favorites.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* TAB 1: MEDICINES BROWSER */}
        {activeTab === 'medicines' && (
          <div className="space-y-6">
            
            {/* Search Hero */}
            <div className="bg-gradient-to-br from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 max-w-3xl">
                <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 inline-block mb-3">
                  Search 500+ Essential Medications
                </span>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Find Medicine In Stock Nearby
                </h1>

                <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-xl leading-relaxed">
                  Search by generic molecule, commercial brand, illness, or active ingredients. Check verified pricing and reserve or call participating pharmacies directly.
                </p>

                {/* Big Search Input */}
                <div className="mt-6 flex flex-col sm:flex-row gap-2 bg-white/95 p-2 rounded-2xl shadow-xl backdrop-blur-md">
                  <div className="flex-1 flex items-center gap-3 px-3 py-2">
                    <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search paracetamol, amoxicillin, asthma, diabetes, heartburn..."
                      className="w-full text-slate-900 placeholder-slate-400 text-sm focus:outline-none bg-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0 sm:pl-3">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="text-xs font-semibold text-slate-700 bg-transparent focus:outline-none pr-3 capitalize cursor-pointer"
                    >
                      <option value="all">All Cities</option>
                      <option value="Mogadishu">Mogadishu</option>
                      <option value="Hargeisa">Hargeisa</option>
                      <option value="Garowe">Garowe</option>
                    </select>

                    <button
                      onClick={loadMedicines}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0"
                    >
                      Search
                    </button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-emerald-200">
                  <span>✓ 12 Verified Core Formulary Meds</span>
                  <span>✓ 5 Partner Dispensaries Active</span>
                  <span>✓ Real-time Price Comparisons</span>
                </div>
              </div>

              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
                <Pill className="w-96 h-96 text-white" />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              
              {/* Categories Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Categories
                </button>

                {categories.map(cat => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Secondary Sub-filters */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-400 font-medium">Filter By:</span>
                  
                  {/* OTC vs Rx toggle */}
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
                    <button
                      onClick={() => setRxFilter('all')}
                      className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${
                        rxFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      All Types
                    </button>
                    <button
                      onClick={() => setRxFilter('otc')}
                      className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${
                        rxFilter === 'otc' ? 'bg-white text-emerald-700 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      OTC (Over The Counter)
                    </button>
                    <button
                      onClick={() => setRxFilter('rx')}
                      className={`px-2.5 py-1 rounded-md font-medium text-[11px] ${
                        rxFilter === 'rx' ? 'bg-white text-amber-700 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Rx Required
                    </button>
                  </div>

                  {/* In Stock Only checkbox */}
                  <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={inStockOnly}
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-medium text-[11px]">In-Stock Only</span>
                  </label>
                </div>

                <div className="text-slate-500 font-medium">
                  Showing <strong>{displayedMedicines.length}</strong> medications
                </div>
              </div>
            </div>

            {/* Medicine Cards Grid */}
            {loading ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-slate-500">Querying medicine catalog & verified pharmacy stocks...</p>
              </div>
            ) : displayedMedicines.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Pill className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No matching medicines found</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Try adjusting your search terms or clearing the category and stock filters.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedCity('all');
                    setInStockOnly(false);
                    setRxFilter('all');
                  }}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedMedicines.map(med => (
                  <MedicineCard
                    key={med.slug}
                    medicine={med}
                    isFavorite={favorites.includes(med.slug)}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(m) => setSelectedMedicine(m)}
                    onWatchStock={(m) => setWatchMedicine(m)}
                  />
                ))}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: AI SYMPTOM ADVISOR */}
        {activeTab === 'ai-advisor' && (
          <AiSymptomAdvisor
            onSelectMedicine={(med) => setSelectedMedicine(med)}
          />
        )}

        {/* TAB 3: PHARMACY DIRECTORY */}
        {activeTab === 'pharmacies' && (
          <PharmacyDirectory />
        )}

        {/* TAB 4: SAVED MEDICINES */}
        {activeTab === 'favorites' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Your Saved Medicine List</h1>
                <p className="text-xs text-slate-500">Quickly monitor stock and price changes for your saved medications</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                {favorites.length} Saved
              </span>
            </div>

            {favoriteMedicinesList.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800">No saved medicines yet</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click the heart icon on any medicine card to track its availability.
                </p>
                <button
                  onClick={() => setActiveTab('medicines')}
                  className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700"
                >
                  Browse Medicines
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {favoriteMedicinesList.map(med => (
                  <MedicineCard
                    key={med.slug}
                    medicine={med}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onSelect={(m) => setSelectedMedicine(m)}
                    onWatchStock={(m) => setWatchMedicine(m)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PHARMACY PORTAL */}
        {activeTab === 'pharmacy-portal' && (
          <PharmacyPortal currentUser={currentUser} />
        )}

        {/* TAB 6: ADMIN PANEL */}
        {activeTab === 'admin' && (
          <AdminPanel />
        )}

      </main>

      {/* Medicine Detail Modal */}
      {selectedMedicine && (
        <MedicineDetailModal
          slug={selectedMedicine.slug}
          onClose={() => setSelectedMedicine(null)}
          currentUser={currentUser}
          isFavorite={favorites.includes(selectedMedicine.slug)}
          onToggleFavorite={handleToggleFavorite}
          onWatchStock={(m) => setWatchMedicine(m)}
        />
      )}

      {/* Stock Watch Notification Modal */}
      {watchMedicine && (
        <StockWatchModal
          medicine={watchMedicine}
          onClose={() => setWatchMedicine(null)}
          userEmail={currentUser?.email || 'demo@daawofinder.so'}
        />
      )}

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
              💊
            </div>
            <span className="font-bold text-slate-800">Daawo Finder</span>
            <span>— Mogadishu • Hargeisa • Garowe</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>Django REST / JWT Compatible Backend</span>
            <span>•</span>
            <span>AI Symptom Triage</span>
            <span>•</span>
            <span>Stock Alerts Engine</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
