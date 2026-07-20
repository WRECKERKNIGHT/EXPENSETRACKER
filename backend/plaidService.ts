import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from './database';

const PLAID_CLIENT_ID = process.env.PLAID_CLIENT_ID || '';
const PLAID_SECRET = process.env.PLAID_SECRET || '';
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';

const PLAID_BASE_URL = PLAID_ENV === 'production'
  ? 'https://production.plaid.com'
  : PLAID_ENV === 'development'
  ? 'https://development.plaid.com'
  : 'https://sandbox.plaid.com';

export const createPlaidLinkToken = async (userId: string) => {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in env');
  }

  const url = `${PLAID_BASE_URL}/link/token/create`;
  const body = {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    client_name: 'SpendSmart',
    products: ['transactions'],
    country_codes: ['US', 'IN'],
    language: 'en',
    user: { client_user_id: userId }
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error_message || 'Plaid create link token failed');
  return data;
};

export const exchangePlaidPublicToken = async (userId: string, publicToken: string) => {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured. Set PLAID_CLIENT_ID and PLAID_SECRET in env');
  }

  const url = `${PLAID_BASE_URL}/item/public_token/exchange`;
  const body = {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    public_token: publicToken
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error_message || 'Plaid exchange failed');
  return data;
};

/**
 * Fetch transactions from Plaid for a given access token
 */
export const fetchPlaidTransactions = async (
  accessToken: string,
  startDate: string,
  endDate: string,
  options?: { count?: number; offset?: number }
): Promise<any> => {
  if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
    throw new Error('Plaid credentials not configured');
  }

  const url = `${PLAID_BASE_URL}/transactions/get`;
  const body = {
    client_id: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
    options: {
      count: options?.count || 100,
      offset: options?.offset || 0
    }
  };

  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data: any = await res.json();
  if (!res.ok) throw new Error(data?.error_description || data?.error_message || 'Plaid transactions fetch failed');
  return data;
};

/**
 * Sync Plaid transactions into the local database
 * Returns array of newly synced transactions
 */
