import React from 'react';

const ITEMS = [
  'Reward-powered digital dollar',
  '1:1 dollar pegged',
  'Auto-compounding yields',
  'Zero lockups',
  'DeFi native',
  'Treasury-grade',
  'Instant redemptions',
  'Audited & transparent',
];

const FeatureTicker: React.FC = () => (
  <div className="bg-black py-4 overflow-hidden">
    <div className="ticker-track">
      {[...ITEMS, ...ITEMS].map((item, i) => (
        <span
          key={i}
          className="mx-8 shrink-0 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.22em] text-white/70 flex items-center gap-8"
        >
          {item} <span className="text-[#d4af37]">✦</span>
        </span>
      ))}
    </div>
  </div>
);

export default FeatureTicker;