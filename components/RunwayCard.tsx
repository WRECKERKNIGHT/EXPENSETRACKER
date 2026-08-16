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
    <div className="bg-surface border border-app p-6 rounded-[2rem] shadow-card-soft relative overflow-hidden group card-glow-hover">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand via-gold to-brand opacity-60" />
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-brand/15 rounded-xl text-brand-ink border border-brand/30">
          <LifeBuoy size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-app">Runway</h3>
          <p className="text-[11px] text-faint uppercase tracking-[0.18em] font-semibold">Financial cushion</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-display text-3xl font-bold text-app tracking-tight">{runwayLabel}<span className="text-lg text-faint font-medium"> mo</span></p>
          <p className="text-[11px] text-faint font-medium mt-1">expenses covered</p>
        </div>
        <div>
          <p className="font-display text-3xl font-bold text-app tracking-tight">{savingsRate.toFixed(0)}<span className="text-lg text-faint font-medium">%</span></p>
          <p className="text-[11px] text-faint font-medium mt-1">savings rate</p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-app/60">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-faint font-semibold uppercase tracking-wide">Avg monthly burn</span>
          <span className="font-bold text-gold">{fmt(stats.avgMonthlyExpense, currency)}</span>
        </div>
        <p className="text-xs text-soft">{runwayText}</p>
      </div>
    </div>
  );
};

export default RunwayCard;
