import React from 'react';
import {
  ArrowRight,
  Cpu,
  Fingerprint,
  ScrollText,
  EyeOff,
  Lock,
} from 'lucide-react';
import SplitHeading from './SplitHeading';
import { go, PATH } from '../lib/router';

const VAULT_ROWS = [
  {
    icon: Cpu,
    title: 'Local-first engine',
    sub: 'Parsing, tagging and budgets run on your device — not on a server.',
  },
  {
    icon: EyeOff,
    title: 'Zero-knowledge',
    sub: 'Your numbers are encrypted before they ever leave the phone.',
  },
  {
    icon: Fingerprint,
    title: 'Biometric vault',
    sub: 'Only you can unlock the story. Face or fingerprint, that is it.',
  },
  {
    icon: ScrollText,
    title: 'Audit trail',
    sub: 'Every auto-read is logged, replayable and deletable forever.',
  },
];

const SecuritySection: React.FC = () => (
  <section className="vault-section relative bg-[#18241C] overflow-hidden">
    <div className="vault-stage min-h-screen flex items-center py-24 overflow-hidden px-6">
      <div
        aria-hidden
        className="absolute left-0 top-0 w-[36rem] h-[36rem] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #24352A 0%, transparent 60%)' }}
      />
      <div aria-hidden className="aura w-[26rem] h-[26rem] -right-24 top-[15%]" style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.14), transparent 70%)' }} />

      <div className="relative z-10 max-w-[88rem] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="vault-copy">
          <p className="vault-chapter kicker kicker-gold mb-6">Chapter 05 — The Vault</p>
          <SplitHeading
            as="h2"
            text="Your money,\nyour secret."
            highlight={['secret.']}
            emClass="text-[#d4af37] glow-gold"
            className="vault-heading glow-cream text-[#FBF9F0] text-5xl md:text-7xl font-medium leading-[1.02] mb-7"
          />
          <p className="vault-sub serif-lead text-white/75 text-lg max-w-md mb-10 leading-relaxed">
            SpendSmart was built the way a bank vault should be built — private by design,
            not private by promise.
          </p>
          <div className="space-y-5">
            {VAULT_ROWS.map((row, i) => (
              <div key={row.title} className={`vault-line-${i} flex items-start gap-5`}>
                <span className="mt-1 shrink-0 flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A444]/50 bg-[#151F19] text-[#d4af37]">
                  <row.icon size={17} />
                </span>
                <div>
                  <p className="text-white text-base font-medium">{row.title}</p>
                  <p className="text-white/50 text-sm mt-0.5 leading-relaxed">{row.sub}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => go(PATH.dashboard)}
            className="vault-cta mt-10 inline-flex items-center gap-2 text-[#d4af37] font-medium group"
          >
            See the vault in action
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="relative flex justify-center">
          <div
            aria-hidden
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[26rem] h-[26rem] rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.18), transparent 68%)' }}
          />
          <div
            className="vault-card relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#151F19]/85 p-9 backdrop-blur"
            style={{ boxShadow: '0 40px 90px -40px rgba(0,0,0,0.8)' }}
          >
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-[#d4af37]"
                  style={{ background: 'linear-gradient(145deg, #26362C, #18241C)', boxShadow: '0 12px 30px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.12)', filter: 'drop-shadow(0 0 14px rgba(212,175,55,0.35))' }}
                >
                  <Lock size={20} />
                </span>
                <div>
                  <p className="text-white text-sm font-medium">Private Vault</p>
                  <p className="text-white/40 text-xs">End-to-end encrypted</p>
                </div>
              </div>
              <span className="rounded-full bg-[#d4af37]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                AES-256
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4">
                <span className="text-white text-sm">Balance</span>
                <span className="text-white text-2xl font-medium">₹ 84,120<span className="text-[#d4af37]">.40</span></span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4">
                <span className="text-white text-sm">Daily allowance</span>
                <span className="text-white font-medium">₹ 460 unlocked</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 px-5 py-4">
                <span className="text-white text-sm">Reads this week</span>
                <span className="text-white font-medium">27 <span className="text-white/40 text-xs">· all local</span></span>
              </div>
              <div className="rounded-2xl border border-[#d4af37]/30 bg-[#d4af37]/5 px-5 py-4">
                <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37] font-semibold mb-1">Vault status</p>
                <p className="text-white text-sm">Everything stays on your device
                  <span className="ml-2 inline-block h-2 w-2 rounded-full bg-[#d4af37] align-middle" style={{ boxShadow: '0 0 10px rgba(212,175,55,0.9)' }} />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default SecuritySection;