import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  TrendingUp,
  IndianRupee,
  Scissors,
  QrCode,
  ArrowRight,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
  Store,
} from 'lucide-react';
import { CardSkeleton } from '../components/LoadingSkeleton';

const AdminDashboardPage = () => {
  const { user, setUser } = useAuth();
  const [salon, setSalon] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick salon registration state if owner has no salon
  const [registering, setRegistering] = useState(false);
  const [salonForm, setSalonForm] = useState({
    name: '',
    category: 'Neighborhood Salon',
    street: '',
    city: 'Mahendragarh',
    state: 'Haryana',
    startingPrice: 50,
    serviceName: 'Normal Haircut',
    openingHour: '09:00',
    closingHour: '20:00',
    description: '',
  });
  const [formError, setFormError] = useState('');

  const salonId = user?.salonId?._id || user?.salonId;

  const fetchAdminData = async () => {
    if (!salonId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [salonRes, analyticsRes] = await Promise.all([
        api.get(`/salons/${salonId}`),
        api.get(`/analytics/${salonId}`),
      ]);
      setSalon(salonRes.data.salon);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [salonId]);

  const handleRegisterSalon = async (e) => {
    e.preventDefault();
    if (!salonForm.name.trim()) {
      setFormError('Please enter your salon name.');
      return;
    }
    setRegistering(true);
    setFormError('');

    try {
      const res = await api.post('/salons', {
        name: salonForm.name.trim(),
        category: salonForm.category,
        description: salonForm.description || 'Professional grooming and salon services.',
        address: {
          street: salonForm.street,
          city: salonForm.city || 'Mahendragarh',
          state: salonForm.state || 'Haryana',
        },
        area: salonForm.city || 'Mahendragarh',
        startingPrice: Number(salonForm.startingPrice) || 50,
        serviceName: salonForm.serviceName || 'Normal Haircut',
        servicePrice: Number(salonForm.startingPrice) || 50,
        openingHour: salonForm.openingHour || '09:00',
        closingHour: salonForm.closingHour || '20:00',
      });

      const newSalon = res.data.salon;
      if (newSalon && newSalon._id) {
        const updatedUser = { ...user, salonId: newSalon._id };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to register salon. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  // If owner has no salon linked yet, display a simple "Register Your Salon" option
  if (!salonId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-700 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
              <Store className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Register Your Salon
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't registered your salon yet. Provide your details below to activate your live queue and dashboard.
            </p>
          </div>

          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleRegisterSalon} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Salon Name *
              </label>
              <input
                type="text"
                required
                value={salonForm.name}
                onChange={(e) => setSalonForm({ ...salonForm, name: e.target.value })}
                placeholder="e.g. Modern Hair & Beard Studio"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Salon Category
                </label>
                <select
                  value={salonForm.category}
                  onChange={(e) => setSalonForm({ ...salonForm, category: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Budget Barber">Budget Barber</option>
                  <option value="Neighborhood Salon">Neighborhood Salon</option>
                  <option value="Modern Grooming">Modern Grooming</option>
                  <option value="Unisex Salon">Unisex Salon</option>
                  <option value="Premium Salon">Premium Salon</option>
                  <option value="Family Salon">Family Salon</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={salonForm.city}
                  onChange={(e) => setSalonForm({ ...salonForm, city: e.target.value })}
                  placeholder="Mahendragarh"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Starting Price (₹)
                </label>
                <input
                  type="number"
                  min="10"
                  value={salonForm.startingPrice}
                  onChange={(e) => setSalonForm({ ...salonForm, startingPrice: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Primary Service
                </label>
                <input
                  type="text"
                  value={salonForm.serviceName}
                  onChange={(e) => setSalonForm({ ...salonForm, serviceName: e.target.value })}
                  placeholder="Haircut"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={registering}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{registering ? 'Registering Salon...' : 'Register Your Salon'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Unavailable</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error}</p>
        <button
          onClick={fetchAdminData}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow transition"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const summary = analytics?.summary || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Salon Owner Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {salon?.name || 'My Salon'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            {salon?.area ? `${salon.area}, ` : ''}{salon?.address?.city}, {salon?.address?.state} &bull; {salon?.openingHour} – {salon?.closingHour}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/admin/queue"
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Clock className="w-4 h-4" />
            <span>Manage Live Queue</span>
          </Link>
          <a
            href={`/api/analytics/${salonId}/export`}
            download
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 transition flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </a>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Total Bookings Today</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white">
            {summary.totalToday ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Walk-ins + online queue</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Currently Waiting</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {summary.waitingToday ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Avg Wait: ~{summary.avgWaitTime ?? 0} mins</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Customers Served</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.completedToday ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Services marked completed</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex justify-between items-center text-slate-500">
            <span className="text-xs font-bold uppercase">Today's Revenue</span>
            <IndianRupee className="w-4 h-4 text-violet-500" />
          </div>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            ₹{summary.revenueToday ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">No-show rate: {summary.noShowRate ?? 0}%</p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/queue"
          className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl shadow-lg hover:shadow-xl transition space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-indigo-300 transition">
              Live Queue Manager
            </h3>
            <p className="text-xs text-indigo-200 mt-1">
              Add walk-ins manually, assign priority tokens, reorder, call next customer.
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold text-indigo-300">
            <span>Open Queue Control</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/services"
          className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-md transition space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-violet-50 dark:bg-violet-950/50 flex items-center justify-center">
            <Scissors className="w-6 h-6 text-violet-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-violet-600 transition">
              Services & Staff Manager
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add services, adjust prices in ₹, edit durations, and manage barber availability.
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold text-violet-600">
            <span>Manage Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          to="/admin/analytics"
          className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm hover:shadow-md transition space-y-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition">
              Analytics & Reports
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Peak hours, staff performance, revenue charts and no-show trends.
            </p>
          </div>
          <div className="flex items-center space-x-1 text-xs font-bold text-emerald-600">
            <span>View Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* Salon QR Code */}
      {salon?.qrCodeData && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 text-indigo-600 text-xs font-bold uppercase">
              <QrCode className="w-4 h-4" />
              <span>Salon Walk-In QR Code</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Instant Queue QR Code
            </h3>
            <p className="text-xs text-slate-500 max-w-lg">
              Print and place this QR code at your reception counter or shop entrance. Customers scan it to join the queue instantly without downloading any app.
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <img
              src={salon.qrCodeData}
              alt="Salon QR"
              className="w-32 h-32 rounded-xl border border-slate-200 dark:border-slate-700 p-1.5 bg-white"
            />
            <a
              href={salon.qrCodeData}
              download={`${salon.name}_qrcode.png`}
              className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-xs font-bold rounded-xl shadow"
            >
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
