import React from 'react';
import { Gauge } from 'lucide-react';
import { DashboardConfig, Tx, fmt, todayISO } from '../engine';

interface AllowanceCardProps {
  cfg: DashboardConfig;
  tx: Tx[];
}

const CAT_COLOR: Record<string, string> = {
  Food: '#B8860B',
  Transport: '#2B2644',
  Shopping: '#8a5d0b',
  Subscriptions: '#a06a15',
  Utilities: '#5c4f8a',
  Savings: '#c9a227',
  Other: '#888',
};

const AllowanceCard: React.FC<AllowanceCardProps> = ({ cfg, tx }) => {
  const today = todayISO();
  const todays = tx.filter((t) => t.date === today);
  const spent = todays.filter((t) => t.cat !== 'Savings').reduce((s, t) => s + t.amount, 0);
  const pct = cfg.dailyAllowance > 0 ? Math.min(1, spent / cfg.dailyAllowance) : 0;
  const left = Math.max(0, cfg.dailyAllowance - spent);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6 flex flex-col">
      <div className="flex items-center gap-2 mb-5">
        <Gauge size={17} className="text-[#B8860B]" />
        <h3 className="text-lg font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
          Today's allowance
        </h3>
      </div>

      <div className="flex items-end justify-between mb-3">
        <p className="text-3xl font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
          {fmt(left)}
        </p>
        <p className="text-sm text-black/45">{fmt(spent)} used of {fmt(cfg.dailyAllowance)}</p>
      </div>

      <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: '#EDE8F5' }}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct >= 1 ? 'bg-[#c0392b]' : ''
          }`}
          style={{ width: `${pct * 100}%`, background: pct >= 1 ? '#c0392b' : 'linear-gradient(90deg, #f0c94d, #b8860b)' }}
        />
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-56">
        {todays.length === 0 && (
          <p className="text-sm text-black/40">Nothing spent yet today. The full allowance is yours.</p>
        )}
        {todays.map((t) => (
          <div key={t.id} className="flex items-center gap-3 rounded-xl bg-[#F5F5F5] px-3 py-2.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CAT_COLOR[t.cat] || '#888' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-black font-medium truncate">{t.name}</p>
              <p className="text-xs text-black/40">{t.cat}</p>
            </div>
            <p className="text-sm font-semibold text-black">{fmt(t.amount)}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllowanceCard;