import React from 'react';
import { Expense, Category } from '../types';
import { 
  Trash2, Search, ArrowUpRight, ArrowDownRight, 
  Utensils, ShoppingBasket, Bus, Fuel, Home, Zap, 
  Landmark, Film, Stethoscope, ShoppingBag, Plane, 
  GraduationCap, TrendingUp, Banknote, Briefcase, MoreHorizontal,
  Calendar, Gift, Shield, FileText, Smile, Repeat, PawPrint, Wrench
} from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
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

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete }) => {
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
      <div className="bg-[#0f172a]/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] p-6 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 opacity-50"></div>
        
        <div>
           <h3 className="text-2xl font-bold text-white tracking-tight text-glow-sm">Transactions</h3>
           <p className="text-zinc-500 text-sm font-medium">History & details</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-zinc-500 group-focus-within:text-emerald-400 transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-black/40 border border-zinc-700/50 rounded-2xl pl-12 pr-4 py-4 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-inner text-sm font-medium"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="bg-[#0f172a]/60 backdrop-blur-md border border-zinc-800 rounded-[2.5rem] overflow-hidden shadow-2xl min-h-[400px]">
        {filteredExpenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 gap-6 text-zinc-500">
            <div className="p-6 bg-zinc-800/30 rounded-full border border-zinc-700/30 shadow-inner">
              <Search className="w-10 h-10 opacity-50" />
            </div>
            <div className="text-center">
               <p className="text-lg font-bold text-zinc-400">No transactions found</p>
               <p className="text-sm">Try adjusting your search terms</p>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-zinc-900/80 text-zinc-500 uppercase text-[11px] font-bold tracking-widest border-b border-zinc-800">
                  <tr>
                    <th className="px-8 py-6">Description</th>
                    <th className="px-6 py-6">Category</th>
                    <th className="px-6 py-6">Date</th>
                    <th className="px-8 py-6 text-right">Amount</th>
                    <th className="px-6 py-6 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${
                            expense.type === 'income' 
                            ? 'bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-red-500/20'
                          }`}>
                            {expense.type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                          </div>
                          <div>
                             <p className="font-bold text-zinc-200 text-base group-hover:text-white transition-colors">{expense.description}</p>
                             <p className="text-xs text-zinc-500 font-mono mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">ID: {expense.id.slice(-4)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border tracking-wide uppercase transition-colors ${
                             expense.type === 'income' 
                             ? 'bg-emerald-900/10 text-emerald-300 border-emerald-500/20 group-hover:border-emerald-500/40' 
                             : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 group-hover:border-zinc-600'
                        }`}>
                          {getCategoryIcon(expense.category)}
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                           <Calendar size={14} className="text-zinc-600" />
                           {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                           <span className="text-zinc-600 text-xs">'{new Date(expense.date).toLocaleDateString('en-IN', { year: '2-digit' })}</span>
                         </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                         <span className={`font-mono text-lg font-bold tracking-tight ${
                             expense.type === 'income' 
                             ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                             : 'text-zinc-200 group-hover:text-white'
                         }`}>
                           {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                         </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <button 
                          onClick={() => onDelete(expense.id)}
                          className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                          title="Delete Transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden flex flex-col p-4 gap-3">
              {filteredExpenses.map((expense) => (
                <div key={expense.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-4 shadow-lg active:scale-[0.98] transition-transform">
                   <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-2xl ${
                              expense.type === 'income' 
                              ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20' 
                              : 'bg-zinc-800 text-zinc-400 ring-1 ring-zinc-700'
                            }`}>
                              {getCategoryIcon(expense.category)}
                        </div>
                        <div>
                          <p className="font-bold text-white text-lg leading-tight">{expense.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-800">{expense.category}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                          onClick={() => onDelete(expense.id)}
                          className="text-zinc-600 p-2"
                        >
                          <Trash2 size={18} />
                      </button>
                   </div>
                   
                   <div className="flex items-end justify-between border-t border-zinc-800/50 pt-3">
                      <div className="text-zinc-500 text-xs font-medium flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className={`text-xl font-mono font-bold ${
                             expense.type === 'income' ? 'text-emerald-400' : 'text-white'
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