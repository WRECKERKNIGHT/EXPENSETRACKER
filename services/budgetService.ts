// Simple budget service (client-side scaffold)
export interface BudgetRule {
  id: string;
  category: string;
  monthlyLimit: number;
}

const BUDGET_KEY = 'spendsmart_budgets_v1';

export const saveBudget = (b: BudgetRule) => {
  const all = getBudgets();
  all.push(b);
  localStorage.setItem(BUDGET_KEY, JSON.stringify(all));
};

export const getBudgets = (): BudgetRule[] => {
  try {
    const raw = localStorage.getItem(BUDGET_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
};

export const clearBudgets = () => localStorage.removeItem(BUDGET_KEY);

export default {};
