import { v4 as uuidv4 } from 'uuid';
import { runQuery, allQuery } from './database';

export interface RecurringPayment {
  id: string;
  userId: string;
  name: string;
  amount: number;
  category: string;
  dueDay: number; // 1-31
  createdAt: number;
  updatedAt: number;
}

export const getRecurringPayments = async (userId: string): Promise<RecurringPayment[]> => {
  return allQuery(
    'SELECT id, userId, name, amount, category, dueDay, createdAt, updatedAt FROM recurringPayments WHERE userId = ? ORDER BY dueDay ASC',
    [userId]
  );
};

export const createRecurringPayment = async (
  userId: string,
  data: { name: string; amount: number; category: string; dueDay: number }
): Promise<RecurringPayment> => {
  const id = uuidv4();
  const now = Date.now();

  await runQuery(
    'INSERT INTO recurringPayments (id, userId, name, amount, category, dueDay, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, userId, data.name, data.amount, data.category, data.dueDay, now, now]
  );

  return { id, userId, ...data, createdAt: now, updatedAt: now };
};

export const deleteRecurringPayment = async (userId: string, id: string): Promise<boolean> => {
  await runQuery('DELETE FROM recurringPayments WHERE id = ? AND userId = ?', [id, userId]);
  return true;
};


