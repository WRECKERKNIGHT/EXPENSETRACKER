
export enum Category {
  FOOD = 'Food & Dining',
  GROCERIES = 'Groceries',
  TRANSPORT = 'Transport',
  FUEL = 'Fuel',
  HOUSING = 'Housing & Rent',
  UTILITIES = 'Utilities (Bills)',
  EMI = 'EMI / Loan',
  ENTERTAINMENT = 'Entertainment',
  HEALTH = 'Health & Medical',
  SHOPPING = 'Shopping',
  TRAVEL = 'Travel',
  EDUCATION = 'Education',
  INVESTMENT = 'Investment',
  SALARY = 'Salary',
  FREELANCE = 'Freelance',
  OTHER = 'Other'
}

export type TransactionType = 'income' | 'expense';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string; // ISO date string YYYY-MM-DD
  description: string;
  createdAt: number; // Timestamp
}

export interface UserProfile {
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
  password: string; // Replaced PIN with Password
}

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export type ViewMode = 'dashboard' | 'expenses' | 'advisor';
export type AppScreen = 'landing' | 'signup' | 'setup' | 'login' | 'app';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
