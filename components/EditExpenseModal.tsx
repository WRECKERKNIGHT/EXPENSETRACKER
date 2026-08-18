import React, { useState, useEffect } from 'react';
import { Category, Expense, TransactionType } from '../types';
import { X, Check, ArrowDownCircle, ArrowUpCircle, Pencil, DollarSign } from 'lucide-react';

interface EditExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Expense>) => void;
  expense: Expense | null;
}

const EditExpenseModal: React.FC<EditExpenseModalProps> = ({ isOpen, onClose, onSave, expense }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState('');

  useEffect(() => {
    if (isOpen && expense) {
      setType(expense.type);
      setAmount(expense.amount.toString());
      setDescription(expense.description);
      setCategory(expense.category);
      setDate(expense.date);
    }
  }, [isOpen, expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;
    onSave(expense.id, {
      amount: parseFloat(amount),
      description,
      category,
      date,
      type,
    });
  };

  if (!isOpen || !expense) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="card-3d bg-surface border border-gold/20 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh] perspective-1000">
        
        <div className="flex justify-between items-center p-6 border-b border-gold/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold/5 to-transparent" />
          <div className="relative flex items-center gap-3">
            <div className="bg-gradient-to-br from-gold-soft to-gold p-2.5 rounded-2xl shadow-card-soft">
              <Pencil size={20} className="text-white" />
            </div>
            <h2 className="heading-serif text-xl font-bold text-app tracking-tight">Edit Transaction</h2>
          </div>
          <button onClick={onClose} className="relative text-faint hover:text-app transition-colors bg-surface-3 p-2.5 rounded-full hover:bg-surface-2 border border-app">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                type === 'expense'
                  ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.15)]'
                  : 'bg-surface-2 border-app text-faint hover:bg-surface-3 hover:border-gold/30'
              }`}
            >
              <ArrowDownCircle size={18} /> Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 transition-all font-bold text-sm ${
                type === 'income'
                  ? 'bg-gold/10 border-gold/50 text-gold shadow-gold-glow'
                  : 'bg-surface-2 border-app text-faint hover:bg-surface-3 hover:border-gold/30'
              }`}
            >
              <ArrowUpCircle size={18} /> Income
            </button>
          </div>

          <div>
            <label className="block text-sm text-soft mb-2 ml-1 font-bold tracking-wide uppercase">Amount</label>
            <div className="relative">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gold font-bold text-lg">₹</span>
              <input
                type="number"
                step="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-app-soft border-2 border-app rounded-2xl pl-12 pr-5 py-4 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all font-display font-bold text-xl shadow-inner"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-soft mb-2 ml-1 font-bold tracking-wide uppercase">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-app-soft border-2 border-app rounded-2xl px-5 py-4 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all shadow-inner"
              placeholder="What was it?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-soft mb-2 ml-1 font-bold tracking-wide uppercase">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-app-soft border-2 border-app rounded-2xl px-4 py-4 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all appearance-none shadow-inner font-medium"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-soft mb-2 ml-1 font-bold tracking-wide uppercase">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-app-soft border-2 border-app rounded-2xl px-4 py-4 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all shadow-inner font-medium"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-surface-3 hover:bg-surface-2 text-soft font-bold py-4 rounded-2xl transition-all border border-app hover:border-gold/20"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] btn-premium text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
