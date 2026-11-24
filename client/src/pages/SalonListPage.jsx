import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  Search, MapPin, Clock, Star, Scissors, Users, Filter,
  IndianRupee, AlertCircle, RefreshCw, Tag, ChevronDown,
} from 'lucide-react';
import { CardSkeleton } from '../components/LoadingSkeleton';

const AREAS = [
  { label: 'All Areas', value: '' },
  { label: 'Jant-Pali / CUH', value: 'Jant-Pali' },
  { label: 'Mahendragarh', value: 'Mahendragarh' },
  { label: 'Narnaul', value: 'Narnaul' },
  { label: 'Kanina', value: 'Kanina' },
  { label: 'Ateli', value: 'Ateli' },
];

const CATEGORIES = [
  { label: 'All Types', value: '' },
  { label: '💈 Budget Barber', value: 'Budget Barber' },
  { label: '🏠 Neighborhood', value: 'Neighborhood Salon' },
  { label: '✂️ Modern Grooming', value: 'Modern Grooming' },
  { label: '👩 Unisex', value: 'Unisex Salon' },
  { label: '⭐ Premium', value: 'Premium Salon' },
  { label: '👨‍👩‍👧 Family Salon', value: 'Family Salon' },
];

const PRICE_RANGES = [
  { label: 'Any Price', min: undefined, max: undefined },
  { label: 'Under ₹50', min: 0, max: 49 },
  { label: '₹50–₹100', min: 50, max: 100 },
  { label: '₹100–₹200', min: 100, max: 200 },
  { label: '₹200–₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 501, max: undefined },
];

const CATEGORY_COLORS = {
  'Budget Barber': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  'Neighborhood Salon': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'Modern Grooming': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
  'Unisex Salon': 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  'Premium Salon': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'Family Salon': 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300',
};

const SalonListPage = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0); // index into PRICE_RANGES
  const [openNow, setOpenNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const fetchSalons = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedArea) params.area = selectedArea;
      if (selectedCategory) params.category = selectedCategory;
      if (openNow) params.openNow = 'true';
      const pr = PRICE_RANGES[selectedPriceRange];
      if (pr.min !== undefined) params.minPrice = pr.min;
      if (pr.max !== undefined) params.maxPrice = pr.max;

      const res = await api.get('/salons', { params });
      setSalons(res.data.salons || []);
    } catch (err) {
      console.error('Failed to load salons:', err);
      setError('Could not load salons. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, [selectedArea, selectedCategory, selectedPriceRange, openNow]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSalons();
  };

  const clearAllFilters = () => {
    setSearch('');
    setSelectedArea('');
    setSelectedCategory('');
    setSelectedPriceRange(0);
    setOpenNow(false);
  };

  const hasActiveFilters = selectedArea || selectedCategory || selectedPriceRange !== 0 || openNow || search;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl">
        <div className="max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              LIVE SALON DISCOVERY
            </span>
            <span className="text-xs text-indigo-400">•</span>
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-white/10 backdrop-blur text-xs font-medium text-indigo-200 border border-white/10">
              <MapPin className="w-3 h-3 text-indigo-300" />
              <span>Location: Mahendragarh, Haryana</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Find a Salon. Skip the Wait.
          </h1>
          <p className="text-sm text-indigo-200">
            Explore nearby salons, compare services and prices, and join the live queue before you arrive.
          </p>

          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by salon name, service or location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 font-semibold text-sm rounded-xl transition shadow"
            >
              Search Salons
            </button>
          </form>

          {/* Open Now toggle */}
          <div className="pt-1 flex items-center space-x-3">
            <label className="flex items-center space-x-2 text-xs text-indigo-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={openNow}
                onChange={(e) => setOpenNow(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="font-medium">Show open salons only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Area quick buttons (always visible) */}
        <div className="flex flex-wrap gap-2 mb-3">
          {AREAS.map((a) => (
            <button
              key={a.value}
              onClick={() => setSelectedArea(a.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                selectedArea === a.value
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400'
              }`}
            >
              <MapPin className="w-3 h-3 inline mr-1" />
              {a.label}
            </button>
          ))}
        </div>

        {/* Advanced filters (collapsible) */}
        {showFilters && (
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-700 pt-4">
            {/* Category */}
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Salon Type</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setSelectedCategory(c.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      selectedCategory === c.value
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-indigo-400'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Starting Price</p>
              <div className="flex flex-wrap gap-2">
                {PRICE_RANGES.map((pr, idx) => (
                  <button
                    key={pr.label}
                    onClick={() => setSelectedPriceRange(idx)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                      selectedPriceRange === idx
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:border-emerald-400'
                    }`}
                  >
                    {pr.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {loading ? 'Loading...' : `${salons.length} Salon${salons.length !== 1 ? 's' : ''} Found`}
          </h2>
          {hasActiveFilters && !loading && (
            <span className="text-xs text-slate-500 dark:text-slate-400">Filters applied</span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-800">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Failed to Load Salons</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">{error}</p>
            <button
              onClick={fetchSalons}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        ) : salons.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Scissors className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No salons found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Try adjusting your search query or clearing filters.</p>
            <button
              onClick={clearAllFilters}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.map((salon) => (
              <div
                key={salon._id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col group"
              >
                {/* Salon Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                  <img
                    src={salon.images?.[0] || salon.logo}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=500&q=80';
                    }}
                  />
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur text-xs font-bold flex items-center space-x-1 shadow">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{salon.rating?.toFixed(1) || '4.5'}</span>
                  </div>
                  {/* Category badge */}
                  {salon.category && (
                    <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold ${CATEGORY_COLORS[salon.category] || 'bg-slate-100 text-slate-700'}`}>
                      {salon.category}
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {salon.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {salon.description || 'Professional salon services at your convenience.'}
                    </p>

                    <div className="pt-1 flex flex-col space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {salon.area ? `${salon.area}, ` : ''}{salon.address?.city || 'Mahendragarh'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{salon.openingHour} – {salon.closingHour}</span>
                      </div>
                      {salon.startingPrice > 0 && (
                        <div className="flex items-center space-x-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            Starting ₹{salon.startingPrice}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-2 gap-2">
                    <Link
                      to={`/salons/${salon._id}`}
                      className="text-center py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/salons/${salon._id}/join`}
                      className="text-center py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
                    >
                      Join Queue
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonListPage;
