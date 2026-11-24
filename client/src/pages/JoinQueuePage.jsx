import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Navigation,
  Sparkles,
  ShieldCheck,
  User,
  ArrowRight,
  AlertCircle,
  Scissors,
} from 'lucide-react';

const JoinQueuePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [serviceId, setServiceId] = useState(searchParams.get('serviceId') || '');
  const [staffId, setStaffId] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [travelTimeMinutes, setTravelTimeMinutes] = useState(15);
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSalonData = async () => {
      try {
        const res = await api.get(`/salons/${id}`);
        setSalon(res.data.salon);
        setServices(res.data.services || []);
        setStaff(res.data.staff || []);
        if (!serviceId && res.data.services?.length > 0) {
          setServiceId(res.data.services[0]._id);
        }
      } catch (err) {
        console.error('Failed to load salon for queue:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSalonData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!serviceId) {
      setError('Please select a service');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/queue/join', {
        salonId: id,
        serviceId,
        staffId: staffId || null,
        priority,
        travelTimeMinutes: Number(travelTimeMinutes),
        customerName,
        customerPhone,
      });

      const booking = res.data.booking;
      // Navigate to live tracker with new booking
      navigate(`/live-tracker/${booking._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join queue. Please check if you already have an active token.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs text-slate-500">Loading queue options...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 text-white p-6 sm:p-8 space-y-2">
          <div className="flex items-center space-x-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Virtual Queue Check-In</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{salon?.name}</h1>
          <p className="text-xs text-indigo-100">
            Join the line remotely from home. We will notify you when to leave.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 XXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Service
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {services.map((srv) => (
                <label
                  key={srv._id}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                    serviceId === srv._id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="service"
                      value={srv._id}
                      checked={serviceId === srv._id}
                      onChange={() => setServiceId(srv._id)}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <p className="text-xs font-bold">{srv.name}</p>
                      <p className="text-[11px] text-slate-500">~{srv.duration} mins</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    ₹{srv.price}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Stylist Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Preferred Stylist
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">✨ Any Available Stylist (Fastest Smart Allocation)</option>
              {staff.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name} ({st.status})
                </option>
              ))}
            </select>
          </div>

          {/* Priority selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Customer Priority Tier
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'NORMAL', label: 'Standard', desc: 'Normal line' },
                { id: 'SENIOR', label: 'Senior Citizen', desc: 'Priority fair boost' },
                { id: 'VIP', label: 'VIP Pass', desc: 'Express lane' },
              ].map((p) => (
                <button
                  type="button"
                  key={p.id}
                  onClick={() => setPriority(p.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    priority === p.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{p.label}</p>
                  <p className="text-[10px] text-slate-500">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Smart Leave Now Travel Time Setting */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-900 dark:text-amber-200 text-xs font-bold">
              <Navigation className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Smart "Leave Now" Travel Alert</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300">
              How many minutes does it take you to reach the salon from home?
            </p>
            <div className="flex items-center space-x-3 pt-1">
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={travelTimeMinutes}
                onChange={(e) => setTravelTimeMinutes(e.target.value)}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-amber-300 dark:border-amber-700 whitespace-nowrap">
                {travelTimeMinutes} mins
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              We notify you when estimated wait ≤ your travel time + 5 min buffer!
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Generating Token...' : 'Confirm & Join Queue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinQueuePage;
