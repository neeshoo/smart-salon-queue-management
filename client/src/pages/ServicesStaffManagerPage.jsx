import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Scissors, Users, Plus, Trash2, Edit3, Clock, IndianRupee, Star, AlertCircle, RefreshCw } from 'lucide-react';
import Toast from '../components/Toast';

const ServicesStaffManagerPage = () => {
  const { user } = useAuth();
  const salonId = user?.salonId?._id || user?.salonId;

  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Modals
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  // New Service Form
  const [serviceName, setServiceName] = useState('');
  const [serviceCategory, setServiceCategory] = useState('Haircut');
  const [servicePrice, setServicePrice] = useState(50);
  const [serviceDuration, setServiceDuration] = useState(30);

  // New Staff Form
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    if (!salonId) {
      setError('Your account is not linked to any salon. Please contact the administrator.');
      setLoading(false);
      return;
    }
    try {
      const [sRes, stRes] = await Promise.all([
        api.get(`/salons/${salonId}/services`),
        api.get(`/staff/salon/${salonId}`),
      ]);
      setServices(sRes.data.services || []);
      setStaff(stRes.data.staff || []);
    } catch (err) {
      console.error('Failed to load services and staff:', err);
      setError(err.response?.data?.message || 'Failed to load data. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [salonId]);

  const handleCreateService = async (e) => {
    e.preventDefault();
    try {
      await api.post('/services', {
        salonId,
        name: serviceName,
        category: serviceCategory,
        price: Number(servicePrice),
        duration: Number(serviceDuration),
      });
      setShowServiceModal(false);
      setServiceName('');
      setToastMessage('Service created successfully!');
      setToastType('success');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create service');
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Deactivate this service?')) return;
    try {
      await api.delete(`/services/${serviceId}`);
      setToastMessage('Service removed');
      setToastType('info');
      loadData();
    } catch (err) {
      alert('Failed to delete service');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/staff', {
        salonId,
        name: staffName,
        email: staffEmail,
        phone: staffPhone,
      });
      setShowStaffModal(false);
      setStaffName('');
      setStaffEmail('');
      setStaffPhone('');
      setToastMessage('Staff member added successfully!');
      setToastType('success');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add staff member');
    }
  };

  const handleDeleteStaff = async (staffId) => {
    if (!window.confirm('Deactivate this staff member?')) return;
    try {
      await api.delete(`/staff/${staffId}`);
      setToastMessage('Staff deactivated');
      setToastType('info');
      loadData();
    } catch (err) {
      alert('Failed to delete staff member');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={loadData} className="text-xs font-bold underline flex items-center space-x-1"><RefreshCw className="w-3.5 h-3.5" /><span>Retry</span></button>
        </div>
      )}

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Services & Staff Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Configure service menu prices, durations, and manage stylist team
        </p>
      </div>

      {/* Services Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Scissors className="w-5 h-5 text-indigo-600" />
              <span>Service Catalog ({services.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Duration controls wait-time algorithm accuracy</p>
          </div>
          <button
            onClick={() => setShowServiceModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex justify-between items-start"
            >
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">
                  {srv.category}
                </span>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{srv.name}</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500">
                  <span>₹{srv.price}</span>
                  <span>•</span>
                  <span>{srv.duration} mins (Learned: ~{srv.avgActualDuration || srv.duration}m)</span>
                </div>
              </div>
              <button
                onClick={() => handleDeleteService(srv._id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Section */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <span>Stylist Team ({staff.length})</span>
            </h2>
            <p className="text-xs text-slate-500">Active stylists share the queue waiting load</p>
          </div>
          <button
            onClick={() => setShowStaffModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {staff.map((st) => (
            <div
              key={st._id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4"
            >
              <img
                src={st.avatar}
                alt={st.name}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                  {st.name}
                </h4>
                <p className="text-xs text-slate-500 truncate">{st.email || 'No email'}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                    st.status === 'Available'
                      ? 'bg-emerald-100 text-emerald-800'
                      : st.status === 'Busy'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {st.status}
                </span>
              </div>
              <button
                onClick={() => handleDeleteStaff(st._id)}
                className="text-slate-400 hover:text-rose-600 p-1"
                title="Deactivate"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Modal */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateService}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Service</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Service Name
              </label>
              <input
                type="text"
                required
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Haircut, Beard Trim, Hair Spa"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Category
              </label>
              <select
                value={serviceCategory}
                onChange={(e) => setServiceCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Haircut">Haircut</option>
                <option value="Beard & Shave">Beard & Shave</option>
                <option value="Styling">Styling</option>
                <option value="Spa & Facial">Spa & Facial</option>
                <option value="Treatment">Treatment</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={servicePrice}
                  onChange={(e) => setServicePrice(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Duration (mins)
                </label>
                <input
                  type="number"
                  min="5"
                  required
                  value={serviceDuration}
                  onChange={(e) => setServiceDuration(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowServiceModal(false)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow"
              >
                Save Service
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add Stylist</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Stylist Name
              </label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder="e.g. Deepak, Rohit, Pankaj"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder="jessica@salon.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={staffPhone}
                onChange={(e) => setStaffPhone(e.target.value)}
                placeholder="+91 98765 XXXXX"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowStaffModal(false)}
                className="py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 text-xs font-bold rounded-xl bg-indigo-600 text-white shadow"
              >
                Save Staff
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ServicesStaffManagerPage;
