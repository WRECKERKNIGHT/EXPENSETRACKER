import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { registerUser, loginUser, verifyToken, getUserById, updateUserProfile } from './authService';
import { createExpense, getExpenses, updateExpense, deleteExpense, bulkCreateExpenses } from './expenseService';
import { connectBank, getBankConnections, saveSMSTransaction, getSMSTransactions, disconnectBank } from './bankService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
interface AuthRequest extends Request {
  userId?: string;
  email?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    req.email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SpendSmart API is running' });
});

// ===== AUTH ROUTES =====

app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, monthlyIncome, currency } = req.body;

    if (!name || !email || !password || !monthlyIncome) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const user = await registerUser({
      name,
      email,
      password,
      monthlyIncome,
      currency: currency || 'INR'
    });

    res.status(201).json({ user });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const { user, token } = await loginUser(email, password);

    res.json({ user, token });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserById(req.userId!);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/auth/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, monthlyIncome } = req.body;
    const user = await updateUserProfile(req.userId!, { name, monthlyIncome });
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== EXPENSE ROUTES =====

app.post('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, type, date, description } = req.body;

    if (!amount || !category || !type || !date || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = await createExpense(req.userId!, { amount, category, type, date, description });
    res.status(201).json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/expenses', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const expenses = await getExpenses(req.userId!);
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { amount, category, type, date, description } = req.body;
    const expense = await updateExpense(req.params.id, req.userId!, { amount, category, type, date, description });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json(expense);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/expenses/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const success = await deleteExpense(req.params.id, req.userId!);

    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/expenses/bulk', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { expenses } = req.body;

    if (!Array.isArray(expenses)) {
      return res.status(400).json({ error: 'Expenses must be an array' });
    }

    const created = await bulkCreateExpenses(req.userId!, expenses);
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== BANK ROUTES =====

app.post('/api/bank/connect', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { bankName, accountNumber } = req.body;

    if (!bankName || !accountNumber) {
      return res.status(400).json({ error: 'Bank name and account number required' });
    }

    const connection = await connectBank(req.userId!, bankName, accountNumber);
    res.status(201).json(connection);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/bank/connections', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const connections = await getBankConnections(req.userId!);
    res.json(connections);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bank/connections/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const success = await disconnectBank(req.userId!, req.params.id);

    if (!success) {
      return res.status(404).json({ error: 'Connection not found' });
    }

    res.json({ message: 'Bank disconnected' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SMS ROUTES =====

app.post('/api/sms/parse', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { messageContent, senderBank } = req.body;

    if (!messageContent || !senderBank) {
      return res.status(400).json({ error: 'Message content and sender bank required' });
    }

    const transaction = await saveSMSTransaction(req.userId!, { messageContent, senderBank });
    res.status(201).json(transaction);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/sms/transactions', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await getSMSTransactions(req.userId!);
    res.json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== ERROR HANDLING =====

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`🚀 SpendSmart API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