export const syncPlaidTransactions = async (
  userId: string,
  bankConnectionId: string,
  accessToken: string
): Promise<any[]> => {
  // Get the last sync time or default to 30 days ago
  const connection = await getQuery(
    'SELECT lastSyncedAt FROM bankConnections WHERE id = ? AND userId = ?',
    [bankConnectionId, userId]
  );

  const startDate = connection?.lastSyncedAt
    ? new Date(connection.lastSyncedAt).toISOString().split('T')[0]
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const plaidData = await fetchPlaidTransactions(accessToken, startDate, endDate);
  const transactions = plaidData.transactions || [];

  const syncedTransactions: any[] = [];

  for (const tx of transactions) {
    // Skip if already synced
    const existing = await getQuery(
      'SELECT id FROM plaidTransactions WHERE plaidTransactionId = ?',
      [tx.transaction_id]
    );
    if (existing) continue;

    const id = uuidv4();
    const category = mapPlaidCategory(tx.category || []);
    const description = tx.name || tx.merchant_name || 'Unknown Transaction';
    const amount = Math.abs(tx.amount);
    const type = tx.amount < 0 ? 'expense' : 'income';

    await runQuery(
      `INSERT INTO plaidTransactions (id, userId, plaidTransactionId, bankConnectionId, amount, description, category, date, merchantName, pending, syncedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, userId, tx.transaction_id, bankConnectionId, amount, description, category, tx.date, tx.merchant_name || null, tx.pending ? 1 : 0, Date.now()]
    );

    syncedTransactions.push({
      id,
      plaidTransactionId: tx.transaction_id,
      amount,
      description,
      category,
      type,
      date: tx.date,
      merchantName: tx.merchant_name,
      pending: tx.pending
    });
  }

  // Update lastSyncedAt
  await runQuery(
    'UPDATE bankConnections SET lastSyncedAt = ? WHERE id = ?',
    [Date.now(), bankConnectionId]
  );

  return syncedTransactions;
};

/**
 * Get pending Plaid transactions that need user labeling
 */
export const getPendingPlaidTransactions = async (userId: string): Promise<any[]> => {
  return allQuery(
    `SELECT pt.*, bc.bankName 
     FROM plaidTransactions pt 
     JOIN bankConnections bc ON pt.bankConnectionId = bc.id 
     WHERE pt.userId = ? AND (pt.userLabel IS NULL OR pt.userLabel = '') 
     ORDER BY pt.date DESC`,
    [userId]
  );
};

/**
 * Update a Plaid transaction with user-provided label and category
 */
export const labelPlaidTransaction = async (
  transactionId: string,
  userId: string,
  userLabel: string,
  userCategory: string
): Promise<boolean> => {
  const tx = await getQuery(
    'SELECT id FROM plaidTransactions WHERE id = ? AND userId = ?',
    [transactionId, userId]
  );
  if (!tx) return false;

  await runQuery(
    'UPDATE plaidTransactions SET userLabel = ?, userCategory = ? WHERE id = ?',
    [userLabel, userCategory, transactionId]
  );
  return true;
};

/**
 * Convert a labeled Plaid transaction into an expense record
 */
export const importPlaidTransactionAsExpense = async (
  transactionId: string,
  userId: string
): Promise<any> => {
  const tx = await getQuery(
    'SELECT * FROM plaidTransactions WHERE id = ? AND userId = ?',
    [transactionId, userId]
  );
  if (!tx) throw new Error('Transaction not found');

  const description = tx.userLabel || tx.description;
  const category = tx.userCategory || tx.category || 'Other';
  const type = tx.amount > 0 ? 'expense' : 'income';

  const expenseId = uuidv4();
  const now = Date.now();

  await runQuery(
    'INSERT INTO expenses (id, userId, amount, category, type, date, description, paymentMethod, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [expenseId, userId, Math.abs(tx.amount), category, type, tx.date, description, 'online', now, now]
  );

  return { id: expenseId, amount: Math.abs(tx.amount), category, type, date: tx.date, description, paymentMethod: 'online', createdAt: now };
};

/**
 * Map Plaid categories to our app categories
 */
const mapPlaidCategory = (plaidCategories: string[]): string => {
  const catStr = plaidCategories.join(' ').toLowerCase();

  if (catStr.includes('food') || catStr.includes('restaurant') || catStr.includes('dining')) return 'Food & Dining';
  if (catStr.includes('groceries') || catStr.includes('supermarket')) return 'Groceries';
  if (catStr.includes('transport') || catStr.includes('travel') || catStr.includes('taxi')) return 'Transport';
  if (catStr.includes('fuel') || catStr.includes('gas')) return 'Fuel';
  if (catStr.includes('rent') || catStr.includes('housing')) return 'Housing & Rent';
  if (catStr.includes('utility') || catStr.includes('electric') || catStr.includes('water')) return 'Utilities (Bills)';
  if (catStr.includes('entertainment') || catStr.includes('recreation')) return 'Entertainment';
  if (catStr.includes('health') || catStr.includes('medical') || catStr.includes('pharmacy')) return 'Health & Medical';
  if (catStr.includes('shopping') || catStr.includes('clothing')) return 'Shopping';
  if (catStr.includes('subscription') || catStr.includes('membership')) return 'Subscriptions';
  if (catStr.includes('education') || catStr.includes('school')) return 'Education';
  if (catStr.includes('insurance')) return 'Insurance';
  if (catStr.includes('income') || catStr.includes('payroll') || catStr.includes('salary')) return 'Salary';
  if (catStr.includes('transfer')) return 'Other';
  return 'Other';
};

export default { createPlaidLinkToken, exchangePlaidPublicToken, fetchPlaidTransactions, syncPlaidTransactions };
