
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, PlusCircle, LayoutDashboard, Receipt, Brain, BarChart3, Moon, Download, Landmark, ArrowRight, Command } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
  onToggleTheme: () => void;
  onAddTransaction: () => void;
}

interface CommandItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut: string;
  action: () => void;
  keywords: string[];
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onNavigate, onToggleTheme, onAddTransaction }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = useMemo(() => [
    { id: 'add', label: 'Add Transaction', icon: <PlusCircle size={18} />, shortcut: 'N', action: onAddTransaction, keywords: ['new', 'create', 'expense', 'income'] },
    { id: 'dashboard', label: 'Go to Dashboard', icon: <LayoutDashboard size={18} />, shortcut: '1', action: () => onNavigate('dashboard'), keywords: ['home', 'overview'] },
    { id: 'expenses', label: 'Go to Expenses', icon: <Receipt size={18} />, shortcut: '2', action: () => onNavigate('expenses'), keywords: ['transactions', 'list', 'history'] },
    { id: 'advisor', label: 'Go to AI Advisor', icon: <Brain size={18} />, shortcut: '3', action: () => onNavigate('advisor'), keywords: ['chat', 'assistant', 'help'] },
    { id: 'reports', label: 'Go to Reports', icon: <BarChart3 size={18} />, shortcut: '4', action: () => onNavigate('reports'), keywords: ['analytics', 'charts'] },
    { id: 'theme', label: 'Toggle Theme', icon: <Moon size={18} />, shortcut: 'T', action: onToggleTheme, keywords: ['dark', 'light', 'mode'] },
    { id: 'export', label: 'Export CSV', icon: <Download size={18} />, shortcut: 'E', action: () => onNavigate('export'), keywords: ['download', 'file'] },
    { id: 'bank', label: 'Connect Bank', icon: <Landmark size={18} />, shortcut: 'B', action: () => onNavigate('bank'), keywords: ['account', 'link', 'import'] },
  ], [onAddTransaction, onNavigate, onToggleTheme]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.keywords.some((kw) => kw.includes(q))
    );
  }, [query, commands]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIndex]) {
          filtered[activeIndex].action();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose, filtered, activeIndex]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          const event = new CustomEvent('open-command-palette');
          window.dispatchEvent(event);
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement;
    if (item) item.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="cmd-palette rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search size={18} className="text-soft shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-app outline-none placeholder-soft text-sm"
          />
          <kbd className="text-[10px] text-soft bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        <div ref={listRef} className="max-h-72 overflow-y-auto custom-scrollbar p-1.5">
          {filtered.length === 0 && (
            <p className="text-soft text-sm text-center py-8">No commands found</p>
          )}
          {filtered.map((cmd, i) => (
            <button
              key={cmd.id}
              onClick={() => { cmd.action(); onClose(); }}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                i === activeIndex ? 'bg-gold/15 text-gold' : 'text-app hover:bg-white/5'
              }`}
            >
              <span className={`shrink-0 ${i === activeIndex ? 'text-gold' : 'text-soft'}`}>{cmd.icon}</span>
              <span className="flex-1 text-left font-medium">{cmd.label}</span>
              <kbd className="text-[10px] text-soft bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono">{cmd.shortcut}</kbd>
              {i === activeIndex && <ArrowRight size={14} className="text-gold shrink-0" />}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/10 text-[11px] text-soft">
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 rounded font-mono">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 rounded font-mono">↵</kbd> select</span>
          <span className="flex items-center gap-1"><kbd className="bg-white/5 border border-white/10 px-1 rounded font-mono">esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
