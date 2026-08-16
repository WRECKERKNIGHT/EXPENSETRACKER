const API_URL = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

let authToken: string | null = localStorage.getItem('spendsmart_token');

export const setAuthToken = (token: string) => {
  authToken = token;
  localStorage.setItem('spendsmart_token', token);
};

export const getAuthToken = () => authToken;

export const clearAuthToken = () => {
  authToken = null;
  localStorage.removeItem('spendsmart_token');
};

const makeRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData: any = await response.json();
    throw new Error(errorData?.error || 'API Error');
  }

  const data: any = await response.json();
  return data as T;
};

// ===== AUTH API =====

export const registerAPI = async (userData: {
  name: string;
  email: string;
  password: string;
  monthlyIncome: number;
  currency?: string;
}) => {
  const response: any = await makeRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response.user;
};

export const loginAPI = async (email: string, password: string) => {
  const response: any = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  if (response.token) {
    setAuthToken(response.token);
  }
  return response.user;
};

export const getCurrentUserAPI = async () => {
  try {
    return await makeRequest('/auth/me', { method: 'GET' });
  } catch (error) {
    clearAuthToken();
    throw error;
  }
};

export const updateProfileAPI = async (updates: { name?: string; monthlyIncome?: number }) => {
  return makeRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

// ===== BUDGET API =====

export const getBudgetsAPI = async () => {
  return makeRequest('/budgets', { method: 'GET' });
};

export const createBudgetAPI = async (category: string, monthlyLimit: number) => {
  return makeRequest('/budgets', {
    method: 'POST',
    body: JSON.stringify({ category, monthlyLimit }),
  });
};

export const updateBudgetAPI = async (id: string, monthlyLimit: number) => {
  return makeRequest(`/budgets/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ monthlyLimit }),
  });
};

export const deleteBudgetAPI = async (id: string) => {
  return makeRequest(`/budgets/${id}`, { method: 'DELETE' });
};

// ===== EXPENSE API =====

export const createExpenseAPI = async (expenseData: {
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  description: string;
}) => {
  return makeRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(expenseData),
  });
};

export const getExpensesAPI = async () => {
  return makeRequest('/expenses', { method: 'GET' });
};

export const updateExpenseAPI = async (
  id: string,
  updates: Partial<{
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
  }>
) => {
  return makeRequest(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteExpenseAPI = async (id: string) => {
  return makeRequest(`/expenses/${id}`, { method: 'DELETE' });
};

export const bulkCreateExpensesAPI = async (
  expenses: Array<{
    amount: number;
    category: string;
    type: 'income' | 'expense';
    date: string;
    description: string;
  }>
) => {
  return makeRequest('/expenses/bulk', {
    method: 'POST',
    body: JSON.stringify({ expenses }),
  });
};

// ===== BANK API =====

export const connectBankAPI = async (bankName: string, accountNumber: string) => {
  return makeRequest('/bank/connect', {
    method: 'POST',
    body: JSON.stringify({ bankName, accountNumber }),
  });
};

export const getBankConnectionsAPI = async () => {
  return makeRequest('/bank/connections', { method: 'GET' });
};

export const disconnectBankAPI = async (connectionId: string) => {
  return makeRequest(`/bank/connections/${connectionId}`, { method: 'DELETE' });
};

export const uploadBankCSVAPI = async (connectionId: string, csvContent: string) => {
  return makeRequest('/bank/upload', {
    method: 'POST',
    body: JSON.stringify({ connectionId, csvContent }),
  });
};

// ===== SMS API =====

export const parseSMSAPI = async (messageContent: string, senderBank: string) => {
  return makeRequest('/sms/parse', {
    method: 'POST',
    body: JSON.stringify({ messageContent, senderBank }),
  });
};

export const getSMSTransactionsAPI = async () => {
  return makeRequest('/sms/transactions', { method: 'GET' });
};
