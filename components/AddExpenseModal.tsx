
import React, { useState, useEffect, useRef } from 'react';
import { Category, Expense, TransactionType } from '../types';
import { parseTransactionsFromText, parseTransactionFromImage } from '../services/geminiService';
import { parseCSVStatement } from '../services/importService';
import { X, Sparkles, Loader2, Check, ArrowDownCircle, ArrowUpCircle, ScanLine, Smartphone, UploadCloud, Image as ImageIcon, Clipboard, FileText, AlertCircle } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;
  initialText?: string;
  initialMode?: 'auto' | 'manual' | 'import';
}

const AddExpenseModal: React.FC<AddExpenseModalProps> = ({ isOpen, onClose, onAdd, initialText, initialMode = 'auto' }) => {
  const [activeTab, setActiveTab] = useState<'auto' | 'manual' | 'import'>('auto');
  
  // AI / Auto State
  const [aiInput, setAiInput] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [scanStatus, setScanStatus] = useState(''); // 'scanning', 'success', 'error'
  const [aiError, setAiError] = useState('');
  const [detectedTransactions, setDetectedTransactions] = useState<Partial<Expense>[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Manual State
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      if (initialText) {
          setAiInput(initialText);
          handleTextParse(initialText);
      }
      if (initialMode) {
          setActiveTab(initialMode);
      }
    }
  }, [isOpen, initialText, initialMode]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setCategory(Category.FOOD);
    setType('expense');
    setDate(new Date().toISOString().split('T')[0]);
    setAiInput('');
    setAiError('');
    setScanStatus('');
    setDetectedTransactions(null);
    setActiveTab('auto'); 
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

  const handleTextParse = async (textOverride?: string) => {
    const textToParse = textOverride || aiInput;
    if (!textToParse.trim()) return;
    
    setIsParsing(true);
    setScanStatus('scanning');
    setAiError('');
    setDetectedTransactions(null);

    try {
      // 1. Attempt scan (Gemini or Local Fallback)
      const results = await parseTransactionsFromText(textToParse);
      
      if (results && results.length > 0) {
        setDetectedTransactions(results);
        setScanStatus('success');
      } else {
        setAiError("No valid transactions found. Try pasting a simpler message like 'Paid 200 to Swiggy'.");
        setScanStatus('error');
      }
    } catch (e) {
      // Should rarely happen due to local fallback
      setAiError("Parsing failed. Please try again.");
      setScanStatus('error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setScanStatus('scanning');
    setAiError('');
    
    try {
      const results = await parseTransactionFromImage(file);
      if (results && results.length > 0) {
        setDetectedTransactions(results);
        setScanStatus('success');
      } else {
        setAiError("Could not read transaction details from image.");
        setScanStatus('error');
      }
    } catch (error) {
      setAiError("Failed to analyze image. Ensure API Key is set for Image analysis.");
      setScanStatus('error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setScanStatus('scanning');
    setAiError('');

    try {
        const results = await parseCSVStatement(file);
        if (results && results.length > 0) {
            setDetectedTransactions(results);
            setScanStatus('success');
        } else {
             setAiError("No valid transactions found in CSV. Ensure columns: Date, Description, Debit/Credit.");
             setScanStatus('error');
        }
    } catch (error: any) {
        setAiError(error.message || "Failed to parse CSV.");
        setScanStatus('error');
    } finally {
        setIsParsing(false);
    }
  };

  const handleClipboardRead = async () => {
      try {
          const text = await navigator.clipboard.readText();
          if (text) {
              setAiInput(text);
              handleTextParse(text);
          } else {
              setAiError("Clipboard is empty.");
          }
      } catch (err) {
          setAiError("Browser blocked clipboard access. Please Paste manually below.");
      }
  };

  const confirmDetectedTransactions = () => {
    if (!detectedTransactions) return;
    
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
      <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex items-center gap-3">
             <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
               <ScanLine size={20} className="text-white" />
             </div>
             <h2 className="text-xl font-bold text-white tracking-tight text-glow-sm">Add Transaction</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 p-2 rounded-full hover:bg-zinc-700">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="px-6 pt-6">
             <div className="flex p-1 gap-1 bg-zinc-900 rounded-xl border border-zinc-800">
                <button
                    onClick={() => setActiveTab('auto')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'auto' 
                        ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <Sparkles size={16} /> Auto Scan
                </button>
                <button
                    onClick={() => setActiveTab('import')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                    activeTab === 'import' 
                        ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    <UploadCloud size={16} /> Import
                </button>
                <button
                    onClick={() => setActiveTab('manual')}
                    className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${
                    activeTab === 'manual' 
                        ? 'bg-zinc-800 text-white shadow-inner ring-1 ring-zinc-700' 
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                >
                    Manual
                </button>
            </div>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          
          {detectedTransactions ? (
             <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-400">
                          <Check size={18} />
                          <span className="text-sm font-bold">Success! Review Items</span>
                      </div>
                      <span className="text-xs text-emerald-300/70 font-mono">Found {detectedTransactions.length} items</span>
                  </div>
                  
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {detectedTransactions.map((tx, idx) => (
                          <div key={idx} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                      {tx.type === 'income' ? <ArrowUpCircle size={18} /> : <ArrowDownCircle size={18} />}
                                  </div>
                                  <div>
                                      <p className="text-zinc-200 font-medium text-sm">{tx.description}</p>
                                      <div className="flex gap-2 text-xs text-zinc-500 mt-1">
                                          <span className="bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">{tx.category}</span>
                                          <span>{tx.date}</span>
                                      </div>
                                  </div>
                              </div>
                              <p className={`font-mono font-bold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-400' : 'text-zinc-200'}`}>
                                  {tx.type === 'income' ? '+' : '-'} ₹{tx.amount}
                              </p>
                          </div>
                      ))}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                          onClick={() => setDetectedTransactions(null)}
                          className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl transition-all"
                    >
                        Back
                    </button>
                    <button
                        onClick={confirmDetectedTransactions}
                        className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] tracking-wide"
                    >
                        <Check size={20} />
                        Save Items
                    </button>
                  </div>
              </div>
          ) : (
            <>
                {/* Auto Scan Tab */}
                {activeTab === 'auto' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleClipboardRead}
                                disabled={isParsing}
                                className="bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-zinc-800 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg relative z-10">
                                    <Clipboard className="text-emerald-400" size={24} />
                                </div>
                                <div className="text-center relative z-10">
                                    <p className="text-zinc-200 font-bold text-sm">Scan Clipboard</p>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Copy SMS & Click</p>
                                </div>
                            </button>

                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-zinc-900/50 border border-zinc-800 hover:border-teal-500/50 hover:bg-zinc-800 p-6 rounded-2xl flex flex-col items-center gap-3 transition-all group cursor-pointer"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isParsing}
                                />
                                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {isParsing ? <Loader2 className="animate-spin text-teal-400" size={24} /> : <ImageIcon className="text-teal-400" size={24} />}
                                </div>
                                <div className="text-center">
                                    <p className="text-zinc-200 font-bold text-sm">Upload Screenshot</p>
                                    <p className="text-zinc-500 text-[10px] uppercase tracking-wide">Payment App / GPay</p>
                                </div>
                            </div>
                        </div>

                        {/* Text Paste Area */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <FileText size={14} className="text-zinc-500" />
                                <span className="text-xs font-bold text-zinc-500 uppercase">Or Paste Text</span>
                            </div>
                            <textarea
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                placeholder={`Paste SMS or text here...\n"Sent Rs 250 to Starbucks on 12th March"`}
                                className="w-full h-24 bg-black/30 border border-zinc-700 rounded-2xl p-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none placeholder:text-zinc-600 text-sm font-mono"
                            />
                            <button
                                onClick={() => handleTextParse()}
                                disabled={isParsing || !aiInput.trim()}
                                className="w-full mt-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Sparkles size={16} /> Analyze Text
                            </button>
                        </div>
                    </div>
                )}

                {/* Import Tab */}
                {activeTab === 'import' && (
                    <div className="space-y-6 flex flex-col items-center justify-center h-full text-center">
                         <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4 animate-pulse-slow">
                            <UploadCloud size={40} className="text-emerald-400" />
                         </div>
                         <h3 className="text-lg font-bold text-white">Import Bank Statement</h3>
                         <p className="text-zinc-400 text-sm max-w-xs">Upload a CSV or Excel file extracted from your net banking portal (HDFC, SBI, ICICI, etc.)</p>
                         
                         <button 
                            onClick={() => csvInputRef.current?.click()}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg flex items-center gap-2"
                         >
                            {isParsing ? <Loader2 className="animate-spin" /> : <FileText size={20} />}
                            Select CSV File
                         </button>
                         <input 
                            type="file" 
                            ref={csvInputRef} 
                            className="hidden" 
                            accept=".csv, .txt"
                            onChange={handleCSVUpload}
                            disabled={isParsing}
                         />
                         
                         <div className="mt-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 text-left w-full">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center gap-2">
                                <AlertCircle size={12} /> Instructions
                            </h4>
                            <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                                <li>Log in to your bank's website</li>
                                <li>Download statement as <strong>CSV</strong> (Not PDF)</li>
                                <li>Upload it here directly</li>
                                <li>We process it locally (secure)</li>
                            </ul>
                         </div>
                    </div>
                )}

                {/* Manual Tab */}
                {activeTab === 'manual' && (
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
                                className="w-full bg-black/30 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-mono text-xl shadow-inner"
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
                            className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-5 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
                            placeholder="What was it?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                            <label className="block text-sm text-zinc-400 mb-2 ml-1 font-medium tracking-wide">CATEGORY</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value as Category)}
                                className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none shadow-inner"
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
                                className="w-full bg-black/30 border border-zinc-700 rounded-2xl px-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner"
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
            </>
          )}

          {aiError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center animate-fade-in mt-4">{aiError}</p>}
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;
