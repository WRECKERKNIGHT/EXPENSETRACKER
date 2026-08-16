
import React, { useState, useEffect } from 'react';
import { Expense, ViewMode, AppScreen, UserProfile, Category } from './types';
import { 
  getExpenses, 
  saveExpense, 
  deleteExpense, 
  registerUser, 
  authenticateUser, 
  getCurrentUser, 
  loginUserSession, 
  logoutUser,
  clearUserExpenses,
  deleteUserAccount
} from './services/storageService';
import Overview from './components/Overview';
import ExpenseList from './components/ExpenseList';
import Advisor from './components/Advisor';
import AddExpenseModal from './components/AddExpenseModal';
import SpaceBackground from './components/SpaceBackground';
import SetupWizard from './components/SetupWizard';
import ProfileModal from './components/ProfileModal';
import { LayoutDashboard, Receipt, Sparkles, Plus, LogOut, ArrowRight, User, ShieldCheck, Smartphone, Mail, Key, Settings, Play } from 'lucide-react';

// --- Components ---

// Brand Logo Component
const SpendSmartLogo = ({ className = "w-8 h-8", animated = false }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M20 70 V 80 H 80 V 70" 
      stroke="#0f172a" 
      strokeWidth="8" 
      strokeLinecap="round" 
    />
    <path 
      d="M20 70 V 40 C 20 30, 30 20, 40 30 L 50 40 L 70 20 L 80 20 L 80 30" 
      stroke="#0f172a" 
      strokeWidth="8" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={animated ? "animate-pulse" : ""}
    />
    <path d="M70 20 L 80 20 L 80 30" stroke="#0f172a" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
    
    <rect x="30" y="55" width="12" height="25" rx="2" fill="#10b981" className={animated ? "animate-[bounce_2s_infinite]" : ""} />
    <rect x="48" y="45" width="12" height="35" rx="2" fill="#10b981" className={animated ? "animate-[bounce_2.2s_infinite]" : ""} />
    <rect x="66" y="30" width="12" height="50" rx="2" fill="#10b981" className={animated ? "animate-[bounce_2.4s_infinite]" : ""} />
  </svg>
);

