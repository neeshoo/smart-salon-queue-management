import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import {
  Clock,
  Users,
  Navigation,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Scissors,
  ArrowLeft,
  XCircle,
  Star,
} from 'lucide-react';
import Toast from '../components/Toast';

const LiveTrackerPage = () => {
  const { bookingId } = useParams();
  const { socket } = useSocket();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [staffCount, setStaffCount] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  // Review modal state if completed
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchStatus = async () => {
    try {
      if (bookingId) {
        // Resolve the actual salonId from the booking record first
        const bookingRes = await api.get(`/bookings/${bookingId}`);
        const bk = bookingRes.data.booking;
        if (!bk) {
          setBooking(null);
          setLoading(false);
          return;
        }
        const sid = bk.salonId?._id || bk.salonId;
        const res = await api.get(`/queue/${sid}/my-status?bookingId=${bookingId}`);
        if (res.data.hasActiveBooking) {
          setBooking(res.data.booking);
          setPeopleAhead(res.data.peopleAhead);
          setEstimatedWait(res.data.estimatedWaitMinutes);
          setStaffCount(res.data.staffCount || 1);
        } else {
          setBooking(null);
        }
      } else {
        // Fallback: find any active booking for this user
        const myBookings = await api.get('/bookings/my?limit=10');
        const active = myBookings.data.bookings?.find((b) =>
          ['WAITING', 'CALLED', 'IN_SERVICE'].includes(b.status)
        );
        if (active) {
          const sid = active.salonId?._id || active.salonId;
          const res = await api.get(`/queue/${sid}/my-status?bookingId=${active._id}`);
          if (res.data.hasActiveBooking) {
            setBooking(res.data.booking);
            setPeopleAhead(res.data.peopleAhead);
            setEstimatedWait(res.data.estimatedWaitMinutes);
            setStaffCount(res.data.staffCount || 1);
          } else {
            setBooking(null);
          }
        } else {
          setBooking(null);
        }
      }
    } catch (err) {
      console.error('Error fetching queue status:', err);
      setBooking(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [bookingId]);

  // Real-time socket events
  useEffect(() => {
    if (!socket || !booking?.salonId) return;

    const salonId = booking.salonId._id || booking.salonId;
    socket.emit('join:salon', salonId);

    const handleQueueUpdate = (data) => {
      console.log('[Socket] Queue updated:', data);
      fetchStatus();
    };

    const handleTokenCalled = (data) => {
      if (booking && data.bookingId === booking._id) {
        setToastMessage('🚨 YOUR TURN! Please proceed to the service counter!');
        setToastType('warning');
        fetchStatus();
      }
    };

    const handleLeaveAlert = (data) => {
      if (booking && data.bookingId === booking._id) {
        setToastMessage(`🚗 Time to Leave! Estimated wait is ~${data.waitMinutes} mins.`);
        setToastType('warning');
        fetchStatus();
      }
    };

    socket.on('queue:update', handleQueueUpdate);
    socket.on('token:called', handleTokenCalled);
    socket.on('leave:alert', handleLeaveAlert);

    return () => {
      socket.off('queue:update', handleQueueUpdate);
      socket.off('token:called', handleTokenCalled);
      socket.off('leave:alert', handleLeaveAlert);
      socket.emit('leave:salon', salonId);
    };
  }, [socket, booking]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your queue token?')) return;
    try {
      await api.patch(`/bookings/${booking._id}/cancel`, { reason: 'Cancelled by customer' });
      setToastMessage('Token cancelled successfully');
      setToastType('info');
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel token');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        salonId: booking.salonId._id || booking.salonId,
        bookingId: booking._id,
        rating,
        comment,
      });
      setShowReviewModal(false);
      setToastMessage('Thank you for rating your experience!');
      setToastType('success');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-slate-500">Connecting to live queue stream...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Active Queue Token</h2>
        <p className="text-xs text-slate-500">
          You don't have an active token in any salon right now. Join a virtual queue to start tracking!
        </p>
        <Link
          to="/salons"
          className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow"
        >
          Browse Salons
        </Link>
      </div>
    );
  }

  const isLeaveNow = booking.status === 'WAITING' && estimatedWait <= (booking.travelTimeMinutes || 15) + 5;
  const isCalled = booking.status === 'CALLED';
  const isInService = booking.status === 'IN_SERVICE';
  const isCompleted = booking.status === 'COMPLETED';

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6">
      <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />

      {/* Top Bar with back link */}
      <div className="flex justify-between items-center">
        <Link
          to="/dashboard"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Bookings</span>
        </Link>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Live Stream
          </span>
        </div>
      </div>

      {/* Main Live Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden text-center">
        {/* Salon name header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-750 border-b border-slate-100 dark:border-slate-700">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {booking.salonId?.name || 'Salon'}
          </p>
          <p className="text-xs text-slate-500">{booking.serviceId?.name || 'Hair Service'}</p>
        </div>

        {/* Big Token Number Display */}
        <div className="p-6 space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Your Token Number
          </span>
          <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
            {booking.tokenFormatted}
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
            {booking.priority} PRIORITY
          </span>
        </div>

        {/* Live Status Banner */}
        <div className="px-6 py-3">
          {isCalled ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 animate-bounce">
              <h4 className="text-sm font-extrabold uppercase flex items-center justify-center space-x-1.5">
                <BellRing className="w-4 h-4" />
                <span>YOUR TURN NOW!</span>
              </h4>
              <p className="text-xs mt-1">Please enter the salon and take your seat!</p>
            </div>
          ) : isInService ? (
            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200">
              <h4 className="text-sm font-extrabold uppercase flex items-center justify-center space-x-1.5">
                <Scissors className="w-4 h-4" />
                <span>IN SERVICE</span>
              </h4>
              <p className="text-xs mt-1">Your service is currently underway.</p>
            </div>
          ) : isCompleted ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200">
              <h4 className="text-sm font-extrabold uppercase flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>SERVICE COMPLETED</span>
              </h4>
              <button
                onClick={() => setShowReviewModal(true)}
                className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow"
              >
                Leave a Review
              </button>
            </div>
          ) : isLeaveNow ? (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200">
              <h4 className="text-sm font-extrabold uppercase flex items-center justify-center space-x-1.5">
                <Navigation className="w-4 h-4 animate-pulse" />
                <span>LEAVE NOW FOR SALON!</span>
              </h4>
              <p className="text-xs mt-1">
                Your travel time is {booking.travelTimeMinutes} mins. Depart now to arrive just in time.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-200">
              <h4 className="text-sm font-bold uppercase">Relax at Home</h4>
              <p className="text-xs mt-1">We will alert you when it's time to head out.</p>
            </div>
          )}
        </div>

        {/* Live Wait Time & Position Numbers */}
        {!isCompleted && !isInService && (
          <div className="p-6 grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Estimated Wait</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                ~{estimatedWait} <span className="text-xs font-normal text-slate-500">mins</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-750">
              <span className="text-[11px] font-bold text-slate-400 uppercase">People Ahead</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                {peopleAhead} <span className="text-xs font-normal text-slate-500">waiting</span>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Stylist Info */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-750 text-xs flex justify-between items-center text-slate-600 dark:text-slate-400">
          <span>Assigned Stylist:</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {booking.staffId?.name || 'Fastest Available Stylist'}
          </span>
        </div>

        {/* Cancel Button */}
        {['WAITING', 'CALLED'].includes(booking.status) && (
          <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={handleCancel}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center justify-center space-x-1 mx-auto"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancel Queue Token</span>
            </button>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleReviewSubmit}
            className="bg-white dark:bg-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-200 dark:border-slate-700"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white text-center">
              Rate Your Experience
            </h3>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400"
                >
                  <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-400' : ''}`} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="How was your service?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            ></textarea>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700"
              >
                Skip
              </button>
              <button
                type="submit"
                className="py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default LiveTrackerPage;
