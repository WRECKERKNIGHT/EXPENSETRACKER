import React, { useState } from 'react';
import { createExpenseAPI } from '../services/apiService';
import { Expense, Category } from '../types';

interface QuickAddInlineProps {
  onCreated: (expense: Expense) => void;
  onClose: () => void;
}

const QuickAddInline: React.FC<QuickAddInlineProps> = ({ onCreated, onClose }) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<Category>(Category.OTHER);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = parseFloat(amount || '0');
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const created: any = await createExpenseAPI({
        amount: amt,
        category: category,
        type: 'expense',
        date: new Date().toISOString().split('T')[0],
        description: description || 'Quick add'
      });

      // API may return the created expense or wrapped response
      const expense: Expense = (created && created.id) ? created : (created.item || created);
      onCreated(expense as Expense);
      setAmount('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to add');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50 w-[92%] max-w-sm bg-[#0b0b0d]/90 border border-white/10 rounded-2xl p-4 shadow-2xl">
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          className="flex-1 bg-transparent border border-zinc-700 rounded-xl px-3 py-2 text-white placeholder:text-zinc-500"
          placeholder="Amount (₹)"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="bg-transparent border border-zinc-700 text-xs rounded-xl px-2 py-2 text-white">
          {Object.values(Category).map((c) => (
            <option key={c} value={c} className="text-black">{c}</option>
          ))}
        </select>

        <button type="submit" disabled={isLoading} className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-sm font-semibold">
          {isLoading ? '...' : 'Add'}
        </button>
      </form>
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  );
};

export default QuickAddInline;
