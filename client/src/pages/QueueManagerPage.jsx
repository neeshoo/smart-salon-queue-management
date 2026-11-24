import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Clock,
  UserPlus,
  Play,
  CheckCircle2,
  PhoneCall,
  UserX,
  SkipForward,
  XCircle,
  AlertCircle,
  Flame,
  Search,
} from 'lucide-react';
import Toast from '../components/Toast';

const QueueManagerPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [queueData, setQueueData] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Walk-in modal
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [walkInPhone, setWalkInPhone] = useState('');
  const [walkInServiceId, setWalkInServiceId] = useState('');
  const [walkInStaffId, setWalkInStaffId] = useState('');
  const [walkInPriority, setWalkInPriority] = useState('NORMAL');

  const salonId = user?.salonId?._id || user?.salonId;

  const loadQueue = async () => {
    if (!salonId) {
      setError('Your account is not linked to any salon. Please contact the administrator.');
      setLoading(false);
      return;
    }
    try {
      const [qRes, sRes, stRes] = await Promise.all([
        api.get(`/queue/${salonId}`),
        api.get(`/salons/${salonId}/services`),
        api.get(`/staff/salon/${salonId}`),
      ]);
      setQueueData(qRes.data);
      setServices(sRes.data.services || []);
      setStaff(stRes.data.staff || []);
      setError('');
      if (!walkInServiceId && sRes.data.services?.length > 0) {
        setWalkInServiceId(sRes.data.services[0]._id);
      }
    } catch (err) {
      console.error('Failed to load queue manager:', err);
      setError(err.response?.data?.message || 'Failed to load queue data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [salonId]);

  // Socket sync
  useEffect(() => {
    if (!socket || !salonId) return;
    socket.emit('join:salon', salonId);
    socket.on('queue:update', () => {
      loadQueue();
    });

    return () => {
      socket.off('queue:update');
      socket.emit('leave:salon', salonId);
    };
  }, [socket, salonId]);

  const handleAction = async (bookingId, status) => {
    try {
      await api.patch(`/queue/${salonId}/${bookingId}/status`, { status });
      setToastMessage(`Status changed to ${status}`);
      setToastType('info');
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await api.post(`/queue/${salonId}/next`, {});
      setToastMessage(`Called token ${res.data.booking.tokenFormatted}!`);
      setToastType('success');
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'No waiting tokens in queue');
    }
  };

  const handleAddWalkIn = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/queue/${salonId}/walk-in`, {
        customerName: walkInName || 'Walk-in Guest',
        customerPhone: walkInPhone,
        serviceId: walkInServiceId,
        staffId: walkInStaffId || null,
        priority: walkInPriority,
      });

      setShowWalkInModal(false);
      setWalkInName('');
      setWalkInPhone('');
      setToastMessage('Walk-in added to queue!');
      setToastType('success');
      loadQueue();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add walk-in');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading queue engine...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Queue Control Unavailable</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); loadQueue(); }}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Salon Floor Operations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Live Queue Dashboard
          </h1>
          <p className="text-xs text-slate-500">
            {queueData?.today} • Total Waiting: {queueData?.totalWaiting || 0} • Active Stylists: {queueData?.activeStaffCount || staff.length}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowWalkInModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Walk-In</span>
          </button>
          <button
            onClick={handleCallNext}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Next</span>
          </button>
        </div>
      </div>

      {/* Three Columns: IN SERVICE | CALLED | WAITING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. IN SERVICE */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
              In Service ({queueData?.inService?.length || 0})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
            {queueData?.inService?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No active services right now</p>
            ) : (
              queueData?.inService?.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-black text-indigo-600 dark:text-indigo-400">
                        {b.tokenFormatted}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {b.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {b.serviceId?.name} • ₹{b.totalPrice}
                      </p>
                    </div>
                    <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                      Stylist: {b.staffId?.name || 'Assigned'}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAction(b._id, 'COMPLETED')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Service</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 2. CALLED */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-rose-50/70 dark:bg-rose-950/40 border-b border-rose-100 dark:border-rose-900 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900 dark:text-rose-200">
              Called & Arriving ({queueData?.called?.length || 0})
            </h3>
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
            {queueData?.called?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No called customers waiting</p>
            ) : (
              queueData?.called?.map((b) => (
                <div
                  key={b._id}
                  className="p-4 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50/20 dark:bg-rose-950/20 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                        {b.tokenFormatted}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {b.customerName}
                      </h4>
                      <p className="text-[11px] text-slate-500">{b.serviceId?.name}</p>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold">
                      Called ~{Math.floor((Date.now() - new Date(b.calledAt).getTime()) / 60000)}m ago
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction(b._id, 'IN_SERVICE')}
                      className="py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Start Cut</span>
                    </button>
                    <button
                      onClick={() => handleAction(b._id, 'NO_SHOW')}
                      className="py-2 bg-slate-100 dark:bg-slate-700 hover:bg-rose-100 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                    >
                      <UserX className="w-3.5 h-3.5" />
                      <span>No-Show</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. WAITING */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 bg-slate-50 dark:bg-slate-750 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Waiting Queue ({queueData?.waiting?.length || 0})
            </h3>
            <span className="text-[11px] font-bold text-indigo-600">
              ~{queueData?.estimatedWaitMinutes || 0} min line
            </span>
          </div>

          <div className="p-4 space-y-2 flex-1 overflow-y-auto max-h-[600px]">
            {queueData?.waiting?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No waiting customers in queue</p>
            ) : (
              queueData?.waiting?.map((b, idx) => (
                <div
                  key={b._id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-400 flex items-center justify-between transition text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {b.tokenFormatted}
                      </span>
                      {b.priority !== 'NORMAL' && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                          {b.priority}
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                      {b.customerName}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {b.serviceId?.name} • ~{b.totalDuration} mins
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleAction(b._id, 'CALLED')}
                      className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[11px]"
                    >
                      Call
                    </button>
                    <button
                      onClick={() => handleAction(b._id, 'CANCELLED')}
                      className="p-1 text-slate-400 hover:text-rose-600"
                      title="Cancel Token"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Walk-In Modal */}
      {showWalkInModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddWalkIn}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Add Manual Walk-In Customer
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Customer Name
              </label>
              <input
                type="text"
                required
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                value={walkInPhone}
                onChange={(e) => setWalkInPhone(e.target.value)}
                placeholder="+91 98765 XXXXX"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Service
              </label>
              <select
                value={walkInServiceId}
                onChange={(e) => setWalkInServiceId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                {services.map((srv) => (
                  <option key={srv._id} value={srv._id}>
                    {srv.name} (₹{srv.price})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Priority Tier
              </label>
              <select
                value={walkInPriority}
                onChange={(e) => setWalkInPriority(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NORMAL">Standard Walk-in</option>
                <option value="SENIOR">Senior Citizen (Fair Priority)</option>
                <option value="VIP">VIP Customer (High Priority)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowWalkInModal(false)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow"
              >
                Add to Queue
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default QueueManagerPage;
