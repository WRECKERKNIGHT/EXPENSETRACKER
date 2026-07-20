// Simple rule-based auto-categorizer
const RULES: Array<{ pattern: RegExp; category: string }> = [
  { pattern: /uber|ola|taxi|cab/i, category: 'Transport' },
  { pattern: /coffee|starbucks|cafe/i, category: 'Food' },
  { pattern: /walmart|grocery|supermarket/i, category: 'Groceries' },
  { pattern: /rent|landlord/i, category: 'Rent' },
  { pattern: /salary|payroll|pay/i, category: 'Income' },
];

export const predictCategory = (text: string) => {
  for (const r of RULES) {
    if (r.pattern.test(text)) return r.category;
  }
  return 'Uncategorized';
};

export default {};
