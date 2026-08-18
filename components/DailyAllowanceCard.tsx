import React, { useMemo } from 'react';
import { Expense, UserPreferences } from '../types';
import { Wallet } from 'lucide-react';
import { getAllowancePlan, getExpenseStats, getBalance } from '../services/planning';

interface DailyAllowanceCardProps {
  expenses: Expense[];
  prefs: UserPreferences;
  monthlyIncome: number;
  currency: string;
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));

const DailyAllowanceCard: React.FC<DailyAllowanceCardProps> = ({ expenses, prefs, monthlyIncome, currency }) => {
  const plan = useMemo(() => {
    const stats = getExpenseStats(expenses);
    return { ...getAllowancePlan(prefs, monthlyIncome, getBalance(expenses), stats), stats };
  }, [expenses, prefs, monthlyIncome]);

  const spentPct = plan.dailyBudget > 0 ? Math.min(100, (plan.spentToday / plan.dailyBudget) * 100) : 0;
  const onTrack = plan.onTrack;

  return (
    <div className="card-3d gold-line-top p-6 relative overflow-hidden group tilt-hover">
      <div className="absolute -bottom-4 -right-4 text-gold/5 pointer-events-none select-none">
        <Wallet size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20">
          <Wallet size={22} />
        </div>
        <div>
          <h3 className="heading-serif text-lg font-bold text-app">Daily Allowance</h3>
          <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">Guardrail for today</p>
        </div>
      </div>

      <p className="text-4xl font-bold text-app tracking-tight font-display relative z-10">{fmt(plan.remainingToday, currency)}</p>
      <p className="text-xs text-faint font-medium mt-1 relative z-10">
        {onTrack ? 'left to spend today' : 'over today — pace yourself'}
      </p>

      <div className="mt-4 relative z-10">
        <div className="relative h-2.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${onTrack ? 'bg-gradient-to-r from-brand-deep to-brand' : 'bg-gradient-to-r from-danger to-gold'}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs font-medium">
          <span className={onTrack ? 'text-brand' : 'text-danger'}>
            {fmt(plan.spentToday, currency)} spent
          </span>
          <span className="text-faint">
            {fmt(plan.dailyBudget, currency)} / day · {plan.daysLeft} days left
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm text-soft relative z-10">
        {fmt(plan.savingsTarget, currency)}/mo is auto-set aside for "{prefs.goalName || 'your goal'}".
      </p>
    </div>
  );
};

export default DailyAllowanceCard;
