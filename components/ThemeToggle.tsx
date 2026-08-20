import React, { useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getTheme, toggleTheme, Theme } from '../services/theme';

interface ThemeToggleProps {
  variant?: 'pill' | 'icon';
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'icon', className = '' }) => {
  const [theme, setTheme] = useState<Theme>(getTheme());

  const handleToggle = () => {
    const next = toggleTheme();
    setTheme(next);
  };

  if (variant === 'pill') {
    return (
      <button
        onClick={handleToggle}
        className={`relative overflow-hidden flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border border-app bg-surface hover:border-gold-soft hover:bg-surface-2 ring-2 ${theme === 'dark' ? 'ring-gold/20 hover:ring-gold/40' : 'ring-brand/20 hover:ring-brand/40'} hover:scale-110 active:scale-95 transition-transform ${className}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} className="text-gold animate-spin" /> : <Moon size={16} className="text-brand animate-spin" />}
        <span className="text-app">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`relative overflow-hidden p-2.5 rounded-full transition-all border border-app bg-surface text-app hover:border-gold-soft hover:text-gold shadow-card-soft ring-2 ${theme === 'dark' ? 'ring-gold/20 hover:ring-gold/40' : 'ring-brand/20 hover:ring-brand/40'} hover:scale-110 active:scale-95 transition-transform ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} className="animate-spin" /> : <Moon size={18} className="animate-spin" />}
    </button>
  );
};

export default ThemeToggle;
