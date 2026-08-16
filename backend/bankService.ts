import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { runQuery, getQuery, allQuery } from './database';

interface SMSTransaction {
  id: string;
  userId: string;
  amount: number;
  senderBank: string;
  messageContent: string;
  parsedCategory: string;
  createdAt: number;
}

interface BankConnection {
  id: string;
  userId: string;
  bankName: string;
  accountNumber: string;
  isConnected: boolean;
  lastSyncedAt: number | null;
  createdAt: number;
}

// Parse SMS messages to extract transaction data
export const parseSMSTransaction = (message: string): { amount: number; category: string; description: string } => {
  // Extract amount pattern: Rs., ₹, INR
  const amountMatch = message.match(/(?:Rs\.|₹|INR)\s*([0-9,]+(?:\.[0-9]{2})?)/i);
  const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : 0;

  // Detect transaction type and category
  let category = 'Other';
  let description = 'SMS Transaction';

  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('grocery') || lowerMessage.includes('supermarket') || lowerMessage.includes('mart')) {
    category = 'Groceries';
    description = 'Grocery Purchase';
  } else if (lowerMessage.includes('fuel') || lowerMessage.includes('petrol') || lowerMessage.includes('gas')) {
    category = 'Fuel';
    description = 'Fuel Purchase';
  } else if (lowerMessage.includes('restaurant') || lowerMessage.includes('food') || lowerMessage.includes('cafe')) {
    category = 'Food & Dining';
    description = 'Restaurant/Cafe';
  } else if (lowerMessage.includes('medical') || lowerMessage.includes('hospital') || lowerMessage.includes('pharmacy')) {
    category = 'Health & Medical';
    description = 'Medical Expense';
  } else if (lowerMessage.includes('bill') || lowerMessage.includes('utility') || lowerMessage.includes('water') || lowerMessage.includes('electricity')) {
    category = 'Utilities (Bills)';
    description = 'Utility Bill';
  } else if (lowerMessage.includes('emi') || lowerMessage.includes('loan') || lowerMessage.includes('installment')) {
    category = 'EMI / Loan';
    description = 'EMI Payment';
  } else if (lowerMessage.includes('transfer') || lowerMessage.includes('salary') || lowerMessage.includes('credited')) {
    category = 'Salary';
    description = 'Income Transfer';
  } else if (lowerMessage.includes('shopping') || lowerMessage.includes('mall') || lowerMessage.includes('store')) {
    category = 'Shopping';
    description = 'Shopping Purchase';
  }

  return { amount, category, description };
};

// Save SMS transaction
export const saveSMSTransaction = async (userId: string, smsData: any): Promise<SMSTransaction> => {
  const id = uuidv4();
  const now = Date.now();
  const { amount, category, description } = parseSMSTransaction(smsData.messageContent);

  await runQuery(
    'INSERT INTO smsTransactions (id, userId, amount, senderBank, messageContent, parsedCategory, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id, userId, amount, smsData.senderBank, smsData.messageContent, category, now]
  );

  return {
    id,
    userId,
    amount,
    senderBank: smsData.senderBank,
    messageContent: smsData.messageContent,
    parsedCategory: category,
    createdAt: now
  };
};

// Get SMS transactions
export const getSMSTransactions = async (userId: string): Promise<SMSTransaction[]> => {
  return allQuery('SELECT * FROM smsTransactions WHERE userId = ? ORDER BY createdAt DESC', [userId]);
};

// Connect bank account
export const connectBank = async (
  userId: string,
  bankName: string,
  accountNumber: string
): Promise<BankConnection> => {
  const id = uuidv4();
  const now = Date.now();

  // In real implementation, this would connect to actual bank API
  // For now, we'll simulate a successful connection
  await runQuery(
    'INSERT INTO bankConnections (id, userId, bankName, accountNumber, isConnected, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [id, userId, bankName, accountNumber, 1, now]
  );

  return {
    id,
    userId,
    bankName,
    accountNumber,
    isConnected: true,
    lastSyncedAt: null,
    createdAt: now
  };
};

// Get bank connections
export const getBankConnections = async (userId: string): Promise<BankConnection[]> => {
  return allQuery('SELECT * FROM bankConnections WHERE userId = ?', [userId]);
};

// Sync bank transactions
export const syncBankTransactions = async (userId: string, bankConnectionId: string): Promise<any[]> => {
  const connection = await getQuery(
    'SELECT * FROM bankConnections WHERE id = ? AND userId = ?',
    [bankConnectionId, userId]
  );

  if (!connection || !connection.isConnected) {
    throw new Error('Bank connection not found or not connected');
  }

  // In real implementation, this would call actual bank API
  // For now, we'll simulate fetching transactions
  const transactions: any[] = [];

  await runQuery('UPDATE bankConnections SET lastSyncedAt = ? WHERE id = ?', [Date.now(), bankConnectionId]);

  return transactions;
};

// Disconnect bank
export const disconnectBank = async (userId: string, bankConnectionId: string): Promise<boolean> => {
  const connection = await getQuery(
    'SELECT * FROM bankConnections WHERE id = ? AND userId = ?',
    [bankConnectionId, userId]
  );

  if (!connection) return false;

  await runQuery('DELETE FROM bankConnections WHERE id = ?', [bankConnectionId]);
  return true;
};
