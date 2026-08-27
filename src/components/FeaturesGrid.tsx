import React from 'react';
import { Wallet, ShieldCheck, Zap, TrendingUp, Lock, Globe } from 'lucide-react';

const FEATURES = [
  { icon: Wallet, title: 'Reward Routing', desc: 'Your balance is continuously deployed into yield-bearing DeFi strategies.' },
  { icon: ShieldCheck, title: 'Dollar-Anchored', desc: '1:1 U.S. dollar backing with on-demand redemptions. Period.' },
  { icon: Zap, title: 'Zero Lockups', desc: 'Funds flow in and out freely. No waiting periods, no liquidity roulette.' },
  { icon: TrendingUp, title: 'Auto-Compounding', desc: 'Yield re-enters strategies automatically for exponential growth.' },
  { icon: Lock, title: 'Treasury-Grade', desc: 'Audited contracts and battle-tested infrastructure built for scale.' },
  { icon: Globe, title: 'DeFi Native', desc: 'Plug into the wider ecosystem with effortless, open connectivity.' },
];

const FeaturesGrid: React.FC = () => (
  <section className="bg-[#F5F5F5] px-6 py-24">
    <div className="max-w-[88rem] mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-black/60 text-sm mb-3">Chapter 03 — The Build</p>
        <h2
          className="text-black text-4xl md:text-6xl font-medium leading-[1.05]"
          style={{ letterSpacing: '-0.04em' }}
        >
          Built to earn.<br />Built to <em className="text-black">last.</em>
        </h2>
      </div>

      <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="feature-card rounded-2xl p-7 min-h-56 flex flex-col justify-between bg-white border border-gray-100 hover:border-gray-200 transition-colors duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#2B2644] flex items-center justify-center mb-6">
              <f.icon size={20} className="text-white" />
            </div>
            <div>
              <h3
                className="text-black text-xl font-medium leading-snug mb-2"
                style={{ letterSpacing: '-0.02em' }}
              >
                {f.title}
              </h3>
              <p className="text-black/60 text-base leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesGrid;