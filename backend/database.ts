import sqlite3 from 'sqlite3';
import { promisify } from 'util';

let db: sqlite3.Database;

export const initializeDatabase = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./spendsmart.db', (err) => {
      if (err) reject(err);
      else {
        createTables().then(resolve).catch(reject);
      }
    });
  });
};

const createTables = async (): Promise<void> => {
  const runAsync = promisify(db.run.bind(db));

  await runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      monthlyIncome REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'INR',
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS bankConnections (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bankName TEXT NOT NULL,
      accountNumber TEXT NOT NULL,
      isConnected BOOLEAN DEFAULT 0,
      lastSyncedAt INTEGER,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  await runAsync(`
    CREATE TABLE IF NOT EXISTS smsTransactions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      senderBank TEXT NOT NULL,
      messageContent TEXT NOT NULL,
      parsedCategory TEXT,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);
};

export const getDatabase = (): sqlite3.Database => db;

export const runQuery = (query: string, params: any[] = []): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(query, params, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const getQuery = (query: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const allQuery = (query: string, params: any[] = []): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};
