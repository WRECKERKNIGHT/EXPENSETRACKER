// Feature management service
// Categories, savings goals, bill splitting, investment tracking, etc.

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  userId: string;
}

export interface BillSplit {
  id: string;
  description: string;
  totalAmount: number;
  people: Array<{ name: string; share: number }>;
  userId: string;
}

export interface InvestmentAccount {
  id: string;
  name: string;
  type: 'stock' | 'crypto' | 'mutual-fund' | 'bonds';
  balance: number;
  userId: string;
}

export interface RecurringTemplate {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  userId: string;
}

export interface TaxCategory {
  id: string;
  name: string;
  category: string;
  deductible: boolean;
  userId: string;
}

// Mock implementations for now
export const createSavingsGoal = (goal: Omit<SavingsGoal, 'id'>): SavingsGoal => ({
  ...goal,
  id: Date.now().toString(),
});

export const createBillSplit = (split: Omit<BillSplit, 'id'>): BillSplit => ({
  ...split,
  id: Date.now().toString(),
});

export const createInvestmentAccount = (account: Omit<InvestmentAccount, 'id'>): InvestmentAccount => ({
  ...account,
  id: Date.now().toString(),
});

export const addRecurringTemplate = (template: Omit<RecurringTemplate, 'id'>): RecurringTemplate => ({
  ...template,
  id: Date.now().toString(),
});

export const addTaxCategory = (tax: Omit<TaxCategory, 'id'>): TaxCategory => ({
  ...tax,
  id: Date.now().toString(),
});
