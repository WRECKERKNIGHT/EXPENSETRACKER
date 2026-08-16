import { v4 as uuidv4 } from 'uuid';
import { runQuery, allQuery } from './database';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  createdAt: number;
  updatedAt: number;
}

export const getBudgets = async (userId: string): Promise<Budget[]> => {
  return allQuery(
    'SELECT id, userId, category, monthlyLimit, createdAt, updatedAt FROM budgets WHERE userId = ? ORDER BY category ASC',
    [userId]
  );
};

export const createBudget = async (
  userId: string,
  category: string,
  monthlyLimit: number
): Promise<Budget> => {
  const id = uuidv4();
  const now = Date.now();

  await runQuery(
    'INSERT INTO budgets (id, userId, category, monthlyLimit, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, category, monthlyLimit, now, now]
  );

  return { id, userId, category, monthlyLimit, createdAt: now, updatedAt: now };
};

export const updateBudget = async (
  userId: string,
  id: string,
  monthlyLimit: number
): Promise<Budget | null> => {
  const now = Date.now();
  await runQuery(
    'UPDATE budgets SET monthlyLimit = ?, updatedAt = ? WHERE id = ? AND userId = ?',
    [monthlyLimit, now, id, userId]
  );

  const rows = await allQuery(
    'SELECT id, userId, category, monthlyLimit, createdAt, updatedAt FROM budgets WHERE id = ? AND userId = ?',
    [id, userId]
  );
  return rows[0] || null;
};

export const deleteBudget = async (userId: string, id: string): Promise<boolean> => {
  await runQuery('DELETE FROM budgets WHERE id = ? AND userId = ?', [id, userId]);
  return true;
};


