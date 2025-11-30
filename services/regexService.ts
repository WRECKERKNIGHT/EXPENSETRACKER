
import { Expense, Category, TransactionType } from '../types';

// Regex Patterns for Indian Financial SMS
const PATTERNS = {
  // Amount: Matches Rs. 500, INR 500, 500.00
  amount: /(?:rs\.?|inr)\s*[\.]?\s*([0-9,]+(?:\.[0-9]{1,2})?)/i,
  
  // Merchant/Description Extraction
  merchantAt: /(?:at|to|from)\s+([a-z0-9\s\&\-\.]+?)(?:\s+(?:on|using|via|ref|txn)|$|\.)/i,
  merchantVpa: /(?:vpa|upi)\s+([a-z0-9\.\@]+)/i,
  
  // Date Formats: DD-MM-YY, DD/MM/YYYY
  date: /([0-9]{1,2}[-\/][0-9]{1,2}[-\/][0-9]{2,4})/i,
  
  // Keywords
  credit: /(?:credited|received|deposited|added)/i,
  debit: /(?:debited|spent|paid|sent|withdrawn)/i,
  account: /(?:a\/c|acct|account)\s+.*([0-9]{3,4})/i
};

export const parseLocalSMS = (text: string): Partial<Expense>[] => {
  const lines = text.split(/\r?\n|\. /); // Split by newlines or sentences
  const transactions: Partial<Expense>[] = [];
  const today = new Date().toISOString().split('T')[0];

  lines.forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine.length < 10) return;

    // 1. Detect Type
    let type: TransactionType | null = null;
    if (PATTERNS.credit.test(cleanLine)) type = 'income';
    else if (PATTERNS.debit.test(cleanLine)) type = 'expense';
    
    // If no clear keyword, check context (UPI/Payment usually implies expense if not specified)
    if (!type) {
        if (cleanLine.toLowerCase().includes('paid to') || cleanLine.toLowerCase().includes('sent to')) type = 'expense';
        else if (cleanLine.toLowerCase().includes('received from')) type = 'income';
    }

    if (!type) return; // Skip non-transaction lines

    // 2. Extract Amount
    const amountMatch = cleanLine.match(PATTERNS.amount);
    if (!amountMatch) return;
    const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

    // 3. Extract Date
    let date = today;
    const dateMatch = cleanLine.match(PATTERNS.date);
    if (dateMatch) {
      date = standardizeDate(dateMatch[1]) || today;
    }

    // 4. Extract Merchant / Description
    let description = 'Unknown Transaction';
    const merchantMatch = cleanLine.match(PATTERNS.merchantAt);
    const vpaMatch = cleanLine.match(PATTERNS.merchantVpa);

    if (merchantMatch && merchantMatch[1].length > 2) {
      description = merchantMatch[1].trim();
    } else if (vpaMatch) {
      description = vpaMatch[1].trim();
    } else {
      // Fallback: Use keywords
      if (cleanLine.toLowerCase().includes('swiggy')) description = 'Swiggy';
      else if (cleanLine.toLowerCase().includes('zomato')) description = 'Zomato';
      else if (cleanLine.toLowerCase().includes('uber')) description = 'Uber';
      else if (cleanLine.toLowerCase().includes('amazon')) description = 'Amazon';
    }

    // 5. Infer Category
    const category = inferCategory(description);

    transactions.push({
      amount,
      type,
      date,
      description: toTitleCase(description),
      category
    });
  });

  return transactions;
};

// --- Helpers ---

const standardizeDate = (dateStr: string): string | null => {
  try {
    const parts = dateStr.split(/[-/]/);
    if (parts.length === 3) {
      let d = parseInt(parts[0]);
      let m = parseInt(parts[1]);
      let y = parseInt(parts[2]);
      if (y < 100) y += 2000;
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
    return null;
  } catch { return null; }
};

const inferCategory = (desc: string): Category => {
  const d = desc.toLowerCase();
  if (d.includes('swiggy') || d.includes('zomato') || d.includes('food') || d.includes('restaurant')) return Category.FOOD;
  if (d.includes('mart') || d.includes('grocery') || d.includes('bigbasket') || d.includes('blinkit')) return Category.GROCERIES;
  if (d.includes('uber') || d.includes('ola') || d.includes('fuel') || d.includes('shell') || d.includes('petrol')) return Category.TRANSPORT;
  if (d.includes('jio') || d.includes('airtel') || d.includes('act') || d.includes('bescom')) return Category.UTILITIES;
  if (d.includes('netflix') || d.includes('spotify') || d.includes('prime')) return Category.SUBSCRIPTIONS;
  if (d.includes('amazon') || d.includes('flipkart') || d.includes('myntra')) return Category.SHOPPING;
  if (d.includes('salary') || d.includes('credit')) return Category.SALARY;
  return Category.OTHER;
};

const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};
