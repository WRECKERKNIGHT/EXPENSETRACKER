import React from 'react';
import { TrendingDown, TrendingUp, CalendarClock, Zap } from 'lucide-react';
import { Category, DashboardConfig, Tx, fmt } from '../engine';

interface MomentumProps {
  cfg: DashboardConfig;
  tx: Tx[];
}

const weekSpend = (tx: Tx[], weeksAgo: number) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - weeksAgo * 7 - (now.getDay() || 7) + 1);
  const end = new Date(start.getTime() + 7 * 864e5);
  const s = start.toISOString().slice(0, 10);
  const e = end.toISOString().slice(0, 10);
  return tx
    .filter((t) => t.cat !== 'Savings' && t.date >= s && t.date < e)
    .reduce((sum, t) => sum + t.amount, 0);
};

const Momentum: React.FC<MomentumProps> = ({ cfg, tx }) => {
  const thisWeek = weekSpend(tx, 0);
  const lastWeek = weekSpend(tx, 1);
  const delta = thisWeek - lastWeek;
  const pct = lastWeek > 0 ? Math.round((delta / lastWeek) * 100) : 0;
  const up = delta > 0;

  const byCat = new Map<Category, number>();
  tx.filter((t) => t.cat !== 'Savings').forEach((t) => {
    byCat.set(t.cat, (byCat.get(t.cat) || 0) + t.amount);
  });
  const topCat = [...byCat.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? ('Other' as Category);
  const topSpend = byCat.get(topCat) || 0;

  let monthsToGoal = cfg.monthlySave > 0 ? Math.max(0, cfg.inputs.goal / cfg.monthlySave) : 0;

  return (
    <div className="grid sm:grid-cols-3 gap-4 mb-8">
      <div className="dash-card dash-rise rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45 font-semibold">This week vs last</p>
          <span
            className={`flex h-8 w-8 items-center justify-center rounded-full ${up ? 'text-[#c0392b]' : 'text-[#2a7a4b]'}`}
            style={{ background: up ? 'rgba(192,57,43,0.12)' : 'rgba(42,122,75,0.12)' }}
          >
            {up ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
          </span>
        </div>
        <p className="font-serif text-3xl font-semibold text-black">
          {thisWeek === 0 && lastWeek === 0 ? '—' : `${up ? '+' : ''}${fmt(Math.abs(delta))}`}
        </p>
        <p className="text-xs text-black/45 mt-1">
          {thisWeek === 0 && lastWeek === 0
            ? 'Add a few days of transactions'
            : up
              ? `${pct}% more than last week — the watcher is on it`
              : `${pct}% less than last week — keep it up`}
        </p>
      </div>

      <div className="dash-card dash-rise rounded-2xl bg-[#18241C] p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Goal runway</p>
          <CalendarClock size={16} className="text-[#d4af37]" />
        </div>
        <p className="font-serif text-3xl font-semibold text-white">
          {monthsToGoal > 0 ? `${monthsToGoal < 1.5 ? '<2' : Math.ceil(monthsToGoal)} mo` : '—'}
        </p>
        <p className="text-xs text-white/50 mt-1">
          {monthsToGoal > 0 ? `to hit your ₹ goal at ${fmt(cfg.monthlySave)}/mo` : 'Goal is met — raise it!'}
        </p>
      </div>

      <div className="dash-card dash-rise rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.2em] text-black/45 font-semibold">Leak radar</p>
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[#B8860B]" style={{ background: 'rgba(184,134,11,0.12)' }}>
            <Zap size={15} />
          </span>
        </div>
        <p className="font-serif text-3xl font-semibold text-black truncate">
          {topSpend > 0 ? `${topCat} · ${fmt(topSpend)}` : '—'}
        </p>
        <p className="text-xs text-black/45 mt-1 truncate">
          {topSpend > 0 ? 'biggest category in your ledger' : 'start importing to arm the radar'}
        </p>
      </div>
    </div>
  );
};

export default Momentum;