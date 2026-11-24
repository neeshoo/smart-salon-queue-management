import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 animate-pulse space-y-4">
    <div className="h-44 bg-slate-200 dark:bg-slate-700 rounded-xl w-full"></div>
    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
    <div className="pt-2 flex justify-between items-center">
      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
      <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-lg w-24"></div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3 animate-pulse">
    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-10 bg-slate-100 dark:bg-slate-700/60 rounded flex items-center justify-between px-4">
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-16"></div>
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-32"></div>
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-20"></div>
        <div className="h-3 bg-slate-300 dark:bg-slate-600 rounded w-12"></div>
      </div>
    ))}
  </div>
);

export default CardSkeleton;
