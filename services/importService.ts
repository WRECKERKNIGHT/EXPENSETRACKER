
import { Expense, Category, TransactionType } from '../types';

// Simple CSV Parser for client-side use
export const parseCSVStatement = async (file: File): Promise<Partial<Expense>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        reject(new Error("Empty file"));
        return;
      }

      const lines = text.split(/\r?\n/);
      const extracted: Partial<Expense>[] = [];
      
      // Heuristic: Find the header row
      let headerIndex = -1;
      let headers: string[] = [];
      
      // Common column names in Indian Bank Statements
      const dateTerms = ['date', 'txn date', 'transaction date', 'value date'];
      const descTerms = ['description', 'narration', 'particulars', 'remarks', 'details'];
      const debitTerms = ['debit', 'withdrawal', 'dr', 'debit amount'];
      const creditTerms = ['credit', 'deposit', 'cr', 'credit amount'];
      
      // 1. Locate Header
      for (let i = 0; i < Math.min(lines.length, 20); i++) {
        const line = lines[i].toLowerCase();
        if (dateTerms.some(term => line.includes(term)) && 
           (debitTerms.some(term => line.includes(term)) || creditTerms.some(term => line.includes(term)))) {
          headerIndex = i;
          headers = lines[i].split(',').map(h => h.trim().toLowerCase());
          break;
        }
      }

      if (headerIndex === -1) {
        reject(new Error("Could not detect valid bank statement headers. Please ensure the CSV has Date, Description, and Debit/Credit columns."));
        return;
      }

      // 2. Identify Column Indices
      const dateIdx = headers.findIndex(h => dateTerms.some(t => h.includes(t)));
      const descIdx = headers.findIndex(h => descTerms.some(t => h.includes(t)));
      const debitIdx = headers.findIndex(h => debitTerms.some(t => h.includes(t)));
      const creditIdx = headers.findIndex(h => creditTerms.some(t => h.includes(t)));

      // 3. Parse Rows
      for (let i = headerIndex + 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]); // Handle quoted CSV values
        if (row.length < headers.length) continue;

        const dateStr = row[dateIdx];
        const descStr = row[descIdx];
        const debitStr = debitIdx !== -1 ? row[debitIdx] : '0';
        const creditStr = creditIdx !== -1 ? row[creditIdx] : '0';

        // Parse Amounts (Remove commas, handle empty strings)
        const debit = parseFloat(debitStr.replace(/,/g, '') || '0');
        const credit = parseFloat(creditStr.replace(/,/g, '') || '0');

        if (isNaN(debit) && isNaN(credit)) continue;
        if (debit === 0 && credit === 0) continue;

        // Parse Date (Try to standardize to YYYY-MM-DD)
        // Supported: DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD
        const formattedDate = standardizeDate(dateStr);
        if (!formattedDate) continue;

        const amount = debit > 0 ? debit : credit;
        const type: TransactionType = debit > 0 ? 'expense' : 'income';
        
        // Infer Category from Description
        const category = inferCategory(descStr);

        extracted.push({
          date: formattedDate,
          description: cleanDescription(descStr),
          amount: amount,
          type: type,
          category: category
        });
      }

      resolve(extracted);
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};

// Helper: Handle CSV rows with quotes (e.g., "Dining, Food", 100)
const parseCSVRow = (row: string): string[] => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

// Helper: Infer Category
const inferCategory = (desc: string): Category => {
  const d = desc.toLowerCase();
  if (d.includes('swiggy') || d.includes('zomato') || d.includes('restaurant') || d.includes('food')) return Category.FOOD;
  if (d.includes('uber') || d.includes('ola') || d.includes('petrol') || d.includes('fuel') || d.includes('shell')) return Category.TRANSPORT;
  if (d.includes('jio') || d.includes('airtel') || d.includes('bill') || d.includes('electricity')) return Category.UTILITIES;
  if (d.includes('amazon') || d.includes('flipkart') || d.includes('myntra') || d.includes('shop')) return Category.SHOPPING;
  if (d.includes('salary') || d.includes('neft') || d.includes('imps')) return Category.SALARY;
  if (d.includes('loan') || d.includes('emi')) return Category.EMI;
  if (d.includes('netflix') || d.includes('spotify') || d.includes('prime')) return Category.SUBSCRIPTIONS;
  if (d.includes('doctor') || d.includes('pharmacy') || d.includes('hospital')) return Category.HEALTH;
  return Category.OTHER;
};

// Helper: Clean Description
const cleanDescription = (desc: string) => {
  return desc.replace(/['"]/g, '').replace(/MPS\/|UPI\/|NEFT\//g, '').trim() || 'Bank Transaction';
};

// Helper: Standardize Date
const standardizeDate = (dateStr: string): string | null => {
  try {
    // Handle DD/MM/YYYY or DD-MM-YYYY
    if (dateStr.includes('/') || dateStr.includes('-')) {
      const parts = dateStr.split(/[-/]/);
      if (parts.length === 3) {
        // Assume Day is first if > 12, or generally ambiguous unless year is last
        let d = parseInt(parts[0]);
        let m = parseInt(parts[1]);
        let y = parseInt(parts[2]);
        
        // Fix 2 digit years
        if (y < 100) y += 2000;
        
        // If first part is huge, it's YYYY-MM-DD
        if (d > 1000) {
            return `${d}-${String(m).padStart(2, '0')}-${String(y).padStart(2, '0')}`; // Actually Y-M-D
        }
        
        return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    return null;
  } catch {
    return null;
  }
};
