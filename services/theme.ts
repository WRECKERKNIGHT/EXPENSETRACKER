export type Theme = 'light' | 'dark';

const THEME_KEY = 'spendsmart_theme';

export const getTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  // Auto-detect system preference on first visit
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
};

export const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (e) {
    // localStorage unavailable — ignore
  }
};

export const initTheme = () => {
  applyTheme(getTheme());

  // Listen for system theme changes and auto-update if user hasn't manually set one
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const manualOverride = localStorage.getItem(THEME_KEY);
      if (!manualOverride) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
  }
};

export const toggleTheme = (): Theme => {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};
