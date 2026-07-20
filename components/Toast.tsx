import React, { useEffect } from 'react';

const Toast: React.FC<{ message: string; type?: 'info' | 'success' | 'error'; onClose?: () => void }> = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const t = setTimeout(() => onClose && onClose(), 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg = type === 'error' ? 'bg-red-600' : type === 'success' ? 'bg-emerald-600' : 'bg-zinc-800';

  return (
    <div className={`fixed right-6 bottom-6 z-50 px-4 py-3 rounded-lg text-white ${bg} shadow-lg`}> 
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default Toast;