// Google Icon Component
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('landing');
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // App State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [modalInitialText, setModalInitialText] = useState('');
  const [modalInitialMode, setModalInitialMode] = useState<'auto'|'manual'|'import'>('auto');

  // Auth Forms State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  useEffect(() => {
    // Check for existing session on mount
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setExpenses(getExpenses(currentUser.email));
      setScreen('app');
    } else {
      logoutUser(); // Ensure clean state if storage is inconsistent
    }
  }, []);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !passwordInput || !incomeInput || !balanceInput) return;

    const newUser: UserProfile = {
      name: nameInput,
      email: emailInput,
      password: passwordInput,
      monthlyIncome: parseFloat(incomeInput),
      currency: 'INR'
    };

    const registration = registerUser(newUser);

    if (!registration.success) {
      setAuthError(registration.message || 'Registration failed');
      return;
    }

    loginUserSession(newUser.email);
    setUser(newUser);
    
    // Create the initial balance transaction
    const initialBalance = parseFloat(balanceInput);
    if (initialBalance > 0) {
        const initialTx: Expense = {
            id: Date.now().toString(),
            amount: initialBalance,
            category: Category.SALARY,
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            description: 'Initial Wallet Balance',
            createdAt: Date.now()
        };
        saveExpense(newUser.email, initialTx);
    }
    
    // Refresh expenses
    setExpenses(getExpenses(newUser.email));
    
    // CRITICAL: New users go to Setup Wizard
    setScreen('setup'); 
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const authenticatedUser = authenticateUser(loginEmail, loginPassword);

    if (authenticatedUser) {
      loginUserSession(authenticatedUser.email);
      setUser(authenticatedUser);
      setExpenses(getExpenses(authenticatedUser.email));
      
      // CRITICAL: Returning users go directly to Dashboard
      setScreen('app'); 
      
      setAuthError('');
      setLoginEmail('');
      setLoginPassword('');
    } else {
      setAuthError('Invalid email or password.');
    }
  };

  const handleDemoLogin = () => {
      // Create a demo user automatically
      const demoEmail = `demo_${Date.now()}@spendsmart.ai`;
      const demoUser: UserProfile = {
          name: "Demo User",
          email: demoEmail,
          password: "demo",
          monthlyIncome: 85000,
          currency: 'INR'
      };
      
      registerUser(demoUser);
      loginUserSession(demoUser.email);
      setUser(demoUser);

      // Seed some data for the demo
      const today = new Date().toISOString().split('T')[0];
      const demoExpenses: Expense[] = [
          { id: '1', amount: 50000, category: Category.SALARY, type: 'income', date: today, description: 'Salary Credit', createdAt: Date.now() },
          { id: '2', amount: 15000, category: Category.HOUSING, type: 'expense', date: today, description: 'Rent Payment', createdAt: Date.now() },
          { id: '3', amount: 450, category: Category.FOOD, type: 'expense', date: today, description: 'Swiggy Order', createdAt: Date.now() },
          { id: '4', amount: 2000, category: Category.FUEL, type: 'expense', date: today, description: 'Shell Petrol', createdAt: Date.now() },
      ];
      
      demoExpenses.forEach(e => saveExpense(demoEmail, e));
      setExpenses(getExpenses(demoEmail));
      setScreen('app');
  };

  const handleGoogleAuth = () => {
    const mockEmail = "user@gmail.com";
    const googleUser: UserProfile = {
      name: "Google User",
      email: mockEmail,
      password: "google-oauth-token", 
      monthlyIncome: 50000, 
      currency: 'INR'
    };
    
    let user = authenticateUser(mockEmail, "google-oauth-token");
    if (!user) {
        registerUser(googleUser);
        user = googleUser;
        saveExpense(mockEmail, {
             id: Date.now().toString(),
            amount: 10000,
            category: Category.SALARY,
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            description: 'Initial Wallet Balance',
            createdAt: Date.now()
        });
        setScreen('setup'); // New Google user -> Setup
    } else {
        setScreen('app'); // Existing Google user -> Dashboard
    }

    loginUserSession(user.email);
    setUser(user);
    setExpenses(getExpenses(user.email));
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setExpenses([]);
    setScreen('landing');
    setAuthError('');
    setIsProfileOpen(false);
  };

  const handleDeleteAccount = () => {
    if (user) {
        deleteUserAccount(user.email);
        handleLogout();
    }
  };

  const handleResetData = () => {
    if (user) {
        clearUserExpenses(user.email);
        setExpenses([]);
        setIsProfileOpen(false);
    }
  }

  const handleSetupComplete = (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
      handleAddExpenses(newExpenses);
      setScreen('app');
  };

  const handleAddExpenses = (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    if (!user) return;
    
    newExpenses.forEach(item => {
        const expense: Expense = {
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            createdAt: Date.now(),
        };
        saveExpense(user.email, expense);
    });
    setExpenses(getExpenses(user.email));
  };

  const handleDeleteExpense = (id: string) => {
    if (!user) return;
    const updated = deleteExpense(user.email, id);
    setExpenses(updated);
  };

  const handleScanClipboard = async () => {
      try {
          const text = await navigator.clipboard.readText();
          if (text) {
              setModalInitialText(text);
              setModalInitialMode('auto');
              setIsModalOpen(true);
          } else {
              setModalInitialMode('auto');
              setIsModalOpen(true);
          }
      } catch (err) {
          setModalInitialMode('auto');
          setIsModalOpen(true);
      }
  };

  const handleCloseModal = () => {
      setIsModalOpen(false);
      setModalInitialText('');
  };

  // --- Screens ---

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex flex-col relative overflow-hidden font-sans selection:bg-emerald-500/30">
        <SpaceBackground />
        <nav className="relative z-20 w-full p-6 md:p-8 flex justify-between items-center animate-fade-in">
             <div className="flex items-center gap-3">
                <div className="bg-white/90 p-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg">
                    <SpendSmartLogo className="w-6 h-6" />
                </div>
                <span className="text-xl md:text-2xl font-bold tracking-tight text-white">SpendSmart AI</span>
             </div>
        </nav>
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 text-center px-4 -mt-20">
          <div className="mb-8 animate-float">
             <div className="bg-white p-6 rounded-[2rem] shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-500/20 backdrop-blur-sm">
                <SpendSmartLogo className="w-24 h-24 md:w-32 md:h-32" animated={true} />
             </div>
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-500 drop-shadow-xl animate-fade-in leading-[0.9]">
            Smart Growth<br className="md:hidden" />
            <span className="text-emerald-400 text-glow">For Your Wallet</span>
          </h1>
          <p className="text-lg md:text-2xl text-zinc-400 max-w-xl md:max-w-3xl mb-12 leading-relaxed font-light animate-fade-in delay-100">
            The intelligent financial assistant that helps you <span className="text-emerald-400 font-semibold text-glow-sm">save more</span> and spend wisely using AI.
          </p>
          <div className="flex flex-col md:flex-row items-center gap-5 w-full max-w-md md:max-w-none justify-center animate-fade-in delay-200">
              <button onClick={() => setScreen('login')} className="w-full md:w-auto px-10 py-5 bg-zinc-900/50 backdrop-blur-md border border-zinc-700 text-zinc-300 hover:text-white text-lg font-bold rounded-full transition-all hover:bg-zinc-800 hover:border-zinc-500 flex items-center justify-center gap-2">
                  <User size={20} /> Login
              </button>
              <button onClick={() => setScreen('signup')} className="group relative w-full md:w-auto px-12 py-5 bg-emerald-500 text-white text-lg font-bold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:shadow-[0_0_60px_rgba(16,185,129,0.6)] hover:bg-emerald-400">
                  <span className="relative z-10 flex items-center justify-center gap-3">
                  Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
              </button>
          </div>
          <div className="mt-8 animate-fade-in delay-300">
             <button onClick={handleDemoLogin} className="text-zinc-500 hover:text-emerald-400 text-sm font-semibold flex items-center gap-2 transition-colors">
                <Play size={14} /> Try Demo Account (No Signup)
             </button>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 opacity-80 animate-fade-in delay-300">
             {[
               { icon: Receipt, label: "SMS Parsing" },
               { icon: Sparkles, label: "AI Advisor" },
               { icon: ShieldCheck, label: "Secure Data" },
               { icon: Smartphone, label: "Mobile First" }
             ].map((f, i) => (
               <div key={i} className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/30 backdrop-blur-sm hover:bg-zinc-800/60 transition-all cursor-default group">
                 <f.icon size={16} className="text-emerald-400 group-hover:text-emerald-300" />
                 <span className="text-xs md:text-sm font-medium text-zinc-300">{f.label}</span>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'setup') {
      return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative font-sans">
        <SpaceBackground />
        <div className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] transform rotate-3">
               <SpendSmartLogo className="w-12 h-12" animated={false} />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Welcome Back</h2>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>
          <button onClick={handleGoogleAuth} className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-6">
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-zinc-700"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-widest font-bold">Or continue with email</span>
            <div className="flex-grow border-t border-zinc-700"></div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-inner" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Password</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600 shadow-inner" placeholder="••••••••" />
              </div>
            </div>
            {authError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2 animate-fade-in">{authError}</p>}
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] mt-2 text-lg tracking-wide">
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center">
             <button onClick={handleDemoLogin} className="text-zinc-400 text-sm hover:text-emerald-400 underline decoration-zinc-700 hover:decoration-emerald-400 underline-offset-4 transition-all">Try Demo Account</button>
          </div>
          <button onClick={() => setScreen('landing')} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  if (screen === 'signup') {
    return (
      <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative font-sans">
        <SpaceBackground />
        <div className="relative z-10 w-full max-w-md bg-[#0f172a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow animate-fade-in my-10">
          <div className="text-center mb-6">
             <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Create Account</h2>
             <p className="text-zinc-400">Setup your financial profile</p>
          </div>
          
          <button onClick={handleGoogleAuth} className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-6">
            <GoogleIcon />
            Sign up with Google
          </button>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase">Full Name</label>
              <input type="text" required value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase">Email</label>
              <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600" placeholder="you@example.com" />
            </div>
             <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase">Password</label>
              <input type="password" required value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600" placeholder="Create a password" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase">Monthly Income (₹)</label>
                    <input type="number" required value={incomeInput} onChange={(e) => setIncomeInput(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600" placeholder="50000" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 uppercase">Current Balance (₹)</label>
                    <input type="number" required value={balanceInput} onChange={(e) => setBalanceInput(e.target.value)} className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder:text-zinc-600" placeholder="12000" />
                </div>
            </div>
            
            {authError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20">{authError}</p>}
            
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] mt-2">
              Create Account
            </button>
          </form>
          <div className="mt-6 text-center">
             <button onClick={() => setScreen('login')} className="text-zinc-400 text-sm hover:text-white transition-colors">Already have an account? <span className="text-emerald-400 font-bold">Log in</span></button>
          </div>
           <button onClick={() => setScreen('landing')} className="w-full mt-4 text-zinc-500 text-sm hover:text-white transition-colors">Back to Home</button>
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-[#020617] text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans selection:bg-emerald-500/30">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[#0f172a]/90 backdrop-blur-xl border-r border-white/5 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-6 md:p-8 flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <SpendSmartLogo className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-bold tracking-tight block text-white text-glow-sm">SpendSmart</span>
            <span className="text-[10px] md:text-xs text-emerald-400 font-semibold tracking-wider uppercase">AI Expense Tracker</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-3 py-6 overflow-y-auto hidden md:block">
          <button onClick={() => setView('dashboard')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${view === 'dashboard' ? 'bg-zinc-800/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)] border border-white/5 bg-gradient-to-r from-zinc-800/80 to-zinc-900/0' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'}`}>
            <LayoutDashboard size={20} className={view === 'dashboard' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} /> Dashboard
          </button>
          <button onClick={() => setView('expenses')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${view === 'expenses' ? 'bg-zinc-800/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)] border border-white/5 bg-gradient-to-r from-zinc-800/80 to-zinc-900/0' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'}`}>
            <Receipt size={20} className={view === 'expenses' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : ''} /> Manage Expenses
          </button>
          <button onClick={() => setView('advisor')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${view === 'advisor' ? 'bg-zinc-800/60 text-white shadow-[0_0_15px_rgba(255,255,255,0.02)] border border-white/5 bg-gradient-to-r from-zinc-800/80 to-zinc-900/0' : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'}`}>
            <Sparkles size={20} className={view === 'advisor' ? 'text-teal-400 drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]' : ''} /> AI Advisor
          </button>
        </nav>

        <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#0f172a]/95 backdrop-blur-xl border-t border-zinc-800 p-2 grid grid-cols-4 gap-1 z-50">
           <button onClick={() => setView('dashboard')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'dashboard' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500'}`}><LayoutDashboard size={20} /><span className="text-[10px] font-medium mt-1">Home</span></button>
           <button onClick={() => setView('expenses')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'expenses' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-500'}`}><Receipt size={20} /><span className="text-[10px] font-medium mt-1">Expenses</span></button>
           <button onClick={() => setView('advisor')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'advisor' ? 'text-teal-400 bg-teal-500/10' : 'text-zinc-500'}`}><Sparkles size={20} /><span className="text-[10px] font-medium mt-1">AI</span></button>
           <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl text-white bg-emerald-500 shadow-lg"><Plus size={20} /><span className="text-[10px] font-medium mt-1">Add</span></button>
        </div>

        <div className="p-6 border-t border-zinc-800 space-y-4 hidden md:block bg-black/20">
           <button onClick={() => setIsModalOpen(true)} className="w-full bg-white hover:bg-emerald-50 text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1">
             <Plus size={20} /> Add Transaction
           </button>
           <button onClick={() => setIsProfileOpen(true)} className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-white py-2 text-sm transition-colors font-medium tracking-wide">
             <Settings size={16} /> My Profile
           </button>
        </div>
      </aside>

      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto bg-[#020617] p-4 md:p-8 lg:p-12 relative custom-scrollbar pb-20 md:pb-10">
        <div className="hidden md:flex justify-between items-end mb-10 animate-fade-in">
           <div>
               <h1 className="text-4xl font-bold text-white mb-2 tracking-tight text-glow-sm">
                 {view === 'dashboard' && 'Dashboard Overview'}
                 {view === 'expenses' && 'Manage Expenses'}
                 {view === 'advisor' && 'Financial Assistant'}
               </h1>
               <p className="text-zinc-400 text-lg font-light">
                 {view === 'dashboard' && `Welcome back, ${user?.name}`}
                 {view === 'expenses' && 'Detailed breakdown of your transactions.'}
                 {view === 'advisor' && 'AI-powered financial insights.'}
               </p>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setIsProfileOpen(true)} className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-xl transition-all">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">{user?.name[0]}</div>
                  <span className="text-sm font-medium text-zinc-300 hidden md:inline">{user?.name}</span>
              </button>
           </div>
        </div>

        <div className="md:hidden flex justify-between items-center mb-6">
           <span className="text-lg font-bold text-white">SpendSmart</span>
           <button onClick={() => setIsProfileOpen(true)} className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg">
               {user?.name[0]}
           </button>
        </div>

        <div className="max-w-7xl mx-auto pb-10">
          {view === 'dashboard' && (
            <Overview 
              expenses={expenses} 
              monthlyIncome={user?.monthlyIncome || 0} 
              onAddTx={() => {
                  setModalInitialMode('auto');
                  setIsModalOpen(true);
              }}
              onManageExpenses={() => setView('expenses')}
              onScanClipboard={handleScanClipboard}
              userName={user?.name}
            />
          )}
          {view === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
          {view === 'advisor' && <Advisor expenses={expenses} />}
        </div>
      </main>

      <AddExpenseModal isOpen={isModalOpen} onClose={handleCloseModal} onAdd={handleAddExpenses} initialText={modalInitialText} initialMode={modalInitialMode} />
      
      {user && (
          <ProfileModal 
            isOpen={isProfileOpen} 
            onClose={() => setIsProfileOpen(false)} 
            user={user} 
            stats={{ totalTx: expenses.length, joinDate: '2024' }} 
            onLogout={handleLogout}
            onResetData={handleResetData}
            onDeleteAccount={handleDeleteAccount}
          />
      )}

    </div>
  );
};

export default App;
