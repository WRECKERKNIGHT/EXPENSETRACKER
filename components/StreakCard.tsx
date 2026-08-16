import React, { useMemo } from 'react';
import { Expense, UserPreferences } from '../types';
import { Flame, TrendingUp, TrendingDown, Sparkles, AlertTriangle } from 'lucide-react';
import { getExpenseStats, getBalance, getAllowancePlan, getStreak, getInsights, getSavingsRate } from '../services/planning';

interface StreakCardProps {
  expenses: Expense[];
  prefs: UserPreferences;
  monthlyIncome: number;
}

const ICONS = {
  up: <TrendingUp size={14} className="text-brand shrink-0 mt-0.5" />,
  down: <TrendingDown size={14} className="text-gold shrink-0 mt-0.5" />,
  star: <Sparkles size={14} className="text-gold shrink-0 mt-0.5" />,
  alert: <AlertTriangle size={14} className="text-danger shrink-0 mt-0.5" />,
};

const StreakCard: React.FC<StreakCardProps> = ({ expenses, prefs, monthlyIncome }) => {
  const data = useMemo(() => {
    const stats = getExpenseStats(expenses);
    const plan = getAllowancePlan(prefs, monthlyIncome, getBalance(expenses), stats);
    const streak = getStreak(expenses, plan.dailyBudget);
    const insights = getInsights(expenses, prefs, stats, getSavingsRate(monthlyIncome, stats.avgMonthlyExpense));
    return { streak, insights, onTrack: plan.onTrack };
  }, [expenses, prefs, monthlyIncome]);

  const { streak, insights, onTrack } = data;

  return (
    <div className="bg-surface border border-app p-6 rounded-[2rem] shadow-card-soft relative overflow-hidden group card-glow-hover">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold via-brand to-gold opacity-60" />
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 bg-danger/15 rounded-xl text-gold border border-gold/30">
          <Flame size={20} className={streak.current > 0 ? 'text-gold' : 'text-faint'} />
        </div>
        <div>
          <h3 className="font-semibold text-sm text-app">Discipline Streak</h3>
          <p className="text-[11px] text-faint uppercase tracking-[0.18em] font-semibold">Days under allowance</p>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div>
          <p className="font-display text-4xl font-bold text-app tracking-tight">
            {streak.current}<span className="text-xl text-faint font-medium"> days</span>
          </p>
          <p className="text-[11px] text-faint font-medium mt-1">
            {onTrack ? 'and still on track today' : '— today is over, restart tomorrow'}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] text-faint font-semibold uppercase tracking-wide">Best</p>
          <p className="font-display text-2xl font-bold text-gold">{streak.best}<span className="text-xs text-faint font-medium"> days</span></p>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-app/60 space-y-2">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-soft">
              {ICONS[ins.icon]}
              <span>{ins.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StreakCard;
