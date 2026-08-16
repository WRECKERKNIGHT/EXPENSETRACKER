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
    <div className="bg-surface border border-app p-6 rounded-[2rem] shadow-card-soft relative overflow-hidden group card-glow-hover">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-soft via-gold to-brand opacity-60" />
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-gold/15 rounded-xl text-gold border border-gold/30">
          <Wallet size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-app">Daily Allowance</h3>
          <p className="text-[11px] text-faint uppercase tracking-[0.18em] font-semibold">Guardrail for today</p>
        </div>
      </div>

      <p className="text-3xl font-bold text-app tracking-tight">{fmt(plan.remainingToday, currency)}</p>
      <p className="text-[11px] text-faint font-medium mt-1">
        {onTrack ? 'left to spend today' : 'over today — pace yourself'}
      </p>

      <div className="mt-4">
        <div className="relative h-2 rounded-full bg-surface-3 overflow-hidden">
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${onTrack ? 'bg-gradient-to-r from-brand-deep to-brand' : 'bg-gradient-to-r from-danger to-gold'}`}
            style={{ width: `${spentPct}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px] font-medium">
          <span className={onTrack ? 'text-brand' : 'text-danger'}>
            {fmt(plan.spentToday, currency)} spent
          </span>
          <span className="text-faint">
            {fmt(plan.dailyBudget, currency)} / day · {plan.daysLeft} days left
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs text-soft">
        {fmt(plan.savingsTarget, currency)}/mo is auto-set aside for "{prefs.goalName || 'your goal'}".
      </p>
    </div>
  );
};

export default DailyAllowanceCard;
