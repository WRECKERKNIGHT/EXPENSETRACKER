import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Expense } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart as PieChartIcon, Activity, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare, ArrowUpRight, ArrowDownLeft, Eye, EyeOff, Settings, Bell, Target, Zap, Clock, AlertCircle, BookOpen, Award, Flame, Calendar, DollarSign } from 'lucide-react';
import QuickAdd from './QuickAdd';
import QuickAddInline from './QuickAddInline';
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2">
              Welcome back, {userName || 'User'} 👋
            </h1>
            <p className="text-slate-400 text-sm">Here's your financial snapshot</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10">
              <Bell size={20} className="text-white" />
            </button>
            <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/10">
              <Settings size={20} className="text-white" />
            </button>
          </div>
        </div>

        {/* Main balance card */}
        <div className="bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">Total Balance</p>
                <div className="flex items-center gap-3">
                  <h2 className="text-5xl font-bold text-white">{hideBalance ? '••••' : formatCurrency(calculations.balance)}</h2>
                  <button onClick={() => setHideBalance(!hideBalance)} className="p-2 rounded-lg hover:bg-white/10 transition">
                    {hideBalance ? <EyeOff size={20} className="text-slate-400" /> : <Eye size={20} className="text-slate-400" />}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-400 text-sm mb-2">Savings Rate</p>
                <p className="text-3xl font-bold text-emerald-400">{savingsRate}%</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowDownLeft size={16} className="text-red-400" />
                  <p className="text-slate-400 text-xs">Income This Month</p>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(calculations.totalIncomeTx)}</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowUpRight size={16} className="text-emerald-400" />
                  <p className="text-slate-400 text-xs">Spending This Month</p>
                </div>
                <p className="text-2xl font-bold text-white">{formatCurrency(calculations.totalExpense)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <button onClick={onAddTx} className="group relative p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-medium text-sm transition overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative flex items-center justify-center gap-2"><Plus size={18} /> Add</div>
          </button>

          <button onClick={onManageExpenses} className="group relative p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-sm transition overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative flex items-center justify-center gap-2"><ListChecks size={18} /> Manage</div>
          </button>

          <button onClick={handleConnectBank} disabled={isBankConnected || isBankConnecting} className="group relative p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-medium text-sm transition overflow-hidden disabled:opacity-50">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative flex items-center justify-center gap-2">
              {isBankConnecting ? <Loader2 size={18} className="animate-spin" /> : isBankConnected ? <CheckCircle2 size={18} /> : <LinkIcon size={18} />}
              Bank
            </div>
          </button>

          <button onClick={() => setShowSmsModal(true)} className="group relative p-4 rounded-2xl bg-gradient-to-br from-cyan-600 to-cyan-700 hover:from-cyan-500 hover:to-cyan-600 text-white font-medium text-sm transition overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative flex items-center justify-center gap-2"><MessageSquare size={18} /> SMS</div>
          </button>

          <button onClick={() => setShowReceiptModal(true)} className="group relative p-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-medium text-sm transition overflow-hidden">
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
            <div className="relative flex items-center justify-center gap-2"><UploadCloud size={18} /> Receipt</div>
          </button>
        </div>

        {/* CSV Upload hint */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UploadCloud size={20} className="text-indigo-400" />
              <div>
                <p className="text-white font-medium text-sm">Import Bank Transactions</p>
                <p className="text-slate-400 text-xs">Upload CSV for bulk import</p>
              </div>
            </div>
            <button onClick={handleFilePick} disabled={isUploadingCsv} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition disabled:opacity-50">
              {isUploadingCsv ? 'Uploading...' : 'Upload'}
            </button>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </div>
          {csvMessage && (
            <p className={`text-xs mt-3 ${csvMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {csvMessage.text}
            </p>
          )}
        </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Avg Daily Expense */}
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-emerald-600 font-medium">Avg Daily Expense</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{currency}{avgDailyExpense}</div>
          <div className="text-xs text-emerald-600 mt-1">+2.5% from yesterday</div>
        </div>

        {/* Total Transactions */}
        <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-purple-600 font-medium">Total Transactions</span>
            <Zap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{calculations.totalIncomeTx || 0 + calculations.totalExpense || 0}</div>
          <div className="text-xs text-purple-600 mt-1">Tracked this month</div>
        </div>

        {/* Top Category */}
        <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-orange-600 font-medium">Top Category</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{topCategory?.name || 'N/A'}</div>
          <div className="text-xs text-orange-600 mt-1">{currency}{topCategory?.value || '0'}</div>
        </div>

        {/* Budget Health */}
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-blue-600 font-medium">Budget Health</span>
            <AlertCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">85%</div>
          <div className="text-xs text-blue-600 mt-1">On track</div>
        </div>
      </div>

      {/* Additional Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Last Transaction */}
        <div className="bg-gradient-to-br from-slate-500/10 to-gray-500/10 border border-slate-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-600 font-medium">Last Transaction</span>
            <Clock className="w-4 h-4 text-slate-500" />
          </div>
          {lastExpense ? (
            <>
              <div className="text-sm font-semibold text-gray-900 truncate">{lastExpense.description}</div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-lg font-bold text-gray-900">{currency}{lastExpense.amount}</span>
                <span className="text-xs text-slate-500">{new Date(lastExpense.date).toLocaleDateString()}</span>
              </div>
            </>
          ) : (
            <div className="text-sm text-slate-500">No transactions yet</div>
          )}
        </div>

        {/* Budget Status */}
        <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-indigo-600 font-medium">Budget Status</span>
            <AlertCircle className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="w-full bg-indigo-100 rounded-full h-2 mb-2">
            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-semibold text-gray-900">{currency}18,000</span>
            <span className="text-xs text-indigo-600">72% of {currency}25,000</span>
          </div>
        </div>

        {/* Insights */}
        <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-rose-600 font-medium">Financial Insights</span>
            <Sparkles className="w-4 h-4 text-rose-500" />
          </div>
          <ul className="text-xs space-y-1 text-gray-700">
            <li>• Your food spending is 15% higher than last month</li>
            <li>• You're saving {savingsRate}% of your income</li>
            <li>• Budget refresh in 5 days</li>
          </ul>
        </div>
      </div>

      {/* Achievements & Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Achievements */}
        <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-amber-600 font-medium">Achievements</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="bg-amber-100 rounded-full px-3 py-1 text-xs font-semibold text-amber-700 flex items-center gap-1">
              <span>✓</span> 7-Day Tracker
            </div>
            <div className="bg-amber-100 rounded-full px-3 py-1 text-xs font-semibold text-amber-700 flex items-center gap-1">
              <span>✓</span> Budget Master
            </div>
            <div className="bg-amber-100 rounded-full px-3 py-1 text-xs font-semibold text-amber-700 flex items-center gap-1">
              <span>✓</span> Recurring Pro
            </div>
            <div className="bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-500">Report Wizard</div>
            <div className="bg-gray-100 rounded-full px-3 py-1 text-xs font-semibold text-gray-500">Savings Expert</div>
          </div>
          <div className="mt-3 text-xs text-amber-600">3 of 10 achievements unlocked</div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-lime-500/10 to-green-500/10 border border-lime-200/50 rounded-xl p-4 backdrop-blur-md hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-lime-600 font-medium">Quick Stats</span>
            <Zap className="w-4 h-4 text-lime-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-lime-100 rounded-lg p-2">
              <div className="text-lg font-bold text-lime-700">12</div>
              <div className="text-xs text-lime-600">Today</div>
            </div>
            <div className="bg-lime-100 rounded-lg p-2">
              <div className="text-lg font-bold text-lime-700">47</div>
              <div className="text-xs text-lime-600">This Week</div>
            </div>
            <div className="bg-lime-100 rounded-lg p-2">
              <div className="text-lg font-bold text-lime-700">{(calculations.totalIncomeTx + calculations.totalExpense) / 30 ? ((calculations.totalIncomeTx + calculations.totalExpense) / 30).toFixed(0) : 0}</div>
              <div className="text-xs text-lime-600">Daily Avg</div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Tips Section */}
      <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-200/50 rounded-xl p-6 backdrop-blur-md mb-8">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-violet-600" />
          <h3 className="text-lg font-semibold text-gray-900">Financial Tips</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tip 1 */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
            <div className="font-semibold text-sm text-blue-900 mb-1">Budget First</div>
            <div className="text-xs text-blue-700">Create a monthly budget and track all expenses to stay in control of your money.</div>
          </div>
          {/* Tip 2 */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
            <div className="font-semibold text-sm text-green-900 mb-1">50/30/20 Rule</div>
            <div className="text-xs text-green-700">Allocate 50% to needs, 30% to wants, and 20% to savings for a balanced financial life.</div>
          </div>
          {/* Tip 3 */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 border border-orange-100">
            <div className="font-semibold text-sm text-orange-900 mb-1">Emergency Fund</div>
            <div className="text-xs text-orange-700">Build an emergency fund with 3-6 months of expenses for financial security.</div>
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Spending trend */}
          {monthlyData.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <TrendingUp size={20} className="text-cyan-400" /> Spending Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                  <Area type="monotone" dataKey="Income" stroke="#10b981" fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="Expense" stroke="#ef4444" fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Category breakdown */}
          {categoryData.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 hover:bg-white/[0.08] transition">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <PieChartIcon size={20} className="text-purple-400" /> Top Categories
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}`} outerRadius={100} fill="#8884d8" dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '12px' }} labelStyle={{ color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Additional widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
