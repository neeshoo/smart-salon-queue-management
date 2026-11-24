import React from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  Navigation,
  Sparkles,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BellRing,
  Smartphone,
} from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5" />
                <span>LIVE SALON DISCOVERY</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                Find a Salon.{' '}
                <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                  Skip the Wait.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0">
                Explore nearby salons, compare services and prices, and join the live queue before you arrive.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/salons"
                  className="w-full sm:w-auto px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center space-x-2 transition transform hover:-translate-y-0.5"
                >
                  <span>Browse Salons</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/my-queue"
                  className="w-full sm:w-auto px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-semibold rounded-xl flex items-center justify-center space-x-2 transition"
                >
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span>Track Queue</span>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Real-time WebSocket Updates</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Historical AI Wait Estimation</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Smart Travel-Time Alerts</span>
                </span>
              </div>
            </div>

            {/* Right Live Simulation Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-sm sm:max-w-md bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Live Queue Simulation
                    </span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-300 rounded-lg">
                    T-004
                  </span>
                </div>

                <div className="py-6 text-center space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Your Current Estimated Wait
                  </span>
                  <div className="text-5xl font-black text-indigo-600 dark:text-indigo-400">
                    18 <span className="text-2xl font-semibold text-slate-400">mins</span>
                  </div>
                  <p className="text-xs text-slate-500">2 people ahead of you • 3 active stylists</p>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                    <span>Queue Progress</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">75%</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>

                {/* Smart Leave Now Alert Box */}
                <div className="mt-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start space-x-3 text-left">
                  <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase">
                      "Leave Now" Smart Notice
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                      Your travel time is 15 mins. Head out in <strong>3 minutes</strong> to arrive right as your token is called!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            How Smart Salon Works
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            No crowds, no waiting chairs. Just a seamless bridge between your home and the stylist chair.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            {
              step: '01',
              title: 'Discover & Choose',
              desc: 'Browse verified salons, compare service menus, durations, and check which are open now.',
              icon: <Smartphone className="w-6 h-6 text-indigo-600" />,
            },
            {
              step: '02',
              title: 'Join Virtual Queue',
              desc: 'Select services with one tap from anywhere and receive an instant atomic queue token.',
              icon: <Clock className="w-6 h-6 text-indigo-600" />,
            },
            {
              step: '03',
              title: 'Smart "Leave Now" Alert',
              desc: 'Our engine tracks your travel time and alerts you right before you need to leave.',
              icon: <Navigation className="w-6 h-6 text-indigo-600" />,
            },
            {
              step: '04',
              title: 'Instant Service',
              desc: 'Walk in straight to your stylist chair. Pay, review, and enjoy zero wasted minutes.',
              icon: <CheckCircle2 className="w-6 h-6 text-indigo-600" />,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition group"
            >
              <div className="text-3xl font-black text-slate-200 dark:text-slate-700 mb-3 group-hover:text-indigo-200 dark:group-hover:text-indigo-900/60 transition">
                {item.step}
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 flex items-center justify-center mb-4">
                {item.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Smart Engine Highlights */}
      <section className="bg-gradient-to-b from-indigo-900 to-slate-900 text-white py-16 rounded-3xl mx-4 sm:mx-8 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-indigo-800/60 text-indigo-300 text-xs font-semibold uppercase tracking-wider">
              Mathematical Precision
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Powered by Adaptive Queue Algorithms
            </h2>
            <p className="text-sm text-indigo-200 max-w-2xl mx-auto">
              Unlike static estimation, our algorithms learn from actual completion times and active staff loads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <Clock className="w-6 h-6 text-indigo-400" />
              <h3 className="text-base font-bold">Dynamic Wait Estimation</h3>
              <p className="text-xs text-slate-300">
                Formula: (Active Remaining Time + Total Waiting Duration) / Active Staff Count using historical moving average actual service times.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <Users className="w-6 h-6 text-violet-400" />
              <h3 className="text-base font-bold">Smart Load Allocation</h3>
              <p className="text-xs text-slate-300">
                Automatically routes incoming customers to staff matching the requested specialty with lowest pending backlog.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h3 className="text-base font-bold">Anti-Starvation Priority</h3>
              <p className="text-xs text-slate-300">
                VIP & Senior tokens receive fair priority boosts while normal tokens steadily gain wait-age score to prevent starvation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
