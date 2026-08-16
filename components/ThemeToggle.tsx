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
        className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border border-app bg-surface hover:border-gold-soft hover:bg-surface-2 ${className}`}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun size={16} className="text-gold" /> : <Moon size={16} className="text-brand" />}
        <span className="text-app">{theme === 'dark' ? 'Light' : 'Dark'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2.5 rounded-full transition-all border border-app bg-surface text-app hover:border-gold-soft hover:text-gold shadow-card-soft ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default ThemeToggle;
