
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Expense, UserPreferences, WidgetKey } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart as PieChartIcon, Activity, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare, SlidersHorizontal, X, Gauge, DollarSign, Landmark, Shield, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import QuickAdd from './QuickAdd';
import QuickAddInline from './QuickAddInline';
import { connectBankAPI, getBankConnectionsAPI, uploadBankCSVAPI } from '../services/apiService';
import SmsImportModal from './SmsImportModal';
import BudgetsCard from './BudgetsCard';
import RecurringCard from './RecurringCard';
import GoalCard from './GoalCard';
import DailyAllowanceCard from './DailyAllowanceCard';
import RunwayCard from './RunwayCard';
import StreakCard from './StreakCard';
import AlertStrip from './AlertStrip';
import SpendingInsightsCard from './SpendingInsightsCard';

declare global {
  interface Window { gsap: any; ScrollTrigger: any; }
}

interface OverviewProps {
  expenses: Expense[];
  monthlyIncome: number;
  currency: string;
  onAddTx: () => void;
  onManageExpenses: () => void;
  userName?: string;
  onImportComplete?: () => void;
  preferences?: UserPreferences | null;
  showCustomizePrompt?: boolean;
  onCustomize?: () => void;
  onDismissCustomize?: () => void;
}

const COLORS_CATEGORY = ['#d4af37', '#c5a028', '#3fae6e', '#b3492f', '#6f8f5e', '#8a6f4d', '#2f8f9e', '#7a5ea8', '#64748b'];
const COLORS_HEALTH = ['#d4af37', '#3fae6e'];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/* ─── Floating Dollar Background ─── */
const FloatingDollars: React.FC = () => (
  <div className="floating-dollars">
    <span>$</span><span>$</span><span>$</span><span>$</span><span>$</span>
  </div>
);

/* ─── Gold Coin SVG for hero ─── */
const GoldCoin: React.FC<{ size?: number; className?: string }> = ({ size = 80, className = '' }) => (
  <div className={`preserve-3d ${className}`} style={{ width: size, height: size }}>
    <div className="w-full h-full rounded-full" style={{
      background: 'radial-gradient(circle at 35% 30%, #f3e29a, #d4af37 40%, #b8960b 65%, #8a6510 100%)',
      boxShadow: '0 8px 32px rgba(212,175,55,0.5), inset 0 2px 6px rgba(255,255,255,0.5), inset 0 -4px 8px rgba(0,0,0,0.3), 0 0 0 3px rgba(212,175,55,0.3)',
    }}>
      <div className="w-full h-full rounded-full flex items-center justify-center border-2 border-[#8a6510]/40" style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
      }}>
        <span className="font-display font-black text-[#5d4306]" style={{ fontSize: size * 0.4 }}>$</span>
      </div>
    </div>
  </div>
);

