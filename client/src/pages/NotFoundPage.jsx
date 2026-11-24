import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 flex items-center justify-center mb-4">
        <Scissors className="w-8 h-8 rotate-90" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300 mt-2">
        Page Not Found
      </h2>
      <p className="text-xs text-slate-500 mt-1 max-w-sm">
        The queue, booking, or salon page you are looking for does not exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center space-x-1.5"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};

export default NotFoundPage;
