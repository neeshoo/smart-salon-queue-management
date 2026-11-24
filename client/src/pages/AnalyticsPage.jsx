import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  IndianRupee,
  Users,
  FileSpreadsheet,
  Star,
  Flame,
  Award,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { CardSkeleton } from '../components/LoadingSkeleton';

const AnalyticsPage = () => {
  const { user } = useAuth();
  const salonId = user?.salonId?._id || user?.salonId;

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    if (!salonId) {
      setError('Your account is not linked to any salon. Please contact the administrator.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/analytics/${salonId}`);
      setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err.response?.data?.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [salonId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Analytics Unavailable</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  const summary = analytics?.summary || {};
  const dailyStats = analytics?.dailyStats || [];
  const peakHoursData = analytics?.peakHoursData || [];
  const staffPerformance = analytics?.staffPerformance || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Business Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Salon Queue & Revenue Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Real-time charts, peak-hour predictions, and staff efficiency metrics
          </p>
        </div>

        <a
          href={`/api/analytics/${salonId}/export`}
          download
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1.5"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Complete CSV Report</span>
        </a>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Today's Revenue</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
            ₹{summary.revenueToday || 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Customers Served</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {summary.completedToday || 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Average Wait Time</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ~{summary.avgWaitTime || 0} mins
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">No-Show / Skip Rate</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400">
            {summary.noShowRate || 0}%
          </div>
        </div>
      </div>

      {/* Peak Hours Prediction Chart */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <span>Peak Hours Prediction (Moving Average)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Distribution of customer volume throughout the day (9:00 AM - 9:00 PM)
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1b4b',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="customers" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Volume & Revenue History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span>Daily Customer Trends & Revenue (Last 7 Days)</span>
          </h2>
          <p className="text-xs text-slate-500">Revenue generated from completed queue services</p>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyStats}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e1b4b',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4f46e5"
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Staff Leaderboard */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <span>Stylist Performance Leaderboard</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staffPerformance.map((st, i) => (
            <div
              key={st.staffId}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-center"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400">Rank #{i + 1}</span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{st.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {st.completedServices} services completed
                </p>
              </div>
              <div className="text-right">
                <span className="flex items-center space-x-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{st.rating || 4.9}</span>
                </span>
                <span className="text-[10px] text-slate-400">{st.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
