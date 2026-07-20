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
    <div className="bg-[#121215]/60 backdrop-blur-xl border border-white/5 p-6 md:p-7 rounded-[2rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 opacity-70" />
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/15 rounded-xl text-amber-300 border border-amber-500/30 shadow-[0_0_18px_rgba(251,191,36,0.4)]">
            <Bell size={18} />
          </div>
          <div>
            <h3 className="text-zinc-100 font-semibold text-sm md:text-base">Upcoming Bills</h3>
            <p className="text-[11px] text-zinc-500 uppercase tracking-[0.18em] font-semibold">
              Recurring expenses & reminders
            </p>
          </div>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />}
      </div>

      <div className="space-y-2 mb-4 max-h-40 overflow-y-auto custom-scrollbar">
        {upcoming.length === 0 && (
          <p className="text-[11px] text-zinc-500">Add your rent, subscriptions, or EMIs to see reminders here.</p>
        )}
        {upcoming.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between bg-zinc-900/70 border border-zinc-800 rounded-2xl px-3 py-2 group"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-amber-300">
                <Clock3 size={14} />
              </div>
              <div>
                <p className="text-[12px] text-zinc-100 font-semibold">{i.name}</p>
                <p className="text-[10px] text-zinc-500">
                  {i.category} · in {i.daysLeft === 0 ? 'today' : `${i.daysLeft} day${i.daysLeft === 1 ? '' : 's'}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-zinc-200">{formatCurrency(i.amount)}</span>
              <button
                onClick={() => handleDelete(i.id)}
                className="p-1 rounded-full text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="space-y-2 mt-1">
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Bill name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/30 border border-zinc-700 rounded-2xl px-3 py-2.5 text-[12px] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-black/30 border border-zinc-700 rounded-2xl px-3 py-2.5 text-[12px] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-black/30 border border-zinc-700 rounded-2xl px-3 py-2.5 text-[12px] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
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
            className="bg-black/30 border border-zinc-700 rounded-2xl px-3 py-2.5 text-[12px] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />
        </div>
        {error && <p className="text-[11px] text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading || !name || !amount}
          className="w-full mt-1 inline-flex items-center justify-center gap-2 text-[12px] font-semibold rounded-2xl py-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-black shadow-[0_0_18px_rgba(251,191,36,0.6)] hover:shadow-[0_0_24px_rgba(251,191,36,0.9)] disabled:opacity-60 transition-all"
        >
          <Plus size={14} />
          Add Recurring
        </button>
      </form>
    </div>
  );
};

export default RecurringCard;


