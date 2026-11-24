import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  Layers,
  PhoneCall,
  Play,
  CheckCircle2,
  Clock,
  UserX,
  SkipForward,
  Coffee,
  CheckCircle,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import Toast from '../components/Toast';

const StaffPanelPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [staffInfo, setStaffInfo] = useState(null);
  const [salonQueue, setSalonQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const salonId = user?.salonId?._id || user?.salonId;

  const loadData = async () => {
    if (!salonId) {
      setError('Your staff account is not linked to any salon. Please contact your salon manager.');
      setLoading(false);
      return;
    }
    try {
      const [queueRes, staffRes] = await Promise.all([
        api.get(`/queue/${salonId}`),
        api.get(`/staff/salon/${salonId}`),
      ]);

      setSalonQueue(queueRes.data);
      const myStaffProfile = staffRes.data.staff?.find(
        (s) => s.userId === user._id || s.email === user.email
      );
      setStaffInfo(myStaffProfile || staffRes.data.staff?.[0]);
      setError('');
    } catch (err) {
      console.error('Failed to load staff panel data:', err);
      setError(err.response?.data?.message || 'Failed to load staff terminal data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [salonId]);

  // Socket listener for real-time changes
  useEffect(() => {
    if (!socket || !salonId) return;

    socket.emit('join:salon', salonId);
    socket.on('queue:update', () => {
      loadData();
    });

    return () => {
      socket.off('queue:update');
      socket.emit('leave:salon', salonId);
    };
  }, [socket, salonId]);

  const handleStatusChange = async (newStatus) => {
    if (!staffInfo) return;
    try {
      await api.patch(`/staff/${staffInfo._id}/status`, { status: newStatus });
      setStaffInfo({ ...staffInfo, status: newStatus });
      setToastMessage(`Status changed to ${newStatus}`);
      setToastType('success');
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleCallNext = async () => {
    try {
      const res = await api.post(`/queue/${salonId}/next`, {
        staffId: staffInfo?._id,
      });
      setToastMessage(`Called ${res.data.booking.tokenFormatted}!`);
      setToastType('success');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'No waiting customers in queue');
    }
  };

  const handleTokenAction = async (bookingId, newStatus) => {
    try {
      await api.patch(`/queue/${salonId}/${bookingId}/status`, {
        status: newStatus,
        staffId: staffInfo?._id,
      });
      setToastMessage(`Token status updated to ${newStatus}`);
      setToastType('info');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update token');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading staff terminal...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Staff Terminal Unavailable</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={() => { setLoading(true); setError(''); loadData(); }}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // Active token being served or called by this staff member
  const currentAssigned = [
    ...(salonQueue?.inService || []),
    ...(salonQueue?.called || []),
  ].find((b) => b.staffId?._id === staffInfo?._id || b.staffId === staffInfo?._id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Staff Status Header */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Staff Service Terminal
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {staffInfo?.name || user?.name}
          </h1>
          <p className="text-xs text-slate-500">
            {salonQueue?.today} • {salonQueue?.totalWaiting || 0} customers waiting in salon
          </p>
        </div>

        {/* Status Switcher Buttons */}
        <div className="flex items-center space-x-2">
          {['Available', 'Busy', 'On Break'].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition ${
                staffInfo?.status === st
                  ? 'border-indigo-600 bg-indigo-600 text-white shadow'
                  : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Action Workstation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Current Active Customer Station */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Current Active Customer
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                Chair #1
              </span>
            </div>

            {currentAssigned ? (
              <div className="space-y-6 text-center">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Token Number
                  </span>
                  <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                    {currentAssigned.tokenFormatted}
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {currentAssigned.customerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {currentAssigned.serviceId?.name} (₹{currentAssigned.totalPrice})
                  </p>
                </div>

                {/* State Tag */}
                <div className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                  Status: {currentAssigned.status}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {currentAssigned.status === 'CALLED' ? (
                    <button
                      onClick={() => handleTokenAction(currentAssigned._id, 'IN_SERVICE')}
                      className="col-span-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-4 h-4" />
                      <span>Start Service</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleTokenAction(currentAssigned._id, 'COMPLETED')}
                      className="col-span-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Service</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleTokenAction(currentAssigned._id, 'SKIPPED')}
                    className="py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip</span>
                  </button>
                  <button
                    onClick={() => handleTokenAction(currentAssigned._id, 'NO_SHOW')}
                    className="py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl flex items-center justify-center space-x-1"
                  >
                    <UserX className="w-3.5 h-3.5" />
                    <span>No-Show</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto text-slate-400">
                  <PhoneCall className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Chair is Available
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Press below to summon the next customer according to priority queue order.
                  </p>
                </div>
                <button
                  onClick={handleCallNext}
                  className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center space-x-2 mx-auto"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Next Customer</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Waiting Queue List */}
        <div className="lg:col-span-7">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Waiting Queue ({salonQueue?.waiting?.length || 0})
                </h2>
                <p className="text-xs text-slate-500">Ordered by Priority & Token Time</p>
              </div>
              <button
                onClick={handleCallNext}
                className="px-3.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl hover:bg-indigo-100 transition"
              >
                + Call Next
              </button>
            </div>

            {salonQueue?.waiting?.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Queue is clear! No customers currently waiting.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 max-h-[500px] overflow-y-auto">
                {salonQueue?.waiting?.map((b, idx) => (
                  <div
                    key={b._id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-750/50 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-extrabold text-sm text-indigo-600 dark:text-indigo-400">
                            {b.tokenFormatted}
                          </span>
                          {b.priority !== 'NORMAL' && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              {b.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {b.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {b.serviceId?.name} • ~{b.totalDuration} mins
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleTokenAction(b._id, 'CALLED')}
                        className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 shadow-sm"
                      >
                        Call
                      </button>
                      <button
                        onClick={() => handleTokenAction(b._id, 'SKIPPED')}
                        className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-semibold"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPanelPage;
