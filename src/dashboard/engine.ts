export type SpendStyle = 'strict' | 'balanced' | 'flex';

export interface OnboardInputs {
  name: string;
  income: number;
  rent: number;
  bills: number;
  goal: number;
  style: SpendStyle;
  apps: string[];
  leak: string;
}

export const APP_OPTIONS = ['PhonePe', 'Google Pay', 'Paytm', 'Bank app', 'Credit card', 'Amazon Pay'] as const;

export const LEAK_OPTIONS = [
  { id: 'food', label: 'Food delivery & coffee runs', icon: '🍜' },
  { id: 'subscriptions', label: 'Subscriptions I forget', icon: '📺' },
  { id: 'shopping', label: 'Impulse shopping', icon: '🛍️' },
  { id: 'travel', label: 'Cabs & travel', icon: '🚕' },
  { id: 'unclear', label: 'Honestly? No idea', icon: '🤷' },
] as const;

export const LEAK_LABELS: Record<string, string> = {
  food: 'food delivery & coffee',
  subscriptions: 'forgotten subscriptions',
  shopping: 'impulse shopping',
  travel: 'cabs & travel',
  unclear: 'a leak we should hunt down',
};

export const DEFAULT_INPUTS: OnboardInputs = {
  name: '',
  income: 60000,
  rent: 15000,
  bills: 4000,
  goal: 9000,
  style: 'balanced',
  apps: [],
  leak: 'unclear',
};

export const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Subscriptions', 'Utilities', 'Savings', 'Other'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Tx {
  id: string;
  name: string;
  amount: number;
  cat: Category;
  date: string;
}

export interface DashboardConfig {
  inputs: OnboardInputs;
  fixed: number;
  spendable: number;
  dailyAllowance: number;
  monthlySave: number;
  goalPct: number;
  runwayDays: number;
  style: SpendStyle;
}

export const AUTOPILOT = [
  { id: 'rent', label: 'Rent locked', desc: 'Reserved first, always', base: true },
  { id: 'autopay', label: 'Bills autopay', desc: 'Scheduled automatically', base: true },
  { id: 'allowance', label: 'Daily allowance', desc: 'Budget guard active', base: true },
  { id: 'ghost', label: 'Ghost savings', desc: 'Impulse holds auto-saved', base: false },
  { id: 'hunter', label: 'Subscription hunter', desc: 'Scanning for repeats', base: true },
  { id: 'advisor', label: 'AI advisor', desc: 'Watching your runway', base: true },
] as const;

export type AutopilotId = (typeof AUTOPILOT)[number]['id'];

export const buildConfig = (i: OnboardInputs): DashboardConfig => {
  const fixed = i.rent + i.bills;
  const spendable = Math.max(0, i.income - fixed - i.goal);
  const dailyAllowance = Math.round(spendable / 30);
  const monthlySave = Math.max(0, i.goal + spendable - dailyAllowance * 30);
  const goalPct = i.income > 0 ? Math.min(1, i.goal / i.income) : 0;
  const runwayDays = dailyAllowance > 0 ? Math.round(spendable / dailyAllowance) : 0;
  return { inputs: i, fixed, spendable, dailyAllowance, monthlySave, goalPct, runwayDays, style: i.style };
};

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const parseRupee = (v: string) => {
  const n = parseFloat(v.replace(/[^\d.]/g, ''));
  return Number.isFinite(n) ? n : 0;
};

export const fmt = (n: number) => '₹' + Math.round(n).toLocaleString('en-IN');

