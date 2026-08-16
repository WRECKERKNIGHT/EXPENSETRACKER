
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

  const inputCls = "bg-app-soft border border-app rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all text-app placeholder:text-faint";

  return (
    <div className="min-h-screen bg-app text-app flex items-center justify-center p-6 font-sans relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-gold/10 rounded-full blur-[120px]"></div>
           <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-brand/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl bg-surface border border-app p-8 rounded-[2rem] shadow-card animate-fade-in">
        
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
            <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-brand-deep to-brand' : 'bg-surface-3'}`}></div>
            <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-brand-deep to-brand' : 'bg-surface-3'}`}></div>
        </div>

        {step === 1 && (
          <div className="animate-fade-in">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-deep to-brand rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-card-soft transform rotate-3">
                   <Home size={28} className="text-white" />
                </div>
                <h2 className="heading-serif text-2xl font-bold mb-2">Fixed Monthly Expenses</h2>
                <p className="text-soft">Do you have rent, internet, or Netflix subscriptions?</p>
             </div>

             <div className="bg-surface-2 p-4 rounded-xl border border-app mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                   <input 
                     placeholder="Name (e.g. Rent)" 
                     className={inputCls}
                     value={desc}
                     onChange={e => setDesc(e.target.value)}
                   />
                   <input 
                     type="number" 
                     placeholder="Amount (₹)" 
                     className={inputCls}
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                   />
                   <select 
                     className={inputCls}
                     value={cat}
                     onChange={e => setCat(e.target.value as Category)}
                   >
                     <option value={Category.HOUSING}>Rent</option>
                     <option value={Category.UTILITIES}>Utilities</option>
                     <option value={Category.ENTERTAINMENT}>Subscription</option>
                     <option value={Category.EDUCATION}>Education</option>
                   </select>
                </div>
                <button onClick={addItem} className="w-full bg-surface-3 hover:bg-surface-2 text-app py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-app transition-all">
                  <Plus size={16} /> Add Expense
                </button>
             </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in">
             <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-gold-soft to-gold rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-card-soft transform -rotate-3">
                   <Car size={28} className="text-white" />
                </div>
                <h2 className="heading-serif text-2xl font-bold mb-2">Loans & EMIs</h2>
                <p className="text-soft">Add any scheduled loan repayments.</p>
             </div>

             <div className="bg-surface-2 p-4 rounded-xl border border-app mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                   <input 
                     placeholder="Name (e.g. Car Loan)" 
                     className={inputCls}
                     value={desc}
                     onChange={e => setDesc(e.target.value)}
                   />
                   <input 
                     type="number" 
                     placeholder="Amount (₹)" 
                     className={inputCls}
                     value={amount}
                     onChange={e => setAmount(e.target.value)}
                   />
                   <select 
                     className={inputCls}
                     value={cat}
                     onChange={e => setCat(e.target.value as Category)}
                   >
                     <option value={Category.EMI}>Loan / EMI</option>
                   </select>
                </div>
                <button onClick={addItem} className="w-full bg-surface-3 hover:bg-surface-2 text-app py-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 border border-app transition-all">
                  <Plus size={16} /> Add EMI
                </button>
             </div>
          </div>
        )}

        {/* List of Added Items */}
        {items.length > 0 && (
          <div className="mb-8 max-h-40 overflow-y-auto custom-scrollbar">
            <h3 className="text-xs font-bold text-faint uppercase tracking-wider mb-2">Added Items</h3>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-surface-2 p-3 rounded-lg border border-app">
                  <div className="flex items-center gap-3">
                     <span className="text-sm font-medium">{item.description}</span>
                     <span className="text-xs text-faint bg-surface-3 px-2 py-0.5 rounded">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-danger">-₹{item.amount}</span>
                    <button onClick={() => removeItem(idx)} className="text-faint hover:text-danger"><Plus size={16} className="rotate-45" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleNext}
          disabled={isLoading}
          className="w-full bg-gradient-to-br from-brand-deep to-brand hover:brightness-110 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-card flex items-center justify-center gap-2 tracking-wide"
        >
          {isLoading ? 'Saving...' : step === 1 ? 'Next: Add EMIs' : 'Finish Setup'} {!isLoading && <ArrowRight size={20} />}
        </button>
        
        {step === 1 && (
            <button onClick={() => setStep(2)} className="w-full text-center text-faint text-sm mt-4 hover:text-app transition-colors">Skip to EMIs</button>
        )}
         {step === 2 && (
            <button onClick={handleSkip} disabled={isLoading} className="w-full text-center text-faint text-sm mt-4 hover:text-app transition-colors disabled:text-faint">Skip Setup</button>
        )}

      </div>
    </div>
  );
};

export default SetupWizard;
