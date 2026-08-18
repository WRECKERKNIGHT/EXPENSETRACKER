import React, { useEffect, useMemo, useState } from 'react';
import { Expense, Category } from '../types';
import { getRecurringAPI, createRecurringAPI, deleteRecurringAPI } from '../services/apiService';
import { Bell, Plus, Trash2, Loader2, Clock3 } from 'lucide-react';

interface RecurringCardProps {
  expenses: Expense[];
  currency: string;
}

interface RecurringItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  dueDay: number;
}

const categoryOptions = Object.values(Category);

const RecurringCard: React.FC<RecurringCardProps> = ({ expenses, currency }) => {
  const [items, setItems] = useState<RecurringItem[]>([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(Category.UTILITIES);
  const [dueDay, setDueDay] = useState<string>('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data: any = await getRecurringAPI();
        const mapped: RecurringItem[] = Array.isArray(data)
          ? data.map((d) => ({
              id: d.id,
              name: d.name,
              amount: d.amount,
              category: d.category,
              dueDay: d.dueDay,
            }))
          : [];
        setItems(mapped);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const now = new Date();
  const todayDay = now.getDate();

  const upcoming = useMemo(() => {
    const withDays = items.map((i) => {
      let daysLeft = i.dueDay - todayDay;
      if (daysLeft < 0) daysLeft += 30; // simple wrap for month
      return { ...i, daysLeft };
    });
    return withDays.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 4);
  }, [items, todayDay]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(val);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !dueDay) return;
    const amt = Number(amount);
    const day = Number(dueDay);
    if (!amt || amt <= 0 || day < 1 || day > 31) {
      setError('Enter a valid amount and due day (1–31)');
      return;
    }
    setError('');
    try {
      setLoading(true);
      const created: any = await createRecurringAPI({
        name,
        amount: amt,
        category,
        dueDay: day,
      });
      setItems((prev) => [
        ...prev,
        {
          id: created.id,
          name: created.name,
          amount: created.amount,
          category: created.category,
          dueDay: created.dueDay,
        },
      ]);
      setName('');
      setAmount('');
      setDueDay('1');
    } catch (e: any) {
      setError(e.message || 'Failed to add recurring bill');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await deleteRecurringAPI(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-3d p-6 md:p-7 relative overflow-hidden">
      <div className="absolute -bottom-4 -right-4 text-gold/5 pointer-events-none select-none">
        <Bell size={80} strokeWidth={1} />
      </div>
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="heading-serif text-lg font-bold text-app">Upcoming Bills</h3>
            <p className="text-xs text-faint uppercase tracking-[0.18em] font-semibold">
              Recurring expenses & reminders
            </p>
          </div>
        </div>
        {loading && <Loader2 className="w-5 h-5 text-soft animate-spin" />}
      </div>

      <div className="space-y-2.5 mb-4 max-h-40 overflow-y-auto custom-scrollbar relative z-10">
        {upcoming.length === 0 && (
          <p className="text-sm text-faint">Add your rent, subscriptions, or EMIs to see reminders here.</p>
        )}
        {upcoming.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between bg-surface-2 border border-app rounded-2xl px-4 py-3 group hover:border-gold-soft transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/15 border border-gold/20 flex items-center justify-center text-gold">
                <Clock3 size={16} />
              </div>
              <div>
                <p className="text-sm text-app font-semibold">{i.name}</p>
                <p className="text-xs text-faint">
                  {i.category} · in {i.daysLeft === 0 ? 'today' : `${i.daysLeft} day${i.daysLeft === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-app font-display">{formatCurrency(i.amount)}</span>
              <button
                onClick={() => handleDelete(i.id)}
                className="p-1.5 rounded-full text-faint hover:text-red-400 hover:bg-surface-3 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-3 mt-1 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Bill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          >
            {categoryOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={1}
            max={31}
            placeholder="Due day"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            className="bg-app-soft border border-app rounded-2xl px-3 py-3 text-sm text-app focus:outline-none focus:ring-2 focus:ring-gold/40 transition-all"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name || !amount}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-2xl py-3 btn-gold hover:brightness-110 disabled:opacity-60 transition-all"
        >
          <Plus size={16} />
          Add Recurring
        </button>
      </form>
    </div>
  );
};

export default RecurringCard;


