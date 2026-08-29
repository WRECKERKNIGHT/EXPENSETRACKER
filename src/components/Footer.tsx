import React from 'react';
import { Wallet, Github, Twitter, Mail } from 'lucide-react';
import { go, PATH } from '../lib/router';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Dashboard', action: () => go(PATH.dashboard) },
      { label: 'Autopilot', href: '#autopilot' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'SpendSmart',
    links: [
      { label: 'About', href: '#about' },
      { label: 'Privacy', href: '#' },
      { label: 'Security', href: '#security' },
      { label: 'Blog', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy policy', href: '#' },
      { label: 'Cookie notice', href: '#' },
      { label: 'Licenses', href: '#' },
    ],
  },
];

const Footer: React.FC = () => (
  <footer className="relative bg-[#18241C] text-white/70 overflow-hidden px-6 pt-20 pb-10">
    <div
      aria-hidden
      className="absolute left-0 top-0 right-0 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.6), transparent)' }}
    />
    <div
      aria-hidden
      className="absolute right-0 bottom-0 w-[30rem] h-[30rem] rounded-full opacity-10 pointer-events-none"
      style={{ background: 'radial-gradient(circle, #24352A 0%, transparent 60%)' }}
    />

    <div className="relative max-w-[88rem] mx-auto">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-10 pb-14">
        <div className="col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center border border-[#C9A444]/50"
              style={{ background: 'linear-gradient(135deg, #d5b256, #9a7416)' }}
            >
              <Wallet size={17} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="font-serif text-xl text-white">SpendSmart</span>
              <p className="text-[9px] uppercase tracking-[0.26em] text-[#d4af37] font-semibold mt-1.5">
                Money, mastered
              </p>
            </div>
          </div>
          <p className="max-w-sm text-white/50 text-sm leading-relaxed mb-6">
            The private expense tracker that reads your bank SMS, UPI and
            receipts so you never type a rupee again.
          </p>
          <div className="flex items-center gap-3">
            {[Github, Twitter, Mail].map((Icon, i) => (
              <button
                key={i}
                aria-label="Social link"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors duration-200 cursor-pointer"
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-[#d4af37] font-semibold mb-5">
              {col.title}
            </p>
            <ul className="space-y-3">
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href ?? '#'}
                    onClick={link.action ? (e) => { e.preventDefault(); link.action!(); } : undefined}
                    className="text-sm text-white/55 hover:text-white transition-colors duration-200 cursor-pointer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
        <p className="text-xs text-white/40">© {new Date().getFullYear()} SpendSmart. All rights reserved.</p>
        <p className="text-xs text-white/40 flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37]" style={{ boxShadow: '0 0 8px rgba(212,175,55,0.9)' }} />
          Made in India · Private by design
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;