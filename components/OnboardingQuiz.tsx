import React, { useEffect, useMemo, useState } from 'react';
import { Expense, FinancialGoal, ReminderFrequency, SpendingStyle, UserPreferences, WidgetKey } from '../types';
import { getTheme, applyTheme } from '../services/theme';
import {
  getExpenseStats, getBalance, getAllowancePlan, getGoalPace,
} from '../services/planning';
import ProgressRing from './ProgressRing';
import {
  Target, ShieldCheck, TrendingUp, Eye, PiggyBank, Plane, Laptop, Gift, Plus,
  Bell, BellRing, BellOff, Sun, Moon, Check, ArrowRight, Sparkles, Wallet,
  LifeBuoy, Flame, X, ChevronRight,
} from 'lucide-react';

interface OnboardingQuizProps {
  monthlyIncome: number;
  currency: string;
  expenses: Expense[];
  onComplete: (prefs: Omit<UserPreferences, 'updatedAt'>) => void;
  onSkip: () => void;
}

const fmt = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(Math.round(amount));

const GOAL_PRESETS = [
  { icon: <PiggyBank size={22} />, name: 'Emergency Fund', amount: 50000, tag: '3–6 months of safety' },
  { icon: <Plane size={22} />, name: 'Dream Vacation', amount: 25000, tag: 'Guilt-free getaway' },
  { icon: <Laptop size={22} />, name: 'New Device', amount: 40000, tag: 'Phone, laptop or gear' },
  { icon: <Gift size={22} />, name: 'Big Purchase', amount: 75000, tag: 'Wedding, home, anything' },
  { icon: <Plus size={22} />, name: 'Custom Goal', amount: null, tag: 'Set your own number' },
];

const GOAL_OPTIONS: Array<{ id: FinancialGoal; icon: React.ReactNode; title: string; sub: string }> = [
  { id: 'save', icon: <Target size={22} />, title: 'Save more', sub: 'Build a cushion for the future' },
  { id: 'debt', icon: <ShieldCheck size={22} />, title: 'Get out of debt', sub: 'Clear EMIs and loans faster' },
  { id: 'invest', icon: <TrendingUp size={22} />, title: 'Grow investments', sub: 'Make money work harder' },
  { id: 'track', icon: <Eye size={22} />, title: 'Just track', sub: 'See exactly where cash goes' },
];

const STYLE_OPTIONS: Array<{ id: SpendingStyle; title: string; sub: string; tag: string }> = [
  { id: 'strict', title: 'Strict Saver', sub: '10% buffer baked into every day', tag: 'Aggressive' },
  { id: 'balanced', title: 'Balanced', sub: 'Set savings aside, live the rest', tag: 'Recommended' },
  { id: 'free', title: 'Free Spirit', sub: 'Loose guardrail, room to enjoy', tag: 'Relaxed' },
];

const REMINDER_OPTIONS: Array<{ id: ReminderFrequency; icon: React.ReactNode; title: string; sub: string }> = [
  { id: 'daily', icon: <Bell size={20} />, title: 'Daily check-in', sub: 'Morning allowance nudge' },
  { id: 'weekly', icon: <BellRing size={20} />, title: 'Weekly recap', sub: 'Sunday spend summary' },
  { id: 'off', icon: <BellOff size={20} />, title: 'No reminders', sub: 'Check when you feel like it' },
];

const WIDGET_META: Array<{ id: WidgetKey; icon: React.ReactNode; label: string }> = [
  { id: 'goal', icon: <Target size={16} />, label: 'Savings Goal' },
  { id: 'allowance', icon: <Wallet size={16} />, label: 'Daily Allowance' },
  { id: 'runway', icon: <LifeBuoy size={16} />, label: 'Runway' },
  { id: 'streak', icon: <Flame size={16} />, label: 'Streaks' },
];

