import React from 'react';
import { Plus, DollarSign } from 'lucide-react';

interface QuickAddProps {
  onQuickAdd: () => void;
}

const QuickAdd: React.FC<QuickAddProps> = ({ onQuickAdd }) => {
  return (
    <button
      onClick={onQuickAdd}
      className="md:hidden fixed bottom-24 right-4 z-50 btn-gold w-14 h-14 rounded-full flex items-center justify-center shadow-neon-gold hover:scale-110 active:scale-95 transition-all duration-300"
      aria-label="Quick add transaction"
    >
      <span className="absolute inset-0 rounded-full border-2 border-gold/40 animate-[pulse_2s_ease-in-out_infinite]" />
      <Plus size={22} strokeWidth={2.5} />
    </button>
  );
};

export default QuickAdd;
