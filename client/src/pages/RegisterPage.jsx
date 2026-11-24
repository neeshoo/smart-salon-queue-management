import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Scissors, Lock, Mail, User, Phone, AlertCircle, ArrowRight, Store, Clock, IndianRupee, MapPin } from 'lucide-react';

const CATEGORIES = [
  'Budget Barber',
  'Neighborhood Salon',
  'Modern Grooming',
  'Unisex Salon',
  'Premium Salon',
  'Family Salon',
];

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });
  const [salonData, setSalonData] = useState({
    salonName: '',
    salonCategory: 'Neighborhood Salon',
    street: '',
    city: 'Mahendragarh',
    state: 'Haryana',
    description: '',
    openingHour: '09:00',
    closingHour: '20:00',
    serviceName: 'Normal Haircut',
    servicePrice: '50',
    serviceDuration: '20',
  });
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSalonChange = (e) => {
    setSalonData({ ...salonData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    let raw = e.target.value;
    // Strip all non-digit characters
    let digits = raw.replace(/\D/g, '');

    // Prevent duplicate +91 if user pastes a number with 91 prefix
    if (digits.length > 10 && digits.startsWith('91')) {
      digits = digits.slice(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      // Strip leading 0
      digits = digits.slice(1);
    }

    // Limit to exactly 10 digits
    digits = digits.slice(0, 10);
    setPhoneDigits(digits);

    // Dynamic error clearing when number reaches 10 valid digits
    if (phoneError) {
      if (digits.length === 10 && /^[6-9]/.test(digits)) {
        setPhoneError('');
      }
    }
  };

  const formatPhoneDisplay = (digits) => {
    if (!digits) return '';
    if (digits.length > 5) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    }
    return digits;
  };

  const validatePhone = (digits) => {
    if (!digits || !digits.trim()) {
      return 'Phone number is required. Please enter your 10-digit mobile number.';
    }
    if (digits.length !== 10) {
      return 'Phone number must be exactly 10 digits.';
    }
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return 'Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.';
    }
    return '';
  };

  const handlePhoneBlur = () => {
    if (phoneDigits) {
      const err = validatePhone(phoneDigits);
      setPhoneError(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phoneValidationMsg = validatePhone(phoneDigits);
    if (phoneValidationMsg) {
      setPhoneError(phoneValidationMsg);
      setError(phoneValidationMsg);
      return;
    }

    if (formData.role === 'admin' && !salonData.salonName.trim()) {
      setError('Please provide your Salon Name to complete salon owner registration.');
      return;
    }

    setPhoneError('');
    setLoading(true);

    try {
      // Always store in consistent E.164 international format without duplicate +91
      const payload = {
        ...formData,
        phone: `+91${phoneDigits}`,
      };

      if (formData.role === 'admin') {
        payload.salon = {
          name: salonData.salonName.trim(),
          category: salonData.salonCategory,
          description: salonData.description || 'Professional salon & grooming services.',
          address: {
            street: salonData.street,
            city: salonData.city || 'Mahendragarh',
            state: salonData.state || 'Haryana',
          },
          openingHour: salonData.openingHour || '09:00',
          closingHour: salonData.closingHour || '20:00',
          initialService: {
            name: salonData.serviceName || 'Normal Haircut',
            price: Number(salonData.servicePrice) || 50,
            duration: Number(salonData.serviceDuration) || 20,
          },
        };
      }

      const loggedUser = await register(payload);
      if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/salons');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-lg text-center">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/30">
          <Scissors className="w-6 h-6 rotate-90" />
        </div>
        <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white">
          Create an Account
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {formData.role === 'admin'
            ? 'Register as a Salon Owner to list your salon and manage queues'
            : 'Join virtual queues, track wait times, and discover top salons'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl rounded-2xl sm:px-10 border border-slate-200 dark:border-slate-700 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account Type Selector (Only 2 Public Options: Customer & Salon Owner) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Account Type
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="customer">Customer (Join queues & book appointments)</option>
                <option value="admin">Salon Owner (Register & manage your salon)</option>
              </select>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                {formData.role === 'admin' ? 'Owner Credentials' : 'Personal Details'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={formData.role === 'admin' ? 'e.g. Vikram Yadav' : 'e.g. Rahul Sharma'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Mobile Number
                </label>
                <span className="text-[11px] text-slate-400">Format: +91 98765 43210</span>
              </div>
              <div
                className={`relative flex items-center rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition focus-within:ring-2 focus-within:ring-indigo-500 ${
                  phoneError
                    ? 'border-rose-400 dark:border-rose-600'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                {/* Fixed +91 Country Code Badge */}
                <div className="flex items-center pl-3.5 pr-2.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-r border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 select-none shrink-0 space-x-1.5">
                  <Phone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="text-sm font-bold tracking-wide">+91</span>
                </div>
                {/* 10-Digit Mobile Input */}
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formatPhoneDisplay(phoneDigits)}
                  onChange={handlePhoneChange}
                  onBlur={handlePhoneBlur}
                  placeholder="98765 43210"
                  maxLength={11}
                  className="w-full px-3.5 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                />
              </div>
              {phoneError && (
                <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{phoneError}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Essential Salon Information Section (Only for Salon Owner) */}
            {formData.role === 'admin' && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                  <Store className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Salon Information
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Salon Name *
                  </label>
                  <input
                    type="text"
                    name="salonName"
                    required
                    value={salonData.salonName}
                    onChange={handleSalonChange}
                    placeholder="e.g. Royal Men's Grooming Studio"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Salon Category
                    </label>
                    <select
                      name="salonCategory"
                      value={salonData.salonCategory}
                      onChange={handleSalonChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      City & State
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="city"
                        value={salonData.city}
                        onChange={handleSalonChange}
                        placeholder="City"
                        className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <input
                        type="text"
                        name="state"
                        value={salonData.state}
                        onChange={handleSalonChange}
                        placeholder="State"
                        className="w-full px-2.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Street Address / Area
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={salonData.street}
                    onChange={handleSalonChange}
                    placeholder="e.g. Main Market, Near Bus Stand"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      name="openingHour"
                      value={salonData.openingHour}
                      onChange={handleSalonChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      name="closingHour"
                      value={salonData.closingHour}
                      onChange={handleSalonChange}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Primary Service */}
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Primary Service & Starting Price
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <input
                        type="text"
                        name="serviceName"
                        value={salonData.serviceName}
                        onChange={handleSalonChange}
                        placeholder="Service Name (e.g. Haircut)"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          name="servicePrice"
                          min="10"
                          value={salonData.servicePrice}
                          onChange={handleSalonChange}
                          placeholder="50"
                          className="w-full pl-6 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
            >
              <span>
                {loading
                  ? 'Creating Account...'
                  : formData.role === 'admin'
                  ? 'Register Salon & Create Account'
                  : 'Register'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

