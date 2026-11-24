import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import SalonListPage from './pages/SalonListPage';
import SalonDetailPage from './pages/SalonDetailPage';
import JoinQueuePage from './pages/JoinQueuePage';
import LiveTrackerPage from './pages/LiveTrackerPage';
import BookingPage from './pages/BookingPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import StaffPanelPage from './pages/StaffPanelPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import QueueManagerPage from './pages/QueueManagerPage';
import ServicesStaffManagerPage from './pages/ServicesStaffManagerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SuperAdminPage from './pages/SuperAdminPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/salons" element={<SalonListPage />} />
          <Route path="/salons/:id" element={<SalonDetailPage />} />

          {/* Customer & Queue Tracking */}
          <Route element={<ProtectedRoute allowedRoles={['customer', 'staff', 'admin', 'superadmin']} />}>
            <Route path="/salons/:id/join" element={<JoinQueuePage />} />
            <Route path="/salons/:id/book" element={<BookingPage />} />
            <Route path="/live-tracker/:bookingId" element={<LiveTrackerPage />} />
            <Route path="/my-queue" element={<LiveTrackerPage />} />
            <Route path="/dashboard" element={<CustomerDashboardPage />} />
          </Route>

          {/* Staff Counter */}
          <Route element={<ProtectedRoute allowedRoles={['staff', 'admin', 'superadmin']} />}>
            <Route path="/staff/panel" element={<StaffPanelPage />} />
          </Route>

          {/* Salon Admin / Owner Operations */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'superadmin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/queue" element={<QueueManagerPage />} />
            <Route path="/admin/services" element={<ServicesStaffManagerPage />} />
            <Route path="/admin/analytics" element={<AnalyticsPage />} />
          </Route>

          {/* Super Admin Console */}
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/superadmin" element={<SuperAdminPage />} />
          </Route>

          {/* 404 Catch All */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
