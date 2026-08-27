import React from 'react';
import { Landmark, TrendingUp, MonitorPlay } from 'lucide-react';

const STEPS = [
  { icon: Landmark, num: '01', title: 'Connect', desc: 'Deposit dollars and receive your USD Halo balance instantly.' },
  { icon: TrendingUp, num: '02', title: 'Earn', desc: 'Tokens are routed into proven strategies automatically, around the clock.' },
  { icon: MonitorPlay, num: '03', title: 'Live', desc: 'Track, withdraw, or compound any time. No forms, no waits.' },
];

const HowItWorks: React.FC = () => (
  <section className="bg-[#F5F5F5] px-6 pb-24">
    <div className="max-w-[88rem] mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-black/60 text-sm mb-3">Chapter 04 — The Flow</p>
        <h2
          className="text-black text-4xl md:text-6xl font-medium leading-[1.05]"
          style={{ letterSpacing: '-0.04em' }}
        >
          Three moves.<br />That's <em className="text-black">it.</em>
        </h2>
      </div>

      <div className="steps-grid grid gap-4 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="step-card relative rounded-2xl bg-white border border-gray-100 p-9 overflow-hidden"
          >
            <span
              className="absolute -top-3 right-5 text-[7rem] leading-none font-semibold text-black/[0.05] pointer-events-none"
              style={{ letterSpacing: '-0.04em' }}
            >
              {s.num}
            </span>
            <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center mb-7">
              <s.icon size={20} className="text-white" />
            </div>
            <h3
              className="text-black text-2xl font-medium mb-3"
              style={{ letterSpacing: '-0.02em' }}
            >
              {s.title}
            </h3>
            <p className="text-black/60 text-base leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;