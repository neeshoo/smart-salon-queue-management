import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Calendar, Clock, Scissors, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('11:00');
  const [travelTimeMinutes, setTravelTimeMinutes] = useState(15);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSalon = async () => {
      try {
        const res = await api.get(`/salons/${id}`);
        setSalon(res.data.salon);
        setServices(res.data.services || []);
        setStaff(res.data.staff || []);
        if (res.data.services?.length > 0) {
          setServiceId(res.data.services[0]._id);
        }
      } catch (err) {
        console.error('Failed to load salon:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalon();
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
      await api.post('/bookings', {
        salonId: id,
        serviceId,
        staffId: staffId || null,
        date,
        scheduledTime,
        travelTimeMinutes: Number(travelTimeMinutes),
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book slot');
      setSubmitting(false);
    }
  };

  const timeSlots = [
    '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  if (loading) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading appointment slots...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="bg-slate-900 text-white p-6 sm:p-8 space-y-1">
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Calendar className="w-4 h-4" />
            <span>Schedule Slot</span>
          </div>
          <h1 className="text-2xl font-extrabold">{salon?.name}</h1>
          <p className="text-xs text-slate-400">
            Choose your preferred date and time for guaranteed reservation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-emerald-700 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Appointment booked successfully! Redirecting...</span>
            </div>
          )}

          {/* Service */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Service
            </label>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              {services.map((srv) => (
                <option key={srv._id} value={srv._id}>
                  {srv.name} (₹{srv.price} • {srv.duration} mins)
                </option>
              ))}
            </select>
          </div>

          {/* Staff */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Select Stylist
            </label>
            <select
              value={staffId}
              onChange={(e) => setStaffId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Any Available Stylist</option>
              {staff.map((st) => (
                <option key={st._id} value={st._id}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Appointment Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Time Slots Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Available Time Slots
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setScheduledTime(slot)}
                  className={`py-2 text-xs font-bold rounded-xl border transition ${
                    scheduledTime === slot
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Confirming Slot...' : 'Confirm Appointment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingPage;
