
import React, { useState, useEffect } from 'react';
import { Expense, ViewMode, AppScreen, UserProfile, Category } from './types';
import { getExpenses, saveExpense, saveUserProfile, setSessionActive, deleteUserAccount, clearUserExpenses } from './services/storageService';
import { loginAPI, registerAPI, setAuthToken, getAuthToken, clearAuthToken, getExpensesAPI, deleteExpenseAPI, bulkCreateExpensesAPI, getCurrentUserAPI, googleOAuthPopupAPI, deleteAccountAPI, resetUserDataAPI, forgotPasswordAPI, resetPasswordAPI } from './services/apiService';
import DashboardNew from './components/DashboardNew';
import BankConnection from './components/BankConnection';
import SmsImportModal from './components/SmsImportModal';
import ExpenseList from './components/ExpenseList';
import Advisor from './components/Advisor';
import Reports from './components/Reports';
import AddExpenseModal from './components/AddExpenseModal';
import SpaceBackground from './components/SpaceBackground';
import Money3D from './components/Money3D';
import SetupWizard from './components/SetupWizard';
import Features from './components/Features';
import NotificationCenter from './components/NotificationCenter';
import ProfileModal from './components/ProfileModal';
import { LayoutDashboard, Receipt, Sparkles, Plus, Wallet, LogOut, ArrowRight, Lock, User, ShieldCheck, Smartphone, Mail, Key, BarChart2, Bell, Building2, X } from 'lucide-react';
import ResetPassword from './components/ResetPassword';

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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFeatures, setShowFeatures] = useState(false);
  const [resetToken, setResetToken] = useState<string | undefined>(undefined);
  
  // App State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);

  // Auth Forms State
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [incomeInput, setIncomeInput] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
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

  useEffect(() => {
    // Check for existing token and user session on app load
    const token = getAuthToken();
    if (token) {
      // Try to load user profile from backend to verify token is still valid
      getCurrentUserAPI()
        .then((user: any) => {
          setUser(user as UserProfile);
          loadExpenses(user as UserProfile);
          setScreen('app');
        })
        .catch((error: any) => {
          console.error('Failed to load user profile:', error);
          clearAuthToken();
          setScreen('landing');
        });
    }

    // If URL contains a reset token (e.g. /?token=...), navigate to reset screen
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get('token');
      if (t) {
        setResetToken(t);
        setScreen('reset');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const savedEmail = localStorage.getItem('spendsmart_remember_email');
    if (savedEmail) setLoginEmail(savedEmail);
  }, []);

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

  const passwordStrength = (p: string) => {
    if (!p) return { score: 0, label: 'Too short' };
    let score = 0;
    if (p.length >= 8) score += 1;
    if (/[A-Z]/.test(p)) score += 1;
    if (/[0-9]/.test(p)) score += 1;
    if (/[^A-Za-z0-9]/.test(p)) score += 1;
    const labels = ['Very Weak', 'Weak', 'Okay', 'Strong', 'Very Strong'];
    return { score, label: labels[score] || 'Very Weak' };
  };

  const handleGoogleAuth = async () => {
    try {
      const userFromOAuth: any = await googleOAuthPopupAPI();
      if (userFromOAuth) {
        setUser(userFromOAuth as UserProfile);
        await loadExpenses(userFromOAuth as UserProfile);
        setScreen('app');
      }
    } catch (err) {
      console.error('OAuth failed', err);
      setAuthError((err as any)?.message || 'OAuth failed');
    }
  };

  const handleSetupComplete = (newExpenses: Omit<Expense, 'id' | 'createdAt'>[]) => {
      handleAddExpenses(newExpenses);
      setScreen('app');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setAuthError('');

    try {
      const loggedInUser = await loginAPI(loginEmail, loginPassword);
      setUser(loggedInUser);
      saveUserProfile(loggedInUser);
      
      await loadExpenses(loggedInUser);
      setScreen('app');
      
      setLoginEmail('');
      setLoginPassword('');
      if (!rememberMe) localStorage.removeItem('spendsmart_remember_email');
    } catch (error: any) {
      setAuthError(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      const email = window.prompt('Enter your account email for password reset');
      if (!email) return;
      const res: any = await forgotPasswordAPI(email);
      if (res?.debugToken) {
        // Dev mode: token returned. Redirect to reset page with token prefilled for nicer UX.
        const token = res.debugToken;
        // update URL and navigate to reset screen
        const url = new URL(window.location.href);
        url.searchParams.set('token', token);
        window.history.replaceState({}, '', url.toString());
        setResetToken(token);
        setScreen('reset');
      } else {
        alert('If that email exists, a password reset link has been sent.');
      }
    } catch (err: any) {
      console.error('Forgot password failed', err);
      alert(err?.message || 'Failed to request password reset');
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
  };

  // Profile modal state and handlers
  const handleResetData = async () => {
    if (!user) return;
    try {
      await resetUserDataAPI();
      setExpenses([]);
    } catch (err) {
      console.error('Reset failed:', err);
      setAuthError('Failed to reset data');
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      await deleteAccountAPI();
      clearAuthToken();
      handleLogout();
    } catch (err) {
      console.error('Delete failed:', err);
      setAuthError('Failed to delete account');
    }
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
          description: e.description,
          paymentMethod: e.paymentMethod
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

  const handleBankExpensesImported = (newExpenses: Expense[]) => {
    setExpenses(prev => [...newExpenses, ...prev]);
  };

  const handleUpdateExpense = async (id: string, updates: Partial<Expense>) => {
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...updates } as Expense : e));
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

  // --- Screens ---

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">
        
        <SpaceBackground />

        {/* Top Navigation - Glassmorphic + Neumorphic */}
        <nav className="relative z-20 w-full px-6 py-5 md:px-12 md:py-6 flex justify-between items-center animate-fade-in">
             <div className="flex items-center gap-3">
                <div className="glass-neu p-3 rounded-2xl">
                    <Wallet className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                </div>
                <div>
                  <span className="text-xl md:text-2xl font-bold tracking-tight text-white">SpendSmart</span>
                  <span className="hidden sm:block text-[10px] text-indigo-400/70 font-semibold tracking-widest uppercase">AI Finance</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={() => setScreen('login')} className="neu-btn px-5 py-2.5 text-sm font-semibold text-zinc-300 hover:text-white">
                  Sign In
                </button>
                <button onClick={() => setScreen('signup')} className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all hover:scale-[1.02]">
                  Get Started
                </button>
             </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 w-full flex-1 px-4 md:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 md:py-12">
            
            {/* Left - Copy & CTAs */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 glass-neu px-4 py-2 mb-6 stagger-in">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs font-semibold text-zinc-300">AI-Powered Finance Tracker</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-200">Track.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Analyze.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-teal-400">Improve.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-8 leading-relaxed">
                The smartest way to understand your money. Intelligent categorization, receipt scanning, bank sync, and AI insights — all in one beautiful dashboard.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10">
                <button onClick={() => setScreen('signup')} className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)] transition-all hover:scale-[1.03] shimmer-overlay overflow-hidden">
                  <span className="relative z-10 flex items-center gap-3">
                    Get Started — It's Free
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
                <button onClick={() => setScreen('login')} className="neu-btn px-8 py-4 text-zinc-300 hover:text-white font-semibold text-lg">
                  Sign In
                </button>
              </div>

              {/* Feature pills */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-8">
                {['🤖 AI Insights', '📸 Receipt OCR', '🏦 Bank Sync', '📊 Reports', '💡 Budgets'].map((feat, i) => (
                  <div key={i} className="neu-badge px-4 py-2 text-xs font-semibold text-zinc-300 stagger-in" style={{ animationDelay: `${i * 0.1}s` }}>
                    {feat}
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                {[
                  { label: 'Avg Saving', value: '23%', icon: '💰' },
                  { label: 'Categories', value: '25+', icon: '📁' },
                  { label: 'Security', value: 'AES-256', icon: '🔒' }
                ].map((stat, i) => (
                  <div key={i} className="glass-neu p-4 text-center stagger-in" style={{ animationDelay: `${i * 0.15}s` }}>
                    <div className="text-lg mb-1">{stat.icon}</div>
                    <div className="text-xl font-bold text-white">{stat.value}</div>
                    <div className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - 3D Money + Preview Card */}
            <div className="flex flex-col items-center relative">
              {/* 3D Money Animation */}
              <Money3D />
              
              {/* Floating preview card */}
              <div className="w-full max-w-sm glass-card p-6 tilt-card stagger-in -mt-8 relative z-10" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-xs text-zinc-400 font-medium">Total Balance</div>
                    <div className="text-3xl font-bold text-white">₹2,45,800</div>
                  </div>
                  <div className="neu-badge px-3 py-1.5">
                    <div className="text-[10px] text-emerald-400 font-bold">+12.5%</div>
                  </div>
                </div>
                <div className="h-24 rounded-xl neu-pressed p-3 mb-4">
                  <svg viewBox="0 0 200 60" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="url(#g1)" strokeWidth="2.5" points="0,45 30,38 60,30 90,35 120,22 150,18 180,15 200,10" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="200" cy="10" r="4" fill="#a78bfa" opacity="0.9">
                      <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-neu p-3">
                    <div className="text-[10px] text-zinc-500 mb-1">Income</div>
                    <div className="text-sm font-bold text-emerald-400">₹85,000</div>
                  </div>
                  <div className="glass-neu p-3">
                    <div className="text-[10px] text-zinc-500 mb-1">Expenses</div>
                    <div className="text-sm font-bold text-rose-400">₹62,400</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => setShowFeatures(true)} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transition-all">
                    Explore Features
                  </button>
                  <button onClick={() => setScreen('signup')} className="flex-1 neu-btn py-3 text-zinc-300 hover:text-white font-bold text-sm">
                    Try Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature showcase */}
        <div className="relative z-10 px-4 md:px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: '🏦', title: 'Bank Sync', desc: 'Connect any bank via Plaid for real-time transaction sync', color: 'from-indigo-500/10 to-purple-500/10' },
                { icon: '📸', title: 'Receipt Scanner', desc: 'Snap a photo and AI extracts all the details instantly', color: 'from-cyan-500/10 to-blue-500/10' },
                { icon: '🧠', title: 'AI Advisor', desc: 'Get personalized spending insights and saving tips', color: 'from-emerald-500/10 to-teal-500/10' }
              ].map((f, i) => (
                <div key={i} className={`glass-neu p-5 stagger-in`} style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="text-2xl mb-3">{f.icon}</div>
                  <h3 className="text-white font-bold mb-1">{f.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
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
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative font-sans">
        <SpaceBackground />

        <div className="relative z-10 w-full max-w-md glass-card p-8 md:p-10 animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 glass-neu mx-auto mb-6 flex items-center justify-center rounded-2xl glow-ring-pulse">
               <User size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Welcome Back</h2>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>
          
          <button 
            onClick={handleGoogleAuth}
            className="w-full neu-btn hover:bg-white/10 text-zinc-900 font-bold py-4 transition-all flex items-center justify-center gap-3 mb-6 bg-white hover:bg-zinc-200"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-widest font-bold">Or continue with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full neu-pressed pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Password</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full neu-pressed pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm"
                    placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={rememberMe} onChange={(e) => { setRememberMe(e.target.checked); if (e.target.checked) localStorage.setItem('spendsmart_remember_email', loginEmail); else localStorage.removeItem('spendsmart_remember_email'); }} className="accent-indigo-500" />
                Remember me
              </label>
              <button type="button" onClick={handleForgotPassword} className="text-sm text-indigo-300 hover:text-indigo-200 transition-colors">Forgot?</button>
            </div>

            {authError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2 animate-fade-in">{authError}</p>}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-700 disabled:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] mt-2 text-lg tracking-wide"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <button onClick={() => setScreen('landing')} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'signup') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative font-sans">
        <SpaceBackground />

        <div className="relative z-10 w-full max-w-lg glass-card p-8 md:p-10 animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Create Account</h2>
            <p className="text-zinc-400 font-light">Join SpendSmart and take control of your finances.</p>
          </div>
          
          <button 
            onClick={handleGoogleAuth}
            className="w-full neu-btn bg-white hover:bg-zinc-200 text-zinc-900 font-bold py-4 transition-all flex items-center justify-center gap-3 mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-widest font-bold">Or sign up with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Personal Info */}
            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Full Name</label>
              <input
                type="text"
                required
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full neu-pressed px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm"
                placeholder="Rahul Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Email Address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full neu-pressed px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm"
                placeholder="rahul@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full neu-pressed px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 text-sm"
                placeholder="••••••••"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-zinc-400">Strength: <span className="font-semibold text-white">{passwordStrength(passwordInput).label}</span></div>
                <div className="text-xs text-zinc-500">Min 8 chars, mix letter & number</div>
              </div>
            </div>
            
            {/* Financial Info */}
            <div className="pt-4 border-t border-white/10">
                <p className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Financial Setup</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Current Balance (₹)</label>
                    <input
                        type="number"
                        required
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        className="w-full neu-pressed px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 font-mono text-sm"
                        placeholder="0"
                    />
                    </div>

                    <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Monthly Salary (₹)</label>
                    <input
                        type="number"
                        required
                        value={incomeInput}
                        onChange={(e) => setIncomeInput(e.target.value)}
                        className="w-full neu-pressed px-4 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 font-mono text-sm"
                        placeholder="0"
                    />
                    </div>
                </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:from-indigo-700 disabled:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_35px_rgba(99,102,241,0.5)] mt-4 text-lg tracking-wide"
            >
              {isLoading ? 'Setting Up...' : 'Continue Setup'}
            </button>
          </form>
          <button onClick={() => setScreen('landing')} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'reset') {
    return <ResetPassword token={resetToken} onDone={() => { setScreen('login'); const url = new URL(window.location.href); url.searchParams.delete('token'); window.history.replaceState({}, '', url.toString()); }} />;
  }

  // --- Main App Dashboard ---

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row overflow-hidden font-sans selection:bg-indigo-500/30">
      
      {/* Sidebar Navigation - Glassmorphic + Neumorphic */}
      <aside className="w-full md:w-80 glass-card border-r border-white/5 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 rounded-none md:rounded-none">
        <div className="p-6 md:p-8 flex items-center gap-4">
          <div className="glass-neu p-3 rounded-2xl glow-ring-pulse">
            <Wallet className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-bold tracking-tight block text-white">SpendSmart</span>
            <span className="text-[10px] md:text-xs text-indigo-400/70 font-semibold tracking-wider uppercase">AI Expense Tracker</span>
          </div>
          <div className="ml-auto">
            <button onClick={() => setShowProfileModal(true)} className="neu-btn p-2.5">
              <User size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="flex-1 px-4 space-y-2 py-4 overflow-y-auto hidden md:block">
          {[
            { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
            { id: 'expenses' as ViewMode, label: 'Manage Expenses', icon: Receipt, color: 'text-cyan-400' },
            { id: 'advisor' as ViewMode, label: 'AI Advisor', icon: Sparkles, color: 'text-purple-400' },
            { id: 'reports' as ViewMode, label: 'Reports', icon: BarChart2, color: 'text-sky-400' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button 
              key={id}
              onClick={() => setView(id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
                view === id 
                ? 'glass-neu text-white' 
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]'
              }`}
            >
              <Icon size={20} className={view === id ? color : ''} />
              {label}
              {view === id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current" />}
            </button>
          ))}
        </nav>

        {/* Mobile Navigation Bar (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full glass-card border-t border-white/5 p-2 grid grid-cols-5 gap-1 z-50">
           {[
            { id: 'dashboard' as ViewMode, label: 'Home', icon: LayoutDashboard, color: 'text-indigo-400' },
            { id: 'expenses' as ViewMode, label: 'Expenses', icon: Receipt, color: 'text-cyan-400' },
            { id: 'advisor' as ViewMode, label: 'AI', icon: Sparkles, color: 'text-purple-400' },
            { id: 'reports' as ViewMode, label: 'Reports', icon: BarChart2, color: 'text-sky-400' },
          ].map(({ id, label, icon: Icon, color }) => (
            <button key={id} onClick={() => setView(id)} className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all ${view === id ? `${color} glass-neu` : 'text-zinc-500'}`}>
              <Icon size={18} />
              <span className="text-[9px] font-medium mt-1">{label}</span>
            </button>
          ))}
           <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl text-white bg-gradient-to-br from-indigo-600 to-purple-600 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
              <Plus size={18} />
              <span className="text-[9px] font-medium mt-1">Add</span>
           </button>
        </div>

        <div className="p-6 border-t border-white/5 space-y-3 hidden md:block">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all flex items-center justify-center gap-2 shimmer-overlay overflow-hidden"
           >
             <span className="relative z-10 flex items-center gap-2"><Plus size={20} /> Add Transaction</span>
           </button>
           <div className="grid grid-cols-2 gap-2">
             <button 
               onClick={() => setIsSmsModalOpen(true)}
               className="neu-btn py-3 text-zinc-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
             >
               SMS Import
             </button>
             <button 
               onClick={() => setIsBankModalOpen(true)}
               className="neu-btn py-3 text-zinc-300 font-semibold text-sm transition-all flex items-center justify-center gap-2"
             >
               Connect Bank
             </button>
           </div>
           <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 py-3 neu-btn text-sm transition-all font-medium tracking-wide"
           >
             <LogOut size={16} /> LOGOUT
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto bg-[#09090b] p-4 md:p-8 lg:p-10 relative custom-scrollbar pb-20 md:pb-10">
        
        {/* Header - Only Show on Desktop (Mobile uses internal headers) */}
        <div className="hidden md:flex justify-between items-end mb-8 animate-fade-in">
           <div>
               <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                 {view === 'dashboard' && 'Dashboard Overview'}
                 {view === 'expenses' && 'Manage Expenses'}
                 {view === 'advisor' && 'Financial Assistant'}
                 {view === 'reports' && 'Spending Reports'}
               </h1>
               <p className="text-zinc-500 text-sm">
                 {view === 'dashboard' && `Welcome back, ${user?.name}`}
                 {view === 'expenses' && 'Detailed breakdown of your transactions.'}
                 {view === 'advisor' && 'AI-powered financial insights.'}
                 {view === 'reports' && 'High-level summaries and exportable statements.'}
               </p>
           </div>
           <div className="flex items-center gap-3">
              <button onClick={() => setShowFeatures(true)} className="neu-btn p-2.5" title="View Features">
                <Sparkles size={18} className="text-indigo-400" />
              </button>
              <button onClick={() => setShowNotifications(true)} className="neu-btn p-2.5 relative" title="Notifications">
                <Bell size={18} className="text-amber-400" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={() => setShowProfileModal(true)} className="neu-btn p-2.5" title="Profile">
                <User size={18} className="text-emerald-400" />
              </button>
              <div className="glass-neu px-4 py-2 text-right">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Today</p>
                <p className="font-mono text-indigo-300 text-xs">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
           </div>
        </div>

        {/* Mobile Header for Logout */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <span className="text-lg font-bold text-white">SpendSmart</span>
           <button onClick={handleLogout} className="neu-btn p-2">
               <LogOut size={16} className="text-zinc-400" />
           </button>
        </div>

        <div className="max-w-7xl mx-auto pb-10">
          {view === 'dashboard' && (
            <DashboardNew 
              expenses={expenses} 
              monthlyIncome={user?.monthlyIncome || 0} 
              currency={user?.currency || 'INR'}
              onAddTx={() => setIsModalOpen(true)}
              onManageExpenses={() => setView('expenses')}
              userName={user?.name}
              onImportComplete={() => user && loadExpenses(user)}
            />
          )}
          {showProfileModal && user && (
            <ProfileModal
              isOpen={showProfileModal}
              onClose={() => setShowProfileModal(false)}
              user={user}
              stats={{ totalTx: expenses.length, joinDate: user?.createdAt || new Date().toISOString() }}
              onLogout={() => { setShowProfileModal(false); handleLogout(); }}
              onResetData={() => { setShowProfileModal(false); handleResetData(); }}
              onDeleteAccount={() => { setShowProfileModal(false); handleDeleteAccount(); }}
            />
          )}           {view === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} onUpdate={handleUpdateExpense} />}
          {view === 'advisor' && <Advisor expenses={expenses} />}
          {view === 'reports' && user && <Reports expenses={expenses} currency={user.currency || 'INR'} />}
        </div>

      </main>

      <AddExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddExpenses} 
      />

      <SmsImportModal isOpen={isSmsModalOpen} onClose={() => setIsSmsModalOpen(false)} onImported={() => loadExpenses(user!)} />

      {/* Bank Connection Modal */}
      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]">
            <div className="flex justify-end items-center p-4 border-b border-zinc-800/50 bg-zinc-900/50">
              <button onClick={() => setIsBankModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors bg-zinc-800/50 p-2 rounded-full hover:bg-zinc-700">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <BankConnection onExpensesImported={handleBankExpensesImported} />
            </div>
          </div>
        </div>
      )}

      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <Features isOpen={showFeatures} onClose={() => setShowFeatures(false)} expenses={expenses} />

    </div>
  );
};

export default App;
