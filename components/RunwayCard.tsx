import React, { useMemo } from 'react';
import { Expense, UserPreferences } from '../types';
import { LifeBuoy } from 'lucide-react';
import { getExpenseStats, getBalance, getRunway, getSavingsRate } from '../services/planning';

interface RunwayCardProps {
  expenses: Expense[];
  prefs: UserPreferences;
  monthlyIncome: number;
  currency: string;
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));

const RunwayCard: React.FC<RunwayCardProps> = ({ expenses, monthlyIncome, currency }) => {
  const stats = useMemo(() => getExpenseStats(expenses), [expenses]);
  const balance = useMemo(() => getBalance(expenses), [expenses]);
  const runway = getRunway(balance, stats.avgMonthlyExpense);
  const savingsRate = getSavingsRate(monthlyIncome, stats.avgMonthlyExpense);

  const runwayLabel = Number.isFinite(runway)
    ? `${Math.floor(runway)}.${Math.round((runway % 1) * 10)}`
    : '∞';
  const runwayText = Number.isFinite(runway)
    ? runway >= 12 ? 'more than a year of freedom' : runway >= 6 ? 'a healthy safety cushion' : runway >= 3 ? 'getting tight — rebuild it' : 'critical — prioritize savings'
    : 'no expenses yet — data will appear as you log spend';

  return (
    <div className="card-3d gold-shimmer p-5 tilt-hover relative overflow-hidden">
      <div className="absolute -top-8 -left-8 w-24 h-24 rounded-full bg-brand/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 text-brand/5 pointer-events-none select-none">
        <LifeBuoy size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-3 bg-brand/10 rounded-xl text-brand-ink border border-brand/20">
          <LifeBuoy size={22} />
        </div>
        <div>
          <h3 className="heading-serif text-lg font-bold text-app">Runway</h3>
          <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">Financial cushion</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <div>
          <p className="font-display text-4xl font-bold text-app tracking-tight">{runwayLabel}<span className="text-xl text-faint font-medium"> mo</span></p>
          <p className="text-xs text-faint font-medium mt-1">expenses covered</p>
        </div>
        <div>
          <p className="font-display text-4xl font-bold text-app tracking-tight">{savingsRate.toFixed(0)}<span className="text-xl text-faint font-medium">%</span></p>
          <p className="text-xs text-faint font-medium mt-1">savings rate</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-app/60 relative z-10">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-faint font-semibold uppercase tracking-wide">Avg monthly burn</span>
          <span className="font-bold text-gold font-display">{fmt(stats.avgMonthlyExpense, currency)}</span>
        </div>
        <p className="text-sm text-soft">{runwayText}</p>
      </div>
    </div>
  );
};

export default RunwayCard;
