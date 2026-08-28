import React, { useState } from 'react';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import { CATEGORIES, Category, Tx, fmt, parseRupee, todayISO } from '../engine';
import { nextId } from '../storage';

interface TransactionsProps {
  tx: Tx[];
  onAdd: (t: Tx) => void;
  onDelete: (id: string) => void;
  onResetDay: () => void;
}

const CAT_COLOR: Record<string, string> = {
  Food: '#B8860B',
  Transport: '#18241C',
  Shopping: '#8a5d0b',
  Subscriptions: '#a06a15',
  Utilities: '#5c4f8a',
  Savings: '#c9a227',
  Other: '#888',
};

const inputCls =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-black outline-none focus:border-[#B8860B] transition-colors duration-200';

const Transactions: React.FC<TransactionsProps> = ({ tx, onAdd, onDelete, onResetDay }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<Category>('Food');

  const sorted = [...tx].sort((a, b) => (a.date < b.date ? 1 : -1));

  const submit = () => {
    const amt = parseRupee(amount);
    if (!name.trim() || amt <= 0) return;
    onAdd({
      id: nextId(),
      name: name.trim(),
      amount: amt,
      cat,
      date: todayISO(),
    });
    setName('');
    setAmount('');
  };

  return (
    <div className="rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
          Transactions · {tx.length}
        </h3>
        <button
          onClick={onResetDay}
          className="inline-flex items-center gap-1.5 text-xs text-black/50 font-medium hover:text-black transition-colors duration-200 cursor-pointer"
        >
          <RotateCcw size={13} /> Clear today
        </button>
      </div>

      <div className="grid sm:grid-cols-[1.4fr_1fr_1fr_auto] gap-3 mb-5">
        <input className={inputCls} placeholder="What did you spend on?" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={inputCls} placeholder="Amount ₹" value={amount} onChange={(e) => setAmount(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} inputMode="numeric" />
        <select className={inputCls} value={cat} onChange={(e) => setCat(e.target.value as Category)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          onClick={submit}
          className="inline-flex items-center justify-center gap-2 bg-[#18241C] text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-96 overflow-y-auto">
        {sorted.length === 0 && (
          <p className="text-sm text-black/40 py-6 text-center">No transactions yet. Add your first spend above.</p>
        )}
        {sorted.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-3 rounded-xl bg-[#F4EFE4] px-4 py-3"
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLOR[t.cat] || '#888' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black truncate">{t.name}</p>
              <p className="text-xs text-black/40">{t.cat} · {t.date}</p>
            </div>
            <p className="text-sm font-semibold text-black">{fmt(t.amount)}</p>
            <button
              onClick={() => onDelete(t.id)}
              className="text-black/25 hover:text-[#c0392b] transition-colors duration-200 cursor-pointer"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;