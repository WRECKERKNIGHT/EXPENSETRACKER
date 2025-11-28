
import { Expense, Category, UserProfile } from '../types';

const STORAGE_KEY = 'spendsmart_expenses_v2';
const USER_KEY = 'spendsmart_user_v2';
const SESSION_KEY = 'spendsmart_session_active';

export const getExpenses = (): Expense[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load expenses", e);
    return [];
  }
};

export const saveExpense = (expense: Expense): Expense[] => {
  const current = getExpenses();
  const updated = [expense, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const deleteExpense = (id: string): Expense[] => {
  const current = getExpenses();
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// User Profile Management
export const getUserProfile = (): UserProfile | null => {
  try {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (e) {
    return null;
  }
};

export const saveUserProfile = (profile: UserProfile): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(profile));
};

// Session Management (Remember Me)
export const setSessionActive = (active: boolean) => {
  if (active) localStorage.setItem(SESSION_KEY, 'true');
  else localStorage.removeItem(SESSION_KEY);
};

export const isSessionActive = (): boolean => {
  return localStorage.getItem(SESSION_KEY) === 'true';
};

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_KEY);
};
