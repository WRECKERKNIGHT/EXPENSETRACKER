import React from 'react';
import Coin3D from './Coin3D';

const LINES = [
  'Every second your dollars sit idle, they could be earning.',
  'USD Halo routes your balance into proven yield strategies.',
  'Rewards stream in automatically — you do nothing.',
  'Withdraw any time. No lockups. No waits.',
];

const RewardsSection: React.FC = () => (
  <section className="rewards-section relative bg-[#17142B] overflow-hidden">
    <div className="rewards-stage min-h-screen flex items-center overflow-hidden py-24">
      {/* Ambient glow */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #b8960c 0%, transparent 55%)' }}
      />
      {/* Floating particles */}
      {[5, 25, 50, 75, 90].map((left, i) => (
        <span
          key={i}
          className="particle-float absolute bottom-0 pointer-events-none w-1.5 h-1.5 rounded-full bg-[#d4af37]/30"
          style={{ left: `${left}%`, animationDelay: `${i * 4}s`, animationDuration: `${18 + i * 3}s` }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
        <div>
          <p className="rewards-chapter text-xs uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-6">
            Chapter 01 — The Drip
          </p>
          <h2
            className="rewards-heading text-white text-4xl md:text-6xl font-medium leading-[1.05] mb-12"
            style={{ letterSpacing: '-0.04em' }}
          >
            Your dollars don't sleep.<br />
            They <em className="text-[#d4af37]">drip.</em>
          </h2>
          <div className="relative h-64">
            {LINES.map((line, i) => (
              <p
                key={i}
                className={`rewards-line-${i} absolute inset-x-0 text-lg md:text-2xl text-white/80 font-medium`}
                style={{ top: i * 56, opacity: 0 }}
              >
                <span className="text-[#d4af37] mr-3">✦</span>
                {line}
              </p>
            ))}
            <div
              className="rewards-stat absolute inset-x-0 flex items-center gap-5"
              style={{ top: 4 * 56 + 4, opacity: 0 }}
            >
              <p className="text-3xl md:text-4xl font-semibold text-[#d4af37]">$142</p>
              <p className="text-sm md:text-base text-white/70 font-medium leading-snug">
                avg. daily yield streamed<br />
                to a single holder.
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-[26rem] hidden lg:block">
          <div className="rewards-coin-0 absolute" style={{ left: '6%', top: '40%', opacity: 0 }}>
            <Coin3D size={64} />
          </div>
          <div className="rewards-coin-1 absolute" style={{ left: '30%', top: '32%', opacity: 0 }}>
            <Coin3D size={84} symbol="H" symbolBack="$" />
          </div>
          <div className="rewards-coin-2 absolute" style={{ left: '56%', top: '44%', opacity: 0 }}>
            <Coin3D size={68} />
          </div>
          <div className="rewards-coin-3 absolute" style={{ left: '74%', top: '26%', opacity: 0 }}>
            <Coin3D size={96} symbol="H" symbolBack="$" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default RewardsSection;