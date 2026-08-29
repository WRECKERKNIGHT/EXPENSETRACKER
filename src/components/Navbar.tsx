import React from 'react';
import { Wallet } from 'lucide-react';
import { go, PATH } from '../lib/router';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Privacy', href: '#about' },
  { label: 'Blog', href: '#' },
  { label: 'Support', href: '#' },
];

const Navbar: React.FC = () => (
  <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
    <div className="flex items-center justify-between max-w-[88rem] mx-auto">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center border border-[#C9A444]/60 shadow-sm"
          style={{ background: 'linear-gradient(135deg, #d5b256, #9a7416)' }}
        >
          <Wallet size={17} className="text-white" />
        </div>
        <div className="leading-none">
          <span className="font-serif text-xl text-black">SpendSmart</span>
          <p className="text-[9px] uppercase tracking-[0.26em] text-[#B8860B] font-semibold mt-1.5">
            Money, mastered
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="nav-link text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
          >
            {link.label}
          </a>
        ))}
      </div>

      <button
        onClick={() => go(PATH.dashboard)}
        className="shine-btn bg-[#18241C] text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer"
      >
        Get Started
      </button>
    </div>
  </nav>
);

export default Navbar;