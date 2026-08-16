import React from 'react';
import { Expense, Category } from '../types';
import { 
  Trash2, Search, ArrowUpRight, ArrowDownRight, Edit3,
  Utensils, ShoppingBasket, Bus, Fuel, Home, Zap, 
  Landmark, Film, Stethoscope, ShoppingBag, Plane, 
  GraduationCap, TrendingUp, Banknote, Briefcase, MoreHorizontal,
  Calendar, Gift, Shield, FileText, Smile, Repeat, PawPrint, Wrench
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

  const filteredExpenses = expenses
    .filter(e => 
      e.description.toLowerCase().includes(filter.toLowerCase()) || 
      e.category.toLowerCase().includes(filter.toLowerCase())
    )
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
      <div className="bg-surface backdrop-blur-md border border-app rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-deep via-brand to-gold opacity-50"></div>
        
        <div>
           <h3 className="text-2xl font-bold text-app tracking-tight text-glow-sm">Transactions</h3>
           <p className="text-faint text-sm font-medium">History & details</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-faint group-focus-within:text-brand-ink transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-app-soft border border-app rounded-2xl pl-12 pr-4 py-4 text-app focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all shadow-inner text-sm font-medium"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-surface backdrop-blur-md border border-app rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px]">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 text-faint">
            <div className="p-6 bg-surface-3 rounded-full border border-app/30 shadow-inner">
              <Search className="w-10 h-10 opacity-50" />
            </div>
            <div className="text-center">
               <p className="text-lg font-bold text-soft">No transactions found</p>
               <p className="text-sm">Try adjusting your search terms</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-2 text-faint uppercase text-[11px] font-bold tracking-widest border-b border-app">
                  <tr>
                    <th className="px-8 py-6">Description</th>
                    <th className="px-6 py-6">Category</th>
                    <th className="px-6 py-6">Date</th>
                    <th className="px-8 py-6 text-right">Amount</th>
                    <th className="px-6 py-6 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-app">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                            expense.type === 'income' 
                            ? 'bg-brand/10 text-brand-ink shadow-card-soft ring-1 ring-brand/30' 
                            : 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
                          }`}>
                            {expense.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                             <p className="font-bold text-app text-base group-hover:text-app transition-colors">{expense.description}</p>
                             <p className="text-xs text-faint font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {expense.id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border tracking-wide uppercase transition-colors ${
                             expense.type === 'income' 
                             ? 'bg-brand/10 text-brand-ink border-brand/20 group-hover:border-gold-soft' 
                             : 'bg-surface-3 text-soft border-app group-hover:border-app'
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
                         <span className={`font-mono text-lg font-bold tracking-tight ${
                             expense.type === 'income' 
                             ? 'text-brand-ink drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                             : 'text-app group-hover:text-app'
                         }`}>
                           {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(expense)}
                              className="text-faint hover:text-gold hover:bg-gold/10 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                              title="Edit Transaction"
                            >
                              <Edit3 size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => onDelete(expense.id)}
                            className="text-faint hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                            title="Delete Transaction"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="bg-surface-2 border border-app rounded-2xl p-4 flex flex-col gap-4 shadow-lg active:scale-[0.98] transition-transform">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                              expense.type === 'income' 
                              ? 'bg-brand/10 text-brand-ink ring-1 ring-brand/30' 
                              : 'bg-surface-3 text-soft ring-1 ring-app'
                            }`}>
                              {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p className="font-bold text-app text-lg leading-tight">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-bold text-faint uppercase tracking-wider bg-surface-3 px-2 py-0.5 rounded border border-app">{expense.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(expense)}
                            className="text-faint p-2"
                          >
                            <Edit3 size={18} />
                          </button>
                        )}
                        <button 
                            onClick={() => onDelete(expense.id)}
                            className="text-faint p-2"
                          >
                            <Trash2 size={18} />
                        </button>
                      </div>
                   </div>
                   
                   <div className="flex items-end justify-between border-t border-app/50 pt-3">
                      <div className="text-faint text-xs font-medium flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className={`text-xl font-mono font-bold ${
                             expense.type === 'income' ? 'text-brand-ink' : 'text-app'
                         }`}>
                        {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                      </div>
                   </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;