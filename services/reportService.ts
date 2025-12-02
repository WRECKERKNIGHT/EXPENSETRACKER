// Lightweight report service: prepares CSV exports and summary payloads
import { getExpensesAPI } from './apiService';

export const exportExpensesCSV = async () => {
  const data: any = await getExpensesAPI();
  const rows = (data && data.expenses) || data || [];
  const header = ['id', 'date', 'type', 'category', 'amount', 'currency', 'description'];
  const csv = [header.join(',')];
  rows.forEach((r: any) => {
    csv.push([
      r.id || '',
      r.date || '',
      r.type || '',
      (r.category || '').replace(/,/g, ' '),
      r.amount || 0,
      r.currency || '',
      (r.description || '').replace(/,/g, ' '),
    ].join(','));
  });
  return csv.join('\n');
};

export const getSummary = async () => {
  const data: any = await getExpensesAPI();
  const rows = (data && data.expenses) || data || [];
  const total = rows.reduce((acc: number, r: any) => acc + (r.amount || 0), 0);
  return { count: rows.length, total };
};

export default {};
