export type SpendStyle = 'strict' | 'balanced' | 'flex';

export interface OnboardInputs {
  name: string;
  income: number;
  rent: number;
  bills: number;
  goal: number;
  style: SpendStyle;
}

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

  const subscriptions = tx.filter((t) => t.cat === 'Subscriptions' && !toggles['hunter']);
  if (subscriptions.length > 0 && toggles['hunter']) {
    const yearly = subscriptions.reduce((s, t) => s + t.amount, 0) * 12;
    out.push(`Your subscriptions cost roughly ${fmt(yearly)} a year. Turn hunter off for any you actually use.`);
  }

  out.push(`Spending style set to ${style}. Flex headroom on any given day is ${Math.round(STYLE_FACTOR[style] * dailyAllowance)}.`);
  out.push(`Streak: ${streak} day${streak === 1 ? '' : 's'} under budget. ${streak >= 5 ? 'This is a serious win — protect it.' : 'Five days in a row unlocks the gold badge.'}`);

  return out;
};