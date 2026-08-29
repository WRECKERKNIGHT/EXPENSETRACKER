import React from 'react';
import {
  Smartphone,
  ScanLine,
  Sparkles,
  ShieldCheck,
  PiggyBank,
  BellRing,
  Landmark,
  Fingerprint,
} from 'lucide-react';
import SplitHeading from './SplitHeading';

const FEATURES = [
  {
    icon: Smartphone,
    title: 'Smart Import',
    desc: 'Paste a bank SMS or UPI alert and watch it become a categorized transaction — parsed on your device.',
  },
  {
    icon: ScanLine,
    title: 'Receipt OCR',
    desc: 'Snap a bill or drop a PDF. Amount, taxes, merchant and line items — extracted instantly.',
  },
  {
    icon: Sparkles,
    title: 'AI Advisor',
    desc: 'Reads your week, week vs week, and tells you your goal runway and top leak — in plain words.',
  },
  {
    icon: ShieldCheck,
    title: 'Rent Shield',
    desc: 'Rent and fixed bills are locked before anything else. You only see what is truly yours to spend.',
  },
  {
    icon: PiggyBank,
    title: 'Ghost Savings',
    desc: 'Skip an impulse buy? Log it and watch that money hop straight into a savings vault.',
  },
  {
    icon: BellRing,
    title: 'Subscription Hunter',
    desc: 'Recurring charges you never use get flagged — with their one-year burn rate attached.',
  },
  {
    icon: Landmark,
    title: 'Bank & CSV',
    desc: 'Link your bank, drop in a CSV, or import messages. Every source, one ledger.',
  },
  {
    icon: Fingerprint,
    title: 'Privacy First',
    desc: 'Sensitive parsing runs locally on your device. Your money story stays yours.',
  },
];

const FeaturesGrid: React.FC = () => (
  <section id="features" className="relative overflow-hidden bg-[#F4EFE4] px-6 py-24">
    <div className="max-w-[88rem] mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="kicker mb-4">Chapter 03 — The Build</p>
        <SplitHeading
          as="h2"
          text="Built to save.\nBuilt to last."
          highlight={['last.']}
          className="split-title text-black text-5xl md:text-7xl font-medium leading-[1.02]"
        />
      </div>

      <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="feature-card tilt-card rounded-2xl p-7 min-h-56 flex flex-col justify-between bg-[#FBF9F0] border border-[#E7DEC7] hover:border-gray-200 transition-colors duration-300"
          >
<div className="w-11 h-11 rounded-full bg-[#18241C] border border-[#C9A444]/50 flex items-center justify-center mb-6">
              <f.icon size={20} className="text-[#d5b256]" />
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