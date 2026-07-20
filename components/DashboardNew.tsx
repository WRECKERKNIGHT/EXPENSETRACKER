import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Expense } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { TrendingUp, Plus, PieChart as PieChartIcon, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Zap, AlertCircle, BookOpen, Award, Flame, Clock } from 'lucide-react';
import QuickAdd from './QuickAdd';
import { connectBankAPI, getBankConnectionsAPI, uploadBankCSVAPI } from '../services/apiService';
import SmsImportModal from './SmsImportModal';
import ReceiptUploadModal from './ReceiptUploadModal';
import BudgetsCard from './BudgetsCard';
import RecurringCard from './RecurringCard';

interface DashboardNewProps {
  expenses: Expense[];
  monthlyIncome: number;
  currency: string;
  onAddTx: () => void;
  onManageExpenses: () => void;
  userName?: string;
  onImportComplete?: () => void;
}

const COLORS_CATEGORY = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];

const DashboardNew: React.FC<DashboardNewProps> = ({
  expenses,
  monthlyIncome,
  currency,
  onAddTx,
  onManageExpenses,
  userName,
  onImportComplete,
}) => {
  const [isBankConnecting, setIsBankConnecting] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hideBalance, setHideBalance] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const calculations = useMemo(() => {
    const totalIncomeTx = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const balance = totalIncomeTx - totalExpense;
    return { totalIncomeTx, totalExpense, balance };
  }, [expenses]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.filter(e => e.type === 'expense').forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number, expense: number }>();
    const sorted = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(e => {
      const month = new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const savingsRate = calculations.totalIncomeTx > 0 ? ((calculations.balance / calculations.totalIncomeTx) * 100).toFixed(1) : '0';

  const lastExpense = useMemo(() => {
    return expenses.filter(e => e.type === 'expense').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  }, [expenses]);

  const avgDailyExpense = calculations.totalExpense > 0 ? (calculations.totalExpense / 30).toFixed(2) : '0';
  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  // Real transaction counts
  const today = new Date().toISOString().split('T')[0];
  const txToday = expenses.filter(e => e.date === today).length;
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const txThisWeek = expenses.filter(e => e.date >= weekAgo).length;

  return (
    <div className="min-h-screen">
      {/* Subtle background glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Main Balance Card - Glassmorphic + Shimmer */}
        <div className="glass-card p-8 mb-6 shimmer-overlay overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-zinc-500 text-xs font-semibold mb-2 uppercase tracking-wider">Total Balance</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">{hideBalance ? '••••••' : formatCurrency(calculations.balance)}</h2>
                  <button onClick={() => setHideBalance(!hideBalance)} className="neu-btn p-2">
                    {hideBalance ? <EyeOff size={18} className="text-zinc-400" /> : <Eye size={18} className="text-zinc-400" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs font-semibold mb-2 uppercase tracking-wider">Savings Rate</p>
                <p className="text-3xl font-bold text-emerald-400">{savingsRate}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-neu p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft size={14} className="text-emerald-400" />
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Income</p>
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(calculations.totalIncomeTx)}</p>
              </div>
              <div className="glass-neu p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={14} className="text-rose-400" />
                  <p className="text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">Spending</p>
                </div>
                <p className="text-xl font-bold text-white">{formatCurrency(calculations.totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Neumorphic buttons */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { onClick: onAddTx, icon: Plus, label: 'Add', gradient: 'from-indigo-600 to-indigo-700' },
            { onClick: onManageExpenses, icon: ListChecks, label: 'Manage', gradient: 'from-purple-600 to-purple-700' },
            { onClick: handleConnectBank, icon: isBankConnected ? CheckCircle2 : isBankConnecting ? Loader2 : LinkIcon, label: 'Bank', gradient: 'from-emerald-600 to-emerald-700', disabled: isBankConnected, loading: isBankConnecting },
            { onClick: () => setShowSmsModal(true), icon: MessageSquare, label: 'SMS', gradient: 'from-cyan-600 to-cyan-700' },
            { onClick: () => setShowReceiptModal(true), icon: UploadCloud, label: 'Receipt', gradient: 'from-amber-600 to-amber-700' },
          ].map(({ onClick, icon: Icon, label, gradient, disabled, loading }, i) => (
            <button key={i} onClick={onClick} disabled={disabled} className={`group glass-neu p-4 transition-all hover:scale-[1.02] ${disabled ? 'opacity-50' : ''}`}>
              <div className={`flex items-center justify-center gap-2 text-sm font-semibold ${disabled ? 'text-zinc-500' : 'text-white'}`}>
                <Icon size={16} className={loading ? 'animate-spin' : ''} />
                {label}
              </div>
            </button>
          ))}
        </div>

        {/* CSV Upload - Glass card */}
        <div className="glass-neu p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <UploadCloud size={18} className="text-indigo-400" />
            <div>
              <p className="text-white font-medium text-sm">Import Bank Transactions</p>
              <p className="text-zinc-500 text-xs">Upload CSV for bulk import</p>
            </div>
          </div>
          <button onClick={handleFilePick} disabled={isUploadingCsv} className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50">
            {isUploadingCsv ? 'Uploading...' : 'Upload'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          {csvMessage && (
            <p className={`text-xs absolute -bottom-6 left-0 ${csvMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {csvMessage.text}
            </p>
          )}
        </div>

        {/* Key Metrics Row - Neumorphic cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Avg Daily', value: `${currency}${avgDailyExpense}`, icon: TrendingUp, color: 'text-emerald-400', change: expenses.length > 0 ? 'Last 30 days' : 'No data' },
            { label: 'Transactions', value: `${expenses.length}`, icon: Zap, color: 'text-purple-400', change: 'All time' },
            { label: 'Top Category', value: topCategory?.name || 'N/A', icon: Flame, color: 'text-orange-400', change: `${currency}${topCategory?.value || 0}` },
            { label: 'Monthly Income', value: `${currency}${monthlyIncome.toLocaleString()}`, icon: AlertCircle, color: 'text-blue-400', change: 'Target' },
          ].map(({ label, value, icon: Icon, color, change }, i) => (
            <div key={i} className="glass-neu p-4 tilt-card stagger-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div className="text-xl font-bold text-white truncate">{value}</div>
              <div className={`text-[10px] mt-1 ${color} font-medium`}>{change}</div>
            </div>
          ))}
        </div>

        {/* Insights Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {/* Last Transaction */}
          <div className="glass-neu p-4 stagger-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Last Transaction</span>
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
            </div>
            {lastExpense ? (
              <>
                <div className="text-sm font-semibold text-white truncate">{lastExpense.description}</div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-lg font-bold text-white">{currency}{lastExpense.amount}</span>
                  <span className="text-[10px] text-zinc-500">{new Date(lastExpense.date).toLocaleDateString()}</span>
                </div>
              </>
            ) : (
              <div className="text-sm text-zinc-500">No transactions yet</div>
            )}
          </div>

          {/* Budget Status */}
          <div className="glass-neu p-4 stagger-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Budget Status</span>
              <AlertCircle className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="w-full neu-pressed rounded-full h-2 mb-3">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full" style={{ width: '72%' }}></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-white">{currency}18,000</span>
              <span className="text-[10px] text-indigo-400 font-semibold">72% of {currency}25,000</span>
            </div>
          </div>

          {/* Insights */}
          <div className="glass-neu p-4 stagger-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">AI Insights</span>
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <ul className="text-xs space-y-1.5 text-zinc-400">
              <li className="flex items-start gap-2"><span className="text-emerald-400 mt-0.5">•</span> You're saving {savingsRate}% of income</li>
              {topCategory && <li className="flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> Top spending: {topCategory.name} ({currency}{topCategory.value.toLocaleString()})</li>}
              {expenses.length === 0 && <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Add your first transaction to get started</li>}
              {expenses.length > 0 && expenses.length < 10 && <li className="flex items-start gap-2"><span className="text-blue-400 mt-0.5">•</span> Add more transactions for better insights</li>}
            </ul>
          </div>
        </div>

        {/* Achievements & Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <div className="glass-neu p-4 stagger-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Achievements</span>
              <Award className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex flex-wrap gap-2">
              {['7-Day Tracker', 'Budget Master', 'Recurring Pro'].map((a, i) => (
                <div key={i} className="neu-badge px-3 py-1.5 text-[10px] font-semibold text-amber-400 flex items-center gap-1">
                  <span>✓</span> {a}
                </div>
              ))}
              {['Report Wizard', 'Savings Expert'].map((a, i) => (
                <div key={i} className="neu-pressed px-3 py-1.5 text-[10px] font-semibold text-zinc-600">{a}</div>
              ))}
            </div>
            <div className="mt-3 text-[10px] text-zinc-500">3 of 10 unlocked</div>
          </div>

          <div className="glass-neu p-4 stagger-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Quick Stats</span>
              <Zap className="w-3.5 h-3.5 text-lime-400" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { value: `${txToday}`, label: 'Today' },
                { value: `${txThisWeek}`, label: 'This Week' },
                { value: `${expenses.length > 0 ? Math.round(expenses.length / Math.max(1, Math.ceil((Date.now() - new Date(expenses[expenses.length - 1]?.date || Date.now()).getTime()) / 86400000))) : 0}`, label: 'Daily Avg' },
              ].map(({ value, label }, i) => (
                <div key={i} className="neu-pressed p-2 rounded-lg">
                  <div className="text-lg font-bold text-white">{value}</div>
                  <div className="text-[10px] text-zinc-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Financial Tips */}
        <div className="glass-card p-5 mb-6 stagger-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Financial Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Budget First', desc: 'Track all expenses to stay in control of your money.', color: 'from-indigo-500/20 to-cyan-500/20' },
              { title: '50/30/20 Rule', desc: 'Allocate 50% needs, 30% wants, 20% savings.', color: 'from-emerald-500/20 to-teal-500/20' },
              { title: 'Emergency Fund', desc: 'Build 3-6 months of expenses for security.', color: 'from-amber-500/20 to-orange-500/20' },
            ].map(({ title, desc, color }, i) => (
              <div key={i} className={`bg-gradient-to-br ${color} rounded-xl p-3 border border-white/5`}>
                <div className="font-semibold text-xs text-white mb-1">{title}</div>
                <div className="text-[10px] text-zinc-400 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid - Glassmorphic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {monthlyData.length > 0 && (
            <div className="glass-card p-6 stagger-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-cyan-400" /> Spending Trend
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                  <YAxis stroke="#475569" fontSize={10} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1a1d23', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} labelStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#colorIncome)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" fill="url(#colorExpense)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {categoryData.length > 0 && (
            <div className="glass-card p-6 stagger-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                <PieChartIcon size={16} className="text-purple-400" /> Top Categories
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name }) => `${name}`} outerRadius={90} fill="#8884d8" dataKey="value" stroke="rgba(0,0,0,0.3)" strokeWidth={2}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ backgroundColor: '#1a1d23', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }} labelStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Budgets & Recurring */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <BudgetsCard />
          <RecurringCard />
        </div>
      </div>

      {/* Modals */}
      {showSmsModal && <SmsImportModal isOpen={true} onClose={() => setShowSmsModal(false)} onImported={onImportComplete} />}
      {showReceiptModal && (
        <ReceiptUploadModal
          isOpen={true}
          onClose={() => setShowReceiptModal(false)}
          onImported={() => {
            setShowReceiptModal(false);
            onImportComplete && onImportComplete();
          }}
        />
      )}

      <QuickAdd onQuickAdd={onAddTx} />
    </div>
  );
};

export default DashboardNew;
