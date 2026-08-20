import React, { useState, useEffect } from 'react';
import { createExpenseAPI } from '../services/apiService';
import { addToCache, initCache } from '../services/cacheService';
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
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount || '0');
    if (!amt || amt <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const expense = {
        amount: amt,
        category: category,
        type: 'expense' as const,
        date: new Date().toISOString().split('T')[0],
        description: description || 'Quick add',
      };

      if (navigator.onLine) {
        const created: any = await createExpenseAPI(expense);
        const result: Expense = created && created.id ? created : created.item || created;
        onCreated(result);
        setAmount('');
        setDescription('');
        setTimeout(onClose, 300);
      } else {
        await initCache();
        await addToCache(expense);
        setError('💾 Saved offline - will sync when online');
        onCreated({
          id: `temp_${Date.now()}`,
          createdAt: Date.now(),
          ...expense,
        } as Expense);
        setAmount('');
        setDescription('');
        setTimeout(onClose, 1000);
      }
    } catch (err: any) {
      try {
        await initCache();
        await addToCache({
          amount: amt,
          category: category,
          type: 'expense' as const,
          date: new Date().toISOString().split('T')[0],
          description: description || 'Quick add',
        });
        setError('💾 Saved offline - will retry sync when online');
      } catch (cacheErr) {
        setError('❌ Failed to save');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`md:hidden fixed bottom-20 right-4 z-50 w-[92%] max-w-sm bg-surface/90 backdrop-blur-xl border border-gold/15 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)] ${isOffline ? 'bg-orange-900/40 border-orange-500/30' : ''}`}>
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <input
          className="flex-1 bg-transparent border border-app rounded-xl px-3 py-2 text-app placeholder:text-faint"
          placeholder="Amount (₹)"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="bg-transparent border border-app text-xs rounded-xl px-2 py-2 text-app">
          {Object.values(Category).map((c) => (
            <option key={c} value={c} className="text-black">{c}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-gold px-3 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {isLoading ? '...' : isOffline ? '📱' : 'Add'}
        </button>
      </form>
      {error && <p className={`text-xs mt-2 ${isOffline ? 'text-orange-400' : 'text-red-400'}`}>{error}</p>}
    </div>
  );
};

export default QuickAddInline;
