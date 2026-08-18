import React from 'react';
import { Plus, DollarSign } from 'lucide-react';

interface QuickAddProps {
  onQuickAdd: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onQuickAdd }) => {
  return (
    <button
      onClick={onQuickAdd}
      className="md:hidden fixed bottom-20 right-4 z-50 btn-gold p-5 rounded-full flex items-center justify-center hover:scale-110 transition-transform active:scale-95"
      aria-label="Quick add transaction"
    >
      <Plus size={24} strokeWidth={3} />
    </button>
  );
};

export default QuickAdd;
