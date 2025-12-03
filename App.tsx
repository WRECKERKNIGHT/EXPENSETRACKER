
import React, { useState, useEffect } from 'react';
import { Expense, ViewMode, AppScreen, UserProfile, Category } from './types';
import { getExpenses, saveExpense, saveUserProfile, setSessionActive, deleteUserAccount, clearUserExpenses } from './services/storageService';
import { loginAPI, registerAPI, setAuthToken, getAuthToken, clearAuthToken, getExpensesAPI, deleteExpenseAPI, bulkCreateExpensesAPI, getCurrentUserAPI, googleOAuthPopupAPI, deleteAccountAPI, resetUserDataAPI, forgotPasswordAPI, resetPasswordAPI } from './services/apiService';
import DashboardNew from './components/DashboardNew';
import SmsImportModal from './components/SmsImportModal';
import ExpenseList from './components/ExpenseList';
import Advisor from './components/Advisor';
import Reports from './components/Reports';
import AddExpenseModal from './components/AddExpenseModal';
import SpaceBackground from './components/SpaceBackground';
import SetupWizard from './components/SetupWizard';
import Features from './components/Features';
import NotificationCenter from './components/NotificationCenter';
import ProfileModal from './components/ProfileModal';
import { LayoutDashboard, Receipt, Sparkles, Plus, Wallet, LogOut, ArrowRight, Lock, User, ShieldCheck, Smartphone, Mail, Key, BarChart2, Bell } from 'lucide-react';
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

  // --- Screens ---

  if (screen === 'landing') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col relative overflow-hidden font-sans selection:bg-indigo-500/30">
        
        <SpaceBackground />

        {/* Top Navigation */}
        <nav className="relative z-20 w-full p-6 md:p-8 flex justify-between items-center animate-fade-in">
             <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    <Wallet className="w-5 h-5 md:w-6 md:h-6 text-indigo-400" />
                </div>
                <span className="text-xl md:text-2xl font-bold tracking-tight text-white">SpendSmart</span>
             </div>
        </nav>

        {/* Redesigned Hero */}
        <div className="relative z-10 w-full flex-1 px-4 -mt-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-12">
            {/* Left - copy & CTAs */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-white to-cyan-300 leading-tight">
                SpendSmart — Track. Analyze. Improve.
              </h1>
              <p className="text-lg text-zinc-300 max-w-xl mb-6">
                A modern personal finance dashboard that helps you understand where your money goes — with intelligent categorization, effortless receipt capture, and actionable insights.
              </p>

              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <button onClick={() => setScreen('signup')} className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition-transform">
                  Get Started — it's free
                </button>
                <button onClick={() => setScreen('login')} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-black/40 border border-white/10 text-zinc-200 hover:text-white">
                  Sign in
                </button>
              </div>

              <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-sm text-zinc-300">Avg. Saving</div>
                  <div className="text-xl font-bold text-white">Connect bank</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-sm text-zinc-300">Monthly Tx</div>
                  <div className="text-xl font-bold text-white">—</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-sm text-zinc-300">Top Category</div>
                  <div className="text-xl font-bold text-white">Connect to see</div>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center transform hover:-translate-y-1 transition-transform">
                  <div className="text-sm text-zinc-300">Budget Health</div>
                  <div className="text-xl font-bold text-white">—</div>
                </div>
              </div>
            </div>

            {/* Right - preview card (demo / animated sparkline) */}
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-white/6 to-white/3 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-lg hover:scale-[1.01] transition-transform">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-zinc-300">Total Balance (demo)</div>
                    <div className="text-2xl font-bold text-white">₹—</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-300">Status</div>
                    <div className="text-sm font-medium text-emerald-300">Connect account</div>
                  </div>
                </div>

                {/* Simple inline sparkline preview */}
                <div className="h-40 rounded-xl p-3 bg-gradient-to-b from-indigo-800 to-purple-800 flex items-center justify-center">
                  <svg viewBox="0 0 200 60" className="w-full h-full">
                    <defs>
                      <linearGradient id="g1" x1="0" x2="1">
                        <stop offset="0%" stopColor="#60a5fa" />
                        <stop offset="100%" stopColor="#a78bfa" />
                      </linearGradient>
                    </defs>
                    <polyline fill="none" stroke="url(#g1)" strokeWidth="3" points="0,40 25,35 50,28 75,20 100,24 125,18 150,22 175,17 200,14" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
                    <g fill="#fff">
                      <circle cx="0" cy="40" r="2.5" opacity="0.95"></circle>
                      <circle cx="50" cy="28" r="3" opacity="0.95"></circle>
                      <circle cx="100" cy="24" r="3" opacity="0.95"></circle>
                      <circle cx="150" cy="22" r="3" opacity="0.95"></circle>
                      <circle cx="200" cy="14" r="2.5" opacity="0.95"></circle>
                    </g>
                  </svg>
                </div>

                <div className="mt-4 flex gap-3">
                  <button onClick={() => setShowFeatures(true)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-indigo-600 text-white font-semibold shadow hover:scale-[1.02] transition-transform">
                    Explore Features
                  </button>
                  <button onClick={() => setScreen('signup')} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-black/40 border border-white/10 text-zinc-200 hover:text-white">
                    Try Demo
                  </button>
                </div>
                <div className="mt-3 text-xs text-zinc-400">Connect a bank or sign up to see your real data.</div>
              </div>
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

        <div className="relative z-10 w-full max-w-md bg-[#121215]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow animate-fade-in">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.5)] transform rotate-3">
               <User size={28} className="text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight text-white">Welcome Back</h2>
            <p className="text-zinc-400">Sign in to your account</p>
          </div>
          
          <button 
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-6"
          >
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
                <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-black/40 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
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
                    className="w-full bg-black/40 border border-zinc-700 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                    placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-zinc-400">
                <input type="checkbox" checked={rememberMe} onChange={(e) => { setRememberMe(e.target.checked); if (e.target.checked) localStorage.setItem('spendsmart_remember_email', loginEmail); else localStorage.removeItem('spendsmart_remember_email'); }} className="accent-indigo-500" />
                Remember me
              </label>
              <button type="button" onClick={handleForgotPassword} className="text-sm text-indigo-300 hover:underline">Forgot?</button>
            </div>

            {authError && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-xl border border-red-500/20 flex items-center gap-2 animate-fade-in">{authError}</p>}
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] mt-2 text-lg tracking-wide"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <button onClick={() => setScreen('landing')} className="w-full mt-6 text-zinc-500 text-sm hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'signup') {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center p-6 relative font-sans">
        <SpaceBackground />

        <div className="relative z-10 w-full max-w-lg bg-[#121215]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] shadow-2xl card-glow animate-fade-in max-h-[90vh] overflow-y-auto custom-scrollbar">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold mb-3 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Create Account</h2>
            <p className="text-zinc-400 font-light">Join SpendSmart and take control.</p>
          </div>
          
          <button 
            onClick={handleGoogleAuth}
            className="w-full bg-white hover:bg-zinc-200 text-zinc-900 font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3 mb-6"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-zinc-700"></div>
            <span className="flex-shrink mx-4 text-zinc-500 text-xs uppercase tracking-widest font-bold">Or sign up with email</span>
            <div className="flex-grow border-t border-zinc-700"></div>
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
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
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
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
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
                className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-5 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner"
                placeholder="••••••••"
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-zinc-400">Strength: <span className="font-semibold text-white">{passwordStrength(passwordInput).label}</span></div>
                <div className="text-xs text-zinc-500">Min 8 chars, mix letter & number</div>
              </div>
            </div>
            
            {/* Financial Info */}
            <div className="pt-4 border-t border-zinc-800">
                <p className="text-sm font-semibold text-indigo-400 mb-4 uppercase tracking-wider">Financial Setup</p>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-zinc-500 mb-2 ml-1 tracking-widest uppercase">Current Balance (₹)</label>
                    <input
                        type="number"
                        required
                        value={balanceInput}
                        onChange={(e) => setBalanceInput(e.target.value)}
                        className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner font-mono"
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
                        className="w-full bg-black/40 border border-zinc-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all placeholder:text-zinc-600 shadow-inner font-mono"
                        placeholder="0"
                    />
                    </div>
                </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] mt-4 text-lg tracking-wide"
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
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-80 bg-[#121215]/80 backdrop-blur-xl border-r border-white/5 flex-shrink-0 flex flex-col h-auto md:h-screen sticky top-0 z-20 shadow-[5px_0_30px_rgba(0,0,0,0.5)]">
        <div className="p-6 md:p-8 flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl md:text-2xl font-bold tracking-tight block text-white text-glow-sm">SpendSmart</span>
            <span className="text-[10px] md:text-xs text-indigo-400 font-semibold tracking-wider uppercase">AI Expense Tracker</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setShowProfileModal(true)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10">
              <User size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="flex-1 px-4 space-y-3 py-6 overflow-y-auto hidden md:block">
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
          <button 
            onClick={() => setView('reports')}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-medium ${
              view === 'reports' 
              ? 'bg-zinc-800/80 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)] border border-white/5' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30'
            }`}
          >
            <LayoutDashboard size={20} className={view === 'reports' ? 'text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)]' : ''} />
            Reports
          </button>
        </nav>

        {/* Mobile Navigation Bar (Bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-[#121215]/90 backdrop-blur-xl border-t border-zinc-800 p-2 grid grid-cols-4 gap-1 z-50">
           <button onClick={() => setView('dashboard')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'dashboard' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium mt-1">Home</span>
           </button>
           <button onClick={() => setView('expenses')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'expenses' ? 'text-indigo-400 bg-indigo-500/10' : 'text-zinc-500'}`}>
              <Receipt size={20} />
              <span className="text-[10px] font-medium mt-1">Expenses</span>
           </button>
           <button onClick={() => setView('advisor')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'advisor' ? 'text-purple-400 bg-purple-500/10' : 'text-zinc-500'}`}>
              <Sparkles size={20} />
              <span className="text-[10px] font-medium mt-1">AI</span>
           </button>
           <button onClick={() => setView('reports')} className={`flex flex-col items-center justify-center p-2 rounded-xl ${view === 'reports' ? 'text-sky-400 bg-sky-500/10' : 'text-zinc-500'}`}>
              <BarChart2 size={20} />
              <span className="text-[10px] font-medium mt-1">Reports</span>
           </button>
           <button onClick={() => setIsModalOpen(true)} className="flex flex-col items-center justify-center p-2 rounded-xl text-white bg-indigo-600 shadow-lg">
              <Plus size={20} />
              <span className="text-[10px] font-medium mt-1">Add</span>
           </button>
        </div>

        <div className="p-6 border-t border-zinc-800 space-y-4 hidden md:block bg-black/20">
           <button 
             onClick={() => setIsModalOpen(true)}
             className="w-full bg-white hover:bg-indigo-50 text-black font-bold py-4 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all flex items-center justify-center gap-2 transform hover:-translate-y-1"
           >
             <Plus size={20} />
             Add Transaction
           </button>
           <button 
             onClick={() => setIsSmsModalOpen(true)}
             className="w-full mt-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-2xl transition-all flex items-center justify-center gap-2"
           >
             Import SMS
           </button>
           <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-zinc-500 hover:text-red-400 py-2 text-sm transition-colors font-medium tracking-wide"
           >
             <LogOut size={16} /> LOGOUT
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-80px)] md:h-screen overflow-y-auto bg-[#09090b] p-4 md:p-8 lg:p-12 relative custom-scrollbar pb-20 md:pb-10">
        
        {/* Header - Only Show on Desktop (Mobile uses internal headers) */}
        <div className="hidden md:flex justify-between items-end mb-10 animate-fade-in">
           <div>
               <h1 className="text-4xl font-bold text-white mb-2 tracking-tight text-glow-sm">
                 {view === 'dashboard' && 'Dashboard Overview'}
                 {view === 'expenses' && 'Manage Expenses'}
                 {view === 'advisor' && 'Financial Assistant'}
                 {view === 'reports' && 'Spending Reports'}
               </h1>
               <p className="text-zinc-400 text-lg font-light">
                 {view === 'dashboard' && `Welcome back, ${user?.name}`}
                 {view === 'expenses' && 'Detailed breakdown of your transactions.'}
                 {view === 'advisor' && 'AI-powered financial insights.'}
                 {view === 'reports' && 'High-level summaries and exportable statements.'}
               </p>
           </div>
           <div className="flex items-center gap-4">
              <button onClick={() => setShowFeatures(true)} className="p-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all" title="View Features">
                <Sparkles size={20} />
              </button>
              <button onClick={() => setShowNotifications(true)} className="p-2.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition-all relative" title="Notifications">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button onClick={() => setShowProfileModal(true)} className="p-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all" title="Profile">
                <User size={20} />
              </button>
              <div className="text-right">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Current Date</p>
                <p className="font-mono text-indigo-300 text-lg">
                  {new Date().toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                </p>
              </div>
           </div>
        </div>

        {/* Mobile Header for Logout */}
        <div className="md:hidden flex justify-between items-center mb-6">
           <span className="text-lg font-bold text-white">SpendSmart</span>
           <button onClick={handleLogout} className="p-2 bg-zinc-800 rounded-full text-zinc-400">
               <LogOut size={16} />
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
          )}
          {view === 'expenses' && <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />}
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

      <NotificationCenter isOpen={showNotifications} onClose={() => setShowNotifications(false)} />

      <Features isOpen={showFeatures} onClose={() => setShowFeatures(false)} expenses={expenses} />

    </div>
  );
};

export default App;
