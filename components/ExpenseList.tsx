import React, { useMemo } from 'react';
import { Expense, Category } from '../types';
import { detectAnomalies, detectRecurringPatterns, CATEGORY_COLORS, extractMerchant } from '../services/detectionService';
import {
  Trash2, Search, ArrowUpRight, ArrowDownRight, Edit3, CalendarDays,
  Utensils, ShoppingBasket, Bus, Fuel, Home, Zap,
  Landmark, Film, Stethoscope, ShoppingBag, Plane,
  GraduationCap, TrendingUp, Banknote, Briefcase, MoreHorizontal,
  Calendar, Gift, Shield, FileText, Smile, Repeat, PawPrint, Wrench, DollarSign,
  AlertTriangle, Repeat as RepeatIcon
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onEdit?: (expense: Expense) => void;
}

const getCategoryIcon = (category: Category) => {
  switch (category) {
    case Category.FOOD: return <Utensils size={18} />;
    case Category.GROCERIES: return <ShoppingBasket size={18} />;
    case Category.TRANSPORT: return <Bus size={18} />;
    case Category.FUEL: return <Fuel size={18} />;
    case Category.HOUSING: return <Home size={18} />;
    case Category.UTILITIES: return <Zap size={18} />;
    case Category.EMI: return <Landmark size={18} />;
    case Category.ENTERTAINMENT: return <Film size={18} />;
    case Category.HEALTH: return <Stethoscope size={18} />;
    case Category.PERSONAL_CARE: return <Smile size={18} />;
    case Category.INSURANCE: return <Shield size={18} />;
    case Category.TAX: return <FileText size={18} />;
    case Category.SUBSCRIPTIONS: return <Repeat size={18} />;
    case Category.GIFTS: return <Gift size={18} />;
    case Category.PETS: return <PawPrint size={18} />;
    case Category.MAINTENANCE: return <Wrench size={18} />;
    case Category.SHOPPING: return <ShoppingBag size={18} />;
    case Category.TRAVEL: return <Plane size={18} />;
    case Category.EDUCATION: return <GraduationCap size={18} />;
    case Category.INVESTMENT: return <TrendingUp size={18} />;
    case Category.SALARY: return <Banknote size={18} />;
    case Category.FREELANCE: return <Briefcase size={18} />;
    case Category.OTHER: return <MoreHorizontal size={18} />;
    default: return <MoreHorizontal size={18} />;
  }
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onEdit }) => {
  const [filter, setFilter] = React.useState('');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  const anomalies = useMemo(() => detectAnomalies(expenses), [expenses]);
  const recurring = useMemo(() => detectRecurringPatterns(expenses), [expenses]);

  const anomalyMap = useMemo(() => {
    const map = new Map<string, typeof anomalies[0]>();
    for (const a of anomalies) map.set(a.expense.id, a);
    return map;
  }, [anomalies]);

  const recurringMerchants = useMemo(() => {
    const set = new Set<string>();
    for (const r of recurring) set.add(r.normalizedMerchant);
    return set;
  }, [recurring]);

  const filteredExpenses = expenses
    .filter(e =>
      e.description.toLowerCase().includes(filter.toLowerCase()) ||
      e.category.toLowerCase().includes(filter.toLowerCase()) ||
      extractMerchant(e.description).toLowerCase().includes(filter.toLowerCase())
    )
    .filter(e => {
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans pb-20">
      {/* Header & Search */}
      <div className="card-3d bg-surface border border-gold/20 rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="gold-line-top" />
        <div className="absolute top-4 right-6 text-gold/[0.04] pointer-events-none">
          <DollarSign size={120} strokeWidth={1} />
        </div>

        <div className="relative">
           <h3 className="heading-serif text-2xl font-bold text-app tracking-tight">Transactions</h3>
           <p className="text-faint text-sm font-medium">{filteredExpenses.length} transactions</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-faint group-focus-within:text-gold transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by name, category, or merchant..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-app-soft border-2 border-app rounded-2xl pl-12 pr-4 py-4 text-app focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold/40 transition-all shadow-inner text-sm font-medium"
          />
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays size={14} className="text-faint shrink-0" />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="bg-app-soft border-2 border-app rounded-xl px-3 py-2 text-xs text-app focus:outline-none focus:ring-2 focus:ring-gold/40 font-mono"
            placeholder="From"
          />
          <span className="text-faint text-xs">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="bg-app-soft border-2 border-app rounded-xl px-3 py-2 text-xs text-app focus:outline-none focus:ring-2 focus:ring-gold/40 font-mono"
            placeholder="To"
          />
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="text-xs font-bold text-faint hover:text-red-400 transition-colors px-2 py-1"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="card-3d bg-surface border border-gold/15 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px]">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 text-faint">
            <div className="p-6 bg-surface-3 rounded-full border border-gold/20 shadow-inner">
              <DollarSign className="w-10 h-10 opacity-30 text-gold" />
            </div>
            <div className="text-center">
               <p className="heading-serif text-lg font-bold text-soft">No transactions found</p>
               <p className="text-sm">Try adjusting your search terms</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-2 text-faint uppercase text-[11px] font-bold tracking-widest border-b border-gold/15">
                  <tr>
                    <th className="w-1 p-0"></th>
                    <th className="px-8 py-6">Description</th>
                    <th className="px-6 py-6">Category</th>
                    <th className="px-6 py-6">Date</th>
                    <th className="px-8 py-6 text-right">Amount</th>
                    <th className="px-6 py-6 text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.map((expense) => {
                    const catColor = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS[Category.OTHER];
                    const anomaly = anomalyMap.get(expense.id);
                    const merchant = extractMerchant(expense.description);
                    const isRecurring = recurringMerchants.has(merchant.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    return (
                    <tr key={expense.id} className="hover:bg-gold/[0.04] transition-all duration-300 group border-b border-gold/5 last:border-0">
                      <td className="w-1 p-0"><div className={`h-full w-0.5 rounded-full ${expense.type === 'income' ? 'bg-gold' : 'bg-red-500/40'} opacity-0 group-hover:opacity-100 transition-opacity`} /></td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                            expense.type === 'income'
                            ? `${catColor.bg} ${catColor.text} ring-1 ${catColor.border}`
                            : 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                          }`}>
                            {expense.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                             <div className="flex items-center gap-2">
                               <p className="font-bold text-app text-[15px] group-hover:text-app transition-colors">{expense.description}</p>
                               {anomaly && (
                                 <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                   anomaly.severity === 'severe' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                   anomaly.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                   'bg-orange-500/15 text-orange-400 border border-orange-500/30'
                                 }`}>
                                   <AlertTriangle size={10} />
                                   {anomaly.deviationPercent}% high
                                 </span>
                               )}
                               {isRecurring && expense.type === 'expense' && (
                                 <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                   <RepeatIcon size={10} />
                                   recurring
                                 </span>
                               )}
                             </div>
                             <p className="text-[11px] text-faint font-mono mt-0.5">{merchant}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${
                             `${catColor.bg} ${catColor.text} ${catColor.border} group-hover:brightness-110`
                        }`}>
                          {getCategoryIcon(expense.category)}
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-soft text-sm font-medium">
                           <Calendar size={14} className="text-faint" />
                           {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                           <span className="text-faint text-xs">'{new Date(expense.date).toLocaleDateString('en-IN', { year: '2-digit' })}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <span className={`font-display text-lg font-black ${
                             expense.type === 'income'
                             ? 'text-gold'
                             : 'text-red-400'
                         }`}>
                           {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(expense)}
                              className="text-faint hover:text-gold hover:bg-gold/10 p-2.5 rounded-xl transition-all"
                              title="Edit Transaction"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(expense.id)}
                            className="text-faint hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
                            title="Delete Transaction"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {filteredExpenses.map((expense) => {
                const catColor = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS[Category.OTHER];
                const anomaly = anomalyMap.get(expense.id);
                const merchant = extractMerchant(expense.description);
                const isRecurring = recurringMerchants.has(merchant.toLowerCase().replace(/[^a-z0-9]/g, ''));
                return (
                <div key={expense.id} className="card-3d bg-surface-2 border border-gold/15 rounded-2xl p-4 flex flex-col gap-4 shadow-lg active:scale-[0.98] transition-transform">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                              expense.type === 'income'
                              ? `${catColor.bg} ${catColor.text} ring-1 ${catColor.border}`
                              : 'bg-surface-3 text-soft ring-1 ring-app'
                            }`}>
                              {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-app text-lg leading-tight">{expense.description}</p>
                            {anomaly && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                anomaly.severity === 'severe' ? 'bg-red-500/20 text-red-400' :
                                anomaly.severity === 'moderate' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-orange-500/15 text-orange-400'
                              }`}>
                                <AlertTriangle size={10} />
                                {anomaly.deviationPercent}% high
                              </span>
                            )}
                            {isRecurring && expense.type === 'expense' && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/15 text-blue-400">
                                <RepeatIcon size={10} />
                                recurring
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${catColor.bg} ${catColor.text} ${catColor.border}`}>{expense.category}</span>
                             <span className="text-[10px] text-faint">{merchant}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(expense)}
                            className="text-faint hover:text-gold p-2"
                          >
                            <Edit3 size={18} />
                          </button>
                        )}
                        <button
                            onClick={() => onDelete(expense.id)}
                            className="text-faint hover:text-red-400 p-2"
                        >
                            <Trash2 size={18} />
                        </button>
                      </div>
                   </div>

                   <div className="flex items-end justify-between border-t border-gold/15 pt-3">
                      <div className="text-faint text-xs font-medium flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className={`text-xl font-display font-bold ${
                             expense.type === 'income' ? 'text-gold' : 'text-app'
                         }`}>
                        {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                      </div>
                   </div>
                </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