const STEPS = 6;

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ monthlyIncome, currency, expenses, onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<FinancialGoal>('save');
  const [goalName, setGoalName] = useState('Emergency Fund');
  const [goalAmount, setGoalAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [deadline, setDeadline] = useState('12');
  const [style, setStyle] = useState<SpendingStyle>('balanced');
  const [reminder, setReminder] = useState<ReminderFrequency>('weekly');
  const [theme, setTheme] = useState<'dark' | 'light'>(getTheme());
  const [widgets, setWidgets] = useState<WidgetKey[]>(['goal', 'allowance', 'runway', 'streak']);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const deadlineMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + parseInt(deadline, 10), 1).toISOString().split('T')[0].slice(0, 7);
  }, [deadline]);

  const draftPrefs = useMemo<Omit<UserPreferences, 'updatedAt'>>(() => ({
    primaryGoal: goal,
    goalName,
    goalAmount,
    goalDeadline: deadlineMonth,
    spendingStyle: style,
    reminder,
    theme,
    widgets,
  }), [goal, goalName, goalAmount, deadlineMonth, style, reminder, theme, widgets]);

  const preview = useMemo(() => {
    const balance = getBalance(expenses);
    const stats = getExpenseStats(expenses);
    const plan = getAllowancePlan(draftPrefs, monthlyIncome, balance, stats);
    const pace = getGoalPace(draftPrefs, balance);
    return { plan, pace };
  }, [draftPrefs, expenses, monthlyIncome]);

  const pickPreset = (name: string, amount: number | null) => {
    setGoalName(name);
    if (amount) setGoalAmount(amount);
    if (amount === null) setCustomAmount('');
  };

  const toggleWidget = (id: WidgetKey) => {
    setWidgets(prev => prev.includes(id) ? prev.filter(w => w !== id) : [...prev, id]);
  };

  const handleAmountChange = (v: string) => {
    setCustomAmount(v);
    const n = Number(v);
    if (v && !Number.isNaN(n) && n > 0) setGoalAmount(n);
  };

  const displayedAmount = goalName === 'Custom Goal' ? Number(customAmount) : goalAmount;
  const canContinue =
    (step === 1 && displayedAmount > 0) ||
    step !== 1;

  const finish = () => {
    onComplete({ ...draftPrefs, goalAmount: goalAmount > 0 ? goalAmount : 1000 });
  };

  return (
    <div className="min-h-screen bg-app text-app flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[50%] h-[50%] bg-gold/10 rounded-full blur-[130px]" />
        <div className="absolute top-0 left-0 w-[45%] h-[45%] bg-brand/10 rounded-full blur-[130px]" />
        <div className="absolute top-1/3 left-1/2 w-40 h-40 rounded-full border border-gold/20 animate-spin-slow" style={{ transform: 'translateX(-50%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gold/10 border border-gold/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="font-display text-lg font-black leading-none tracking-tight">Build your dashboard</p>
              <p className="text-[11px] text-faint font-semibold mt-1 uppercase tracking-widest">2-minute personalization</p>
            </div>
          </div>
          <button
            onClick={onSkip}
            className="flex items-center gap-1.5 text-faint hover:text-app text-sm font-semibold px-3 py-2 rounded-full hover:bg-surface-2 transition-colors"
          >
            <X size={16} /> Skip
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-1.5 mb-8">
          {Array.from({ length: STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-gradient-to-r from-brand-deep to-gold' : 'bg-surface-3'
              }`}
            />
          ))}
        </div>

        <div className="bg-surface border border-app rounded-[2rem] shadow-card p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-deep via-brand to-gold opacity-70" />

          {/* STEP 0 — Goal */}
          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-2">What matters most right now?</h2>
              <p className="text-soft mb-6">We'll shape your dashboard around it.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOAL_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`text-left p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                      goal === opt.id
                        ? 'border-gold bg-gold/10 shadow-card-soft'
                        : 'border-app bg-surface-2 hover:border-gold-soft'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${goal === opt.id ? 'bg-gold/20 text-gold' : 'bg-surface-3 text-soft'}`}>{opt.icon}</div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{opt.title}</p>
                      <p className="text-xs text-faint mt-0.5">{opt.sub}</p>
                    </div>
                    {goal === opt.id && <Check size={18} className="text-gold shrink-0 mt-1" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 1 — Savings goal */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-2">Pick a savings goal</h2>
              <p className="text-soft mb-6">One target to aim at first. You can change it anytime.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {GOAL_PRESETS.map(p => (
                  <button
                    key={p.name}
                    onClick={() => pickPreset(p.name, p.amount)}
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      goalName === p.name
                        ? 'border-gold bg-gold/10 shadow-card-soft'
                        : 'border-app bg-surface-2 hover:border-gold-soft'
                    }`}
                  >
                    <div className={`mb-3 ${goalName === p.name ? 'text-gold' : 'text-soft'}`}>{p.icon}</div>
                    <p className="font-bold text-sm leading-tight">{p.name}</p>
                    <p className="text-[11px] text-faint mt-1">{p.amount ? fmt(p.amount, currency) : 'You decide'}</p>
                    <p className="text-[10px] text-faint mt-1">{p.tag}</p>
                  </button>
                ))}
              </div>

              <div className="bg-surface-2 border border-app rounded-2xl p-4">
                <label className="block text-xs font-bold text-soft mb-2 uppercase tracking-wider">Target amount ({currency})</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={goalName === 'Custom Goal' ? customAmount : String(goalAmount)}
                    onChange={e => handleAmountChange(e.target.value)}
                    className="flex-1 bg-app-soft border border-app rounded-xl px-4 py-3 text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
                    placeholder="0"
                  />
                  <select
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="bg-app-soft border border-app rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all"
                  >
                    <option value="6">6 months</option>
                    <option value="12">1 year</option>
                    <option value="24">2 years</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — Spending style */}
          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-2">How do you like to spend?</h2>
              <p className="text-soft mb-6">This tunes how tight your daily allowance is.</p>
              <div className="space-y-3">
                {STYLE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setStyle(opt.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3 ${
                      style === opt.id
                        ? 'border-gold bg-gold/10 shadow-card-soft'
                        : 'border-app bg-surface-2 hover:border-gold-soft'
                    }`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      style === opt.id ? 'text-gold border-gold/40 bg-gold/10' : 'text-faint border-app bg-surface-3'
                    }`}>{opt.tag}</span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{opt.title}</p>
                      <p className="text-xs text-faint mt-0.5">{opt.sub}</p>
                    </div>
                    {style === opt.id && <Check size={18} className="text-gold" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3 — Reminders */}
          {step === 3 && (
            <div className="animate-fade-in">
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-2">Want gentle nudges?</h2>
              <p className="text-soft mb-6">Pick how often we remind you to stay on plan.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {REMINDER_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setReminder(opt.id)}
                    className={`p-5 rounded-2xl border transition-all text-left ${
                      reminder === opt.id
                        ? 'border-gold bg-gold/10 shadow-card-soft'
                        : 'border-app bg-surface-2 hover:border-gold-soft'
                    }`}
                  >
                    <div className={`mb-3 ${reminder === opt.id ? 'text-gold' : 'text-soft'}`}>{opt.icon}</div>
                    <p className="font-bold text-sm">{opt.title}</p>
                    <p className="text-[11px] text-faint mt-1">{opt.sub}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4 — Theme + widgets */}
          {step === 4 && (
            <div className="animate-fade-in">
              <h2 className="heading-serif text-2xl sm:text-3xl font-bold mb-2">Style it your way</h2>
              <p className="text-soft mb-6">Theme and the widgets you care about.</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                    theme === 'dark' ? 'border-gold shadow-card-soft' : 'border-app hover:border-gold-soft opacity-70'
                  }`}
                  style={{ background: '#132a1e' }}
                >
                  <Moon size={18} className={theme === 'dark' ? 'text-gold' : 'text-faint'} />
                  <p className="font-bold text-sm mt-2 text-white">Dark Pine</p>
                  <p className="text-[11px] text-faint">Deep green, easy on the eyes</p>
                  {theme === 'dark' && <Check size={16} className="absolute top-3 right-3 text-gold" />}
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden ${
                    theme === 'light' ? 'border-gold shadow-card-soft' : 'border-app hover:border-gold-soft opacity-70'
                  }`}
                  style={{ background: '#f6f1e5' }}
                >
                  <Sun size={18} className={theme === 'light' ? 'text-gold' : 'text-faint'} />
                  <p className="font-bold text-sm mt-2 text-[#16331f]">Warm Paper</p>
                  <p className="text-[11px] text-faint">Creamy ivory, crisp in daylight</p>
                  {theme === 'light' && <Check size={16} className="absolute top-3 right-3 text-gold" />}
                </button>
              </div>

              <p className="text-xs font-bold text-soft uppercase tracking-wider mb-3">Dashboard widgets</p>
              <div className="flex flex-wrap gap-2.5">
                {WIDGET_META.map(w => {
                  const active = widgets.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      onClick={() => toggleWidget(w.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-all ${
                        active
                          ? 'border-gold bg-gold/10 text-app shadow-card-soft'
                          : 'border-app bg-surface-2 text-faint hover:text-app'
                      }`}
                    >
                      <span className={active ? 'text-gold' : 'text-faint'}>{w.icon}</span>
                      {w.label}
                      {active && <Check size={14} className="text-gold" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5 — Summary */}
          {step === 5 && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-gold/15 rounded-xl text-gold border border-gold/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="heading-serif text-2xl font-bold leading-none">Here's your plan</h2>
                  <p className="text-[11px] text-faint mt-1 uppercase tracking-widest font-semibold">Personalized for you</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-surface-2 border border-app rounded-2xl p-4 flex flex-col items-center text-center">
                  <ProgressRing pct={preview.pace.pct} size={92} strokeWidth={8} sublabel="of goal" />
                  <p className="text-xs text-faint mt-2 font-medium">{goalName}</p>
                  <p className="font-bold text-sm">{fmt(goalAmount, currency)}</p>
                </div>
                <div className="space-y-3">
                  <div className="bg-surface-2 border border-app rounded-2xl p-4">
                    <p className="text-[11px] text-faint uppercase tracking-wider font-semibold">Save each month</p>
                    <p className="font-display text-xl font-bold text-gold mt-1">{fmt(preview.pace.monthlyTarget, currency)}</p>
                    <p className="text-[11px] text-faint mt-0.5">over {deadline} months</p>
                  </div>
                  <div className="bg-surface-2 border border-app rounded-2xl p-4">
                    <p className="text-[11px] text-faint uppercase tracking-wider font-semibold">Daily allowance</p>
                    <p className="font-display text-xl font-bold text-brand mt-1">{fmt(preview.plan.dailyBudget, currency)}</p>
                    <p className="text-[11px] text-faint mt-0.5">{style === 'strict' ? 'strict mode' : style === 'free' ? 'free spirit' : 'balanced'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand/10 border border-brand/20 rounded-2xl p-4 text-xs text-soft leading-relaxed">
                <span className="font-bold text-brand-ink">Goal: {goalName}</span> · {fmt(goalAmount, currency)} · {widgets.length} widget{widgets.length === 1 ? '' : 's'} on your dashboard ·{' '}
                {reminder === 'off' ? 'No reminders' : reminder === 'daily' ? 'Daily check-ins' : 'Weekly recaps'} · {theme === 'dark' ? 'Dark Pine' : 'Warm Paper'} theme.
                Everything can be changed later from the sidebar.
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="mt-8 flex items-center gap-3">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="px-5 py-3.5 rounded-2xl text-sm font-bold border border-app bg-surface-2 hover:bg-surface-3 text-soft transition-all"
              >
                Back
              </button>
            ) : <div className="flex-1" />}

            {step < STEPS - 1 ? (
              <button
                onClick={() => canContinue && setStep(s => s + 1)}
                disabled={!canContinue}
                className="flex-1 btn-gold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={finish}
                className="flex-1 btn-gold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Sparkles size={18} /> Build my dashboard <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-[11px] text-faint mt-5">
          {step + 1} of {STEPS} · answers only shape your dashboard — nothing is shared.
        </p>
      </div>
    </div>
  );
};

export default OnboardingQuiz;
