
import React, { useState, useEffect } from 'react';
import { Expense, ViewMode, AppScreen, UserProfile, Category } from './types';
import { getExpenses, saveExpense, deleteExpense, getUserProfile, saveUserProfile, clearData } from './services/storageService';
import Overview from './components/Overview';
import ExpenseList from './components/ExpenseList';
import Advisor from './components/Advisor';
import AddExpenseModal from './components/AddExpenseModal';
import { LayoutDashboard, Receipt, Sparkles, Plus, Wallet, LogOut, ArrowRight, IndianRupee } from 'lucide-react';

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // App State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Setup Form State
  const [nameInput, setNameInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');

  useEffect(() => {
    // Check for existing user
    const existingUser = getUserProfile();
    if (existingUser) {
      setUser(existingUser);
      setScreen('app');
      setExpenses(getExpenses());
    }
  }, []);

  const handleSetupAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !incomeInput || !balanceInput) return;

    const newUser: UserProfile = {
      name: nameInput,
      monthlyIncome: parseFloat(incomeInput),
      currency: 'INR'
    };

    saveUserProfile(newUser);
    setUser(newUser);
    
    // Create the initial balance transaction
    const initialBalance = parseFloat(balanceInput);
    if (initialBalance > 0) {
        const initialTx: Expense = {
            id: Date.now().toString(),
            amount: initialBalance,
            category: Category.SALARY, // Using Salary/Income as category for initial balance
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            description: 'Initial Wallet Balance',
            createdAt: Date.now()
        };
        const updated = saveExpense(initialTx);
        setExpenses(updated);
    } else {
        setExpenses([]);
    }

    setScreen('app');
  };

  const handleLogout = () => {
    clearData();
    setUser(null);
    setScreen('landing');
    setExpenses([]);
    setNameInput('');
    setIncomeInput('');
    setBalanceInput('');
    setView('dashboard');
  };

  const handleAddExpense = (newExpense: Omit<Expense, 'id' | 'createdAt'>) => {
    const expense: Expense = {
      ...newExpense,
      id: Date.now().toString(),
      createdAt: Date.now(),
    };
    const updated = saveExpense(expense);
    setExpenses(updated);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = deleteExpense(id);
    setExpenses(updated);
  };

  // --- Screens ---

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[150px] animate-pulse-slow"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[150px] animate-pulse-slow"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 text-center">
          <div className="mb-8 p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl shadow-[0_0_40px_rgba(99,102,241,0.3)] animate-bounce-slow">
            <IndianRupee className="w-20 h-20 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]">
            SpendSmart AI
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl mb-12 leading-relaxed font-light tracking-wide">
            Master your money with India's most <span className="text-indigo-300 font-semibold text-glow-sm">intelligent</span> expense tracker. 
            Powered by Gemini AI.
          </p>
          <button 
            onClick={() => setScreen('login')}
            className="group relative px-10 py-5 bg-white text-black text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative font-sans">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-900/15 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-[#121215]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Account Setup</h2>
            <p className="text-zinc-400 font-light">Tell us a bit about your finances.</p>
          </div>
          
          <form onSubmit={handleSetupAccount} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Your Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                placeholder="e.g. Rahul Sharma"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Current Wallet/Bank Balance (₹)</label>
              <input
                type="number"
                required
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner font-mono text-lg"
                placeholder="e.g. 15000"
              />
              <p className="text-xs text-zinc-500 mt-2 ml-1">This will be your starting balance.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Monthly Salary/Income (₹)</label>
              <input
                type="number"
                required
                value={incomeInput}
                onChange={(e) => setIncomeInput(e.target.value)}
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner font-mono text-lg"
                placeholder="e.g. 85000"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] mt-6 text-lg tracking-wide"
            >
              Complete Setup
            </button>
          </form>
          <button onClick={() => setScreen('landing')} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // --- Main App Dashboard ---

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[#121215]/80 backdrop-blur-md border-r border-white/5 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight block text-white text-glow-sm">SpendSmart</span>
            <span className="text-xs text-indigo-400 font-semibold tracking-wider uppercase">AI Expense Tracker</span>
          </div>
        </div>
        
        <div className="px-6 mb-6">
          <div className="p-5 bg-gradient-to-r from-zinc-900 to-black rounded-3xl border border-zinc-800/50 shadow-inner">
            <p className="text-xs text-zinc-500 mb-1 font-medium uppercase tracking-wider">Welcome back</p>
            <p className="text-lg font-bold text-zinc-100 text-glow-sm truncate">{user?.name}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3 py-2 overflow-y-auto">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
              view === 'dashboard' 
              ? 'bg-zinc-800/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
            }`}
          >
            <LayoutDashboard size={20} className={view === 'dashboard' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} />
            Dashboard
          </button>
          <button 
            onClick={() => setView('expenses')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
              view === 'expenses' 
              ? 'bg-zinc-800/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
            }`}
          >
            <Receipt size={20} className={view === 'expenses' ? 'text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]' : ''} />
            Manage Expenses
          </button>
          <button 
            onClick={() => setView('advisor')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
              view === 'advisor' 
              ? 'bg-zinc-800/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
            }`}
          >
            <Sparkles size={20} className={view === 'advisor' ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : ''} />
            AI Advisor
          </button>
        </nav>

        <div className="p-6 border-t border-zinc-800 space-y-4">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full bg-white hover:bg-indigo-50 text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
           >
             <Plus size={20} />
             New Transaction
           </button>
           <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 py-2 text-sm transition-colors font-medium tracking-wide"
           >
             <LogOut size={16} /> SIGN OUT
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto bg-[#09090b] p-4 md:p-12 relative custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight text-glow-sm">
              {view === 'dashboard' && 'Dashboard Overview'}
              {view === 'expenses' && 'Manage Expenses'}
              {view === 'advisor' && 'Financial Assistant'}
            </h1>
            <p className="text-zinc-400 text-lg font-light">
              {view === 'dashboard' && `Here is what's happening with your money.`}
              {view === 'expenses' && 'Review and manage all your transactions.'}
              {view === 'advisor' && 'Ask Gemini anything about your finances.'}
            </p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-sm text-zinc-500 font-semibold uppercase tracking-wider mb-1">Current Date</p>
            <p className="font-mono text-indigo-300 text-lg">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </header>

        <div className="max-w-7xl mx-auto pb-10">
          {view === 'dashboard' && (
            <Overview 
              expenses={expenses} 
              monthlyIncome={user?.monthlyIncome || 0} 
              onAddTx={() => setIsModalOpen(true)}
              onManageExpenses={() => setView('expenses')}
            />
          )}
          {view === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
          {view === 'advisor' && <Advisor expenses={expenses} />}
        </div>

      </main>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddExpense} 
      />

    </div>
  );
};

export default App;
