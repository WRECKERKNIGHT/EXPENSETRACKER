import React from 'react';
import { Smartphone, Sparkles, TrendingUp } from 'lucide-react';
import SplitHeading from './SplitHeading';

const STEPS = [
  {
    icon: Smartphone,
    num: '01',
    title: 'Connect',
    desc: 'Link your bank, import your SMS, or upload receipts and CSV statements.',
  },
  {
    icon: Sparkles,
    num: '02',
    title: 'Watch it think',
    desc: 'AI sorts every transaction into categories and flags repeats in seconds.',
  },
  {
    icon: TrendingUp,
    num: '03',
    title: 'Get richer',
    desc: 'A daily allowance, rent shield and forecasts keep you ahead of every bill.',
  },
];

const HowItWorks: React.FC = () => (
  <section id="how" className="bg-[#F5F5F5] px-6 pb-24">
    <div className="max-w-[88rem] mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-[#B8860B] text-xs uppercase tracking-[0.4em] font-semibold mb-3">
          Chapter 04 — The Flow
        </p>
        <SplitHeading
          as="h2"
          text="Three moves.\nThat's it."
          highlight={['it.']}
          className="split-title text-black text-4xl md:text-6xl font-medium leading-[1.05]"
          style={{ letterSpacing: '-0.04em' }}
        />
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
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mb-7"
              style={{ background: 'linear-gradient(135deg, #f0c94d, #b8860b)' }}
            >
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