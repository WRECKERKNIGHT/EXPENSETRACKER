
import React, { useMemo } from 'react';
import { Expense, Category } from '../types';
import {
  detectRecurringPatterns, detectVelocityChanges, detectAnomalies,
  buildMerchantProfiles, CATEGORY_COLORS, RecurringPattern, VelocityAlert, AnomalyResult
} from '../services/detectionService';
import { Brain, Repeat, TrendingUp, TrendingDown, AlertTriangle, Zap, ArrowRight, Check, Plus } from 'lucide-react';

interface SmartInsightsProps {
  expenses: Expense[];
  onAddRecurring?: (name: string, amount: number, category: Category, dueDay: number) => void;
}

const SmartInsights: React.FC<SmartInsightsProps> = ({ expenses, onAddRecurring }) => {
  const recurring = useMemo(() => detectRecurringPatterns(expenses), [expenses]);
  const velocityAlerts = useMemo(() => detectVelocityChanges(expenses), [expenses]);
  const anomalies = useMemo(() => detectAnomalies(expenses), [expenses]);
  const merchantProfiles = useMemo(() => buildMerchantProfiles(expenses), [expenses]);

  const topAnomalies = anomalies.slice(0, 3);
  const topVelocity = velocityAlerts.slice(0, 3);
  const topRecurring = recurring.filter(r => r.occurrences >= 2).slice(0, 3);
  const topMerchants = merchantProfiles.slice(0, 5);

  const hasAnyInsight = topAnomalies.length > 0 || topVelocity.length > 0 || topRecurring.length > 0 || topMerchants.length > 0;
  if (!hasAnyInsight) return null;

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-gold/10 border border-gold/20">
          <Brain size={18} className="text-gold" />
        </div>
        <div>
          <h3 className="heading-serif text-lg font-bold">Auto-Detected Insights</h3>
          <p className="text-xs text-faint">Patterns found in your transaction history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Recurring Patterns */}
        {topRecurring.length > 0 && (
          <div className="card-3d gold-line-top p-5">
            <div className="flex items-center gap-2 mb-4">
              <Repeat size={16} className="text-blue-400" />
              <h4 className="font-bold text-sm text-app">Recurring Expenses</h4>
              <span className="text-[10px] bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full font-bold">{topRecurring.length} found</span>
            </div>
            <div className="space-y-3">
              {topRecurring.map((pattern, idx) => {
                const catColor = CATEGORY_COLORS[pattern.category] || CATEGORY_COLORS[Category.OTHER];
                return (
                <div key={idx} className="bg-surface-2 border border-app rounded-xl p-3 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${catColor.bg} ${catColor.text}`}>
                        <Repeat size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-app">{pattern.description}</p>
                        <p className="text-[10px] text-faint">{pattern.occurrences}x • {pattern.suggestedFrequency} • {pattern.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-app">{formatCurrency(pattern.avgAmount)}</p>
                      <p className="text-[10px] text-faint">avg/{pattern.suggestedFrequency === 'monthly' ? 'mo' : pattern.suggestedFrequency === 'weekly' ? 'wk' : 'period'}</p>
                    </div>
                  </div>
                  {onAddRecurring && (
                    <button
                      onClick={() => onAddRecurring(pattern.description, pattern.avgAmount, pattern.category, pattern.typicalDayOfMonth[0] || 1)}
                      className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 rounded-lg text-blue-400 text-[11px] font-bold transition-all"
                    >
                      <Plus size={12} /> Add as Recurring
                    </button>
                  )}
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Velocity Changes */}
        {topVelocity.length > 0 && (
          <div className="card-3d gold-line-top p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-amber-400" />
              <h4 className="font-bold text-sm text-app">Spending Changes</h4>
              <span className="text-[10px] bg-amber-500/15 text-amber-400 px-2 py-0.5 rounded-full font-bold">vs last month</span>
            </div>
            <div className="space-y-3">
              {topVelocity.map((alert, idx) => {
                const catColor = CATEGORY_COLORS[alert.category] || CATEGORY_COLORS[Category.OTHER];
                return (
                <div key={idx} className="bg-surface-2 border border-app rounded-xl p-3 hover:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${alert.direction === 'up' ? 'bg-red-500/15 text-red-400' : 'bg-emerald-500/15 text-emerald-400'}`}>
                        {alert.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-app">{alert.category}</p>
                        <p className="text-[10px] text-faint">{alert.direction === 'new' ? 'New category' : `${Math.abs(alert.changePercent)}% ${alert.direction}`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-app">{formatCurrency(alert.currentMonthSpent)}</p>
                      {alert.previousMonthSpent > 0 && (
                        <p className="text-[10px] text-faint">was {formatCurrency(alert.previousMonthSpent)}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-[11px] text-soft mt-2">{alert.message}</p>
                </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Anomalies */}
        {topAnomalies.length > 0 && (
          <div className="card-3d gold-line-top p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={16} className="text-red-400" />
              <h4 className="font-bold text-sm text-app">Unusual Spending</h4>
              <span className="text-[10px] bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full font-bold">{topAnomalies.length} flagged</span>
            </div>
            <div className="space-y-3">
              {topAnomalies.map((anomaly, idx) => (
                <div key={idx} className="bg-surface-2 border border-app rounded-xl p-3 hover:border-red-500/30 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        anomaly.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                        anomaly.severity === 'moderate' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-orange-500/15 text-orange-400'
                      }`}>
                        <AlertTriangle size={14} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-app">{anomaly.expense.description}</p>
                        <p className="text-[10px] text-faint">{anomaly.message}</p>
                      </div>
                    </div>
                    <span className={`font-mono font-bold text-sm ${
                      anomaly.severity === 'severe' ? 'text-red-400' :
                      anomaly.severity === 'moderate' ? 'text-amber-400' : 'text-orange-400'
                    }`}>
                      {formatCurrency(anomaly.expense.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Merchants */}
        {topMerchants.length > 0 && (
          <div className="card-3d gold-line-top p-5">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={16} className="text-gold" />
              <h4 className="font-bold text-sm text-app">Top Merchants</h4>
              <span className="text-[10px] bg-gold/15 text-gold px-2 py-0.5 rounded-full font-bold">by frequency</span>
            </div>
            <div className="space-y-2">
              {topMerchants.map((merchant, idx) => {
                const catColor = CATEGORY_COLORS[merchant.category] || CATEGORY_COLORS[Category.OTHER];
                return (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-app/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${catColor.bg} ${catColor.text}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-app">{merchant.name}</p>
                      <p className="text-[10px] text-faint">{merchant.frequency}x • {merchant.category}</p>
                    </div>
                  </div>
                  <p className="font-mono font-bold text-sm text-app">{formatCurrency(merchant.avgAmount)}<span className="text-[10px] text-faint font-normal"> avg</span></p>
                </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SmartInsights;
