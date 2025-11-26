
import React from 'react';
import { Expense } from '../types';
import { Trash2, Search, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete: (id: string) => void;
}

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
    }).format(amount);
  };

  return (
    <div className="bg-[#121215]/80 backdrop-blur-md border border-zinc-800 rounded-[2rem] overflow-hidden shadow-xl animate-fade-in font-sans">
      <div className="p-8 border-b border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-900/30">
        <h3 className="text-xl font-bold text-zinc-100 text-glow-sm">Manage Transactions</h3>
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search by details or category..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full bg-black/40 border border-zinc-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-zinc-400">
          <thead className="bg-zinc-900/50 uppercase text-xs font-bold text-zinc-500 tracking-wider">
            <tr>
              <th className="px-8 py-6">Details / Description</th>
              <th className="px-6 py-6">Category</th>
              <th className="px-6 py-6">Date</th>
              <th className="px-8 py-6 text-right">Amount Spent / Received</th>
              <th className="px-6 py-6 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center text-zinc-500">
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-4 bg-zinc-800/50 rounded-full">
                      <Search className="w-8 h-8 opacity-40" />
                    </div>
                    <p className="font-medium">No transactions found matching your criteria.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-white/[0.03] transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${expense.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-red-500/10 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]'}`}>
                        {expense.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <span className="font-semibold text-zinc-200 text-base">{expense.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 tracking-wide uppercase">
                      {expense.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-medium text-zinc-500">
                    {new Date(expense.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className={`px-8 py-5 text-right font-bold text-base ${expense.type === 'income' ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'text-zinc-200'}`}>
                    {expense.type === 'income' ? '+' : '-'} {formatCurrency(expense.amount)}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <button 
                      onClick={() => onDelete(expense.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors p-2.5 rounded-xl hover:bg-red-500/10 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseList;
