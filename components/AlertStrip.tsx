import React, { useEffect, useMemo, useState } from 'react';
import { Expense } from '../types';
import { getBudgetsAPI } from '../services/apiService';
import { AlertTriangle, X, CheckCircle2 } from 'lucide-react';

interface AlertStripProps {
  expenses: Expense[];
  currency: string;
}

interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));

const AlertStrip: React.FC<AlertStripProps> = ({ expenses, currency }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data: any = await getBudgetsAPI();
        const normalized = Array.isArray(data)
          ? data.map(b => ({ id: b.id, category: b.category, monthlyLimit: b.monthlyLimit }))
          : [];
        setBudgets(normalized);
      } catch (err) {
        console.error('Failed to load budgets for alerts', err);
      }
    };
    load();
  }, []);

  const alerts = useMemo(() => {
    if (budgets.length === 0) return { over: [], near: [] };
    const now = new Date();
    const monthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;
    const spentByCategory = new Map<string, number>();
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (key !== monthKey || e.type !== 'expense') return;
      spentByCategory.set(e.category, (spentByCategory.get(e.category) || 0) + e.amount);
    });

    const over: Array<{ category: string; spent: number; limit: number }> = [];
    const near: Array<{ category: string; spent: number; limit: number }> = [];
    budgets.forEach(b => {
      const spent = spentByCategory.get(b.category) || 0;
      const pct = (spent / b.monthlyLimit) * 100;
      if (spent > b.monthlyLimit) over.push({ category: b.category, spent, limit: b.monthlyLimit });
      else if (pct >= 80) near.push({ category: b.category, spent, limit: b.monthlyLimit });
    });
    return { over, near };
  }, [budgets, expenses]);

  if (dismissed || (alerts.over.length === 0 && alerts.near.length === 0)) return null;

  return (
    <div className={`rounded-2xl border p-4 pr-10 relative animate-fade-in shadow-card-soft ${
      alerts.over.length > 0 ? 'bg-danger/10 border-danger/30' : 'bg-gold/10 border-gold/30'
    }`}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-2 text-faint hover:text-app transition-colors"
        aria-label="Dismiss alerts"
      >
        <X size={16} />
      </button>

      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl ${alerts.over.length > 0 ? 'bg-danger/15 text-danger' : 'bg-gold/15 text-gold'}`}>
          {alerts.over.length > 0 ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <div>
          <p className="text-sm font-bold text-app">
            {alerts.over.length > 0
              ? `${alerts.over.length} budget${alerts.over.length > 1 ? 's' : ''} exceeded this month`
              : 'Almost over budget'}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {alerts.over.map(a => (
              <span key={a.category} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-danger/15 text-danger px-2.5 py-1 rounded-full border border-danger/20">
                <AlertTriangle size={11} /> {a.category}: {fmt(a.spent, currency)} of {fmt(a.limit, currency)}
              </span>
            ))}
            {alerts.near.map(a => (
              <span key={a.category} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gold/15 text-gold-ink px-2.5 py-1 rounded-full border border-gold/20">
                {a.category}: {fmt(a.spent, currency)} / {fmt(a.limit, currency)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertStrip;
