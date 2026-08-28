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

const FEATURES = [
  {
    icon: Smartphone,
    title: 'SMS Parsing',
    desc: 'Bank messages become categorized transactions. No typing, no missed spends.',
  },
  {
    icon: ScanLine,
    title: 'Receipt OCR',
    desc: 'Snap a bill or drop a PDF. Amount, taxes, merchant and line items — extracted instantly.',
  },
  {
    icon: Sparkles,
    title: 'AI Advisor',
    desc: 'Ask "can I afford this after rent?" and get an honest, data-driven answer.',
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
  <section id="features" className="bg-[#F5F5F5] px-6 py-24">
    <div className="max-w-[88rem] mx-auto">
      <div className="max-w-2xl mb-16">
        <p className="text-[#B8860B] text-sm mb-3">Chapter 03 — The Build</p>
        <h2
          className="text-black text-4xl md:text-6xl font-medium leading-[1.05]"
          style={{ letterSpacing: '-0.04em' }}
        >
          Built to save.<br />Built to <em className="text-black">last.</em>
        </h2>
      </div>

      <div className="features-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="feature-card rounded-2xl p-7 min-h-56 flex flex-col justify-between bg-white border border-gray-100 hover:border-gray-200 transition-colors duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-[#2B2644] flex items-center justify-center mb-6">
              <f.icon size={20} className="text-[#d4af37]" />
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