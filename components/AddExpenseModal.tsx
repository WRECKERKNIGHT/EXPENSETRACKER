import React, { useState, useEffect } from 'react';
import { Category, Expense, TransactionType } from '../types';
import { parseExpenseNaturalLanguage } from '../services/geminiService';
import { X, Sparkles, Loader2, Check, ArrowDownCircle, ArrowUpCircle } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('ai');
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // AI State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setCategory(Category.FOOD);
      setType('expense');
      setDate(new Date().toISOString().split('T')[0]);
      setAiInput('');
      setAiError('');
      setActiveTab('ai'); 
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      amount: parseFloat(amount),
      description,
      category,
      date,
      type
    });
    onClose();
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    setAiError('');

    try {
      const result = await parseExpenseNaturalLanguage(aiInput);
      if (result) {
        if (result.amount) setAmount(result.amount.toString());
        if (result.description) setDescription(result.description);
        if (result.category) setCategory(result.category);
        if (result.date) setDate(result.date);
        if (result.type) setType(result.type);
        
        setActiveTab('manual'); 
      } else {
        setAiError("Could not understand. Please try again.");
      }
    } catch (e) {
      setAiError("AI service unavailable. Please enter manually.");
    } finally {
      setIsParsing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#121215] border border-zinc-800 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden transform transition-all ring-1 ring-white/10 card-glow">
        
        <div className="flex justify-between items-center p-8 border-b border-zinc-800/50">
          <h2 className="text-2xl font-bold text-white tracking-tight text-glow-sm">Add Transaction</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 p-2.5 rounded-full hover:bg-zinc-700">
            <X size={20} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex p-2 m-6 mb-0 gap-3 bg-zinc-900 rounded-2xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeTab === 'ai' 
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Sparkles size={18} />
            AI Smart Entry
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 text-sm font-bold rounded-xl transition-all ${
              activeTab === 'manual' 
                ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            Manual Entry
          </button>
        </div>

        <div className="p-8 pt-6">
          {activeTab === 'ai' ? (
            <div className="space-y-5">
              <label className="block text-sm font-medium text-zinc-400 ml-1 tracking-wide">
                TELL ME WHAT HAPPENED
              </label>
              <textarea
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="e.g. 'Got my Salary of 85000' or 'Spent 450 on Pizza'"
                className="w-full h-36 bg-black/30 border border-zinc-700 rounded-2xl p-5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-zinc-600 shadow-inner text-lg"
              />
              {aiError && <p className="text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20">{aiError}</p>}
              
              <button
                onClick={handleAiParse}
                disabled={isParsing || !aiInput.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] mt-4 tracking-wide"
              >
                {isParsing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                {isParsing ? 'ANALYZING...' : 'AUTO-FILL DETAILS'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all font-semibold ${
                    type === 'expense' 
                    ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  <ArrowDownCircle size={20} /> Expense
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex items-center justify-center gap-2 py-4 rounded-2xl border transition-all font-semibold ${
                    type === 'income' 
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800'
                  }`}
                >
                  <ArrowUpCircle size={20} /> Income
                </button>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2 ml-1 font-medium tracking-wide">AMOUNT (₹)</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 font-semibold text-lg">₹</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/30 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-mono text-xl shadow-inner"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-400 mb-2 ml-1 font-medium tracking-wide">DESCRIPTION</label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                  placeholder="What was it?"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 ml-1 font-medium tracking-wide">CATEGORY</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none shadow-inner"
                  >
                    {Object.values(Category).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-zinc-400 mb-2 ml-1 font-medium tracking-wide">DATE</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-wide"
                >
                  <Check size={20} />
                  SAVE {type === 'income' ? 'INCOME' : 'EXPENSE'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;