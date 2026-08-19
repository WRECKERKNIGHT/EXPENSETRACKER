
import { Expense, Category, TransactionType } from '../types';

// === CATEGORY COLORS ===
export const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; hex: string }> = {
  [Category.FOOD]:            { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30', hex: '#f97316' },
  [Category.GROCERIES]:       { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30', hex: '#10b981' },
  [Category.TRANSPORT]:       { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30', hex: '#3b82f6' },
  [Category.FUEL]:            { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30', hex: '#f59e0b' },
  [Category.HOUSING]:         { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30', hex: '#8b5cf6' },
  [Category.UTILITIES]:       { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30', hex: '#06b6d4' },
  [Category.EMI]:             { bg: 'bg-rose-500/15', text: 'text-rose-400', border: 'border-rose-500/30', hex: '#f43f5e' },
  [Category.ENTERTAINMENT]:   { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30', hex: '#ec4899' },
  [Category.HEALTH]:          { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/30', hex: '#ef4444' },
  [Category.PERSONAL_CARE]:   { bg: 'bg-fuchsia-500/15', text: 'text-fuchsia-400', border: 'border-fuchsia-500/30', hex: '#d946ef' },
  [Category.INSURANCE]:       { bg: 'bg-indigo-500/15', text: 'text-indigo-400', border: 'border-indigo-500/30', hex: '#6366f1' },
  [Category.TAX]:             { bg: 'bg-slate-500/15', text: 'text-slate-400', border: 'border-slate-500/30', hex: '#64748b' },
  [Category.SUBSCRIPTIONS]:   { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30', hex: '#14b8a6' },
  [Category.GIFTS]:           { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30', hex: '#a855f7' },
  [Category.SHOPPING]:        { bg: 'bg-sky-500/15', text: 'text-sky-400', border: 'border-sky-500/30', hex: '#0ea5e9' },
  [Category.TRAVEL]:          { bg: 'bg-lime-500/15', text: 'text-lime-400', border: 'border-lime-500/30', hex: '#84cc16' },
  [Category.EDUCATION]:       { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30', hex: '#eab308' },
  [Category.PETS]:            { bg: 'bg-orange-400/15', text: 'text-orange-300', border: 'border-orange-400/30', hex: '#fb923c' },
  [Category.MAINTENANCE]:     { bg: 'bg-stone-500/15', text: 'text-stone-400', border: 'border-stone-500/30', hex: '#78716c' },
  [Category.INVESTMENT]:      { bg: 'bg-gold/15', text: 'text-gold', border: 'border-gold/30', hex: '#d4af37' },
  [Category.SALARY]:          { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30', hex: '#22c55e' },
  [Category.FREELANCE]:       { bg: 'bg-blue-400/15', text: 'text-blue-300', border: 'border-blue-400/30', hex: '#60a5fa' },
  [Category.OTHER]:           { bg: 'bg-gray-500/15', text: 'text-gray-400', border: 'border-gray-500/30', hex: '#6b7280' },
};

// === MERCHANT PROFILES ===
export interface MerchantProfile {
  name: string;
  normalized: string;
  category: Category;
  avgAmount: number;
  frequency: number;
  lastSeen: string;
}

const MERCHANT_DB: Record<string, Category> = {
  swiggy: Category.FOOD, zomato: Category.FOOD, dominos: Category.FOOD, pizza: Category.FOOD,
  mcdonald: Category.FOOD, kfc: Category.FOOD, chai: Category.FOOD, cafe: Category.FOOD,
  starbucks: Category.FOOD, subway: Category.FOOD, food: Category.FOOD, restaurant: Category.FOOD,
  bigbasket: Category.GROCERIES, blinkit: Category.GROCERIES, zepto: Category.GROCERIES,
  instamart: Category.GROCERIES, dmart: Category.GROCERIES, grofer: Category.GROCERIES,
  grocery: Category.GROCERIES, mart: Category.GROCERIES,
  uber: Category.TRANSPORT, ola: Category.TRANSPORT, rapido: Category.TRANSPORT,
  metro: Category.TRANSPORT, irctc: Category.TRANSPORT, redBus: Category.TRANSPORT,
  petrol: Category.FUEL, diesel: Category.FUEL, shell: Category.FUEL, hp: Category.FUEL,
  indianOil: Category.FUEL, bpcl: Category.FUEL,
  rent: Category.HOUSING, housing: Category.HOUSING, maintenance: Category.HOUSING,
  society: Category.HOUSING, apartment: Category.HOUSING,
  jio: Category.UTILITIES, airtel: Category.UTILITIES, vi: Category.UTILITIES,
  bsnl: Category.UTILITIES, bescom: Category.UTILITIES, electricity: Category.UTILITIES,
  water: Category.UTILITIES, gas: Category.UTILITIES, broadband: Category.UTILITIES,
  act: Category.UTILITIES, tier: Category.UTILITIES,
  netflix: Category.SUBSCRIPTIONS, spotify: Category.SUBSCRIPTIONS, prime: Category.SUBSCRIPTIONS,
  hotstar: Category.SUBSCRIPTIONS, youtube: Category.SUBSCRIPTIONS, adobe: Category.SUBSCRIPTIONS,
  office365: Category.SUBSCRIPTIONS, gym: Category.PERSONAL_CARE, salon: Category.PERSONAL_CARE,
  amazon: Category.SHOPPING, flipkart: Category.SHOPPING, myntra: Category.SHOPPING,
  meesho: Category.SHOPPING, ajio: Category.SHOPPING, nykaa: Category.SHOPPING,
  hospital: Category.HEALTH, doctor: Category.HEALTH, pharmacy: Category.HEALTH,
  medical: Category.HEALTH, clinic: Category.HEALTH, practo: Category.HEALTH,
  insurance: Category.INSURANCE, policy: Category.INSURANCE,
  movie: Category.ENTERTAINMENT, bookmyshow: Category.ENTERTAINMENT,
  pvr: Category.ENTERTAINMENT,
  flight: Category.TRAVEL, makemytrip: Category.TRAVEL, yatra: Category.TRAVEL,
  oyo: Category.TRAVEL, booking: Category.TRAVEL,
  school: Category.EDUCATION, college: Category.EDUCATION, course: Category.EDUCATION,
  udemy: Category.EDUCATION, coursera: Category.EDUCATION,
};

function normalizeMerchant(desc: string): string {
  return desc.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
}

export function extractMerchant(description: string): string {
  const desc = description.trim();
  const normalized = desc.toLowerCase();
  for (const [key] of Object.entries(MERCHANT_DB)) {
    if (normalized.includes(key)) return desc.split(/[-_/|]/)[0].trim();
  }
  return desc.split(/[-_/|]/)[0].trim().slice(0, 30);
}

export function buildMerchantProfiles(expenses: Expense[]): MerchantProfile[] {
  const map = new Map<string, { amounts: number[]; count: number; lastDate: string; category: Category }>();
  const incomeCategories = new Set([Category.SALARY, Category.FREELANCE, Category.INVESTMENT, Category.OTHER]);

  for (const e of expenses) {
    if (e.type === 'income' || incomeCategories.has(e.category)) continue;
    const key = normalizeMerchant(e.description);
    const existing = map.get(key);
    if (existing) {
      existing.amounts.push(e.amount);
      existing.count++;
      if (e.date > existing.lastDate) existing.lastDate = e.date;
    } else {
      map.set(key, { amounts: [e.amount], count: 1, lastDate: e.date, category: e.category });
    }
  }

  const profiles: MerchantProfile[] = [];
  for (const [normalized, data] of map) {
    if (data.count < 1) continue;
    const avg = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
    const original = expenses.find(e => normalizeMerchant(e.description) === normalized)?.description || normalized;
    profiles.push({
      name: original.slice(0, 30),
      normalized,
      category: data.category,
      avgAmount: Math.round(avg),
      frequency: data.count,
      lastSeen: data.lastDate,
    });
  }

  return profiles.sort((a, b) => b.frequency - a.frequency);
}

// === SMART CATEGORY SUGGESTION ===
export function suggestCategory(description: string, history: Expense[]): Category {
  const normalized = description.toLowerCase();

  for (const [key, cat] of Object.entries(MERCHANT_DB)) {
    if (normalized.includes(key)) return cat;
  }

  const merchantNorm = normalizeMerchant(description);
  const matches = history.filter(e => normalizeMerchant(e.description) === merchantNorm);
  if (matches.length >= 2) {
    const catCounts = new Map<Category, number>();
    for (const m of matches) catCounts.set(m.category, (catCounts.get(m.category) || 0) + 1);
    let best = Category.OTHER;
    let bestCount = 0;
    for (const [cat, count] of catCounts) {
      if (count > bestCount) { best = cat; bestCount = count; }
    }
    if (bestCount >= 2) return best;
  }

  return Category.OTHER;
}

// === DUPLICATE DETECTION ===
export interface DuplicateMatch {
  existing: Expense;
  confidence: number;
  reason: string;
}

export function detectDuplicates(
  newExpense: { amount: number; description: string; date: string; type: TransactionType },
  existingExpenses: Expense[],
  threshold = 0.75
): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  const newDate = new Date(newExpense.date).getTime();
  const DAY = 86400000;

  for (const e of existingExpenses) {
    let score = 0;
    const reasons: string[] = [];

    if (e.amount === newExpense.amount && e.type === newExpense.type) {
      score += 0.5;
      reasons.push('same amount');
    } else if (Math.abs(e.amount - newExpense.amount) / Math.max(e.amount, 1) < 0.01) {
      score += 0.45;
      reasons.push('near-identical amount');
    }

    const eNorm = normalizeMerchant(e.description);
    const nNorm = normalizeMerchant(newExpense.description);
    if (eNorm === nNorm) {
      score += 0.35;
      reasons.push('same merchant');
    } else if (eNorm.includes(nNorm) || nNorm.includes(eNorm)) {
      score += 0.2;
      reasons.push('similar merchant');
    }

    const dateDiff = Math.abs(newDate - new Date(e.date).getTime()) / DAY;
    if (dateDiff === 0) {
      score += 0.15;
      reasons.push('same date');
    } else if (dateDiff <= 1) {
      score += 0.1;
      reasons.push('adjacent date');
    } else if (dateDiff <= 3) {
      score += 0.05;
      reasons.push('within 3 days');
    }

    if (score >= threshold) {
      matches.push({
        existing: e,
        confidence: Math.min(score, 1),
        reason: reasons.join(', '),
      });
    }
  }

  return matches.sort((a, b) => b.confidence - a.confidence);
}

// === RECURRING PATTERN DETECTION ===
export interface RecurringPattern {
  description: string;
  normalizedMerchant: string;
  category: Category;
  avgAmount: number;
  occurrences: number;
  typicalDayOfMonth: number[];
  dateSpread: number;
  totalSpent: number;
  suggestedFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
}

export function detectRecurringPatterns(expenses: Expense[]): RecurringPattern[] {
  const merchantMap = new Map<string, {
    amounts: number[];
    dates: number[];
    category: Category;
    description: string;
    fullDates: string[];
  }>();

  const incomeCategories = new Set([Category.SALARY, Category.FREELANCE, Category.INVESTMENT]);
  const excludeCategories = new Set([Category.GROCERIES, Category.FOOD, Category.TRANSPORT, Category.FUEL, Category.SHOPPING, Category.PERSONAL_CARE]);

  for (const e of expenses) {
    if (e.type === 'income' || incomeCategories.has(e.category) || excludeCategories.has(e.category)) continue;
    const key = normalizeMerchant(e.description);
    const existing = merchantMap.get(key);
    if (existing) {
      existing.amounts.push(e.amount);
      existing.dates.push(new Date(e.date).getDate());
      existing.fullDates.push(e.date);
      if (e.date > existing.fullDates[existing.fullDates.length - 1]) existing.description = e.description;
    } else {
      merchantMap.set(key, {
        amounts: [e.amount],
        dates: [new Date(e.date).getDate()],
        category: e.category,
        description: e.description,
        fullDates: [e.date],
      });
    }
  }

  const patterns: RecurringPattern[] = [];

  for (const [normalized, data] of merchantMap) {
    if (data.amounts.length < 2) continue;

    const avgAmount = data.amounts.reduce((a, b) => a + b, 0) / data.amounts.length;
    const amountsSimilar = data.amounts.every(a => Math.abs(a - avgAmount) / Math.max(avgAmount, 1) < 0.1);
    if (!amountsSimilar) continue;

    const sortedDates = [...data.dates].sort((a, b) => a - b);
    const dateSpread = sortedDates[sortedDates.length - 1] - sortedDates[0];
    const typicalDays = [...new Set(sortedDates)].slice(0, 3);

    const sortedFullDates = data.fullDates.sort();
    const dayGaps: number[] = [];
    for (let i = 1; i < sortedFullDates.length; i++) {
      const diff = (new Date(sortedFullDates[i]).getTime() - new Date(sortedFullDates[i - 1]).getTime()) / (86400000 * 7);
      dayGaps.push(Math.round(diff));
    }
    const avgGapWeeks = dayGaps.length > 0 ? dayGaps.reduce((a, b) => a + b, 0) / dayGaps.length : 4;

    let freq: RecurringPattern['suggestedFrequency'] = 'monthly';
    if (avgGapWeeks <= 1.5) freq = 'weekly';
    else if (avgGapWeeks <= 3) freq = 'biweekly';
    else if (avgGapWeeks >= 10) freq = 'quarterly';

    patterns.push({
      description: data.description.slice(0, 30),
      normalizedMerchant: normalized,
      category: data.category,
      avgAmount: Math.round(avgAmount),
      occurrences: data.amounts.length,
      typicalDayOfMonth: typicalDays,
      dateSpread,
      totalSpent: Math.round(data.amounts.reduce((a, b) => a + b, 0)),
      suggestedFrequency: freq,
    });
  }

  return patterns.sort((a, b) => b.occurrences - a.occurrences);
}

// === ANOMALY DETECTION ===
export interface AnomalyResult {
  expense: Expense;
  categoryAvg: number;
  deviationPercent: number;
  severity: 'mild' | 'moderate' | 'severe';
  message: string;
}

export function detectAnomalies(expenses: Expense[], newExpense?: Expense): AnomalyResult[] {
  const categoryStats = new Map<Category, { amounts: number[]; total: number; count: number }>();

  for (const e of expenses) {
    if (e.type === 'income') continue;
    const stats = categoryStats.get(e.category);
    if (stats) {
      stats.amounts.push(e.amount);
      stats.total += e.amount;
      stats.count++;
    } else {
      categoryStats.set(e.category, { amounts: [e.amount], total: e.amount, count: 1 });
    }
  }

  const anomalies: AnomalyResult[] = [];
  const toCheck = newExpense ? [newExpense] : expenses;

  for (const e of toCheck) {
    if (e.type === 'income') continue;
    const stats = categoryStats.get(e.category);
    if (!stats || stats.count < 3) continue;

    const avg = stats.total / stats.count;
    if (avg === 0) continue;
    const deviation = ((e.amount - avg) / avg) * 100;

    if (deviation > 50) {
      const severity = deviation > 200 ? 'severe' : deviation > 100 ? 'moderate' : 'mild';
      const timesLabel = deviation > 100 ? `${Math.round(deviation / 100)}x` : `${Math.round(deviation)}%`;
      anomalies.push({
        expense: e,
        categoryAvg: Math.round(avg),
        deviationPercent: Math.round(deviation),
        severity,
        message: `${timesLabel} above avg for ${e.category} (avg ₹${Math.round(avg).toLocaleString('en-IN')})`,
      });
    }
  }

  return anomalies.sort((a, b) => b.deviationPercent - a.deviationPercent);
}

// === CATEGORY LEARNING FROM HISTORY ===
export function getCategoryStats(expenses: Expense[]): Map<Category, { count: number; total: number; avg: number }> {
  const stats = new Map<Category, { count: number; total: number; avg: number }>();
  for (const e of expenses) {
    if (e.type === 'income') continue;
    const s = stats.get(e.category);
    if (s) { s.count++; s.total += e.amount; s.avg = s.total / s.count; }
    else stats.set(e.category, { count: 1, total: e.amount, avg: e.amount });
  }
  return stats;
}

// === SPENDING VELOCITY DETECTION ===
export interface VelocityAlert {
  category: Category;
  currentMonthSpent: number;
  previousMonthSpent: number;
  changePercent: number;
  direction: 'up' | 'down' | 'new';
  message: string;
}

export function detectVelocityChanges(expenses: Expense[]): VelocityAlert[] {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthData = new Map<Category, number>();
  const lastMonthData = new Map<Category, number>();

  for (const e of expenses) {
    if (e.type === 'income') continue;
    if (e.date.startsWith(thisMonth)) {
      thisMonthData.set(e.category, (thisMonthData.get(e.category) || 0) + e.amount);
    }
    if (e.date.startsWith(lastMonthStr)) {
      lastMonthData.set(e.category, (lastMonthData.get(e.category) || 0) + e.amount);
    }
  }

  const alerts: VelocityAlert[] = [];

  for (const [cat, spent] of thisMonthData) {
    const prev = lastMonthData.get(cat);
    if (prev && prev > 0) {
      const change = ((spent - prev) / prev) * 100;
      if (Math.abs(change) > 30) {
        alerts.push({
          category: cat,
          currentMonthSpent: Math.round(spent),
          previousMonthSpent: Math.round(prev),
          changePercent: Math.round(change),
          direction: change > 0 ? 'up' : 'down',
          message: change > 0
            ? `Spending on ${cat} is ${Math.round(change)}% higher than last month`
            : `Spending on ${cat} is ${Math.round(Math.abs(change))}% lower than last month — nice!`,
        });
      }
    } else if (spent > 0) {
      alerts.push({
        category: cat,
        currentMonthSpent: Math.round(spent),
        previousMonthSpent: 0,
        changePercent: 100,
        direction: 'new',
        message: `New spending category this month: ${cat}`,
      });
    }
  }

  return alerts.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
}
