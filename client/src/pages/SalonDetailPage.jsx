import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  Scissors,
  Users,
  QrCode,
  Calendar,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { CardSkeleton } from '../components/LoadingSkeleton';

const SalonDetailPage = () => {
  const { id } = useParams();
  const [salon, setSalon] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [liveQueue, setLiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    const fetchSalonData = async () => {
      try {
        const [salonRes, reviewsRes, queueRes] = await Promise.all([
          api.get(`/salons/${id}`),
          api.get(`/reviews/salon/${id}`),
          api.get(`/queue/${id}`),
        ]);

        setSalon(salonRes.data.salon);
        setServices(salonRes.data.services || []);
        setStaff(salonRes.data.staff || []);
        setReviews(reviewsRes.data.reviews || []);
        setLiveQueue(queueRes.data);
      } catch (err) {
        console.error('Failed to load salon details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonData();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <CardSkeleton />
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Salon Not Found</h2>
        <Link to="/salons" className="text-indigo-600 mt-2 inline-block">Back to Salons</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Banner & Info */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden bg-slate-100 dark:bg-slate-900">
          <img
            src={salon.images?.[0] || salon.logo}
            alt={salon.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row justify-between sm:items-end text-white gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-bold">
                  Open Today
                </span>
                <span className="flex items-center space-x-1 text-xs text-amber-300 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{salon.rating || 4.9} ({salon.numReviews || 0} reviews)</span>
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold">{salon.name}</h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center space-x-2">
                <MapPin className="w-4 h-4 shrink-0 text-slate-400" />
                <span>{salon.address?.street}, {salon.address?.city}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl text-xs font-semibold flex items-center space-x-2 transition"
                title="View Salon QR Code"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Code</span>
              </button>
              <Link
                to={`/salons/${salon._id}/join`}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 transition"
              >
                <Clock className="w-4 h-4" />
                <span>Join Queue</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Queue Pulse Strip */}
        <div className="bg-indigo-50 dark:bg-indigo-950/50 p-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Current Wait Time:</span>
              <strong className="text-sm text-indigo-700 dark:text-indigo-300 font-bold">
                ~{liveQueue?.estimatedWaitMinutes || 0} mins
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">People in Line:</span>
              <strong className="text-sm text-slate-800 dark:text-slate-200 font-bold">
                {liveQueue?.totalWaiting || 0} waiting
              </strong>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Stylists Active:</span>
              <strong className="text-sm text-slate-800 dark:text-slate-200 font-bold">
                {liveQueue?.activeStaffCount || staff.length} online
              </strong>
            </div>
          </div>
          <Link
            to={`/salons/${salon._id}/book`}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </Link>
        </div>
      </div>

      {/* Services Menu Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Services & Pricing</h2>
          <span className="text-xs text-slate-500">{services.length} services offered</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{srv.name}</h3>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    ₹{srv.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {srv.description || 'Professional styling service with quality products.'}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{srv.duration} mins</span>
                </span>
                <Link
                  to={`/salons/${salon._id}/join?serviceId=${srv._id}`}
                  className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition"
                >
                  Select & Join
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Stylists Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Our Master Stylists</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {staff.map((st) => (
            <div
              key={st._id}
              className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center space-x-4"
            >
              <img
                src={st.avatar}
                alt={st.name}
                className="w-14 h-14 rounded-xl object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {st.name}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      st.status === 'Available'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                        : st.status === 'Busy'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{st.rating || 4.9}</span>
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {st.specialties?.slice(0, 2).map((sp) => (
                    <span
                      key={sp._id}
                      className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300"
                    >
                      {sp.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500">No reviews yet. Be the first to leave a review after your service!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-900 dark:text-white">{rev.customerName}</span>
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{rev.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Scan to Join Queue</h3>
            <p className="text-xs text-slate-500">
              Customers can scan this QR code with their mobile phone camera to join the queue instantly at the salon entrance.
            </p>
            {salon.qrCodeData && (
              <img
                src={salon.qrCodeData}
                alt="Salon QR Code"
                className="w-56 h-56 mx-auto rounded-xl border border-slate-200 dark:border-slate-700 p-2"
              />
            )}
            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalonDetailPage;
