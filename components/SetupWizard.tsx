
import React, { useState } from 'react';
import { Category, Expense } from '../types';
import { Check, ArrowRight, Home, Zap, Car, PlayCircle, Plus } from 'lucide-react';

interface SetupWizardProps {
  onComplete: (expenses: Omit<Expense, 'id' | 'createdAt'>[]) => void;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [items, setItems] = useState<Omit<Expense, 'id' | 'createdAt'>[]>([]);
  
  // Temp inputs
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState<Category>(Category.HOUSING);
  const [isLoading, setIsLoading] = useState(false);

  const addItem = () => {
    if (!desc || !amount) return;
    setItems(prev => [...prev, {
      description: desc,
      amount: parseFloat(amount),
      category: cat,
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }]);
    setDesc('');
    setAmount('');
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step === 1) setStep(2);
    else handleComplete();
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await onComplete(items);
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await onComplete(items);
    } catch (error) {
      console.error('Setup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 font-sans relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-indigo-900/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-[#121215]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow animate-fade-in">
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-500' : 'bg-zinc-800'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-500' : 'bg-zinc-800'}`}></div>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3">
                   <Home size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Fixed Monthly Expenses</h2>
                <p className="text-zinc-400">Do you have rent, internet, or Netflix subscriptions?</p>
             </div>

             <div className="bg-black/30 p-4 rounded-xl border border-zinc-800 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                   <input 
                     placeholder="Name (e.g. Rent)" 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={desc}
                     onChange={e => setDesc(e.target.value)}
                   />
                   <input 
                     type="number" 
                     placeholder="Amount (₹)" 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                   />
                   <select 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={cat}
                     onChange={e => setCat(e.target.value as Category)}
                   >
                     <option value={Category.HOUSING}>Rent</option>
                     <option value={Category.UTILITIES}>Utilities</option>
                     <option value={Category.ENTERTAINMENT}>Subscription</option>
                     <option value={Category.EDUCATION}>Education</option>
                   </select>
                </div>
                <button onClick={addItem} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-zinc-700">
                  <Plus size={16} /> Add Expense
                </button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg transform -rotate-3">
                   <Car size={28} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Loans & EMIs</h2>
                <p className="text-zinc-400">Add any scheduled loan repayments.</p>
             </div>

             <div className="bg-black/30 p-4 rounded-xl border border-zinc-800 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                   <input 
                     placeholder="Name (e.g. Car Loan)" 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={desc}
                     onChange={e => setDesc(e.target.value)}
                   />
                   <input 
                     type="number" 
                     placeholder="Amount (₹)" 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                   />
                   <select 
                     className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-3 text-sm focus:outline-none focus:border-indigo-500"
                     value={cat}
                     onChange={e => setCat(e.target.value as Category)}
                   >
                     <option value={Category.EMI}>Loan / EMI</option>
                   </select>
                </div>
                <button onClick={addItem} className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-zinc-700">
                  <Plus size={16} /> Add EMI
                </button>
             </div>
          </div>
        )}

        {/* List of Added Items */}
        {items.length > 0 && (
          <div className="mb-8 max-h-40 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Added Items</h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-medium">{item.description}</span>
                     <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-red-400">-₹{item.amount}</span>
                    <button onClick={() => removeItem(idx)} className="text-zinc-600 hover:text-red-400"><Plus size={16} className="rotate-45" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center justify-center gap-2 tracking-wide"
        >
          {isLoading ? 'Saving...' : step === 1 ? 'Next: Add EMIs' : 'Finish Setup'} {!isLoading && <ArrowRight size={20} />}
        </button>
        
        {step === 1 && (
            <button onClick={() => setStep(2)} className="w-full text-center text-zinc-500 text-sm mt-4 hover:text-zinc-300">Skip to EMIs</button>
        )}
         {step === 2 && (
            <button onClick={handleSkip} disabled={isLoading} className="w-full text-center text-zinc-500 text-sm mt-4 hover:text-zinc-300 disabled:text-zinc-600">Skip Setup</button>
        )}

      </div>
    </div>
  );
};

export default SetupWizard;
