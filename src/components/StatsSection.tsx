import React from 'react';

const STATS = [
  { value: '24', decimals: 0, suffix: '+', label: 'Smart categories' },
  { value: '98', decimals: 0, suffix: '%', label: 'Parsing accuracy' },
  { value: '500', decimals: 0, suffix: '+', label: 'Transactions tracked' },
  { value: '3', decimals: 0, suffix: ' min', label: 'To full setup' },
];

const StatsSection: React.FC = () => (
  <section className="relative bg-[#18241C] px-6 py-20 overflow-hidden">
    <div
      aria-hidden
      className="absolute left-0 top-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }}
    />
    <div
      aria-hidden
      className="absolute left-0 bottom-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)' }}
    />
    <div className="max-w-[88rem] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
      {STATS.map((st) => (
        <div key={st.label} className="stat-shine text-center px-2 py-4">
          <p className="stat-glow font-serif text-4xl md:text-6xl font-semibold text-[#d5b256]" style={{ letterSpacing: '-0.02em' }}>
            <span
              className="stat-count"
              data-value={st.value}
              data-decimals={st.decimals}
              data-suffix={st.suffix}
            >
              0{st.decimals > 0 ? `.${'0'.repeat(st.decimals)}` : ''}
            </span>
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-white/60 font-semibold">
            {st.label}
          </p>
        </div>
      ))}
    </div>
  </section>
);

export default StatsSection;