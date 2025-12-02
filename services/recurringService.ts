// Recurring transactions scaffold
export interface RecurringRule {
  id: string;
  amount: number;
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  nextRun: string; // ISO date
}

const KEY = 'spendsmart_recurring_v1';

export const getRecurring = (): RecurringRule[] => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const addRecurring = (r: RecurringRule) => {
  const arr = getRecurring();
  arr.push(r);
  localStorage.setItem(KEY, JSON.stringify(arr));
};

export const removeRecurring = (id: string) => {
  const arr = getRecurring().filter(r => r.id !== id);
  localStorage.setItem(KEY, JSON.stringify(arr));
};

export default {};