export const statusOfDay = (now: Date) => {
  const h = now.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

/* ─── Real bank-SMS / UPI parser ─── */
const CAT_PATTERNS: Array<[Category, RegExp]> = [
  ['Food', /(swiggy|zomato|dominos|kfc|mcdonalds|burger|pizza|cafe|restaurant|hotel|bigbasket|dmart|grocery|blinkit|zepto|dunzo|chaayos|baker|cake|pan masala|food)/i],
  ['Transport', /(uber|ola|rapido|fuel|petrol|diesel|metro|irctc|rail|fastag|toll|cab|parking|bus|airline|goindigo)/i],
  ['Shopping', /(amazon|flipkart|myntra|meesho|ajio|nykaa|reliance|jewellery|clothing|shoe|watch|iphone|mobile|jeans|electronics)/i],
  ['Subscriptions', /(netflix|hotstar|spotify|prime video|amazon prime|youtube|premium|multiplex|bookmyshow|renew)/i],
  ['Utilities', /(electricity|water bill|bpl|jio|airtel|vodafone|vi |recharge|broadband|internet|postpaid|dth|gas|wifi)/i],
];

export interface ParsedBankMessage {
  ok: boolean;
  kind: 'debit' | 'credit';
  name?: string;
  amount?: number;
  cat?: Category;
  reason?: string;
}

export const parseBankMessage = (raw: string): ParsedBankMessage => {
  const text = raw.trim();
  if (!text) return { ok: false, kind: 'debit', reason: 'Empty message' };

  const amountMatch =
    text.match(/(?:Rs\.?\s?|INR\s?|₹)\s*([\d,]+(?:\.\d+)?)/i) ||
    text.match(/(?:debited with)\s*([\d,]+(?:\.\d+)?)/i);
  if (!amountMatch) return { ok: false, kind: 'debit', reason: 'No amount found — look for "Rs 500" or "₹500".' };
  const amount = parseFloat(amountMatch[1].replace(/,/g, ''));

  const kind: 'debit' | 'credit' = /(debited|spent|used|paid|transferred out|purchase)/i.test(text)
    ? 'debit'
    : /(credited|received|added to your)/i.test(text)
      ? 'credit'
      : 'debit';

  const merchant =
    text.match(/[Aa]t\s+([A-Za-z0-9 .'&]+?)(?=\s+(?:upi|ref|on|to|via|acct|using|date|using|-|$))/) ||
    text.match(/for\s+([A-Za-z0-9 &'.-]+?)(?=\s+(?:upi|ref|on|via|acct|using|,|$))/);
  const name = merchant
    ? merchant[1].trim().replace(/\s+$/, '').slice(0, 40)
    : /(upi|bank)/i.test(text)
      ? 'UPI payment'
      : 'Card spend';

  const cat = CAT_PATTERNS.find(([, re]) => re.test(text))?.[0] ?? 'Other';

  return { ok: true, kind, name, amount, cat, reason: 'Parsed on device.' };
};

export const SAMPLE_SMS = [
  'HDFC Bank: Rs 4600 debited from A/C **1234 at PhonePe on 12-04 REF/3249/88. Bal: Rs 24110.00',
  'Rs 246 debited from A/C **5678 at Swiggy on 11-04. Bal: Rs 33120.00',
  'GPay: ₹640.00 spent at BigBasket on 10-04, UPI/20260410123456. Bal ₹18,920.00',
  'Netflix: Rs 649 debited from A/C **4321 on 04-04 recurring. Bal: Rs 45000.00',
  'Jio: INR 299 recharge debited from A/C **9511 on 02-04. Bal Rs 12,900.00',
  'Uber: Rs 210 debited from A/C **0009 on 09-04 at UBER TRIP LEK. Bal Rs 33,000.00',
];

/* ─── Demo seeding so a fresh dashboard feels alive ─── */
export const seedTransactions = (inputs: OnboardInputs): Tx[] => {
  const d = new Date();
  const iso = (off: number) => {
    const c = new Date(d);
    c.setDate(c.getDate() - off);
    return c.toISOString().slice(0, 10);
  };
  const base: Array<[string, number, Category, number]> = [
    ['Coffee run', 90, 'Food', 0],
    ['Auto — office peak', 145, 'Transport', 0],
    ['BigBasket', 640, 'Food', 1],
    ['Speed post — recharge', 299, 'Utilities', 1],
    ['Netflix', 649, 'Subscriptions', 2],
  ];
  return base
    .filter(([, , , off]) => off >= 0)
    .map(([name, amount, cat, off]) => ({
      id: `demo-${off}-${name.replace(/\s/g, '').toLowerCase()}`,
      name,
      amount,
      cat,
      date: iso(off),
    }));
};

const STYLE_FACTOR: Record<SpendStyle, number> = { strict: 0.08, balanced: 0.15, flex: 0.3 };

export const insightsFor = (
  config: DashboardConfig,
  spentToday: number,
  tx: Tx[],
  toggles: Record<string, boolean>,
  streak: number
): string[] => {
  const { dailyAllowance, goalPct, style } = config;
  const used = dailyAllowance > 0 ? (spentToday / dailyAllowance) * 100 : 0;
  const out: string[] = [];

  if (used > 100) out.push(`Heads up — you've used ${Math.round(used)}% of today's allowance. The remainder comes from your flex budget (${Math.round(used - 100)}% over).`);
  else if (used > 70) out.push(`You've used ${Math.round(used)}% of today's allowance. ${fmt(Math.max(0, dailyAllowance - spentToday))} left until tomorrow resets it.`);
  else out.push(`${fmt(Math.max(0, dailyAllowance - spentToday))} of today's allowance still safe. Stay under and your streak grows.`);

  if (toggles['ghost']) out.push('Ghost savings is live — skipped impulse buys are being banked automatically right now.');
  if (toggles['hunter']) out.push('Subscription hunter found nothing new this week. 2 recurring charges are on autopay.');
  if (goalPct > 0) out.push(`Autopilot locks ${Math.round(goalPct * 100)}% of income to your goal before you see the rest.`);

  const apps = (config.inputs.apps || []) as string[];
  if (apps.length > 0) out.push(`${apps.length} payment source${apps.length === 1 ? ' is' : 's are'} in the loop — ${apps.slice(0, 3).join(', ')}${apps.length > 3 ? '…' : ''}. UPI and SMS get auto-read from here.`);

  const leak = config.inputs.leak as string;
  if (leak && leak !== 'unclear') {
    out.push(`You flagged ${LEAK_LABELS[leak] || 'a leak'} as the biggest drain. The watcher is prioritising that category this month.`);
  } else if (leak === 'unclear') {
    out.push(`No leak flagged — the engine is hunting for you. Overshoot categories will be surfaced here first.`);
  }

  if (config.monthlySave > 0) {
    out.push(`On pace, you bank ${fmt(config.monthlySave)} a month — that's ${
      config.inputs.income > 0 ? Math.round((config.monthlySave / config.inputs.income) * 100) : 0
    }% of income straight into the goal.`);
  }

  const subscriptions = tx.filter((t) => t.cat === 'Subscriptions' && !toggles['hunter']);
  if (subscriptions.length > 0 && toggles['hunter']) {
    const yearly = subscriptions.reduce((s, t) => s + t.amount, 0) * 12;
    out.push(`Your subscriptions cost roughly ${fmt(yearly)} a year. Turn hunter off for any you actually use.`);
  }

  out.push(`Spending style set to ${style}. Flex headroom on any given day is ${Math.round(STYLE_FACTOR[style] * dailyAllowance)}.`);
  out.push(`Streak: ${streak} day${streak === 1 ? '' : 's'} under budget. ${streak >= 5 ? 'This is a serious win — protect it.' : 'Five days in a row unlocks the gold badge.'}`);

  return out;
};