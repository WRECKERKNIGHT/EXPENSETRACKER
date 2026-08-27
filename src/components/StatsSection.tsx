import React from 'react';

const STATS = [
  { value: '420', decimals: 0, suffix: 'M+', label: 'Total value secured' },
  { value: '8', decimals: 0, suffix: '', label: 'Yield strategies routed' },
  { value: '99.9', decimals: 1, suffix: '%', label: 'Infrastructure uptime' },
  { value: '24', decimals: 0, suffix: '/7', label: 'On-demand redemptions' },
];

const StatsSection: React.FC = () => (
  <section className="bg-[#2B2644] px-6 py-20">
    <div className="max-w-[88rem] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
      {STATS.map((st) => (
        <div key={st.label} className="text-center">
          <p
            className="text-4xl md:text-6xl font-semibold text-[#d4af37]"
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