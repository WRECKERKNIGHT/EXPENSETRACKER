import { Expense, UserPreferences } from '../types';

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export interface MonthlyExpenseStats {
  avgMonthlyExpense: number;
  currentMonthSpent: number;
  spentToday: number;
  last3Months: number[];
}

export const getExpenseStats = (expenses: Expense[], now = new Date()): MonthlyExpenseStats => {
  const thisMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const monthKeys: string[] = [];
  for (let i = 0; i < 3; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push(`${d.getFullYear()}-${d.getMonth()}`);
  }

  const monthly = new Map<string, number>();
  let spentToday = 0;

  expenses.forEach(e => {
    if (e.type !== 'expense') return;
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const dayKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    monthly.set(key, (monthly.get(key) || 0) + e.amount);
    if (dayKey === todayKey) spentToday += e.amount;
  });

  const last3Months = monthKeys.map(k => monthly.get(k) || 0);
  const activeMonths = last3Months.filter(v => v > 0).length;
  const avgMonthlyExpense = last3Months.reduce((a, b) => a + b, 0) / Math.max(1, activeMonths);

  return {
    avgMonthlyExpense,
    currentMonthSpent: monthly.get(thisMonthKey) || 0,
    spentToday,
    last3Months,
  };
};

export interface GoalPace {
  savedSoFar: number;
  monthlyTarget: number;
  monthsLeft: number;
  pct: number;
  remaining: number;
}

export const getGoalPace = (prefs: UserPreferences, savedSoFar: number, now = new Date()): GoalPace => {
  const target = Math.max(0, prefs.goalAmount);
  const pct = target > 0 ? clamp((savedSoFar / target) * 100, 0, 100) : 0;
  const monthsLeft = prefs.goalDeadline
    ? Math.max(0, Math.round((new Date(prefs.goalDeadline + '-01').getTime() - new Date(now.getFullYear(), now.getMonth(), 1).getTime()) / 2592000000))
    : 12;
  const remaining = Math.max(0, target - savedSoFar);
  const monthlyTarget = monthsLeft > 0 ? remaining / monthsLeft : remaining;
  return { savedSoFar, monthlyTarget, monthsLeft, pct, remaining };
};

export interface AllowancePlan {
  dailyBudget: number;
  daysLeft: number;
  daysInMonth: number;
  savingsTarget: number;
  spentToday: number;
  remainingToday: number;
  onTrack: boolean;
}

export const getAllowancePlan = (
  prefs: UserPreferences,
  monthlyIncome: number,
  savedSoFar: number,
  stats: MonthlyExpenseStats,
  now = new Date(),
): AllowancePlan => {
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate() + 1;

  const styleFactor = prefs.spendingStyle === 'strict' ? 0.9 : prefs.spendingStyle === 'free' ? 1.1 : 1.0;
  const goal = getGoalPace(prefs, savedSoFar, now);
  const savingsTarget = clamp(goal.monthlyTarget, 0, Math.max(0, monthlyIncome * 0.7));
  const dailyBudget = Math.max(0, ((monthlyIncome - savingsTarget) / daysInMonth) * styleFactor);

  return {
    dailyBudget,
    daysLeft,
    daysInMonth,
    savingsTarget,
    spentToday: stats.spentToday,
    remainingToday: dailyBudget - stats.spentToday,
    onTrack: stats.spentToday <= dailyBudget,
  };
};

export const getRunway = (balance: number, avgMonthlyExpense: number): number =>
  avgMonthlyExpense > 0 ? balance / avgMonthlyExpense : Infinity;

export const getSavingsRate = (monthlyIncome: number, avgMonthlyExpense: number): number =>
  monthlyIncome > 0 ? clamp(((monthlyIncome - avgMonthlyExpense) / monthlyIncome) * 100, -999, 100) : 0;

export interface StreakResult {
  current: number;
  best: number;
  isOnTrackToday: boolean;
}

export const getStreak = (expenses: Expense[], dailyBudget: number, now = new Date()): StreakResult => {
  const byDay = new Map<string, number>();
  expenses.forEach(e => {
    if (e.type !== 'expense') return;
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    byDay.set(key, (byDay.get(key) || 0) + e.amount);
  });

  let run = 0;
  let best = 0;
  let current = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const spent = byDay.get(key) || 0;
    if (spent <= dailyBudget) {
      run += 1;
      best = Math.max(best, run);
      if (i === 0) current = run;
    } else {
      run = 0;
      if (i === 0) current = 0;
    }
  }

  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  return { current, best, isOnTrackToday: (byDay.get(todayKey) || 0) <= dailyBudget };
};

export interface Insight {
  icon: 'up' | 'down' | 'star' | 'alert';
  text: string;
}

export const getInsights = (
  expenses: Expense[],
  prefs: UserPreferences,
  stats: MonthlyExpenseStats,
  savingsRate: number,
  now = new Date(),
): Insight[] => {
  const insights: Insight[] = [];

  if (savingsRate >= 20) {
    insights.push({ icon: 'star', text: `You're saving ${Math.round(savingsRate)}% of income — brilliant. Route it to "${prefs.goalName || 'your goal'}".` });
  } else if (savingsRate > 0) {
    insights.push({ icon: 'up', text: `Savings rate is ${Math.round(savingsRate)}%. A small push to ${Math.min(100, Math.round(savingsRate + 5))}% would compound quickly.` });
  } else {
    insights.push({ icon: 'alert', text: 'Spending is outpacing income. Trim one category this month to flip the trend.' });
  }

  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const categorySpend = new Map<string, number>();
  let biggestExpense: Expense | null = null;
  expenses.forEach(e => {
    if (e.type !== 'expense') return;
    if (biggestExpense === null || e.amount > biggestExpense.amount) biggestExpense = e;
    const d = new Date(e.date);
    if (`${d.getFullYear()}-${d.getMonth()}` !== monthKey) return;
    categorySpend.set(e.category, (categorySpend.get(e.category) || 0) + e.amount);
  });

  const top = Array.from(categorySpend.entries()).sort((a, b) => b[1] - a[1])[0];
  if (top) {
    const amount = top[1] >= 1000 ? `${(top[1] / 1000).toFixed(1)}k` : String(top[1]);
    insights.push({ icon: 'down', text: `${top[0]} leads your spending this month (${amount}).` });
  }
  if (biggestExpense) {
    insights.push({ icon: 'star', text: `Largest expense: "${biggestExpense.description || biggestExpense.category}" (${biggestExpense.amount.toLocaleString()}).` });
  }
  if (prefs.spendingStyle === 'free') {
    insights.push({ icon: 'up', text: 'Free-spirit mode — try one no-spend day a week to build momentum without stress.' });
  }

  return insights.slice(0, 3);
};

export const getBalance = (expenses: Expense[]): number =>
  expenses.reduce((acc, e) => acc + (e.type === 'income' ? e.amount : -e.amount), 0);
