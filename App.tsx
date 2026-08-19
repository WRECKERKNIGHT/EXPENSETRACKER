
import React, { useState, useEffect } from 'react';
import { Expense, ViewMode, AppScreen, UserProfile, Category, UserPreferences } from './types';
import { getExpenses, saveExpense, saveUserProfile, setSessionActive, getUserPreferences, saveUserPreferences, isQuizDismissed, dismissQuizPrompt } from './services/storageService';
import { loginAPI, registerAPI, setAuthToken, getAuthToken, clearAuthToken, getExpensesAPI, deleteExpenseAPI, bulkCreateExpensesAPI, getCurrentUserAPI, updateExpenseAPI } from './services/apiService';
import Overview from './components/Overview';
import SmsImportModal from './components/SmsImportModal';
import ExpenseList from './components/ExpenseList';
import Advisor from './components/Advisor';
import Reports from './components/Reports';
import AddExpenseModal from './components/AddExpenseModal';
import EditExpenseModal from './components/EditExpenseModal';
import MoneyBackground from './components/MoneyBackground';
import SetupWizard from './components/SetupWizard';
import LandingPage from './components/LandingPage';
import ThemeToggle from './components/ThemeToggle';
import OnboardingQuiz from './components/OnboardingQuiz';
import { initTheme, applyTheme } from './services/theme';
import { LayoutDashboard, Receipt, Sparkles, Plus, Wallet, LogOut, User, Mail, Key, BarChart2, SlidersHorizontal } from 'lucide-react';

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
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showCustomizePrompt, setShowCustomizePrompt] = useState(false);
  
  // App State
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const monthlyExpenseCount = React.useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return expenses.filter(e => e.type === 'expense' && new Date(e.date) >= monthStart).length;
  }, [expenses]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Auth Forms State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadExpenses = async (userProfile: UserProfile) => {
    try {
      const data = await getExpensesAPI();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      setExpenses([]);
    }
  };

  const loadPreferences = (email: string) => {
    const prefs = getUserPreferences(email);
    setPreferences(prefs);
    setShowCustomizePrompt(!prefs && !isQuizDismissed(email));
  };

  useEffect(() => {
    initTheme();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          if (screen === 'app') setIsModalOpen(true);
        }
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setIsSmsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const cleanupKeys = () => window.removeEventListener('keydown', handleKeyDown);

    // Check for existing token and user session on app load
    const token = getAuthToken();
    if (token) {
      // Try to load user profile from backend to verify token is still valid
      getCurrentUserAPI()
        .then((user: any) => {
          setUser(user as UserProfile);
          loadPreferences((user as UserProfile).email);
          loadExpenses(user as UserProfile);
          setScreen('app');
        })
        .catch((error: any) => {
          console.error('Failed to load user profile:', error);
          clearAuthToken();
          setScreen('landing');
        });
    }
    return cleanupKeys;
  }, [screen]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !emailInput || !passwordInput || !incomeInput || !balanceInput) return;

    setIsLoading(true);
    setAuthError('');

    try {
      const newUser = await registerAPI({
        name: nameInput,
        email: emailInput,
        password: passwordInput,
        monthlyIncome: parseFloat(incomeInput),
        // Default to INR for now; can be exposed as a dropdown later
        currency: 'INR',
      });

      saveUserProfile(newUser);
      setUser(newUser);

      // Create an opening balance transaction if user entered one
      const openingBalance = parseFloat(balanceInput);
      if (!Number.isNaN(openingBalance) && openingBalance > 0) {
        await bulkCreateExpensesAPI([
          {
            amount: openingBalance,
            category: Category.SALARY,
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            description: 'Opening Balance',
          },
        ]);
      }

      // Clear form inputs
      setNameInput('');
      setEmailInput('');
      setPasswordInput('');
      setIncomeInput('');
      setBalanceInput('');

      // Go to setup wizard immediately after signup
      setScreen('setup');
    } catch (error: any) {
      setAuthError(error.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    // Mock Google Login Logic
    const googleUser: UserProfile = {
      name: "Google User",
      email: "user@gmail.com",
      password: "google-oauth-token", // Dummy token
      monthlyIncome: 50000, // Default mock income
      currency: 'INR'
    };
    
    saveUserProfile(googleUser);
    setSessionActive(true); // Persist login
    setUser(googleUser);
    
    // Check if we need to run setup
    const currentExpenses = getExpenses();
    setExpenses(currentExpenses);
    
    if (currentExpenses.length === 0) {
      // Add default balance if new
      const initialTx: Expense = {
            id: Date.now().toString(),
            amount: 10000,
            category: Category.SALARY,
            type: 'income',
            date: new Date().toISOString().split('T')[0],
            description: 'Initial Wallet Balance',
            createdAt: Date.now()
      };
      saveExpense(initialTx);
      setExpenses([initialTx]);
      setScreen('setup');
    } else {
      loadPreferences(googleUser.email);
      setScreen('app');
    }
  };

  const handleSetupComplete = async (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
      await handleAddExpenses(newExpenses);
      if (user && getUserPreferences(user.email)) {
        setScreen('app');
      } else {
        setScreen('onboarding');
      }
  };

  const handleOnboardingComplete = (prefs: Omit<UserPreferences, 'updatedAt'>) => {
    if (!user) return;
    const saved = saveUserPreferences(user.email, prefs);
    applyTheme(saved.theme);
    setPreferences(saved);
    setShowCustomizePrompt(false);
    setScreen('app');
  };

  const handleOnboardingSkip = () => {
    if (user) dismissQuizPrompt(user.email);
    setShowCustomizePrompt(false);
    setScreen('app');
  };

  const handleOpenCustomization = () => {
    setScreen('onboarding');
  };

  const handleDismissCustomizePrompt = () => {
    if (user) dismissQuizPrompt(user.email);
    setShowCustomizePrompt(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setAuthError('');

    try {
      const loggedInUser = await loginAPI(loginEmail, loginPassword);
      setUser(loggedInUser);
      saveUserProfile(loggedInUser);
      loadPreferences(loggedInUser.email);
      
      await loadExpenses(loggedInUser);
      setScreen('app');
      
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    setScreen('landing');
    setLoginEmail('');
    setLoginPassword('');
    setAuthError('');
    setView('dashboard');
    setUser(null);
    setExpenses([]);
    setPreferences(null);
    setShowCustomizePrompt(false);
  };

  const handleAddExpenses = async (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
    try {
      setIsLoading(true);
      const created: any = await bulkCreateExpensesAPI(
        newExpenses.map(e => ({
          amount: e.amount,
          category: e.category,
          type: e.type,
          date: e.date,
          description: e.description
        }))
      );
      setExpenses(prev => [...(created as Expense[]), ...prev]);
    } catch (error) {
      console.error('Failed to add expenses:', error);
      setAuthError('Failed to save expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      setIsLoading(true);
      await deleteExpenseAPI(id);
      setExpenses(expenses.filter(e => e.id !== id));
    } catch (error) {
      console.error('Failed to delete expense:', error);
      setAuthError('Failed to delete expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      setIsLoading(true);
      await updateExpenseAPI(id, updates);
      setExpenses(expenses.map(e => e.id === id ? { ...e, ...updates } : e));
      setEditingExpense(null);
    } catch (error) {
      console.error('Failed to update expense:', error);
      setAuthError('Failed to update expense');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Screens ---

  if (screen === 'landing') {
    return <LandingPage onNavigate={setScreen} />;
  }

  if (screen === 'setup') {
      return <SetupWizard onComplete={handleSetupComplete} />;
  }

  if (screen === 'onboarding') {
      return (
        <OnboardingQuiz
          monthlyIncome={user?.monthlyIncome || 0}
          currency={user?.currency || 'INR'}
          expenses={expenses}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      );
  }

  if (screen === 'login') {
    return (
      <div className="min-h-screen bg-app text-app flex items-center justify-center p-6 relative font-sans overflow-hidden">
        <MoneyBackground />
        <div className="absolute top-0 left-0 w-full h-full hero-gradient-dark opacity-60 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md perspective-1000">
          <div className="card-3d gold-shimmer p-8 md:p-10 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-gold-soft to-gold rounded-2xl mx-auto mb-5 flex items-center justify-center tilt-hover cursor-pointer">
                 <User size={28} className="text-[#0a0f0a]" />
              </div>
              <h2 className="heading-serif text-3xl md:text-4xl font-bold mb-2">Welcome Back</h2>
              <p className="text-soft">Sign in to your account</p>
            </div>
            
            <button 
              onClick={handleGoogleAuth}
              className="w-full btn-gold flex items-center justify-center gap-3 mb-6 py-4 rounded-xl text-base"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-app"></div>
              <span className="flex-shrink mx-4 text-faint text-xs uppercase tracking-widest font-bold">or email</span>
              <div className="flex-grow border-t border-app"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-soft mb-1.5 ml-1 tracking-wider uppercase">Email</label>
                <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full bg-app-soft border border-app rounded-xl px-4 py-3.5 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all placeholder:text-faint"
                  placeholder="you@example.com" />
              </div>
              <div>
                <label className="block text-xs font-bold text-soft mb-1.5 ml-1 tracking-wider uppercase">Password</label>
                <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-app-soft border border-app rounded-xl px-4 py-3.5 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all placeholder:text-faint"
                  placeholder="••••••••" />
              </div>
              {authError && <p className="text-danger text-sm font-medium">{authError}</p>}
              <button type="submit" disabled={isLoading} className="w-full btn-gold py-3.5 rounded-xl text-base font-bold disabled:opacity-60">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setScreen('signup')} className="text-sm text-faint hover:text-gold transition-colors">
                Don't have an account? <span className="font-bold">Sign up</span>
              </button>
            </div>
            <button onClick={() => setScreen('landing')} className="w-full mt-4 text-faint text-sm hover:text-app transition-colors">← Back to Home</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'signup') {
    return (
      <div className="min-h-screen bg-app text-app flex items-center justify-center p-6 relative font-sans overflow-hidden">
        <MoneyBackground />
        <div className="absolute top-0 left-0 w-full h-full hero-gradient-dark opacity-60 pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-lg perspective-1000">
          <div className="card-3d gold-shimmer p-8 md:p-10 animate-fade-in-up max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-deep via-gold to-brand"></div>
            <div className="text-center mb-6">
              <h2 className="heading-serif text-4xl md:text-5xl font-bold mb-3 tracking-tight">Create Account</h2>
              <p className="text-soft font-light text-lg">Join SpendSmart and take control.</p>
            </div>
            
            <button 
              onClick={handleGoogleAuth}
              className="w-full bg-gold hover:brightness-110 text-white font-bold py-4 rounded-2xl transition-all shadow-gold-glow flex items-center justify-center gap-3 mb-6 text-lg"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <div className="relative flex py-2 items-center mb-6">
              <div className="flex-grow border-t border-app"></div>
              <span className="flex-shrink mx-4 text-faint text-xs uppercase tracking-widest font-bold">Or sign up with email</span>
              <div className="flex-grow border-t border-app"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              
              {/* Personal Info */}
              <div>
                <label className="block text-sm font-bold text-soft mb-2 ml-1 tracking-wider uppercase">Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-app-soft border border-app rounded-2xl px-5 py-4 text-app text-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-soft transition-all placeholder:text-faint"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-soft mb-2 ml-1 tracking-wider uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-app-soft border border-app rounded-2xl px-5 py-4 text-app text-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-soft transition-all placeholder:text-faint"
                  placeholder="rahul@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-soft mb-2 ml-1 tracking-wider uppercase">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-app-soft border border-app rounded-2xl px-5 py-4 text-app text-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-soft transition-all placeholder:text-faint"
                  placeholder="••••••••"
                />
              </div>
              
              {/* Financial Info */}
              <div className="pt-4 border-t border-app">
                  <p className="text-base font-semibold text-gold mb-4 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={18} /> Financial Setup
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                      <label className="block text-sm font-bold text-soft mb-2 ml-1 tracking-wider uppercase">Current Balance (₹)</label>
                      <input
                          type="number"
                          required
                          value={balanceInput}
                          onChange={(e) => setBalanceInput(e.target.value)}
                          className="w-full bg-app-soft border border-app rounded-2xl px-4 py-4 text-app text-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-soft transition-all placeholder:text-faint font-mono"
                          placeholder="0"
                      />
                      </div>

                      <div>
                      <label className="block text-sm font-bold text-soft mb-2 ml-1 tracking-wider uppercase">Monthly Salary (₹)</label>
                      <input
                          type="number"
                          required
                          value={incomeInput}
                          onChange={(e) => setIncomeInput(e.target.value)}
                          className="w-full bg-app-soft border border-app rounded-2xl px-4 py-4 text-app text-lg focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold-soft transition-all placeholder:text-faint font-mono"
                          placeholder="0"
                      />
                      </div>
                  </div>
              </div>

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold disabled:opacity-60 text-base py-3.5 rounded-xl"
              >
                {isLoading ? 'Setting Up...' : 'Continue Setup'}
              </button>
            </form>
            <button onClick={() => setScreen('landing')} className="w-full mt-6 text-faint text-sm hover:text-app transition-colors">
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Dashboard ---

  return (
    <div className="min-h-screen bg-app text-app flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-surface border-r border-app flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 relative overflow-hidden">
        <div className="p-5 flex items-center justify-between gap-3 relative z-10 border-b border-app">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-gold-soft to-gold p-2.5 rounded-xl tilt-hover cursor-pointer">
              <Wallet className="w-5 h-5 text-[#0a0f0a]" />
            </div>
            <div>
              <span className="heading-serif text-lg font-black tracking-tight block">SpendSmart</span>
              <span className="text-[10px] text-gold font-bold tracking-wider uppercase">AI Expense Tracker</span>
            </div>
          </div>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto hidden md:block">
          {[
            { key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'text-brand' },
            { key: 'expenses', icon: Receipt, label: 'Expenses', color: 'text-brand', badge: monthlyExpenseCount },
            { key: 'advisor', icon: Sparkles, label: 'AI Advisor', color: 'text-gold' },
            { key: 'reports', icon: BarChart2, label: 'Reports', color: 'text-gold' },
          ].map(item => (
            <button key={item.key} onClick={() => setView(item.key as ViewMode)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm border ${
                view === item.key ? 'bg-surface-2 text-app border-gold/20' : 'border-transparent text-soft hover:text-app hover:bg-surface-2'
              }`}>
              <item.icon size={18} className={view === item.key ? item.color : ''} />
              {item.label}
              {'badge' in item && item.badge! > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-brand/15 text-brand px-2 py-0.5 rounded-full">{item.badge}</span>
              )}
            </button>
          ))}
          <button onClick={handleOpenCustomization}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm border border-dashed border-gold/20 text-soft hover:text-app hover:bg-surface-2 mt-2">
            <SlidersHorizontal size={18} className="text-gold" /> Customize
          </button>
        </nav>

        {/* Mobile Navigation Bar (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-app p-2 grid grid-cols-5 gap-1 z-50">
           <button onClick={() => setView('dashboard')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${view === 'dashboard' ? 'text-brand bg-surface-2' : 'text-faint'}`}>
              <LayoutDashboard size={18} /><span className="text-[9px] font-medium mt-0.5">Home</span>
           </button>
           <button onClick={() => setView('expenses')} className={`relative flex flex-col items-center justify-center p-2 rounded-lg ${view === 'expenses' ? 'text-brand bg-surface-2' : 'text-faint'}`}>
              <Receipt size={18} /><span className="text-[9px] font-medium mt-0.5">Expenses</span>
              {monthlyExpenseCount > 0 && <span className="absolute -top-0.5 -right-0.5 text-[7px] font-bold bg-brand text-white w-3.5 h-3.5 rounded-full flex items-center justify-center">{monthlyExpenseCount > 99 ? '99+' : monthlyExpenseCount}</span>}
           </button>
           <button onClick={() => setView('advisor')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${view === 'advisor' ? 'text-gold bg-surface-2' : 'text-faint'}`}>
              <Sparkles size={18} /><span className="text-[9px] font-medium mt-0.5">AI</span>
           </button>
           <button onClick={() => setView('reports')} className={`flex flex-col items-center justify-center p-2 rounded-lg ${view === 'reports' ? 'text-gold bg-surface-2' : 'text-faint'}`}>
              <BarChart2 size={18} /><span className="text-[9px] font-medium mt-0.5">Reports</span>
           </button>
           <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-lg text-white bg-gradient-to-br from-brand-deep to-brand">
              <Plus size={18} /><span className="text-[9px] font-medium mt-0.5">Add</span>
           </button>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-app space-y-2.5 hidden md:block bg-surface-2 relative z-10">
           <button onClick={() => setIsModalOpen(true)} className="w-full btn-gold flex items-center justify-center gap-2 text-sm py-3 rounded-xl">
             <Plus size={18} /> Add Transaction
           </button>
           <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-faint hover:text-danger py-2 text-xs transition-colors font-medium tracking-wide">
             <LogOut size={14} /> LOGOUT
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-60px)] md:h-screen overflow-y-auto bg-app p-4 md:p-8 lg:p-10 relative pb-24 md:pb-8">
        
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-end mb-8 animate-fade-in">
           <div>
               <h1 className="heading-serif text-3xl md:text-4xl font-bold mb-1">
                 {view === 'dashboard' && 'Dashboard'}
                 {view === 'expenses' && 'Expenses'}
                 {view === 'advisor' && 'AI Advisor'}
                 {view === 'reports' && 'Reports'}
               </h1>
               <p className="text-soft text-sm">
                 {view === 'dashboard' && `Welcome back, ${user?.name}`}
                 {view === 'expenses' && 'Manage your transactions'}
                 {view === 'advisor' && 'AI-powered insights'}
                 {view === 'reports' && 'Spending summaries'}
               </p>
           </div>
           <div className="text-right">
             <p className="text-[10px] text-faint font-bold uppercase tracking-wider mb-0.5">Today</p>
             <p className="font-mono text-gold text-sm font-semibold">
               {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
             </p>
           </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-4">
           <span className="heading-serif text-xl font-black">SpendSmart</span>
           <div className="flex items-center gap-2">
              <ThemeToggle />
              <button onClick={handleLogout} className="p-2 bg-surface border border-app rounded-lg text-faint hover:text-danger transition-colors">
                  <LogOut size={16} />
              </button>
           </div>
        </div>

        <div className="max-w-7xl mx-auto pb-10">
          {view === 'dashboard' && user && (
            <Overview 
              expenses={expenses} 
              monthlyIncome={user.monthlyIncome} 
              currency={user.currency || 'INR'}
              onAddTx={() => setIsModalOpen(true)}
              onManageExpenses={() => setView('expenses')}
              userName={user.name}
              onImportComplete={() => loadExpenses(user)}
              preferences={preferences}
              showCustomizePrompt={showCustomizePrompt}
              onCustomize={handleOpenCustomization}
              onDismissCustomize={handleDismissCustomizePrompt}
            />
          )}
          {view === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} onEdit={setEditingExpense} />}
          {view === 'advisor' && <Advisor expenses={expenses} />}
          {view === 'reports' && user && <Reports expenses={expenses} currency={user.currency || 'INR'} />}
        </div>

      </main>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddExpenses}
        existingExpenses={expenses}
      />

      <SmsImportModal isOpen={isSmsModalOpen} onClose={() => setIsSmsModalOpen(false)} onImported={() => loadExpenses(user!)} />

      <EditExpenseModal
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onSave={handleEditExpense}
        expense={editingExpense}
      />

    </div>
  );
};

export default App;