const Overview: React.FC<OverviewProps> = ({ expenses, monthlyIncome, currency, onAddTx, onManageExpenses, userName, onImportComplete, preferences, showCustomizePrompt, onCustomize, onDismissCustomize }) => {
  const [isBankConnecting, setIsBankConnecting] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showQuickInline, setShowQuickInline] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);
    const cards = containerRef.current.querySelectorAll('.scroll-reveal');
    cards.forEach((card, i) => {
      window.gsap.fromTo(card,
        { opacity: 0, y: 60, scale: 0.95, rotateX: 4 },
        {
          opacity: 1, y: 0, scale: 1, rotateX: 0,
          duration: 1,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none none' }
        }
      );
    });
    return () => { window.ScrollTrigger.getAll().forEach((t: any) => t.kill()); };
  }, [expenses, preferences]);

  const widgetOrder: WidgetKey[] = useMemo(() => {
    const preferred = preferences ? preferences.widgets : ['goal', 'allowance', 'runway', 'streak'];
    return preferred.filter((w): w is WidgetKey => ['goal', 'allowance', 'runway', 'streak'].includes(w));
  }, [preferences]);

  const renderWidget = (key: WidgetKey) => {
    switch (key) {
      case 'goal':
        return preferences ? <GoalCard expenses={expenses} prefs={preferences} currency={currency} /> : null;
      case 'allowance':
        return preferences ? <DailyAllowanceCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} currency={currency} /> : null;
      case 'runway':
        return preferences ? <RunwayCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} currency={currency} /> : null;
      case 'streak':
        return preferences ? <StreakCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} /> : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    checkBankConnection();
  }, []);

  const checkBankConnection = async () => {
    try {
      const connections: any = await getBankConnectionsAPI();
      const arr = Array.isArray(connections) ? connections : (connections && (connections.items || connections.connections)) || [];
      setIsBankConnected(Array.isArray(arr) && arr.length > 0);
    } catch (error) {
      console.error('Failed to check bank connections:', error);
    }
  };

  const handleConnectBank = async () => {
    if (isBankConnected) return;
    setIsBankConnecting(true);
    try {
      const bankName = 'HDFC Bank';
      const accountNumber = '****1234';
      await connectBankAPI(bankName, accountNumber);
      setIsBankConnected(true);
      onImportComplete && onImportComplete();
    } catch (error) {
      console.error('Failed to connect bank:', error);
    } finally {
      setIsBankConnecting(false);
    }
  };

  const handleFilePick = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    
    setIsUploadingCsv(true);
    setCsvMessage(null);
    
    try {
      const text = await f.text();
      const result: any = await uploadBankCSVAPI('', text);
      
      if (result.imported && result.imported > 0) {
        setCsvMessage({ type: 'success', text: `✓ Imported ${result.imported} transaction(s)` });
        onImportComplete && onImportComplete();
      } else {
        setCsvMessage({ type: 'error', text: 'No transactions found in CSV' });
      }
    } catch (err: any) {
      setCsvMessage({ type: 'error', text: err.message || 'Failed to upload CSV' });
    } finally {
      setIsUploadingCsv(false);
      if (fileRef.current) fileRef.current.value = '';
      setTimeout(() => setCsvMessage(null), 3000);
    }
  };

  const calculations = useMemo(() => {
    const totalIncomeTx = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncomeTx - totalExpense;
    return { totalIncomeTx, totalExpense, balance };
  }, [expenses]);
  
  const healthData = useMemo(() => {
    return [
      { name: 'Available Balance', value: Math.max(0, calculations.balance) },
      { name: 'Total Spent', value: calculations.totalExpense }
    ];
  }, [calculations]);

  const spendingVelocity = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const monthExpenses = expenses
      .filter(e => e.type === 'expense' && new Date(e.date) >= monthStart && new Date(e.date) <= now)
      .reduce((acc, e) => acc + e.amount, 0);

    const dailyBurn = dayOfMonth > 0 ? monthExpenses / dayOfMonth : 0;
    const projectedMonthEnd = dailyBurn * totalDaysInMonth;
    const burnPct = monthlyIncome > 0 ? (projectedMonthEnd / monthlyIncome) * 100 : 0;

    const remainingDays = totalDaysInMonth - dayOfMonth;
    const remainingBudget = monthlyIncome - monthExpenses;
    const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0;

    return { dailyBurn, projectedMonthEnd, burnPct, remainingBudget, dailyAllowance };
  }, [expenses, monthlyIncome]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.filter(e => e.type === 'expense').forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number, expense: number }>();
    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(e => {
      const month = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!map.has(month)) map.set(month, { income: 0, expense: 0 });
      
      const current = map.get(month)!;
      if (e.type === 'income') current.income += e.amount;
      else current.expense += e.amount;
    });

    return Array.from(map.entries()).slice(-7).map(([name, val]) => ({
      name,
      Income: val.income,
      Expense: val.expense
    }));
  }, [expenses]);

  return (
    <div ref={containerRef} className="space-y-8 animate-fade-in font-sans relative">
      
      {/* ━━━ FLOATING DOLLAR BACKGROUND ━━━ */}
      <FloatingDollars />

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          VAULT HERO BANNER
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="vault-hero gold-shimmer p-8 md:p-10 scroll-reveal">
        <img src="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.07] mix-blend-luminosity" loading="lazy" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="gold-ring-pulse rounded-full p-1">
            <GoldCoin size={72} />
          </div>
          <div className="flex-1">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.3em] mb-2">Vault Overview</p>
            <h1 className="heading-serif text-3xl md:text-5xl font-black text-app leading-tight mb-2 text-glow-gold">
              Welcome back, <span className="text-gold">{userName || 'Investor'}</span>
            </h1>
            <p className="text-soft text-base md:text-lg">Your portfolio is performing. Here's your financial command center.</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-xs text-faint uppercase tracking-widest font-bold">Net Worth</p>
            <p className={`heading-serif text-4xl md:text-5xl font-black ${calculations.balance >= 0 ? 'text-gold text-glow-gold' : 'text-danger text-glow-danger'}`}>
              {formatCurrency(calculations.balance, currency)}
            </p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/[0.06] rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-brand/[0.04] rounded-full blur-[60px] -ml-10 -mb-10 pointer-events-none" />
      </div>

      {/* ━━━ QUICK ACTIONS BAR ━━━ */}
      <div className="flex flex-col sm:flex-row gap-4 scroll-reveal">
        <button onClick={onAddTx} className="flex-1 btn-premium flex items-center justify-center gap-3 text-base py-5 rounded-2xl">
          <div className="bg-black/20 p-2 rounded-xl"><Plus size={20} strokeWidth={3} /></div>
          <span>Quick Add Transaction</span>
        </button>
        <button onClick={onManageExpenses} className="flex-1 card-3d flex items-center justify-center gap-3 text-base py-5 rounded-2xl font-bold text-app hover:text-gold cursor-pointer transition-all">
          <div className="p-2 bg-gold/15 rounded-xl text-gold border border-gold/30"><ListChecks size={20} /></div>
          <span>Manage Expenses</span>
        </button>
      </div>

      {/* ━━━ IMPORT BAR ━━━ */}
      <div className="card-3d p-4 flex flex-wrap items-center gap-3 scroll-reveal metallic-sheen">
        <Landmark size={18} className="text-gold" />
        <span className="text-sm font-bold text-faint uppercase tracking-wider">Data Import</span>
        <div className="flex-1" />
        <button onClick={handleConnectBank} disabled={isBankConnecting || isBankConnected}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border-2 ${
            isBankConnected ? 'bg-gold/15 text-gold border-gold/40 gold-ring-pulse' : 'bg-surface-2 text-soft border-gold/20 hover:border-gold/50 hover:bg-gold/5'
          }`}>
          {isBankConnecting ? <Loader2 size={13} className="animate-spin" /> : isBankConnected ? <CheckCircle2 size={13} /> : <LinkIcon size={13} />}
          {isBankConnecting ? 'Syncing...' : isBankConnected ? 'Bank Connected' : 'Connect Bank'}
        </button>
        <button onClick={() => setShowSmsModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-2 text-soft border-2 border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all">
          <MessageSquare size={13} /> Import SMS
        </button>
        <button onClick={handleFilePick} disabled={isUploadingCsv} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-surface-2 text-soft border-2 border-gold/20 hover:border-gold/50 hover:bg-gold/5 transition-all disabled:opacity-50">
          {isUploadingCsv ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />} CSV Upload
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* ━━━ CUSTOMIZE PROMPT ━━━ */}
      {showCustomizePrompt && !preferences && (
        <div className="relative overflow-hidden card-3d gold-shimmer p-6 md:p-8 scroll-reveal border-gold/40">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-gold via-gold-soft to-gold" style={{ boxShadow: '0 0 20px rgba(212,175,55,0.5)' }} />
          <button onClick={onDismissCustomize} className="absolute top-4 right-4 p-1.5 rounded-full text-faint hover:text-app hover:bg-surface-3 transition-colors z-10" aria-label="Dismiss">
            <X size={18} />
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5 relative z-10">
            <div className="p-4 bg-gold/20 rounded-2xl text-gold border-2 border-gold/40 shrink-0 gold-ring-pulse">
              <Sparkles size={32} />
            </div>
            <div className="flex-1">
              <h3 className="heading-serif text-2xl font-black mb-1 text-glow-gold">Personalize Your Vault</h3>
              <p className="text-base text-soft">Answer 6 quick questions to unlock personalized savings goals, daily spending allowance, and financial runway projections.</p>
            </div>
            <button onClick={onCustomize} className="shrink-0 btn-premium flex items-center gap-2 text-base">
              <SlidersHorizontal size={18} /> Personalize
            </button>
          </div>
        </div>
      )}

      {/* ━━━ BUDGET ALERTS ━━━ */}
      <AlertStrip expenses={expenses} currency={currency} />

      {/* ━━━ SPENDING INSIGHTS ━━━ */}
      <SpendingInsightsCard expenses={expenses} monthlyIncome={monthlyIncome} currency={currency} />

      {/* ━━━ PERSONALIZED WIDGETS ━━━ */}
      {preferences && widgetOrder.length > 0 && (
        <div className="scroll-reveal">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gold/20 rounded-2xl text-gold border-2 border-gold/40 gold-ring-pulse">
                <Sparkles size={24} />
              </div>
              <div>
                <h3 className="heading-serif text-2xl md:text-3xl font-black tracking-tight text-glow-gold">Your Financial Plan</h3>
                <p className="text-xs text-faint uppercase tracking-widest font-bold mt-1">Personalized Strategy</p>
              </div>
            </div>
            <button onClick={onCustomize} className="flex items-center gap-2 text-sm font-bold text-gold bg-gold/10 border-2 border-gold/30 hover:border-gold/60 hover:bg-gold/20 px-5 py-2.5 rounded-xl transition-all">
              <SlidersHorizontal size={14} /> Edit Plan
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 md:gap-6">
            {widgetOrder.map(key => (
              <div key={key} className="scroll-reveal">{renderWidget(key)}</div>
            ))}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          KPI CARDS — METALLIC GOLD METERS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="scroll-reveal">
        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-gold/20 rounded-xl text-gold border border-gold/30"><Gauge size={20} /></div>
          <h3 className="heading-serif text-2xl font-black tracking-tight">Financial Dashboard</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Balance KPI */}
          <div className="kpi-card gold-shimmer group">
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-3 bg-gold/20 rounded-xl text-gold border border-gold/40 shadow-gold-glow">
                <Wallet size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">Balance</span>
            </div>
            <p className="heading-serif text-4xl md:text-5xl font-black mb-2 text-glow-gold relative z-10 text-gold">
              {formatCurrency(calculations.balance, currency)}
            </p>
            <p className="text-sm text-faint font-medium relative z-10">Available Funds</p>
            <div className="mt-4 gold-ingot-bar relative z-10">
              <div style={{ width: `${monthlyIncome > 0 ? Math.min((calculations.balance / monthlyIncome) * 100, 100) : 0}%` }} />
            </div>
            <div className="flex justify-between mt-2 relative z-10">
              <span className="text-[10px] text-faint font-bold uppercase tracking-wider">0</span>
              <span className="text-[10px] text-faint font-bold uppercase tracking-wider">{formatCurrency(monthlyIncome, currency)}</span>
            </div>
          </div>

          {/* Spent KPI */}
          <div className="kpi-card gold-shimmer group">
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-3 bg-red-500/15 rounded-xl text-red-400 border border-red-500/30">
                <TrendingDown size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-red-400">Spent</span>
            </div>
            <p className="heading-serif text-4xl md:text-5xl font-black mb-2 text-glow-danger relative z-10 text-red-400">
              {formatCurrency(calculations.totalExpense, currency)}
            </p>
            <p className="text-sm text-faint font-medium relative z-10">Total Outflow</p>
            <div className="mt-4 gold-ingot-bar relative z-10">
              <div style={{
                width: `${monthlyIncome > 0 ? Math.min((calculations.totalExpense / monthlyIncome) * 100, 100) : 0}%`,
                background: 'linear-gradient(180deg, #f5a0a0 0%, #e74c3c 40%, #c0392b 70%, #962d22 100%)',
              }} />
            </div>
            <div className="flex justify-between mt-2 relative z-10">
              <span className="text-[10px] text-faint font-bold uppercase tracking-wider">0</span>
              <span className="text-[10px] text-faint font-bold uppercase tracking-wider">{formatCurrency(monthlyIncome, currency)}</span>
            </div>
          </div>

          {/* Income KPI */}
          <div className="kpi-card gold-shimmer group">
            <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-3 bg-brand/15 rounded-xl text-brand border border-brand/30 shadow-brand-glow">
                <TrendingUp size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-brand">Income</span>
            </div>
            <p className="heading-serif text-4xl md:text-5xl font-black mb-2 text-glow-success relative z-10 text-brand">
              {formatCurrency(monthlyIncome, currency)}
            </p>
            <p className="text-sm text-faint font-medium relative z-10">Monthly Salary</p>
            <div className="mt-4 gold-ingot-bar relative z-10">
              <div style={{
                width: '100%',
                background: 'linear-gradient(180deg, #a8e6c3 0%, #2ecc71 40%, #27ae60 70%, #1e8449 100%)',
              }} />
            </div>
            <div className="flex justify-between mt-2 relative z-10">
              <span className="text-[10px] text-faint font-bold uppercase tracking-wider">Target</span>
              <span className="text-[10px] text-brand font-bold uppercase tracking-wider">● Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━ CSV IMPORT FEEDBACK ━━━ */}
      {csvMessage && (
        <div className={`p-5 rounded-2xl text-sm font-bold border-2 mb-6 animate-fade-in flex items-center gap-3 ${
          csvMessage.type === 'success' ? 'bg-gold/10 text-gold border-gold/40' : 'bg-danger/10 text-danger border-danger/40'
        }`}>
          <div className={`p-2 rounded-xl ${csvMessage.type === 'success' ? 'bg-gold/20' : 'bg-danger/20'}`}>
            {csvMessage.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          </div>
          {csvMessage.text}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SPENDING VELOCITY — VAULT METERS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="card-3d gold-line-top p-6 md:p-8 scroll-reveal gold-shimmer">
        <div className="flex items-center gap-3 mb-8 relative z-10">
          <div className="p-3 bg-gold/20 rounded-xl text-gold border-2 border-gold/40 gold-ring-pulse">
            <Gauge size={24} />
          </div>
          <div>
            <h3 className="heading-serif text-2xl font-black tracking-tight">Spending Velocity</h3>
            <p className="text-xs text-faint uppercase tracking-widest font-bold mt-1">Burn Rate Analysis</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
          
          {/* Daily Burn */}
          <div className="vault-section bg-surface-2 rounded-2xl p-6 space-y-3 hover-3d" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-gold" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-gold">Daily Burn Rate</span>
            </div>
            <p className="heading-serif text-3xl font-black text-glow-gold text-gold">{formatCurrency(spendingVelocity.dailyBurn, currency)}</p>
            <p className="text-xs text-faint">per day average</p>
            <div className="gold-ingot-bar">
              <div style={{ width: `${Math.min((spendingVelocity.dailyBurn / (monthlyIncome / 30)) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Projected */}
          <div className="vault-section bg-surface-2 rounded-2xl p-6 space-y-3 hover-3d" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center gap-2">
              <Activity size={16} className={spendingVelocity.burnPct > 100 ? 'text-danger' : spendingVelocity.burnPct > 80 ? 'text-gold' : 'text-brand'} />
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${spendingVelocity.burnPct > 100 ? 'text-danger' : spendingVelocity.burnPct > 80 ? 'text-gold' : 'text-brand'}`}>Projected Month-End</span>
            </div>
            <p className={`heading-serif text-3xl font-black ${spendingVelocity.burnPct > 100 ? 'text-danger text-glow-danger' : spendingVelocity.burnPct > 80 ? 'text-gold text-glow-gold' : 'text-brand text-glow-success'}`}>
              {formatCurrency(spendingVelocity.projectedMonthEnd, currency)}
            </p>
            <p className="text-xs text-faint">estimated total spend</p>
            <div className="gold-ingot-bar">
              <div style={{
                width: `${Math.min(spendingVelocity.burnPct, 100)}%`,
                background: spendingVelocity.burnPct > 100
                  ? 'linear-gradient(180deg, #f5a0a0 0%, #e74c3c 40%, #c0392b 70%, #962d22 100%)'
                  : spendingVelocity.burnPct > 80
                  ? 'linear-gradient(180deg, #f3e29a 0%, #d4af37 40%, #b8960b 70%, #8a6510 100%)'
                  : 'linear-gradient(180deg, #a8e6c3 0%, #2ecc71 40%, #27ae60 70%, #1e8449 100%)',
              }} />
            </div>
            <p className="text-xs text-faint">{spendingVelocity.burnPct.toFixed(0)}% of {formatCurrency(monthlyIncome, currency)}</p>
          </div>

          {/* Remaining */}
          <div className="vault-section bg-surface-2 rounded-2xl p-6 space-y-3 hover-3d" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center gap-2">
              <Shield size={16} className={spendingVelocity.dailyAllowance > 0 ? 'text-brand' : 'text-danger'} />
              <span className={`text-xs font-black uppercase tracking-[0.2em] ${spendingVelocity.dailyAllowance > 0 ? 'text-brand' : 'text-danger'}`}>Daily Budget Left</span>
            </div>
            <p className={`heading-serif text-3xl font-black ${spendingVelocity.dailyAllowance > 0 ? 'text-brand text-glow-success' : 'text-danger text-glow-danger'}`}>
              {formatCurrency(Math.max(0, spendingVelocity.dailyAllowance), currency)}
            </p>
            <p className="text-xs text-faint">for rest of month</p>
            <div className="gold-ingot-bar">
              <div style={{
                width: `${monthlyIncome > 0 ? Math.min((spendingVelocity.dailyAllowance / (monthlyIncome / 30)) * 100, 100) : 0}%`,
                background: spendingVelocity.dailyAllowance > 0
                  ? 'linear-gradient(180deg, #a8e6c3 0%, #2ecc71 40%, #27ae60 70%, #1e8449 100%)'
                  : 'linear-gradient(180deg, #f5a0a0 0%, #e74c3c 40%, #c0392b 70%, #962d22 100%)',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CHARTS ROW
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-reveal">
        
        {/* Health Chart */}
        <div className="card-3d gold-line-top p-6 md:p-8 relative overflow-hidden min-h-[380px]">
          <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=75" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04] mix-blend-luminosity" loading="lazy" />
          <h3 className="heading-serif text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
            <div className="p-3 bg-gold/20 rounded-xl text-gold border-2 border-gold/40">
              <Activity size={22} />
            </div>
            Financial Health
          </h3>
          <div className="h-64 w-full flex items-center justify-center relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={8}>
                  {healthData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS_HEALTH[index]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '16px', color: 'var(--text)', fontFamily: 'Inter', boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)', border: '2px solid var(--gold-soft)' }}
                  itemStyle={{ color: 'var(--text)', fontWeight: 700 }}
                  formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" formatter={(value) => <span className="text-soft font-bold ml-2">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 text-center pointer-events-none">
              <p className="text-[10px] text-gold uppercase font-black tracking-widest">Total</p>
              <p className="font-black text-xl font-display text-glow-gold">100%</p>
            </div>
          </div>
        </div>

        {/* Category Chart */}
        <div className="card-3d gold-line-top p-6 md:p-8 relative overflow-hidden min-h-[380px]">
          <img src="https://images.unsplash.com/photo-1610375461246-83df859d849d?w=600&q=75" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.04] mix-blend-luminosity" loading="lazy" />
          <h3 className="heading-serif text-2xl font-black mb-6 flex items-center gap-3 relative z-10">
            <div className="p-3 bg-gold/20 rounded-xl text-gold border-2 border-gold/40">
              <PieChartIcon size={22} />
            </div>
            Spending Categories
          </h3>
          <div className="flex flex-col md:flex-row items-center h-64 relative z-10">
            <div className="h-full w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '16px', color: 'var(--text)', fontFamily: 'Inter', boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)', border: '2px solid var(--gold-soft)' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 700 }}
                    formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                {categoryData.length === 0 && <p className="text-faint text-sm text-center mt-10">No expenses yet.</p>}
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between p-3 rounded-xl hover:bg-gold/5 border border-transparent hover:border-gold/20 transition-all group cursor-default">
                    <div className="flex items-center gap-3">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/20" style={{ backgroundColor: COLORS_CATEGORY[index % COLORS_CATEGORY.length] }}></span>
                      <span className="text-sm font-bold text-soft group-hover:text-gold transition-colors">{entry.name}</span>
                    </div>
                    <span className="text-sm font-black text-faint group-hover:text-gold font-display transition-colors">{formatCurrency(entry.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BUDGETS + RECURRING + CASH FLOW
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 scroll-reveal">
        <div className="space-y-5 2xl:col-span-1">
          <BudgetsCard expenses={expenses} currency={currency} />
          <RecurringCard expenses={expenses} currency={currency} />
        </div>
        <div className="2xl:col-span-2 card-3d gold-line-top p-6 md:p-8 relative overflow-hidden">
          <img src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=75" alt="" className="absolute inset-0 w-full h-full object-cover opacity-[0.05] mix-blend-luminosity" loading="lazy" />
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-10">
            <h3 className="heading-serif text-2xl font-black flex items-center gap-3">
              <div className="p-3 bg-gold/20 rounded-xl text-gold border-2 border-gold/40">
                <TrendingUp size={22} />
              </div>
              Cash Flow Trends
            </h3>
            <div className="flex gap-6 text-sm font-bold">
               <div className="flex items-center gap-2 text-gold"><span className="w-3 h-3 rounded-full bg-gold shadow-gold-glow"></span> Income</div>
               <div className="flex items-center gap-2 text-danger"><span className="w-3 h-3 rounded-full bg-danger"></span> Expenses</div>
            </div>
          </div>
          <div className="h-72 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncomeGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenseRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--text-faint)" fontSize={12} tickLine={false} axisLine={false} dy={10} fontFamily="Inter" fontWeight={600} />
                <YAxis stroke="var(--text-faint)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="Inter" fontWeight={600} />
                <RechartsTooltip
                  cursor={{ stroke: 'var(--gold)', strokeWidth: 2 }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)', color: 'var(--text)', fontFamily: 'Inter', border: '2px solid var(--gold-soft)' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 700 }}
                />
                <Area type="monotone" dataKey="Income" stroke="#d4af37" strokeWidth={3} fillOpacity={1} fill="url(#colorIncomeGold)" activeDot={{ r: 8, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Expense" stroke="#e74c3c" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenseRed)" activeDot={{ r: 8, fill: '#e74c3c', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SmsImportModal isOpen={showSmsModal} onClose={() => setShowSmsModal(false)} onImported={onImportComplete} />
    </div>
  );
};

export default Overview;
