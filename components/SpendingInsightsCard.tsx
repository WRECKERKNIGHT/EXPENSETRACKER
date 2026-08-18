import React, { useMemo } from 'react';
import { Expense } from '../types';
import { Lightbulb, TrendingDown, TrendingUp, Target, Zap } from 'lucide-react';

interface SpendingInsightsCardProps {
  expenses: Expense[];
  monthlyIncome: number;
  currency: string;
}

const SpendingInsightsCard: React.FC<SpendingInsightsCardProps> = ({ expenses, monthlyIncome, currency }) => {
  const insights = useMemo(() => {
    const expensesOnly = expenses.filter(e => e.type === 'expense');
    if (expensesOnly.length === 0) return null;

    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthExpenses = expensesOnly.filter(e => new Date(e.date) >= thisMonthStart);
    const totalThisMonth = thisMonthExpenses.reduce((acc, e) => acc + e.amount, 0);
    const daysInMonth = now.getDate();
    const dailyAvg = totalThisMonth / daysInMonth;

    const categoryTotals = new Map<string, number>();
    thisMonthExpenses.forEach(e => {
      categoryTotals.set(e.category, (categoryTotals.get(e.category) || 0) + e.amount);
    });
    const topCategory = Array.from(categoryTotals.entries())
      .sort((a, b) => b[1] - a[1])[0];

    const savingsRate = monthlyIncome > 0
      ? ((monthlyIncome - totalThisMonth) / monthlyIncome) * 100
      : 0;

    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    const prev7Days = new Date(last7Days);
    prev7Days.setDate(prev7Days.getDate() - 7);

    const recentTotal = expensesOnly
      .filter(e => new Date(e.date) >= last7Days)
      .reduce((acc, e) => acc + e.amount, 0);
    const prevTotal = expensesOnly
      .filter(e => new Date(e.date) >= prev7Days && new Date(e.date) < last7Days)
      .reduce((acc, e) => acc + e.amount, 0);

    const trendDirection = prevTotal > 0
      ? ((recentTotal - prevTotal) / prevTotal) * 100
      : 0;

    return {
      dailyAvg,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      savingsRate,
      trendDirection,
      totalThisMonth,
      transactionCount: thisMonthExpenses.length,
    };
  }, [expenses, monthlyIncome]);

  const fmt = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  if (!insights) return null;

  const items = [
    {
      icon: Zap,
      label: 'Daily Average',
      value: fmt(insights.dailyAvg),
      color: 'text-gold',
      bgColor: 'bg-gold/10',
      borderColor: 'border-gold/20',
    },
    {
      icon: Target,
      label: 'Top Category',
      value: insights.topCategory ? insights.topCategory.name : 'N/A',
      sub: insights.topCategory ? fmt(insights.topCategory.amount) : '',
      color: 'text-brand',
      bgColor: 'bg-brand/10',
      borderColor: 'border-brand/20',
    },
    {
      icon: insights.savingsRate >= 0 ? TrendingDown : TrendingUp,
      label: 'Savings Rate',
      value: `${insights.savingsRate.toFixed(1)}%`,
      color: insights.savingsRate >= 20 ? 'text-brand' : insights.savingsRate >= 0 ? 'text-gold' : 'text-danger',
      bgColor: insights.savingsRate >= 20 ? 'bg-brand/10' : insights.savingsRate >= 0 ? 'bg-gold/10' : 'bg-danger/10',
      borderColor: insights.savingsRate >= 20 ? 'border-brand/20' : insights.savingsRate >= 0 ? 'border-gold/20' : 'border-danger/20',
    },
    {
      icon: Lightbulb,
      label: '7-Day Trend',
      value: `${insights.trendDirection > 0 ? '+' : ''}${insights.trendDirection.toFixed(1)}%`,
      color: insights.trendDirection <= 0 ? 'text-brand' : 'text-danger',
      bgColor: insights.trendDirection <= 0 ? 'bg-brand/10' : 'bg-danger/10',
      borderColor: insights.trendDirection <= 0 ? 'border-brand/20' : 'border-danger/20',
    },
  ];

  return (
    <div className="card-3d gold-line-top p-5 md:p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gold/10 rounded-lg text-gold border border-gold/20">
            <Lightbulb size={18} />
          </div>
          <h3 className="heading-serif text-lg font-bold">Spending Insights</h3>
        </div>
        <span className="text-xs text-faint font-bold uppercase tracking-wider">{insights.transactionCount} txns</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className={`p-4 rounded-2xl border ${item.borderColor} ${item.bgColor} flex flex-col gap-2 tilt-hover`}
          >
            <item.icon size={18} className={item.color} />
            <span className="text-xs font-bold uppercase tracking-wider text-soft">{item.label}</span>
            <span className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</span>
            {item.sub && <span className="text-xs text-faint font-mono">{item.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SpendingInsightsCard;
