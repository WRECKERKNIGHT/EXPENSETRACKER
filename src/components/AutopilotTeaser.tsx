import React from 'react';
import { Play } from 'lucide-react';
import { go, PATH } from '../lib/router';

const LINES = [
  { id: '01', title: 'Scan the bill', sub: 'Auto-reads UPI + card receipts' },
  { id: '02', title: 'Tag & learn', sub: 'AI sorts every expense in real time' },
  { id: '03', title: 'Set the allowance', sub: 'A daily budget that actually sticks' },
];

const AutoSmall = [
  ['Coffee', '₹90', 'Food'],
  ['Auto', '₹210', 'Travel'],
  ['Groceries', '₹640', 'Essentials'],
];

export default function AutopilotTeaser() {
  return (
    <section className="auto-section relative bg-[#18241C] overflow-hidden px-6 py-28">
      <div aria-hidden className="aura w-[30rem] h-[30rem] -top-40 right-[10%]" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.22), transparent 70%)' }} />
      <div aria-hidden className="aura w-[26rem] h-[26rem] -bottom-40 left-[5%]" style={{ background: 'radial-gradient(circle, rgba(24,52,42,0.8), transparent 70%)' }} />
      <div className="auto-stage relative max-w-[88rem] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="auto-copy max-w-xl self-start lg:self-auto">
          <p className="auto-chapter kicker kicker-gold mb-3">
            Sense the machine
          </p>
          <h2
            className="auto-heading glow-cream text-[#FBF9F0] text-5xl md:text-7xl font-medium leading-[1.02] mb-6"
          >
            The <em className="text-[#d4af37] glow-gold">autopilot.</em>
          </h2>
          <p className="auto-sub text-white/60 text-base max-w-md">
            Stop logging every rupee. SpendSmart watches your UPI and does the
            bookkeeping while you live.
          </p>
          <div className="mt-10 space-y-6">
            {LINES.map((l) => (
              <div key={l.id} className="auto-line flex items-start gap-5">
                <span className="text-[#d4af37] text-xl font-medium mt-0.5">{l.id}</span>
                <div>
                  <p className="text-white text-lg font-medium">{l.title}</p>
                  <p className="text-white/50 text-sm mt-0.5">{l.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => go(PATH.dashboard)}
            className="auto-cta shine-btn mt-10 inline-flex items-center gap-2 bg-[#d4af37] text-[#18241C] font-semibold px-6 py-3 rounded-full text-sm uppercase tracking-wider group"
          >
            Turn it on
            <Play className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="auto-ui relative">
          <div className="auto-word pointer-events-none absolute -top-24 -right-8 select-none text-[10rem] lg:text-[15rem] leading-none font-medium text-[#d4af37]/10 glow-gold">
            50%
          </div>
          <div className="auto-card relative z-10 w-[19rem] rounded-3xl border border-white/10 bg-[#151F19]/80 p-7 backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-white/70 text-sm">Daily Autopilot</p>
              <span className="rounded-full bg-[#d4af37] px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[#18241C]">
                <span className="animate-pulse">●</span> LIVE
              </span>
            </div>
            <div className="mb-6 rounded-2xl bg-white/5 p-4">
              <p className="text-white/50 text-xs mb-1">Allowance left today</p>
              <p className="text-white text-3xl font-medium">₹460</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[63%] rounded-full" style={{ background: 'linear-gradient(90deg,#d5b256,#b8860b)' }} />
              </div>
            </div>
            <div className="space-y-3">
              {AutoSmall.map(([name, amount, tag]) => (
                <div key={name} className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{name}</p>
                    <p className="text-white/40 text-xs">{tag}</p>
                  </div>
                  <p className="text-white/70 text-sm">{amount}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}