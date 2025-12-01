import React from 'react';
import { Plus } from 'lucide-react';

interface QuickAddProps {
  onQuickAdd: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onQuickAdd }) => {
  return (
    <button
      onClick={onQuickAdd}
      className="md:hidden fixed bottom-6 right-4 z-50 bg-indigo-600 text-white p-4 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
      aria-label="Quick add transaction"
    >
      <Plus size={20} />
    </button>
  );
};

export default QuickAdd;
