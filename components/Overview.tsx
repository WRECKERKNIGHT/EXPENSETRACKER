
import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Expense, UserPreferences, WidgetKey } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart as PieChartIcon, Activity, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare, SlidersHorizontal, X, Gauge, DollarSign } from 'lucide-react';
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

const COLORS_CATEGORY = ['#3fae6e', '#d4af37', '#3f7d9e', '#b3492f', '#6f8f5e', '#8a6f4d', '#2f8f9e', '#7a5ea8', '#64748b'];
const COLORS_HEALTH = ['#3fae6e', '#e07a5f'];

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

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
        { opacity: 0, y: 50, scale: 0.97 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.8,
          delay: i * 0.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 92%', toggleActions: 'play none none none' }
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
    <div ref={containerRef} className="space-y-8 animate-fade-in font-sans">
      
      {/* Mobile Welcome Header */}
      <div className="md:hidden mb-6 card-3d gold-shimmer p-6 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
         <div className="relative z-10">
            <h2 className="heading-serif text-3xl font-bold mb-1">Hi, {userName || 'User'}</h2>
            <p className="text-gold text-base font-semibold">Your finances are looking sharp today.</p>
         </div>
         <div className="absolute top-0 right-0 w-40 h-40 bg-gold/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
         <div className="absolute -bottom-4 -right-4 text-gold/5 pointer-events-none select-none">
           <DollarSign size={100} strokeWidth={1} />
         </div>
      </div>

      {/* One-time customize prompt for returning users */}
      {showCustomizePrompt && !preferences && (
        <div className="relative overflow-hidden card-3d gold-shimmer p-6 md:p-8 scroll-reveal">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-deep via-gold to-brand" />
          <button
            onClick={onDismissCustomize}
            className="absolute top-4 right-4 p-1.5 rounded-full text-faint hover:text-app hover:bg-surface-3 transition-colors"
            aria-label="Dismiss"
          >
            <X size={18} />
          </button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="p-3 bg-gold/15 rounded-2xl text-gold border border-gold/30 shrink-0 animate-pulse-gold">
              <Sparkles size={28} />
            </div>
            <div className="flex-1">
              <h3 className="heading-serif text-2xl font-bold mb-1">Make this dashboard yours</h3>
              <p className="text-base text-soft">
                Answer 6 quick questions to get a personalized savings goal, daily spending allowance, runway, and streaks.
              </p>
            </div>
            <button
              onClick={onCustomize}
              className="shrink-0 flex items-center gap-2 btn-premium text-base"
            >
              <SlidersHorizontal size={18} /> Personalize
            </button>
          </div>
        </div>
      )}

      {/* Budget alerts */}
      <AlertStrip expenses={expenses} currency={currency} />

      {/* Spending insights */}
      <SpendingInsightsCard expenses={expenses} monthlyIncome={monthlyIncome} currency={currency} />

      {/* Personalized widgets */}
      {preferences && widgetOrder.length > 0 && (
        <div className="scroll-reveal">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold/15 rounded-xl text-gold border border-gold/30">
                <Sparkles size={20} />
              </div>
              <h3 className="heading-serif text-2xl md:text-3xl font-bold tracking-tight">Your Plan</h3>
            </div>
            <button
              onClick={onCustomize}
              className="flex items-center gap-1.5 text-sm font-bold text-faint hover:text-app bg-surface-2 border border-app hover:border-gold-soft px-4 py-2.5 rounded-full transition-all"
            >
              <SlidersHorizontal size={14} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5 md:gap-6">
            {widgetOrder.map(key => (
              <div key={key} className="scroll-reveal">{renderWidget(key)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Top Row: Quick Actions & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6 scroll-reveal">
        
        {/* Actions Column */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-row md:flex-col gap-3">
             {/* Quick Add Button Card */}
            <div 
              onClick={onAddTx}
              className="flex-1 hover-3d cursor-pointer group"
            >
              <div className="bg-gradient-to-br from-brand-deep to-brand p-[2px] rounded-2xl md:rounded-2xl shadow-card-soft group-hover:shadow-brand-glow transition-all duration-300">
                <div className="bg-surface h-full w-full rounded-[14px] md:rounded-[14px] flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start p-3 md:p-4 border border-transparent group-hover:border-gold-soft transition-colors gap-2 md:gap-3">
                  <div className="bg-gradient-to-br from-brand-deep to-brand text-white p-2.5 rounded-full shadow-card-soft">
                    <Plus size={20} strokeWidth={3} />
                  </div>
                  <div className="text-center md:text-left">
                      <h3 className="font-bold text-sm md:text-base leading-tight">Quick Add</h3>
                      <p className="hidden md:block text-faint text-xs uppercase tracking-wide">Transaction</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Manage Expenses Button Card */}
            <div 
              onClick={onManageExpenses}
              className="flex-1 hover-3d cursor-pointer group"
            >
              <div className="bg-surface-3 p-[2px] rounded-2xl md:rounded-2xl shadow-card-soft border border-app group-hover:border-gold-soft transition-all duration-300">
                <div className="bg-surface h-full w-full rounded-[14px] md:rounded-[14px] flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start p-3 md:p-4 border border-transparent group-hover:border-gold-soft transition-colors gap-2 md:gap-3">
                  <div className="bg-surface-3 text-app p-2.5 rounded-full border border-app">
                    <ListChecks size={20} strokeWidth={2} />
                  </div>
                  <div className="text-center md:text-left">
                      <h3 className="font-bold text-sm md:text-base leading-tight">Manage</h3>
                      <p className="hidden md:block text-faint text-xs uppercase tracking-wide">Expenses</p>
                  </div>
                </div>
              </div>
            </div>
        </div>

        {/* Mobile Quick Add floating button */}
        <QuickAdd onQuickAdd={() => setShowQuickInline(true)} />

        {showQuickInline && (
          <QuickAddInline
            onCreated={(expense) => {
              onImportComplete && onImportComplete();
              setShowQuickInline(false);
            }}
            onClose={() => setShowQuickInline(false)}
          />
        )}

        {/* Balance Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 card-3d dollar-watermark p-6 flex flex-col justify-between min-h-[180px]">
           <div className="absolute top-0 right-0 w-48 h-48 bg-brand/8 rounded-full blur-3xl -mr-12 -mt-12"></div>
           <div className="flex items-center justify-between mb-5 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-brand/15 rounded-xl text-brand border border-brand/20 shadow-brand-glow">
                    <Wallet size={22} />
                </div>
                <span className="text-faint font-bold text-sm uppercase tracking-wider">Balance</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleConnectBank}
                  disabled={isBankConnecting || isBankConnected}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isBankConnected 
                      ? 'bg-brand/15 text-brand border-brand/30' 
                      : 'bg-surface-2 text-soft border-app hover:bg-surface-3'
                  }`}
                >
                    {isBankConnecting ? <Loader2 size={12} className="animate-spin" /> : isBankConnected ? <CheckCircle2 size={12} /> : <LinkIcon size={12} />}
                    {isBankConnecting ? 'Syncing...' : isBankConnected ? 'Bank Connected' : 'Connect Bank'}
                </button>

                <button onClick={() => setShowSmsModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-2 text-soft border border-app hover:bg-surface-3">
                  <MessageSquare size={14} /> Import SMS
                </button>

                <button onClick={handleFilePick} disabled={isUploadingCsv} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-surface-2 text-soft border border-app hover:bg-surface-3 disabled:opacity-50">
                  {isUploadingCsv ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Import CSV
                </button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

              </div>
           </div>
           <div className="relative z-10">
               <p className="text-4xl md:text-5xl font-bold mb-1 text-glow-success font-display">{formatCurrency(calculations.balance, currency)}</p>
               <p className="text-sm text-faint font-medium">Available Funds on Hand</p>
           </div>
        </div>

        {/* Expense Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 card-3d p-6 flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-36 h-36 bg-danger/8 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="p-3 bg-danger/15 rounded-xl text-danger border border-danger/20">
                <TrendingDown size={22} />
              </div>
              <span className="text-faint font-bold text-sm uppercase tracking-wider">Spent</span>
           </div>
           <div className="relative z-10">
               <p className="text-3xl md:text-4xl font-bold mb-1 text-glow-danger font-display">{formatCurrency(calculations.totalExpense, currency)}</p>
               <p className="text-sm text-faint font-medium">Total Outflow</p>
           </div>
        </div>

        {/* Income (Salary) Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 card-3d p-6 flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-36 h-36 bg-gold/8 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-3 mb-5 relative z-10">
              <div className="p-3 bg-gold/15 rounded-xl text-gold border border-gold/20 shadow-gold-glow">
                <TrendingUp size={22} />
              </div>
              <span className="text-faint font-bold text-sm uppercase tracking-wider">Salary</span>
           </div>
           <div className="relative z-10">
               <p className="text-3xl md:text-4xl font-bold mb-1 text-glow-gold font-display">{formatCurrency(monthlyIncome, currency)}</p>
               <p className="text-sm text-faint font-medium">Registered Income</p>
           </div>
        </div>
      </div>

      {/* CSV Import Feedback */}
      {csvMessage && (
        <div className={`p-4 rounded-2xl text-sm font-bold border mb-6 animate-fade-in ${
          csvMessage.type === 'success' 
            ? 'bg-brand/10 text-brand border-brand/30' 
            : 'bg-danger/10 text-danger border-danger/30'
        }`}>
          {csvMessage.text}
        </div>
      )}

      {/* Spending Velocity */}
      <div className="card-3d gold-shimmer p-6 md:p-8 scroll-reveal">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gold/15 rounded-xl text-gold border border-gold/30">
            <Gauge size={20} />
          </div>
          <h3 className="heading-serif text-xl md:text-2xl font-bold tracking-tight">Spending Velocity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface-2 border border-app rounded-2xl p-5 space-y-2 hover-3d">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Daily Burn Rate</span>
            <p className="text-2xl font-bold font-mono text-gold font-display">{formatCurrency(spendingVelocity.dailyBurn, currency)}</p>
            <p className="text-xs text-faint">per day average</p>
          </div>
          <div className="bg-surface-2 border border-app rounded-2xl p-5 space-y-2 hover-3d">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Projected Month-End</span>
            <p className={`text-2xl font-bold font-mono font-display ${spendingVelocity.burnPct > 100 ? 'text-danger' : spendingVelocity.burnPct > 80 ? 'text-gold' : 'text-brand-ink'}`}>
              {formatCurrency(spendingVelocity.projectedMonthEnd, currency)}
            </p>
            <div className="w-full bg-app-soft rounded-full h-2 overflow-hidden mt-2">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(spendingVelocity.burnPct, 100)}%`,
                  backgroundColor: spendingVelocity.burnPct > 100 ? 'var(--danger)' : spendingVelocity.burnPct > 80 ? 'var(--gold)' : 'var(--brand)',
                }}
              />
            </div>
            <p className="text-xs text-faint">{spendingVelocity.burnPct.toFixed(0)}% of {formatCurrency(monthlyIncome, currency)}</p>
          </div>
          <div className="bg-surface-2 border border-app rounded-2xl p-5 space-y-2 hover-3d">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Remaining Daily Budget</span>
            <p className={`text-2xl font-bold font-mono font-display ${spendingVelocity.dailyAllowance > 0 ? 'text-brand-ink' : 'text-danger'}`}>
              {formatCurrency(Math.max(0, spendingVelocity.dailyAllowance), currency)}
            </p>
            <p className="text-xs text-faint">for rest of month</p>
          </div>
        </div>
      </div>

      {/* Row 2: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 scroll-reveal">
        
        {/* Chart 1: Saved vs Spent */}
        <div className="card-3d gold-line-top p-6 md:p-8 relative overflow-hidden min-h-[380px]">
           <h3 className="heading-serif text-2xl font-bold mb-6 flex items-center gap-3">
             <div className="p-2 bg-brand/15 rounded-lg text-brand border border-brand/20">
               <Activity size={20} />
             </div>
             Financial Health
           </h3>
           <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_HEALTH[index]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold-soft)', borderRadius: '16px', color: 'var(--text)', fontFamily: 'Inter', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                    itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                    formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-soft font-medium ml-2">{value}</span>}
                  />
                </PieChart>
             </ResponsiveContainer>
             
             {/* Center Label */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 text-center pointer-events-none">
                <p className="text-xs text-faint uppercase font-bold">Total</p>
                <p className="font-bold text-xl font-display">100%</p>
             </div>
           </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="card-3d gold-line-top p-6 md:p-8 relative overflow-hidden min-h-[380px]">
           <h3 className="heading-serif text-2xl font-bold mb-6 flex items-center gap-3">
             <div className="p-2 bg-gold/15 rounded-lg text-gold border border-gold/20">
               <PieChartIcon size={20} />
             </div>
             Spending Categories
           </h3>
           <div className="flex flex-col md:flex-row items-center h-64">
             <div className="h-full w-full md:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={5}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold-soft)', borderRadius: '16px', color: 'var(--text)', fontFamily: 'Inter', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                      itemStyle={{ color: 'var(--text)', fontWeight: 600 }}
                      formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-full md:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
               <div className="space-y-3">
                 {categoryData.length === 0 && <p className="text-faint text-sm text-center mt-10">No expenses yet.</p>}
                 {categoryData.map((entry, index) => (
                   <div key={entry.name} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-2 transition-colors group">
                     <div className="flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS_CATEGORY[index % COLORS_CATEGORY.length] }}></span>
                       <span className="text-sm font-medium text-soft group-hover:text-app">{entry.name}</span>
                     </div>
                     <span className="text-sm font-bold text-faint group-hover:text-app font-mono">{formatCurrency(entry.value, currency)}</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Row 3: Budgets + Recurring + Cash Flow */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6 scroll-reveal">
        <div className="space-y-5 2xl:col-span-1">
          <BudgetsCard expenses={expenses} currency={currency} />
          <RecurringCard expenses={expenses} currency={currency} />
        </div>
        <div className="2xl:col-span-2 card-3d gold-line-top p-6 md:p-8 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-48 h-48 opacity-[0.04] pointer-events-none" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 relative z-10">
            <h3 className="heading-serif text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-brand/15 rounded-lg text-brand border border-brand/20">
                <TrendingUp size={20} />
              </div>
              Cash Flow Trends
            </h3>
            <div className="flex gap-5 text-sm font-medium">
               <div className="flex items-center gap-2 text-brand"><span className="w-2.5 h-2.5 rounded-full bg-brand"></span> Income</div>
               <div className="flex items-center gap-2 text-danger"><span className="w-2.5 h-2.5 rounded-full bg-danger"></span> Expenses</div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3fae6e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3fae6e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e07a5f" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e07a5f" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" vertical={false} opacity={0.6} />
                <XAxis dataKey="name" stroke="var(--text-faint)" fontSize={12} tickLine={false} axisLine={false} dy={10} fontFamily="Inter" fontWeight={500} />
                <YAxis stroke="var(--text-faint)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="Inter" fontWeight={500} />
                <RechartsTooltip
                  cursor={{ stroke: 'var(--gold-soft)', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold-soft)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', color: 'var(--text)', fontFamily: 'Inter' }}
                  itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="Income" stroke="#3fae6e" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 7, strokeWidth: 0, fill: '#fff' }} />
                <Area type="monotone" dataKey="Expense" stroke="#e07a5f" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 7, strokeWidth: 0, fill: '#fff' }} />
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
