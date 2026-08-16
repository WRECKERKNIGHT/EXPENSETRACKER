export type Theme = 'light' | 'dark';

const THEME_KEY = 'spendsmart_theme';

export const getTheme = (): Theme => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
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
};

export const toggleTheme = (): Theme => {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
};
