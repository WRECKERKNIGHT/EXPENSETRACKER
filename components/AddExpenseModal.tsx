
import React, { useState, useEffect } from 'react';
import { Category, Expense, TransactionType } from '../types';
import { parseTransactionsFromText } from '../services/geminiService';
import { X, Sparkles, Loader2, Check, ArrowDownCircle, ArrowUpCircle, Copy, AlertCircle, ArrowRight } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
  
  // AI Bulk State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [aiError, setAiError] = useState('');
  const [detectedTransactions, setDetectedTransactions] = useState<Partial<Expense>[] | null>(null);

  // Manual State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory(Category.FOOD);
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setAiInput('');
    setAiError('');
    setDetectedTransactions(null);
    setActiveTab('ai'); 
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd([{
      amount: parseFloat(amount),
      description,
      category,
      date,
      type
    }]);
    onClose();
  };

  const handleAiParse = async () => {
    if (!aiInput.trim()) return;
    setIsParsing(true);
    setAiError('');
    setDetectedTransactions(null);

    try {
      const results = await parseTransactionsFromText(aiInput);
      if (results && results.length > 0) {
        setDetectedTransactions(results);
      } else {
        setAiError("No transactions detected. Please try pasting a clearer SMS format.");
      }
    } catch (e) {
      setAiError("AI service unavailable. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const confirmDetectedTransactions = () => {
    if (!detectedTransactions) return;
    
    // Convert Partial<Expense> to required format
    const validExpenses = detectedTransactions.map(t => ({
      amount: t.amount || 0,
      description: t.description || 'Unknown Transaction',
      category: (t.category as Category) || Category.OTHER,
      date: t.date || new Date().toISOString().split('T')[0],
      type: (t.type as TransactionType) || 'expense'
    }));

    onAdd(validExpenses);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="bg-[#121215] border border-white/10 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
               <Sparkles size={20} className="text-white" />
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight text-glow-sm">Smart Import</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 p-2 rounded-full hover:bg-zinc-700">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-6">
             <div className="flex p-1 gap-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'ai' 
                        ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Paste SMS / Text
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    activeTab === 'manual' 
                        ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Manual Entry
                </button>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'ai' ? (
            <div className="space-y-6">
              
              {!detectedTransactions ? (
                  <>
                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex gap-3">
                        <AlertCircle className="text-indigo-400 shrink-0" size={20} />
                        <p className="text-sm text-indigo-200 leading-relaxed">
                            Paste your <strong>Bank SMS</strong>, <strong>UPI alerts</strong>, or <strong>Notes</strong> here. 
                            The AI will automatically detect amounts, categories, and dates. You can paste multiple messages at once.
                        </p>
                    </div>

                    <textarea
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        placeholder={`Example:\nHDFC: Rs 500 debited for Zomato on 12-04-2024.\nCredited Rs 50000 Salary.\nPaid 200 for Tea via UPI.`}
                        className="w-full h-40 bg-black/30 border border-zinc-700 rounded-2xl p-5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none placeholder:text-zinc-600 shadow-inner text-base font-mono leading-relaxed"
                    />

                    {aiError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{aiError}</p>}
                    
                    <button
                        onClick={handleAiParse}
                        disabled={isParsing || !aiInput.trim()}
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] tracking-wide"
                    >
                        {isParsing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                        {isParsing ? 'ANALYZING TEXT...' : 'DETECT TRANSACTIONS'}
                    </button>
                  </>
              ) : (
                  <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between">
                          <h3 className="text-zinc-300 font-semibold">Detected {detectedTransactions.length} Transactions</h3>
                          <button onClick={() => setDetectedTransactions(null)} className="text-xs text-indigo-400 hover:underline">Clear & Try Again</button>
                      </div>
                      
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {detectedTransactions.map((tx, idx) => (
                              <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                          {tx.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                      </div>
                                      <div>
                                          <p className="text-zinc-200 font-medium text-sm">{tx.description}</p>
                                          <div className="flex gap-2 text-xs text-zinc-500 mt-1">
                                              <span className="bg-zinc-800 px-2 py-0.5 rounded">{tx.category}</span>
                                              <span>{tx.date}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <p className={`font-mono font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                      {tx.type === 'income' ? '+' : '-'} ₹{tx.amount}
                                  </p>
                              </div>
                          ))}
                      </div>

                      <button
                        onClick={confirmDetectedTransactions}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] tracking-wide mt-2"
                      >
                        <Check size={20} />
                        CONFIRM & SAVE ALL
                      </button>
                  </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-6">
              
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

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] tracking-wide"
                >
                  <Check size={20} />
                  SAVE TRANSACTION
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
