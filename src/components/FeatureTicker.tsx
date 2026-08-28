import React from 'react';

const ITEMS = [
  'Track every rupee',
  'Protect your rent',
  'AI-powered insights',
  'Ghost savings',
  'Receipt OCR',
  'Bank connected',
  'Subscription hunter',
  'No more spreadsheets',
  'Daily allowance',
  'On-device privacy',
];

const FeatureTicker: React.FC = () => (
  <div className="bg-[#18241C] py-4 overflow-hidden">
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