
import { Expense, UserProfile } from '../types';

const USERS_KEY = 'spendsmart_users_db';
const SESSION_KEY = 'spendsmart_active_session_email';
const EXPENSE_PREFIX = 'spendsmart_expenses_';

// --- Helper: Get Key for specific user ---
const getUserExpenseKey = (email: string) => `${EXPENSE_PREFIX}${email}`;

// --- User Management ---

export const getAllUsers = (): UserProfile[] => {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const registerUser = (newUser: UserProfile): { success: boolean; message?: string } => {
  const users = getAllUsers();
  
  if (users.find(u => u.email === newUser.email)) {
    return { success: false, message: 'User with this email already exists.' };
  }

  const updatedUsers = [...users, newUser];
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  return { success: true };
};

export const authenticateUser = (email: string, password: string): UserProfile | null => {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
};

export const updateUserProfile = (updatedProfile: UserProfile): void => {
  const users = getAllUsers();
  const index = users.findIndex(u => u.email === updatedProfile.email);
  if (index !== -1) {
    users[index] = updatedProfile;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const deleteUserAccount = (email: string) => {
  // 1. Remove User
  const users = getAllUsers().filter(u => u.email !== email);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // 2. Remove Data
  localStorage.removeItem(getUserExpenseKey(email));
  
  // 3. Clear Session if it's the current user
  if (getCurrentUserEmail() === email) {
    logoutUser();
  }
};

// --- Session Management ---

export const loginUserSession = (email: string) => {
  localStorage.setItem(SESSION_KEY, email);
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUserEmail = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const getCurrentUser = (): UserProfile | null => {
  const email = getCurrentUserEmail();
  if (!email) return null;
  
  const users = getAllUsers();
  return users.find(u => u.email === email) || null;
};

// --- Expense Management (Scoped to User) ---

export const getExpenses = (email: string): Expense[] => {
  if (!email) return [];
  try {
    const stored = localStorage.getItem(getUserExpenseKey(email));
    if (!stored) return [];
    
    // Parse and ensure date objects are handled if necessary (though strings in JSON are fine for our types)
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to load expenses", e);
    return [];
  }
};

export const saveExpense = (email: string, expense: Expense): Expense[] => {
  if (!email) return [];
  const current = getExpenses(email);
  const updated = [expense, ...current];
  localStorage.setItem(getUserExpenseKey(email), JSON.stringify(updated));
  return updated;
};

export const deleteExpense = (email: string, id: string): Expense[] => {
  if (!email) return [];
  const current = getExpenses(email);
  const updated = current.filter(e => e.id !== id);
  localStorage.setItem(getUserExpenseKey(email), JSON.stringify(updated));
  return updated;
};

export const clearUserExpenses = (email: string): void => {
  if (!email) return;
  localStorage.removeItem(getUserExpenseKey(email));
};
