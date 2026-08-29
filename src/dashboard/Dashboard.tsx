import React, { useEffect, useState } from 'react';
import { ArrowLeft, Lock, Wallet } from 'lucide-react';
import Onboarding from './Onboarding';
import {
  buildConfig,
  OnboardInputs,
  SpendStyle,
  Tx,
  fmt,
  todayISO,
  statusOfDay,
} from './engine';
import { loadProfile, saveProfile, clearProfile, emptyToggles, nextId, Profile } from './storage';
import { go, PATH } from '../lib/router';
import GoalRing from './widgets/GoalRing';
import AllowanceCard from './widgets/AllowanceCard';
import Autopilot from './widgets/Autopilot';
import Transactions from './widgets/Transactions';
import Charts from './widgets/Charts';
import Insights from './widgets/Insights';

const seedTransactions = (cfg: ReturnType<typeof buildConfig>): Tx[] => {
  const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const today = daysAgo(0);
  const daily = cfg.dailyAllowance;
  return [
    { id: nextId(), name: 'Rent (locked)', amount: cfg.inputs.rent, cat: 'Utilities', date: today },
    { id: nextId(), name: 'Fixed bills', amount: cfg.inputs.bills, cat: 'Utilities', date: today },
    { id: nextId(), name: 'Netflix', amount: 649, cat: 'Subscriptions', date: today },
    { id: nextId(), name: 'Spotify', amount: 119, cat: 'Subscriptions', date: today },
    { id: nextId(), name: 'Chai + snacks', amount: Math.round(daily * 0.4), cat: 'Food', date: today },
    { id: nextId(), name: 'Metro recharge', amount: Math.round(daily * 0.2), cat: 'Transport', date: daysAgo(1) },
    { id: nextId(), name: 'Weekend dinner', amount: Math.round(daily * 0.9), cat: 'Food', date: daysAgo(2) },
    { id: nextId(), name: 'Groceries', amount: Math.round(daily * 0.7), cat: 'Food', date: daysAgo(3) },
  ];
};

