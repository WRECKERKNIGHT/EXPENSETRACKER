import React from 'react';

const STATS = [
  { value: '24', decimals: 0, suffix: '+', label: 'Smart categories' },
  { value: '98', decimals: 0, suffix: '%', label: 'Parsing accuracy' },
  { value: '500', decimals: 0, suffix: '+', label: 'Transactions tracked' },
  { value: '3', decimals: 0, suffix: ' min', label: 'To full setup' },
];

const StatsSection: React.FC = () => (
  <section className="bg-[#18241C] px-6 py-20">
    <div className="max-w-[88rem] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
      {STATS.map((st) => (
        <div key={st.label} className="stat-shine text-center px-2 py-4">
          <p
            className="font-serif text-4xl md:text-6xl font-semibold text-[#d5b256]"
            style={{ letterSpacing: '-0.04em' }}
          >
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