import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './database';
import { registerUser, loginUser, verifyToken, getUserById, updateUserProfile, deleteUserAccount, resetUserData, setPasswordResetToken, resetPasswordWithToken } from './authService';
import { createExpense, getExpenses, updateExpense, deleteExpense, bulkCreateExpenses } from './expenseService';
import { connectBank, getBankConnections, saveSMSTransaction, getSMSTransactions, disconnectBank } from './bankService';
import { createPlaidLinkToken, exchangePlaidPublicToken } from './plaidService';
import { getBudgets, createBudget, updateBudget, deleteBudget } from './budgetService';
import { getRecurringPayments, createRecurringPayment, deleteRecurringPayment } from './recurringService';

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

// Mock Google OAuth flow for local development
app.get('/api/auth/mock-google', async (req: Request, res: Response) => {
  try {
    // Create or login a test Google user
    const email = process.env.MOCK_GOOGLE_EMAIL || 'google.user@example.com';
    const name = process.env.MOCK_GOOGLE_NAME || 'Google User';
    const password = process.env.MOCK_GOOGLE_PASSWORD || 'google-oauth-token';

    // Try to register (registerUser should throw if exists)
    try {
      await registerUser({ name, email, password, monthlyIncome: 30000, currency: 'INR' });
    } catch (e) {
      // ignore if exists
    }

    // Login and produce token
    const { user, token } = await loginUser(email, password);

    // Return a tiny HTML page that posts the token to the opener and closes
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Mock Google OAuth</title></head><body style="font-family:Arial,Helvetica,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#fff"><div style="text-align:center;max-width:380px;padding:20px;border-radius:12px;background:linear-gradient(180deg,#111827,#081226);box-shadow:0 10px 30px rgba(0,0,0,0.6)"><h2 style="margin-bottom:8px">Mock Google Consent</h2><p style="color:#9ca3af;margin-bottom:16px">This simulates Google OAuth for local development. Click authorize to continue.</p><button id="auth" style="padding:10px 18px;border-radius:8px;background:#4f46e5;border:none;color:#fff;font-weight:600;cursor:pointer">Authorize</button></div><script>document.getElementById('auth').addEventListener('click',()=>{const payload = ${JSON.stringify({ token: '${token}', user: user })}; if(window.opener){window.opener.postMessage(payload,'*');} window.close();});</script></body></html>`;

    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error: any) {
    res.status(500).send(`Error: ${error.message}`);
  }
});

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

    // Auto-login after registration: generate token
    try {
      const loginResult = await loginUser(email, password);
      res.status(201).json({ user: loginResult.user, token: loginResult.token });
    } catch (err) {
      // If login failed for some reason, still return user without token
      res.status(201).json({ user });
    }
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

app.post('/api/auth/reset-data', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await resetUserData(req.userId!);
    res.json({ message: 'Data reset successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/auth/account', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await deleteUserAccount(req.userId!);
    res.json({ message: 'Account deleted' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ===== PASSWORD RESET =====
app.post('/api/auth/forgot', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const token = require('crypto').randomBytes(24).toString('hex');
    const expiryMs = 1000 * 60 * 60; // 1 hour
    await setPasswordResetToken(email, token, expiryMs);

    const showToken = process.env.SHOW_RESET_TOKEN === 'true';
    res.json({ success: true, debugToken: showToken ? token : undefined });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/reset', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Token and password required' });
    await resetPasswordWithToken(token, password);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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

// ===== BUDGET ROUTES =====

app.get('/api/budgets', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const budgets = await getBudgets(req.userId!);
    res.json(budgets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/budgets', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { category, monthlyLimit } = req.body;

    if (!category || !monthlyLimit) {
      return res.status(400).json({ error: 'Category and monthlyLimit are required' });
    }

    const budget = await createBudget(req.userId!, category, Number(monthlyLimit));
    res.status(201).json(budget);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/budgets/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { monthlyLimit } = req.body;
    if (!monthlyLimit) {
      return res.status(400).json({ error: 'monthlyLimit is required' });
    }

    const updated = await updateBudget(req.userId!, req.params.id, Number(monthlyLimit));
    if (!updated) {
      return res.status(404).json({ error: 'Budget not found' });
    }

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/budgets/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await deleteBudget(req.userId!, req.params.id);
    res.json({ message: 'Budget deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== RECURRING PAYMENTS ROUTES =====

app.get('/api/recurring', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const items = await getRecurringPayments(req.userId!);
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/recurring', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, amount, category, dueDay } = req.body;
    if (!name || !amount || !category || !dueDay) {
      return res.status(400).json({ error: 'name, amount, category and dueDay are required' });
    }
    const created = await createRecurringPayment(req.userId!, {
      name,
      amount: Number(amount),
      category,
      dueDay: Number(dueDay),
    });
    res.status(201).json(created);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/recurring/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    await deleteRecurringPayment(req.userId!, req.params.id);
    res.json({ message: 'Recurring payment deleted' });
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

// Upload bank CSV and import transactions
app.post('/api/bank/upload', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { connectionId, csvContent } = req.body;
    if (!connectionId || !csvContent) return res.status(400).json({ error: 'connectionId and csvContent required' });

    // Simple CSV parser: expect header with date,description,amount,type (type optional)
    const lines = csvContent.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    const header = lines.shift();
    if (!header) return res.status(400).json({ error: 'Empty CSV' });

    const cols = header.split(',').map((c: string) => c.trim().toLowerCase());
    const idxDate = cols.indexOf('date');
    const idxDesc = cols.indexOf('description');
    const idxAmount = cols.indexOf('amount');
    const idxType = cols.indexOf('type');

    if (idxDate === -1 || idxDesc === -1 || idxAmount === -1) return res.status(400).json({ error: 'CSV must contain date,description,amount columns' });

    const expensesToCreate: any[] = [];
    for (const line of lines) {
      const parts = line.split(',').map((p: string) => p.trim());
      const date = parts[idxDate];
      const description = parts[idxDesc];
      const amountRaw = parts[idxAmount].replace(/[^0-9.-]/g, '');
      const amount = parseFloat(amountRaw) || 0;
      const type = (idxType !== -1 && parts[idxType]) ? (parts[idxType].toLowerCase().includes('credit') ? 'income' : 'expense') : (amount >= 0 ? 'income' : 'expense');

      expensesToCreate.push({ amount: Math.abs(amount), category: 'Other', type, date, description });
    }

    const created = await bulkCreateExpenses(req.userId!, expensesToCreate);
    res.json({ imported: created.length, items: created });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== PLAID SCAFFOLD ROUTES (requires PLAID_CLIENT_ID, PLAID_SECRET env vars)
app.post('/api/bank/plaid/link_token', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const result = await createPlaidLinkToken(req.userId!);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank/plaid/exchange', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { publicToken } = req.body;
    if (!publicToken) return res.status(400).json({ error: 'publicToken required' });
    const result = await exchangePlaidPublicToken(req.userId!, publicToken);
    // In a real app you'd persist access_token and item_id securely
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== SMS FORWARDER ENDPOINT =====
// Accepts an array of SMS messages from a trusted mobile companion or forwarder
app.post('/api/sms/forward', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages must be an array' });

    const results: any[] = [];
    for (const msg of messages) {
      // Expect each msg to have { messageContent, senderBank }
      if (!msg.messageContent || !msg.senderBank) continue;
      try {
        const saved = await saveSMSTransaction(req.userId!, { messageContent: msg.messageContent, senderBank: msg.senderBank });
        results.push({ ok: true, saved });
      } catch (err: any) {
        results.push({ ok: false, error: err.message });
      }
    }

    res.json({ processed: results.length, results });
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
