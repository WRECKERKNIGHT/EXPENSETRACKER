import React, { useMemo } from 'react';
import { Expense, UserPreferences } from '../types';
import { Target } from 'lucide-react';
import { getGoalPace, getBalance } from '../services/planning';
import ProgressRing from './ProgressRing';

interface GoalCardProps {
  expenses: Expense[];
  prefs: UserPreferences;
  currency: string;
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));

const GoalCard: React.FC<GoalCardProps> = ({ expenses, prefs, currency }) => {
  const goal = useMemo(() => getGoalPace(prefs, getBalance(expenses)), [prefs, expenses]);

  const deadlineLabel = prefs.goalDeadline
    ? new Date(prefs.goalDeadline + '-01').toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : '12 months';

  return (
    <div className="card-3d gold-shimmer p-5 tilt-hover relative overflow-hidden">
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-brand/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-4 -right-4 text-gold/5 pointer-events-none select-none">
        <Target size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-3 bg-brand/10 rounded-xl text-brand-ink border border-brand/20">
          <Target size={22} />
        </div>
        <div>
          <h3 className="heading-serif text-lg font-bold text-app">Savings Goal</h3>
          <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">{prefs.goalName || 'Custom goal'}</p>
        </div>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <ProgressRing pct={goal.pct} size={110} strokeWidth={10} sublabel="of target" />
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-3xl font-bold text-app tracking-tight font-display">{fmt(goal.remaining, currency)}</p>
          <p className="text-xs text-faint font-medium">remaining of {fmt(prefs.goalAmount, currency)}</p>
          <div className="pt-2 border-t border-app/60 mt-2">
            <p className="text-xs text-faint font-semibold uppercase tracking-wide">Monthly pace</p>
            <p className="text-base font-bold text-gold font-display">{fmt(goal.monthlyTarget, currency)}<span className="text-faint font-medium text-sm"> /mo</span></p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm text-soft relative z-10">
        {goal.pct >= 100
          ? 'Goal reached — treat yourself, then set a new one!'
          : `On track to hit ${fmt(prefs.goalAmount, currency)} by ${deadlineLabel} saving ${fmt(goal.monthlyTarget, currency)} each month.`}
      </p>
    </div>
  );
};

export default GoalCard;