const Dashboard: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(() => loadProfile());
  const [customizing, setCustomizing] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const update = (patch: Partial<Profile> | ((p: Profile) => Profile)) => {
    setProfile((p) => {
      if (!p) return p;
      const next = typeof patch === 'function' ? patch(p) : { ...p, ...patch };
      saveProfile(next);
      return next;
    });
  };

  /* ── Streak: +1 the first time each under-budget day is detected ── */
  const cfgLive = profile ? buildConfig(profile.inputs) : null;
  const todayLive = todayISO();
  useEffect(() => {
    if (!profile || !cfgLive) return;
    const spent = profile.tx
      .filter((t) => t.date === todayLive && t.cat !== 'Savings')
      .reduce((s, t) => s + t.amount, 0);
    if (spent <= cfgLive.dailyAllowance && profile.lastWinDay !== todayLive && cfgLive.dailyAllowance > 0) {
      update((p) => ({ ...p, streak: p.streak + 1, lastWinDay: todayLive }));
    }
  }, [profile, cfgLive, todayLive, update]);

  const handleComplete = (inputs: OnboardInputs) => {
    const cfg = buildConfig(inputs);
    const fresh: Profile = {
      inputs,
      tx: seedTransactions(cfg),
      toggles: emptyToggles(),
      streak: 0,
      lastWinDay: '',
      onboardedAt: new Date().toISOString(),
    };
    saveProfile(fresh);
    setProfile(fresh);
    setCustomizing(false);
    window.location.hash = PATH.dashboard;
  };

  const backToSite = () => go(PATH.home);

  if (!profile || customizing) {
    return (
      <Onboarding
        initial={profile?.inputs ?? null}
        onComplete={handleComplete}
        onCancel={() => (profile ? setCustomizing(false) : backToSite())}
      />
    );
  }

  const cfg = buildConfig(profile.inputs);
  const today = todayISO();
  const spentToday = profile.tx
    .filter((t) => t.date === today && t.cat !== 'Savings')
    .reduce((s, t) => s + t.amount, 0);
  const allowanceLeft = Math.max(0, cfg.dailyAllowance - spentToday);
  const allowancePct = cfg.dailyAllowance > 0 ? Math.min(1, spentToday / cfg.dailyAllowance) : 0;

  const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen bg-[#F4EFE4]">
      {/* ── Top nav ── */}
      <div className="sticky top-0 z-30 bg-[#F4EFE4]/90 backdrop-blur border-b border-black/5">
        <div className="max-w-[88rem] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #d5b256, #b8860b)' }}
            >
              <Wallet size={18} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="text-lg font-medium tracking-tight text-black">SpendSmart</span>
              <p className="text-[9px] uppercase tracking-[0.24em] text-[#B8860B] font-semibold mt-1">
                Autonomous
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden md:flex items-center gap-1.5 text-[#B8860B]">
              <span className="text-sm font-semibold">🔥 {profile.streak}</span>
              <span className="text-xs text-black/45 font-medium">day streak</span>
            </div>
            <button
              onClick={() => setCustomizing(true)}
              className="text-sm bg-[#18241C] text-white px-5 py-2 rounded-full font-medium hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer"
            >
              Re-customize
            </button>
            <button
              onClick={backToSite}
              className="hidden sm:inline-flex items-center gap-2 text-sm text-black/60 font-medium hover:text-black transition-colors duration-200 cursor-pointer"
            >
              <ArrowLeft size={15} /> Site
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[88rem] mx-auto px-6 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="kicker mb-3">
              {statusOfDay(now)} · {timeStr}
            </p>
            <h1 className="text-4xl md:text-6xl font-medium text-black">
              {profile.inputs.name}'s money, <em className="not-italic text-[#B8860B]">mastered.</em>
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8860B] bg-[#B8860B]/10 px-3 py-1.5 rounded-full">
                🛣️ {cfg.runwayDays} day runway
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8860B] bg-[#B8860B]/10 px-3 py-1.5 rounded-full">
                🎯 {Math.round(cfg.goalPct * 100)}% goal locked
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#B8860B] bg-[#B8860B]/10 px-3 py-1.5 rounded-full">
                🔥 {profile.streak} day streak
              </span>
            </div>
          </div>
          <p className="text-black/50 text-sm max-w-xs leading-relaxed">
            Generated from your answers — {profile.tx.length} transactions, allowance, and autopilot
            all live and updating right now.
          </p>
        </div>

        {/* ── Balance cards ── */}
        {/* ── Balance cards ── */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="dash-card dash-rise rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45 font-semibold mb-2">Monthly income</p>
            <p className="font-serif text-3xl font-semibold text-black">{fmt(profile.inputs.income)}</p>
          </div>

          <div className="dash-card dash-rise rounded-2xl bg-[#18241C] p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Locked first</p>
              <Lock size={14} className="text-[#d4af37]" />
            </div>
            <p className="font-serif text-3xl font-semibold text-white">{fmt(cfg.fixed)}</p>
            <p className="text-xs text-white/50 mt-1">Rent + fixed bills, autopilot-held</p>
          </div>

          <div className="dash-card dash-rise rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-black/45 font-semibold mb-2">Allowance left today</p>
            <p className="font-serif text-3xl font-semibold text-black">{fmt(allowanceLeft)}</p>
            <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#E9E0CB' }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${allowancePct * 100}%`,
                  background: allowancePct >= 1 ? '#c0392b' : 'linear-gradient(90deg, #d5b256, #b8860b)',
                }}
              />
            </div>
            <p className="text-xs text-black/45 mt-1">{fmt(spentToday)} of {fmt(cfg.dailyAllowance)} used</p>
          </div>
        </div>

        {/* ── Widgets ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <GoalRing cfg={cfg} tx={profile.tx} toggles={profile.toggles} />
          </div>
          <div className="md:col-span-2 grid md:grid-cols-2 gap-4">
            <AllowanceCard cfg={cfg} tx={profile.tx} />
            <Autopilot
              toggles={profile.toggles}
              onChange={(id, on) =>
                update((p) => ({
                  ...p,
                  toggles: { ...p.toggles, [id]: on },
                }))
              }
            />
          </div>
        </div>

        <div className="mt-4">
          <Insights
            cfg={cfg}
            tx={profile.tx}
            toggles={profile.toggles}
            streak={profile.streak}
          />
        </div>

        <div className="mt-4">
          <Charts tx={profile.tx} />
        </div>

        <div className="mt-4">
          <Transactions
            tx={profile.tx}
            onAdd={(t) => update((p) => ({ ...p, tx: [...p.tx, t] }))}
            onDelete={(id) => update((p) => ({ ...p, tx: p.tx.filter((x) => x.id !== id) }))}
            onResetDay={() => update((p) => ({ ...p, tx: p.tx.filter((x) => x.date !== today) }))}
          />
        </div>

        {/* ── Footer bar ── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/5 pt-6">
          <p className="text-xs text-black/40">
            Data lives in your browser ({profile.tx.length} transactions). Nothing leaves your device.
          </p>
          <div className="flex items-center gap-6 text-xs font-medium">
            <button
              onClick={() => setCustomizing(true)}
              className="text-black/50 hover:text-black transition-colors duration-200 cursor-pointer"
            >
              Customize again
            </button>
            <button
              onClick={() => {
                clearProfile();
                setProfile(null);
              }}
              className="text-[#c0392b]/70 hover:text-[#c0392b] transition-colors duration-200 cursor-pointer"
            >
              Reset all data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;