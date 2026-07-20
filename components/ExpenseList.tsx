import React from 'react';
import { Expense, Category, PaymentMethod } from '../types';
import { updateExpenseAPI } from '../services/apiService';
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
  onUpdate?: (id: string, updates: Partial<Expense>) => void;
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

const getPaymentMethodLabel = (method?: PaymentMethod) => {
  switch (method) {
    case 'cash': return '💵 Cash';
    case 'card': return '💳 Card';
    case 'upi': return '📱 UPI';
    case 'online': return '🌐 Online';
    case 'bank_transfer': return '🏦 Transfer';
    default: return '';
  }
};

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDelete, onUpdate }) => {
  const [filter, setFilter] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editForm, setEditForm] = React.useState({ description: '', amount: '', category: '', date: '', type: '' as 'income' | 'expense' });
  const [saving, setSaving] = React.useState(false);

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const updates = {
        description: editForm.description,
        amount: parseFloat(editForm.amount) || 0,
        category: editForm.category as Category,
        date: editForm.date,
        type: editForm.type as 'income' | 'expense',
      };
      await updateExpenseAPI(editingId, updates);
      if (onUpdate) onUpdate(editingId, updates);
      setEditingId(null);
    } catch (err) {
      console.error('Failed to update expense:', err);
    } finally {
      setSaving(false);
    }
  };

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
      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in">
          <div className="bg-[#0f172a] border border-white/10 rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div className="flex justify-between items-center p-6 border-b border-zinc-800/50">
              <h3 className="text-lg font-bold text-white">Edit Transaction</h3>
              <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:text-white transition-colors p-2 rounded-full hover:bg-zinc-800">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Description</label>
                <input type="text" value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Amount</label>
                <input type="number" value={editForm.amount} onChange={e => setEditForm(p => ({ ...p, amount: e.target.value }))} className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Category</label>
                <select value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm">
                  {Object.values(Category).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Date</label>
                <input type="date" value={editForm.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value }))} className="w-full bg-black/30 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-500 mb-2 uppercase tracking-wider">Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setEditForm(p => ({ ...p, type: 'expense' }))} className={`py-3 rounded-xl border text-sm font-semibold transition-all ${editForm.type === 'expense' ? 'bg-red-500/10 border-red-500/50 text-red-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>Expense</button>
                  <button type="button" onClick={() => setEditForm(p => ({ ...p, type: 'income' }))} className={`py-3 rounded-xl border text-sm font-semibold transition-all ${editForm.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>Income</button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingId(null)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-3 rounded-2xl transition-all">Cancel</button>
                <button onClick={handleSaveEdit} disabled={saving} className="flex-[2] bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
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
                        <div className="flex flex-col gap-1.5">
                          <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border tracking-wide uppercase transition-colors ${
                               expense.type === 'income' 
                               ? 'bg-emerald-900/10 text-emerald-300 border-emerald-500/20 group-hover:border-emerald-500/40' 
                               : 'bg-zinc-800/50 text-zinc-400 border-zinc-700/50 group-hover:border-zinc-600'
                          }`}>
                            {getCategoryIcon(expense.category)}
                            {expense.category}
                          </span>
                          {expense.paymentMethod && expense.paymentMethod !== 'other' && (
                            <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/30">
                              {getPaymentMethodLabel(expense.paymentMethod as PaymentMethod)}
                            </span>
                          )}
                        </div>
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
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all">
                          <button 
                            onClick={() => {
                              setEditingId(expense.id);
                              setEditForm({
                                description: expense.description,
                                amount: String(expense.amount),
                                category: expense.category,
                                date: expense.date,
                                type: expense.type,
                              });
                            }}
                            className="text-zinc-600 hover:text-blue-400 hover:bg-blue-500/10 p-2.5 rounded-xl transition-all"
                            title="Edit Transaction"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button 
                            onClick={() => onDelete(expense.id)}
                            className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 p-2.5 rounded-xl transition-all"
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
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                             <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-800">{expense.category}</span>
                             {expense.paymentMethod && expense.paymentMethod !== 'other' && (
                               <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800/50 px-2 py-0.5 rounded border border-zinc-700/30">
                                 {getPaymentMethodLabel(expense.paymentMethod as PaymentMethod)}
                               </span>
                             )}
                          </div>
                        </div>
                      </div>                      <div className="flex gap-1">
                        <button 
                            onClick={() => {
                              setEditingId(expense.id);
                              setEditForm({
                                description: expense.description,
                                amount: String(expense.amount),
                                category: expense.category,
                                date: expense.date,
                                type: expense.type,
                              });
                            }}
                            className="text-zinc-600 p-2"
                          >
                            <Edit3 size={18} />
                        </button>
                        <button 
                            onClick={() => onDelete(expense.id)}
                            className="text-zinc-600 p-2"
                          >
                            <Trash2 size={18} />
                        </button>
                      </div>
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