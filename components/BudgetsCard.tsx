import React, { useEffect, useMemo, useState } from 'react';
import { Expense, Category } from '../types';
import { getBudgetsAPI, createBudgetAPI, updateBudgetAPI, deleteBudgetAPI } from '../services/apiService';
import { Wallet, AlertTriangle, Plus, Edit3, Trash2, Loader2 } from 'lucide-react';

interface BudgetsCardProps {
  expenses: Expense[];
  currency: string;
}

interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
}

const categoryOptions = Object.values(Category);

const BudgetsCard: React.FC<BudgetsCardProps> = ({ expenses, currency }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formCategory, setFormCategory] = useState<string>(Category.GROCERIES);
  const [formLimit, setFormLimit] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const data: any = await getBudgetsAPI();
        const normalized = Array.isArray(data)
          ? data.map(b => ({ id: b.id, category: b.category, monthlyLimit: b.monthlyLimit }))
          : [];
        setBudgets(normalized);
      } catch (err: any) {
        console.error('Failed to load budgets', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth() + 1}`;

  const spentByCategory = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (key !== currentMonthKey || e.type !== 'expense') return;
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return map;
  }, [expenses, currentMonthKey]);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCategory || !formLimit) return;
    const limit = Number(formLimit);
    if (!limit || limit <= 0) {
      setError('Enter a positive monthly limit');
      return;
    }
    setError('');
    try {
      setIsLoading(true);
      if (editingId) {
        const updated: any = await updateBudgetAPI(editingId, limit);
        setBudgets(prev =>
          prev.map(b => (b.id === editingId ? { id: updated.id, category: updated.category, monthlyLimit: updated.monthlyLimit } : b)),
        );
      } else {
        const created: any = await createBudgetAPI(formCategory, limit);
        setBudgets(prev => [...prev, { id: created.id, category: created.category, monthlyLimit: created.monthlyLimit }]);
      }
      setEditingId(null);
      setFormLimit('');
    } catch (err: any) {
      setError(err.message || 'Failed to save budget');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (b: Budget) => {
    setEditingId(b.id);
    setFormCategory(b.category);
    setFormLimit(String(b.monthlyLimit));
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteBudgetAPI(id);
      setBudgets(prev => prev.filter(b => b.id !== id));
      if (editingId === id) {
        setEditingId(null);
        setFormLimit('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-3d p-6 md:p-7 relative overflow-hidden">
      <div className="absolute -bottom-4 -right-4 text-brand/5 pointer-events-none select-none">
        <Wallet size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand/15 rounded-xl text-brand-ink border border-brand/30 shadow-brand-glow">
            <Wallet size={22} />
          </div>
          <div>
            <h3 className="heading-serif text-lg font-bold text-app">Monthly Budgets</h3>
            <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">
              Stay ahead of overspending
            </p>
          </div>
        </div>
        {isLoading && <Loader2 className="w-5 h-5 text-soft animate-spin" />}
      </div>

      {budgets.length === 0 && (
        <p className="text-sm text-faint mb-4">
          Set limits for categories you want to watch.
        </p>
      )}

      <div className="space-y-3 mb-5 max-h-48 overflow-y-auto custom-scrollbar relative z-10">
        {budgets.map(b => {
          const spent = spentByCategory.get(b.category) || 0;
          const pct = Math.round((spent / b.monthlyLimit) * 100);
          const isOver = spent > b.monthlyLimit;
          const isNear = !isOver && pct >= 80;

          return (
            <div
              key={b.id}
              className="group bg-surface-2 border border-app/80 rounded-2xl px-4 py-3 hover:border-gold-soft transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-brand to-gold" />
                  <div>
                    <p className="text-sm font-semibold text-app">{b.category}</p>
                    <p className="text-xs text-faint">
                      {formatCurrency(spent)} / {formatCurrency(b.monthlyLimit)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 rounded-full bg-surface-3 text-soft hover:text-app hover:bg-surface-2"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-full bg-surface-2 text-soft hover:text-red-400 hover:bg-surface-3"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="relative h-2.5 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                    isOver ? 'bg-gradient-to-r from-red-500 to-orange-500' : isNear ? 'bg-amber-400' : 'bg-brand'
                  }`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-faint">
                  {isOver ? 'Over budget' : isNear ? 'Almost there' : 'On track'}
                </p>
                {(isOver || isNear) && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300">
                    <AlertTriangle size={12} /> {pct}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="mt-2 space-y-3 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <select
            value={formCategory}
            onChange={e => setFormCategory(e.target.value)}
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
          >
            {categoryOptions.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={formLimit}
            onChange={e => setFormLimit(e.target.value)}
            placeholder="Limit / month"
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isLoading || !formLimit}
          className="w-full mt-1 flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl py-3 btn-gold disabled:opacity-60 transition-all"
        >
          {editingId ? <Edit3 size={16} /> : <Plus size={16} />}
          {editingId ? 'Update Budget' : 'Add Budget'}
        </button>
      </form>
    </div>
  );
};

export default BudgetsCard;
