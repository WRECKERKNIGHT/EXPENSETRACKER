import React from 'react';
import { Lock } from 'lucide-react';
import Coin3D from './Coin3D';
import SplitHeading from './SplitHeading';

const LINES = [
  'Rent gets locked in first. Always.',
  'Bills fly on autopilot — zero drama.',
  'You only see what is truly yours.',
  'That is your honest daily allowance.',
];

const SafetyNetSection: React.FC = () => (
  <section className="safety-section relative bg-[#18241C] overflow-hidden">
    <div className="safety-stage min-h-screen flex items-center py-24 overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute right-0 top-0 w-[40rem] h-[40rem] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #24352A 0%, transparent 60%)' }}
      />
      {[8, 35, 65, 92].map((left, i) => (
        <span
          key={i}
          className="particle-float absolute bottom-0 pointer-events-none w-1 h-1 rounded-full bg-white/15"
          style={{ left: `${left}%`, animationDelay: `${i * 5}s`, animationDuration: `${20 + i * 4}s` }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-14 items-center">
        <div className="relative h-[26rem] hidden lg:block">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`safety-coin-${i} absolute left-1/2 -translate-x-1/2`}
              style={{ top: 210 - i * 52, opacity: 0 }}
            >
              <Coin3D size={92} label="10" symbolBack="₹" />
            </div>
          ))}
          <div
            className="safety-shield absolute left-1/2 -translate-x-1/2 flex items-center justify-center"
            style={{ top: 40, opacity: 0 }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 132,
                height: 58,
                borderRadius: 20,
                background: 'linear-gradient(145deg, #26362C, #18241C)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.12)',
              }}
            >
              <Lock size={22} color="#d4af37" />
            </div>
          </div>
          <p className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full text-center text-sm text-white/50 font-medium">
            Four coins. One safety net.
          </p>
        </div>

        <div>
          <p className="safety-chapter text-xs uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-6">
            Chapter 02 — The Shield
          </p>
          <SplitHeading
            as="h2"
            text="Your Safety\nNet."
            highlight={['Net.']}
            emClass="text-[#d4af37]"
            className="safety-heading text-white text-4xl md:text-6xl font-medium leading-[1.05] mb-12"
            style={{ letterSpacing: '-0.04em' }}
          />
          <div className="relative h-56">
            {LINES.map((line, i) => (
              <p
                key={i}
                className={`safety-line-${i} absolute inset-x-0 text-lg md:text-2xl text-white/80 font-medium`}
                style={{ top: i * 56, opacity: 0 }}
              >
                <span className="text-[#d4af37] mr-3">✦</span>
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SafetyNetSection;