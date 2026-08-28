import React, { useState } from 'react';
import { Wallet } from 'lucide-react';
import Onboarding from './Onboarding';
import { buildConfig, DashboardConfig, OnboardInputs, SpendStyle, Tx, fmt } from './engine';
import { loadProfile, saveProfile, emptyToggles, nextId, Profile } from './storage';
import { go, PATH } from '../lib/router';

const seedTransactions = (cfg: DashboardConfig, style: SpendStyle): Tx[] => {
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

  const handleComplete = (inputs: OnboardInputs) => {
    const cfg = buildConfig(inputs);
    const fresh: Profile = {
      inputs,
      tx: seedTransactions(cfg, inputs.style),
      toggles: emptyToggles(),
      streak: 0,
      lastWinDay: '',
      onboardedAt: new Date().toISOString(),
    };
    saveProfile(fresh);
    setProfile(fresh);
  };

  const backToSite = () => go(PATH.home);

  if (!profile) {
    return <Onboarding onComplete={handleComplete} onCancel={backToSite} />;
  }

  const cfg = buildConfig(profile.inputs);

  /* Generated-config preview (shell arrives next) */
  return (
    <div className="min-h-screen bg-[#F5F5F5] px-6 py-8">
      <div className="max-w-[88rem] mx-auto">
        <div className="flex items-center justify-between mb-16">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #f0c94d, #b8860b)' }}
            >
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-xl font-medium tracking-tight text-black">SpendSmart</span>
          </div>
          <button
            onClick={backToSite}
            className="text-sm text-black/60 font-medium hover:text-black transition-colors duration-200 cursor-pointer"
          >
            ← Back to site
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <p className="text-[#B8860B] text-xs uppercase tracking-[0.4em] font-semibold mb-4">
            Your autonomous config
          </p>
          <h1 className="text-4xl font-medium text-black mb-6" style={{ letterSpacing: '-0.03em' }}>
            Hey {profile.inputs.name}, your dashboard is ready.
          </h1>
          <p className="text-black/60 text-lg mb-10 leading-relaxed">
            Built purely from your answers. Nothing is guessed — every number below came from what
            you told us.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-10">
            {[
              { label: 'Locked every month', value: fmt(cfg.fixed) },
              { label: 'Truly yours to spend', value: fmt(cfg.spendable) },
              { label: 'Daily allowance', value: `${fmt(cfg.dailyAllowance)}/day` },
              { label: 'Auto-saved to goal', value: fmt(cfg.monthlySave) },
              { label: 'Goal coverage', value: `${Math.round(cfg.goalPct * 100)}% of income` },
              { label: 'Runway', value: `${cfg.runwayDays} days` },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-black/45 font-semibold mb-2">{s.label}</p>
                <p className="text-2xl font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => go(PATH.dashboard)}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
          >
            Take me inside
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;