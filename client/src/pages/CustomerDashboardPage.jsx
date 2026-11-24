import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Star,
  Scissors,
} from 'lucide-react';
import { TableSkeleton } from '../components/LoadingSkeleton';

const CustomerDashboardPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error('Failed to load user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`, { reason: 'User cancelled' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const activeBooking = bookings.find((b) =>
    ['WAITING', 'CALLED', 'IN_SERVICE'].includes(b.status)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome & Active Token Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hello, {user?.name || 'Customer'} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your virtual queue tokens, appointments, and service history
          </p>
        </div>
        <Link
          to="/salons"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
        >
          <Scissors className="w-4 h-4" />
          <span>Browse Salons</span>
        </Link>
      </div>

      {/* Active Token Highlight Card */}
      {activeBooking && (
        <div className="p-6 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                Active Live Queue Token
              </span>
            </div>
            <h2 className="text-3xl font-black">{activeBooking.tokenFormatted}</h2>
            <p className="text-xs text-indigo-200">
              {activeBooking.salonId?.name} • {activeBooking.serviceId?.name}
            </p>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <Link
              to={`/live-tracker/${activeBooking._id}`}
              className="flex-1 sm:flex-initial px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow transition text-center"
            >
              Track Queue
            </Link>
          </div>
        </div>
      )}

      {/* Bookings & Queue History Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Booking & Queue History
          </h2>
          <span className="text-xs text-slate-500">{bookings.length} total entries</span>
        </div>

        {loading ? (
          <TableSkeleton rows={4} />
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-500">
            No booking history found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Token</th>
                  <th className="px-5 py-3">Salon</th>
                  <th className="px-5 py-3">Service</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {b.tokenFormatted}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {b.salonId?.name || 'Salon'}
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {b.serviceId?.name || 'Service'}
                    </td>
                    <td className="px-5 py-4 text-slate-500">{b.date}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          b.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : b.status === 'WAITING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                            : b.status === 'CALLED'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                            : b.status === 'IN_SERVICE'
                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-900 dark:text-white">
                      ₹{b.totalPrice}
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      {['WAITING', 'CALLED', 'IN_SERVICE'].includes(b.status) && (
                        <Link
                          to={`/live-tracker/${b._id}`}
                          className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg hover:underline"
                        >
                          Track
                        </Link>
                      )}
                      {['WAITING', 'CALLED'].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          className="px-2.5 py-1 text-rose-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboardPage;
