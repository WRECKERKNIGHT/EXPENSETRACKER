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
    <div className="card-3d gold-line-top p-6 relative overflow-hidden group tilt-hover">
      <div className="absolute -bottom-4 -right-4 text-danger/5 pointer-events-none select-none">
        <Flame size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center gap-3 mb-5 relative z-10">
        <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20">
          <Flame size={22} className={streak.current > 0 ? 'text-gold' : 'text-faint'} />
        </div>
        <div>
          <h3 className="heading-serif text-lg font-bold text-app">Discipline Streak</h3>
          <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">Days under allowance</p>
        </div>
      </div>

      <div className="flex items-center gap-5 relative z-10">
        <div>
          <p className="font-display text-5xl font-bold text-app tracking-tight">
            {streak.current}<span className="text-xl text-faint font-medium"> days</span>
          </p>
          <p className="text-xs text-faint font-medium mt-1">
            {onTrack ? 'and still on track today' : '— today is over, restart tomorrow'}
          </p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-xs text-faint font-semibold uppercase tracking-wide">Best</p>
          <p className="font-display text-3xl font-bold text-gold">{streak.best}<span className="text-sm text-faint font-medium"> days</span></p>
        </div>
      </div>

      {insights.length > 0 && (
        <div className="mt-4 pt-3 border-t border-app/60 space-y-2.5 relative z-10">
          {insights.map((ins, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-soft">
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
