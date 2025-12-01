import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from './database';

interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description: string;
  createdAt: number;
}

export const createExpense = async (
  userId: string,
  { amount, category, type, date, description }: Omit<Expense, 'id' | 'userId' | 'createdAt'>
): Promise<Expense> => {
  const id = uuidv4();
  const now = Date.now();

  await runQuery(
    'INSERT INTO expenses (id, userId, amount, category, type, date, description, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, amount, category, type, date, description, now, now]
  );

  return { id, userId, amount, category, type, date, description, createdAt: now };
};

export const getExpenses = async (userId: string): Promise<Expense[]> => {
  return allQuery(
    'SELECT id, userId, amount, category, type, date, description, createdAt FROM expenses WHERE userId = ? ORDER BY date DESC',
    [userId]
  );
};

export const getExpenseById = async (id: string, userId: string): Promise<Expense | null> => {
  return getQuery(
    'SELECT id, userId, amount, category, type, date, description, createdAt FROM expenses WHERE id = ? AND userId = ?',
    [id, userId]
  );
};

export const updateExpense = async (
  id: string,
  userId: string,
  updates: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt'>>
): Promise<Expense | null> => {
  const expense = await getExpenseById(id, userId);
  if (!expense) return null;

  const updateFields = [];
  const params = [];

  if (updates.amount !== undefined) {
    updateFields.push('amount = ?');
    params.push(updates.amount);
  }
  if (updates.category) {
    updateFields.push('category = ?');
    params.push(updates.category);
  }
  if (updates.type) {
    updateFields.push('type = ?');
    params.push(updates.type);
  }
  if (updates.date) {
    updateFields.push('date = ?');
    params.push(updates.date);
  }
  if (updates.description) {
    updateFields.push('description = ?');
    params.push(updates.description);
  }

  if (updateFields.length === 0) return expense;

  updateFields.push('updatedAt = ?');
  params.push(Date.now());
  params.push(id);

  await runQuery(`UPDATE expenses SET ${updateFields.join(', ')} WHERE id = ?`, params);

  return getExpenseById(id, userId);
};

export const deleteExpense = async (id: string, userId: string): Promise<boolean> => {
  const expense = await getExpenseById(id, userId);
  if (!expense) return false;

  await runQuery('DELETE FROM expenses WHERE id = ? AND userId = ?', [id, userId]);
  return true;
};

export const bulkCreateExpenses = async (
  userId: string,
  expenses: Omit<Expense, 'id' | 'userId' | 'createdAt'>[]
): Promise<Expense[]> => {
  const created = [];
  for (const expense of expenses) {
    const created_expense = await createExpense(userId, expense);
    created.push(created_expense);
  }
  return created;
};
