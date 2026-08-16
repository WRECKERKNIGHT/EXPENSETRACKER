import React, { useMemo, useState } from 'react';
import { Expense } from '../types';
import { Download, CalendarRange, BarChart2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

interface ReportsProps {
  expenses: Expense[];
  currency: string;
}

type Range = 'month' | 'week' | 'day';

const Reports: React.FC<ReportsProps> = ({ expenses, currency }) => {
  const [range, setRange] = useState<Range>('month');

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { totalIncome, totalExpense, byCategory } = useMemo(() => {
    let from: Date;
    if (range === 'day') from = startOfDay;
    else if (range === 'week') from = startOfWeek;
    else from = startOfMonth;

    let income = 0;
    let expense = 0;
    const map = new Map<string, number>();

    expenses.forEach(e => {
      const d = new Date(e.date);
      if (d < from || d > now) return;
      if (e.type === 'income') income += e.amount;
      else expense += e.amount;
      map.set(e.category, (map.get(e.category) || 0) + (e.type === 'expense' ? e.amount : 0));
    });

    const cat = Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalIncome: income, totalExpense: expense, byCategory: cat };
  }, [expenses, range, now, startOfDay, startOfWeek, startOfMonth]);

  const monthlyComparison = useMemo(() => {
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    let thisMonthExpense = 0;
    let lastMonthExpense = 0;

    expenses.forEach(e => {
      const d = new Date(e.date);
      if (e.type !== 'expense') return;
      if (d >= thisMonthStart && d <= now) thisMonthExpense += e.amount;
      if (d >= lastMonthStart && d <= lastMonthEnd) lastMonthExpense += e.amount;
    });

    const change = lastMonthExpense > 0
      ? ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100
      : 0;

    return { thisMonthExpense, lastMonthExpense, change };
  }, [expenses, now]);

  const comparisonBarData = useMemo(() => {
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const getMonthlyTotal = (start: Date, end: Date) => {
      let total = 0;
      expenses.forEach(e => {
        const d = new Date(e.date);
        if (e.type === 'expense' && d >= start && d <= end) total += e.amount;
      });
      return total;
    };

    return [
      {
        name: lastMonth.toLocaleDateString('en-IN', { month: 'short' }),
        amount: getMonthlyTotal(lastMonth, thisMonth),
        fill: '#d4af37',
      },
      {
        name: thisMonth.toLocaleDateString('en-IN', { month: 'short' }),
        amount: getMonthlyTotal(thisMonth, now),
        fill: '#3fae6e',
      },
    ];
  }, [expenses, now]);

  const fmt = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  const handleDownloadCsv = () => {
    const header = 'Date,Type,Category,Amount,Description\n';
    const rows = expenses
      .map(e => `${e.date},${e.type},${e.category},${e.amount},"${(e.description || '').replace(/"/g, '""')}"`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendsmart-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const net = totalIncome - totalExpense;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-surface border border-app rounded-[2rem] p-6 md:p-8 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-gold-soft to-gold shadow-card-soft">
            <BarChart2 className="w-6 h-6 text-app" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-app tracking-tight">Spending Reports</h2>
            <p className="text-xs text-soft uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
              <CalendarRange className="w-3 h-3" /> {range === 'day' && 'Today'}
              {range === 'week' && 'This Week'}
              {range === 'month' && 'This Month'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="inline-flex bg-surface-2 rounded-full p-1 border border-app">
            {(['day', 'week', 'month'] as Range[]).map(r => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                  range === r
                    ? 'bg-gold text-white shadow-card-soft'
                    : 'text-soft hover:text-app'
                }`}
              >
                {r === 'day' ? 'Day' : r === 'week' ? 'Week' : 'Month'}
              </button>
            ))}
          </div>
          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-2 text-app text-xs font-semibold shadow-card-soft hover:bg-surface-3 transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-surface border border-app rounded-[1.75rem] p-5 shadow-xl relative overflow-hidden">
          <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-brand/20 to-transparent pointer-events-none" />
          <p className="text-[11px] font-semibold text-soft uppercase tracking-[0.18em] mb-1">Income</p>
          <p className="text-2xl font-bold text-brand-ink">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-surface border border-app rounded-[1.75rem] p-5 shadow-xl relative overflow-hidden">
          <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-red-500/25 to-transparent pointer-events-none" />
          <p className="text-[11px] font-semibold text-soft uppercase tracking-[0.18em] mb-1">Expenses</p>
          <p className="text-2xl font-bold text-red-400">{fmt(totalExpense)}</p>
        </div>
        <div className="bg-surface border border-app rounded-[1.75rem] p-5 shadow-xl relative overflow-hidden">
          <div className="absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-gold/20 to-transparent pointer-events-none" />
          <p className="text-[11px] font-semibold text-soft uppercase tracking-[0.18em] mb-1">Net</p>
          <p className={`text-2xl font-bold ${net >= 0 ? 'text-brand-ink' : 'text-red-300'}`}>{fmt(net)}</p>
        </div>
      </div>

      <div className="bg-surface border border-app rounded-[2rem] p-6 md:p-8 shadow-2xl">
        <h3 className="text-sm font-semibold text-soft mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          Top Spending Categories
        </h3>
        {byCategory.length === 0 ? (
          <p className="text-xs text-faint">No expenses in this period.</p>
        ) : (
          <div className="space-y-2">
            {byCategory.map(c => (
              <div
                key={c.name}
                className="flex items-center justify-between bg-surface-2 border border-app rounded-2xl px-4 py-2.5"
              >
                <span className="text-xs text-app">{c.name}</span>
                <span className="text-xs font-semibold text-soft">{fmt(c.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Monthly Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-2 bg-surface border border-app rounded-[2rem] p-6 md:p-8 shadow-2xl">
          <h3 className="text-sm font-semibold text-soft mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand" />
            Month-over-Month Comparison
          </h3>
          {monthlyComparison.thisMonthExpense === 0 && monthlyComparison.lastMonthExpense === 0 ? (
            <p className="text-xs text-faint text-center py-10">No expense data for comparison.</p>
          ) : (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} opacity={0.6} />
                  <XAxis dataKey="name" stroke="var(--text-faint)" fontSize={12} tickLine={false} axisLine={false} fontFamily="Outfit" />
                  <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="Outfit" />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--surface-2)', radius: 8 }}
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px', color: 'var(--text)', fontFamily: 'Outfit' }}
                    formatter={(value: number) => [fmt(value), 'Spent']}
                  />
                  <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={56}>
                    {comparisonBarData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-surface border border-app rounded-[2rem] p-6 shadow-2xl flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-semibold text-soft mb-4">vs Last Month</h3>
          {monthlyComparison.change === 0 ? (
            <Minus size={36} className="text-faint mb-3" />
          ) : monthlyComparison.change > 0 ? (
            <TrendingUp size={36} className="text-red-400 mb-3" />
          ) : (
            <TrendingDown size={36} className="text-brand mb-3" />
          )}
          <p className={`text-4xl font-bold font-mono ${
            monthlyComparison.change > 0 ? 'text-red-400' : monthlyComparison.change < 0 ? 'text-brand-ink' : 'text-faint'
          }`}>
            {monthlyComparison.change > 0 ? '+' : ''}{monthlyComparison.change.toFixed(1)}%
          </p>
          <p className="text-xs text-faint mt-2">
            {monthlyComparison.change > 0 ? 'Spending increased' : monthlyComparison.change < 0 ? 'Spending decreased' : 'No change yet'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Reports;


