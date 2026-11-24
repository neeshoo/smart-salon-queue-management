import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Shield, CheckCircle, XCircle, Users, Scissors, Building, AlertCircle, RefreshCw } from 'lucide-react';
import Toast from '../components/Toast';

const SuperAdminPage = () => {
  const [stats, setStats] = useState(null);
  const [salons, setSalons] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('salons');
  const [toastMessage, setToastMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [dashRes, salonsRes, usersRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/salons'),
        api.get('/admin/users'),
      ]);
      setStats(dashRes.data.stats);
      setSalons(salonsRes.data.salons || []);
      setUsers(usersRes.data.users || []);
    } catch (err) {
      console.error('Failed to load superadmin data:', err);
      setError(err.response?.data?.message || 'Failed to load system administration data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproval = async (salonId, isApproved) => {
    try {
      await api.patch(`/admin/salons/${salonId}/approval`, { isApproved });
      setToastMessage(`Salon approval status updated`);
      loadData();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleToggleActive = async (salonId, currentActive) => {
    try {
      await api.patch(`/admin/salons/${salonId}/approval`, { isActive: !currentActive });
      setToastMessage(`Salon active state updated`);
      loadData();
    } catch (err) {
      alert('Failed to update salon');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-500">Loading Super Admin console...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center px-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Failed to Load Admin Console</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
        <button
          onClick={loadData}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition inline-flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Toast message={toastMessage} type="info" onClose={() => setToastMessage('')} />

      <div>
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/70 border border-purple-200 text-purple-700 dark:text-purple-300 text-xs font-bold mb-2">
          <Shield className="w-3.5 h-3.5" />
          <span>Platform Super Admin</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          System Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Global platform stats, salon approval verification, and user accounts
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Salons</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats?.totalSalons || 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Approvals</span>
          <div className="text-2xl font-black text-amber-600 mt-1">
            {stats?.pendingSalons || 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Platform Users</span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {stats?.totalUsers || 0}
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Tokens Processed</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">
            {stats?.totalBookings || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <button
          onClick={() => setActiveTab('salons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'salons'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Salons Directory ({salons.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'users'
              ? 'bg-purple-600 text-white shadow'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Platform Users ({users.length})
        </button>
      </div>

      {/* Content based on Tab */}
      {activeTab === 'salons' ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Salon Name</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">Approval</th>
                  <th className="px-5 py-3">Active State</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {salons.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {s.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {s.ownerId?.name} ({s.ownerId?.email})
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {s.address?.city}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isApproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {s.isApproved ? 'Approved' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          s.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleApproval(s._id, !s.isApproved)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      >
                        {s.isApproved ? 'Revoke Approval' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(s._id, s.isActive)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded-lg ${
                          s.isActive ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {s.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-750 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Phone</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Registered On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-750/50">
                    <td className="px-5 py-4 font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {u.phone || 'N/A'}
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminPage;
