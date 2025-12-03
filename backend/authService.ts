import { v4 as uuidv4 } from 'uuid';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { runQuery, getQuery, allQuery } from './database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

interface UserData {
  name: string;
  email: string;
  password: string;
  monthlyIncome: number;
  currency: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  monthlyIncome: number;
  currency: string;
  createdAt: number;
}

export const registerUser = async (userData: UserData): Promise<UserProfile> => {
  const existingUser = await getQuery('SELECT id FROM users WHERE email = ?', [userData.email]);
  if (existingUser) {
    throw new Error('Email already registered');
  }

  const userId = uuidv4();
  const hashedPassword = await bcryptjs.hash(userData.password, 10);
  const now = Date.now();

  await runQuery(
    'INSERT INTO users (id, name, email, password, monthlyIncome, currency, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, userData.name, userData.email, hashedPassword, userData.monthlyIncome, userData.currency, now, now]
  );

  return {
    id: userId,
    name: userData.name,
    email: userData.email,
    monthlyIncome: userData.monthlyIncome,
    currency: userData.currency,
    createdAt: now
  };
};

export const loginUser = async (email: string, password: string): Promise<{ user: UserProfile; token: string }> => {
  const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const passwordMatch = await bcryptjs.compare(password, user.password);
  if (!passwordMatch) {
    throw new Error('Invalid email or password');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome,
      currency: user.currency,
      createdAt: user.createdAt
    },
    token
  };
};

export const verifyToken = (token: string): { userId: string; email: string } => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const getUserById = async (userId: string): Promise<UserProfile | null> => {
  const user = await getQuery('SELECT id, name, email, monthlyIncome, currency, createdAt FROM users WHERE id = ?', [userId]);
  return user || null;
};

export const updateUserProfile = async (userId: string, updates: Partial<UserData>): Promise<UserProfile> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const now = Date.now();
  const updateFields = [];
  const params = [];

  if (updates.name) {
    updateFields.push('name = ?');
    params.push(updates.name);
  }
  if (updates.monthlyIncome) {
    updateFields.push('monthlyIncome = ?');
    params.push(updates.monthlyIncome);
  }

  if (updateFields.length === 0) {
    return user;
  }

  updateFields.push('updatedAt = ?');
  params.push(now);
  params.push(userId);

  await runQuery(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`, params);

  const updated = await getUserById(userId);
  return updated || user;
};

export const deleteUserAccount = async (userId: string): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await runQuery('DELETE FROM users WHERE id = ?', [userId]);
};

export const resetUserData = async (userId: string): Promise<void> => {
  const user = await getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  await runQuery('DELETE FROM expenses WHERE userId = ?', [userId]);
};
