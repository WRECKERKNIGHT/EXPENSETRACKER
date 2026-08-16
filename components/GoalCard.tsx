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
    <div className="bg-surface border border-app p-6 rounded-[2rem] shadow-card-soft relative overflow-hidden group card-glow-hover">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-deep via-brand to-gold opacity-60" />
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-brand/15 rounded-xl text-brand-ink border border-brand/30">
          <Target size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-app">Savings Goal</h3>
          <p className="text-[11px] text-faint uppercase tracking-[0.18em] font-semibold">{prefs.goalName || 'Custom goal'}</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <ProgressRing pct={goal.pct} size={104} strokeWidth={10} sublabel="of target" />
        <div className="space-y-1.5 flex-1 min-w-0">
          <p className="text-2xl font-bold text-app tracking-tight">{fmt(goal.remaining, currency)}</p>
          <p className="text-[11px] text-faint font-medium">remaining of {fmt(prefs.goalAmount, currency)}</p>
          <div className="pt-2 border-t border-app/60 mt-2">
            <p className="text-[11px] text-faint font-semibold uppercase tracking-wide">Monthly pace</p>
            <p className="text-sm font-bold text-gold">{fmt(goal.monthlyTarget, currency)}<span className="text-faint font-medium text-xs"> /mo</span></p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs text-soft">
        {goal.pct >= 100
          ? 'Goal reached — treat yourself, then set a new one!'
          : `On track to hit ${fmt(prefs.goalAmount, currency)} by ${deadlineLabel} saving ${fmt(goal.monthlyTarget, currency)} each month.`}
      </p>
    </div>
  );
};

export default GoalCard;
