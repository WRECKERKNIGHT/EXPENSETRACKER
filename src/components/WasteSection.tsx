import React from 'react';
import Coin3D from './Coin3D';
import SplitHeading from './SplitHeading';

const LINES = [
  '₹180 a month on coffee runs — gone.',
  '₹500 on subscriptions you never open.',
  '₹60 in charges that just… happen.',
  'Small leaks. Big yearly losses.',
];

const WasteSection: React.FC = () => (
  <section className="waste-section skew-target relative bg-[#18241C] overflow-hidden">
    <div className="waste-stage min-h-screen flex items-center overflow-hidden py-24">
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
          <p className="waste-chapter text-xs uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-6">
            Chapter 01 — The Leak
          </p>
          <SplitHeading
            as="h2"
            text="Money doesn't vanish.\nIt drips."
            highlight={['drips.']}
            emClass="text-[#d4af37]"
            className="waste-heading text-white text-4xl md:text-6xl font-medium leading-[1.05] mb-12"
            style={{ letterSpacing: '-0.04em' }}
          />
          <div className="relative h-72">
            {LINES.map((line, i) => (
              <p
                key={i}
                className={`waste-line-${i} absolute inset-x-0 text-lg md:text-2xl text-white/80 font-medium`}
                style={{ top: i * 60, opacity: 0 }}
              >
                <span className="text-[#d4af37] mr-3">✦</span>
                {line}
              </p>
            ))}
            <div
              className="waste-stat absolute inset-x-0 flex items-center gap-5"
              style={{ top: 4 * 60 + 4, opacity: 0 }}
            >
              <p className="text-3xl md:text-4xl font-semibold text-[#d4af37]">₹24,000+</p>
              <p className="text-sm md:text-base text-white/70 font-medium leading-snug">
                leaked last year, one small<br />
                bill at a time.
              </p>
            </div>
          </div>
        </div>

        <div className="relative h-[26rem] hidden lg:block">
          <div className="waste-coin-0 absolute" style={{ left: '6%', top: '36%', opacity: 0 }}>
            <Coin3D size={58} label="10" />
          </div>
          <div className="waste-coin-1 absolute" style={{ left: '30%', top: '28%', opacity: 0 }}>
            <Coin3D size={84} label="10" symbolBack="₹" />
          </div>
          <div className="waste-coin-2 absolute" style={{ left: '56%', top: '40%', opacity: 0 }}>
            <Coin3D size={66} label="10" />
          </div>
          <div className="waste-coin-3 absolute" style={{ left: '74%', top: '22%', opacity: 0 }}>
            <Coin3D size={96} label="10" symbolBack="₹" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default WasteSection;