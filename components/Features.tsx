import React, { useState } from 'react';
import { Settings2, Goal, TrendingUp, Users, FileText, Tag, Calendar, PieChart, AlertCircle, Download, BarChart3, Filter } from 'lucide-react';

interface FeaturesProps {
  expenses?: any[];
  onClose: () => void;
  isOpen?: boolean;
}

const Features: React.FC<FeaturesProps> = ({ expenses = [], onClose, isOpen = true }) => {
  if (!isOpen) return null;
  const [activeTab, setActiveTab] = useState<'goals' | 'split' | 'taxes' | 'export' | 'analytics' | 'settings'>('goals');

  const features = [
    { id: 'goals', name: 'Savings Goals', icon: Goal },
    { id: 'split', name: 'Bill Split', icon: Users },
    { id: 'taxes', name: 'Tax Tracking', icon: Tag },
    { id: 'export', name: 'Export Data', icon: Download },
    { id: 'analytics', name: 'Advanced Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings2 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-[#0f172a] border border-zinc-800 rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Premium Features</h2>
          <button onClick={onClose} className="text-white hover:text-zinc-300">✕</button>
        </div>

        <div className="flex flex-col md:flex-row h-96">
          {/* Tabs */}
          <div className="w-full md:w-48 bg-zinc-900/50 border-b md:border-b-0 md:border-r border-zinc-800 p-4 space-y-2 overflow-y-auto">
            {features.map((f) => {
              const Icon = f.icon as any;
              return (
                <button
                  key={f.id}
                  onClick={() => setActiveTab(f.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-sm ${
                    activeTab === f.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
                  }`}
                >
                  <Icon size={16} />
                  {f.name}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 p-8 overflow-y-auto">
            {activeTab === 'goals' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Savings Goals</h3>
                <p className="text-zinc-300 mb-4">Set and track multiple savings goals. Monitor progress toward vacation, emergency fund, car, or house purchase.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ Create custom goals • ✓ Track progress • ✓ Automatic milestone alerts</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points="0,22 20,18 40,12 60,8 80,10 100,6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'split' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Bill Splitting</h3>
                <p className="text-zinc-300 mb-4">Split expenses with friends and roommates. Calculate exact shares and settle debts easily.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ Create splits • ✓ Automatic calculations • ✓ Settlement tracking</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#a78bfa" strokeWidth="2" points="0,20 20,14 40,18 60,10 80,12 100,8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'taxes' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Tax Category Tracking</h3>
                <p className="text-zinc-300 mb-4">Mark expenses as deductible and generate tax reports. Perfect for freelancers and business owners.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ Tax-eligible marking • ✓ Annual reports • ✓ Deduction summaries</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#60f0c4" strokeWidth="2" points="0,18 20,16 40,14 60,10 80,12 100,9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Export & Reports</h3>
                <p className="text-zinc-300 mb-4">Export transactions as PDF, CSV, or Excel. Generate annual and monthly financial reports.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ PDF export • ✓ CSV/Excel • ✓ Custom date ranges</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#fbbf24" strokeWidth="2" points="0,20 20,18 40,12 60,10 80,14 100,9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Advanced Analytics</h3>
                <p className="text-zinc-300 mb-4">Year-over-year comparisons, spending trends, net worth tracking, and predictive insights.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ YoY analysis • ✓ Trend forecasting • ✓ Net worth tracking</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#60a5fa" strokeWidth="2" points="0,22 20,18 40,12 60,8 80,10 100,6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Settings & Preferences</h3>
                <p className="text-zinc-300 mb-4">Customize themes, notifications, currency, and data privacy settings.</p>
                <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-lg flex items-center justify-between">
                  <p className="text-sm text-zinc-400">✓ Dark/Light themes • ✓ Smart notifications • ✓ Multi-currency • ✓ Privacy controls</p>
                  <svg viewBox="0 0 100 30" className="w-28 h-8">
                    <polyline fill="none" stroke="#94a3b8" strokeWidth="2" points="0,20 20,18 40,14 60,12 80,14 100,10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
