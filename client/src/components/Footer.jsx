import React from 'react';
import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 transition-colors mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Column 1 – Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Scissors className="w-4 h-4 rotate-90" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">SmartSalon</span>
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Book your salon visit, join virtual queues, and track your turn in real time. Save time and enjoy a smarter salon experience.
            </p>
          </div>

          {/* Column 2 – EXPLORE */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/salons" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Browse Salons
                </Link>
              </li>
              <li>
                <Link to="/my-queue" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Live Queue
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 – FOR SALONS */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              For Salons
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/admin/dashboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Salon Dashboard
                </Link>
              </li>
              <li>
                <Link to="/admin/queue" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Queue Management
                </Link>
              </li>
              <li>
                <Link to="/staff/panel" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Staff Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4 – SMART FEATURES */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-4">
              Smart Features
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link to="/my-queue" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Live Queue Tracking
                </Link>
              </li>
              <li>
                <Link to="/salons" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Wait Time Estimates
                </Link>
              </li>
              <li>
                <Link to="/salons" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Online Booking
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <p>© 2026 SmartSalon. All rights reserved.</p>
          <p className="font-medium text-slate-600 dark:text-slate-300">
            Your Time Matters.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
