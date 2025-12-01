
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Expense } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart as PieChartIcon, Activity, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare } from 'lucide-react';
import QuickAdd from './QuickAdd';
import QuickAddInline from './QuickAddInline';
import { connectBankAPI, getBankConnectionsAPI, uploadBankCSVAPI } from '../services/apiService';
import SmsImportModal from './SmsImportModal';
import BudgetsCard from './BudgetsCard';
import RecurringCard from './RecurringCard';

interface OverviewProps {
  expenses: Expense[];
  monthlyIncome: number;
  currency: string;
  onAddTx: () => void;
  onManageExpenses: () => void;
  userName?: string;
  onImportComplete?: () => void;
}

const COLORS_CATEGORY = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', '#64748b'];
const COLORS_HEALTH = ['#10b981', '#ef4444']; // Green for Saved, Red for Spent

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

const Overview: React.FC<OverviewProps> = ({ expenses, monthlyIncome, currency, onAddTx, onManageExpenses, userName, onImportComplete }) => {
  const [isBankConnecting, setIsBankConnecting] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showQuickInline, setShowQuickInline] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
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
      // Simulate bank connection dialog (in real app, this would open an OAuth flow)
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
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Mobile Welcome Header */}
      <div className="md:hidden mb-6 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
         <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-1">Hi, {userName || 'User'} 👋</h2>
            <p className="text-indigo-200 text-sm">Your finances are looking sharp today.</p>
         </div>
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
      </div>

      {/* Top Row: Quick Actions & KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        
        {/* Actions Column */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-row md:flex-col gap-3">
             {/* Quick Add Button Card */}
            <div 
              onClick={onAddTx}
              className="flex-1 bg-gradient-to-br from-indigo-600 to-indigo-800 p-[1px] rounded-2xl md:rounded-[1.5rem] shadow-xl cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="bg-[#18181b]/40 backdrop-blur-md h-full w-full rounded-[0.8rem] md:rounded-[1.3rem] flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start p-3 md:p-4 border border-white/10 group-hover:bg-white/5 transition-colors gap-2 md:gap-3">
                <div className="bg-white text-indigo-600 p-2 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                  <Plus size={18} strokeWidth={3} />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight">Quick Add</h3>
                    <p className="hidden md:block text-indigo-200 text-[10px] uppercase tracking-wide">Transaction</p>
                </div>
              </div>
            </div>

            {/* Manage Expenses Button Card */}
            <div 
              onClick={onManageExpenses}
              className="flex-1 bg-gradient-to-br from-zinc-700 to-zinc-800 p-[1px] rounded-2xl md:rounded-[1.5rem] shadow-xl cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
            >
              <div className="bg-[#18181b]/40 backdrop-blur-md h-full w-full rounded-[0.8rem] md:rounded-[1.3rem] flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start p-3 md:p-4 border border-white/10 group-hover:bg-white/5 transition-colors gap-2 md:gap-3">
                <div className="bg-zinc-800 text-zinc-300 p-2 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] border border-zinc-600">
                  <ListChecks size={18} strokeWidth={2} />
                </div>
                <div className="text-center md:text-left">
                    <h3 className="text-zinc-200 font-bold text-xs md:text-sm leading-tight">Manage</h3>
                    <p className="hidden md:block text-zinc-500 text-[10px] uppercase tracking-wide">Expenses</p>
                </div>
              </div>
            </div>
        </div>

        {/* Mobile Quick Add floating button */}
        <QuickAdd onQuickAdd={() => setShowQuickInline(true)} />

        {showQuickInline && (
          <QuickAddInline
            onCreated={(expense) => {
              // Let parent know a new expense was added so it can refresh local state
              onImportComplete && onImportComplete();
              setShowQuickInline(false);
            }}
            onClose={() => setShowQuickInline(false)}
          />
        )}

        {/* Balance Card */}
        <div className="col-span-1 md:col-span-2 lg:col-span-2 relative overflow-hidden bg-[#121215]/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/5 group card-glow-hover flex flex-col justify-between min-h-[160px]">
           <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10">
                    <Wallet size={20} />
                </div>
                <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Balance</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleConnectBank}
                  disabled={isBankConnecting || isBankConnected}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                      isBankConnected 
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                    {isBankConnecting ? <Loader2 size={12} className="animate-spin" /> : isBankConnected ? <CheckCircle2 size={12} /> : <LinkIcon size={12} />}
                    {isBankConnecting ? 'Syncing...' : isBankConnected ? 'Bank Connected' : 'Connect Bank'}
                </button>

                <button onClick={() => setShowSmsModal(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700">
                  <MessageSquare size={14} /> Import SMS
                </button>

                <button onClick={handleFilePick} disabled={isUploadingCsv} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50">
                  {isUploadingCsv ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />} Import CSV
                </button>
                <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

              </div>
           </div>
           <div className="relative z-10">
               <p className="text-3xl font-bold text-white mb-1 text-glow-success">{formatCurrency(calculations.balance, currency)}</p>
               <p className="text-xs text-zinc-500">Available Funds on Hand</p>
           </div>
        </div>

        {/* Expense Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 relative overflow-hidden bg-[#121215]/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/5 group card-glow-hover flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2.5 bg-red-500/10 rounded-xl text-red-400 border border-red-500/10">
                <TrendingDown size={20} />
              </div>
              <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Spent</span>
           </div>
           <div className="relative z-10">
               <p className="text-2xl font-bold text-white mb-1 text-glow-danger">{formatCurrency(calculations.totalExpense, currency)}</p>
               <p className="text-xs text-zinc-500">Total Outflow</p>
           </div>
        </div>

        {/* Income (Salary) Card */}
        <div className="col-span-1 md:col-span-1 lg:col-span-1 relative overflow-hidden bg-[#121215]/60 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/5 group card-glow-hover flex flex-col justify-between">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
           <div className="flex items-center gap-3 mb-4 relative z-10">
              <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
                <TrendingUp size={20} />
              </div>
              <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Salary</span>
           </div>
           <div className="relative z-10">
               <p className="text-2xl font-bold text-white mb-1 text-glow">{formatCurrency(monthlyIncome, currency)}</p>
               <p className="text-xs text-zinc-500">Registered Income</p>
           </div>
        </div>
      </div>

      {/* CSV Import Feedback */}
      {csvMessage && (
        <div className={`p-4 rounded-2xl text-sm font-bold border mb-6 animate-fade-in ${
          csvMessage.type === 'success' 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {csvMessage.text}
        </div>
      )}

      {/* Row 2: Pie Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Saved vs Spent */}
        <div className="bg-[#121215]/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden min-h-[350px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-red-500 opacity-50"></div>
           <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2 text-glow-sm">
             <Activity size={20} className="text-emerald-400" /> Financial Health
           </h3>
           <div className="h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={5}
                  >
                    {healthData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_HEALTH[index]} className="drop-shadow-lg" />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontFamily: 'Outfit' }}
                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                    formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value, entry: any) => <span className="text-zinc-400 font-medium ml-2">{value}</span>}
                  />
                </PieChart>
             </ResponsiveContainer>
             
             {/* Center Label */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 text-center pointer-events-none">
                <p className="text-xs text-zinc-500 uppercase font-bold">Total</p>
                <p className="text-zinc-200 font-bold text-lg">100%</p>
             </div>
           </div>
        </div>

        {/* Chart 2: Category Breakdown */}
        <div className="bg-[#121215]/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden min-h-[350px]">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
           <h3 className="text-xl font-bold text-zinc-100 mb-6 flex items-center gap-2 text-glow-sm">
             <PieChartIcon size={20} className="text-indigo-400" /> Spending Categories
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
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} className="drop-shadow-lg" />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontFamily: 'Outfit' }}
                      itemStyle={{ color: '#fff', fontWeight: 600 }}
                      formatter={(value: number) => [formatCurrency(value as number, currency), 'Amount']}
                    />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-full md:w-1/2 h-full overflow-y-auto pr-2 custom-scrollbar">
               <div className="space-y-3">
                 {categoryData.length === 0 && <p className="text-zinc-500 text-sm text-center mt-10">No expenses yet.</p>}
                 {categoryData.map((entry, index) => (
                   <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                     <div className="flex items-center gap-2">
                       <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_CATEGORY[index % COLORS_CATEGORY.length], boxShadow: `0 0 8px ${COLORS_CATEGORY[index % COLORS_CATEGORY.length]}` }}></span>
                       <span className="text-xs font-medium text-zinc-300 group-hover:text-white">{entry.name}</span>
                     </div>
                     <span className="text-xs font-bold text-zinc-400 group-hover:text-white">{formatCurrency(entry.value, currency)}</span>
                   </div>
                 ))}
               </div>
             </div>
           </div>
        </div>
      </div>

      {/* Row 3: Budgets + Recurring + Cash Flow */}
      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <div className="space-y-4 2xl:col-span-1">
          <BudgetsCard expenses={expenses} currency={currency} />
          <RecurringCard expenses={expenses} currency={currency} />
        </div>
        <div className="2xl:col-span-2 bg-[#121215]/60 backdrop-blur-xl border border-white/5 p-6 md:p-8 rounded-[2rem] shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-3 text-glow-sm">
              <TrendingUp size={20} className="text-indigo-500" /> Cash Flow Trends
            </h3>
            <div className="flex gap-4 text-xs font-medium">
               <div className="flex items-center gap-2 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span> Income</div>
               <div className="flex items-center gap-2 text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></span> Expenses</div>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} opacity={0.5} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} dy={10} fontFamily="Outfit" />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} fontFamily="Outfit" />
                <RechartsTooltip
                  cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', color: '#fff', fontFamily: 'Outfit' }}
                  itemStyle={{ fontSize: '13px', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="Income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
                <Area type="monotone" dataKey="Expense" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }} />
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
