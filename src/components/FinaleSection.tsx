import React from 'react';
import { ArrowRight } from 'lucide-react';
import SplitHeading from './SplitHeading';
import { go, PATH } from '../lib/router';

const FinaleSection: React.FC = () => (
  <section className="finale-section relative bg-[#18241C] overflow-hidden">
    <div className="finale-stage min-h-screen flex items-center justify-center py-24 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(212,175,55,0.10) 0%, transparent 55%)' }}
      />
      {[15, 45, 70, 88].map((left, i) => (
        <span
          key={i}
          className="particle-float absolute bottom-0 pointer-events-none w-1.5 h-1.5 rounded-full bg-[#d4af37]/25"
          style={{ left: `${left}%`, animationDelay: `${i * 6}s`, animationDuration: `${22 + i * 4}s` }}
        />
      ))}

      <div className="relative z-10 text-center px-6">
        <div className="relative h-44 flex items-center justify-center mb-6 select-none">
          <span
            className="finale-mark font-serif font-semibold leading-none text-[#d4af37]/15 glow-gold"
            style={{ fontSize: '12rem', opacity: 0 }}
          >
            ₹
          </span>
        </div>

        <div className="finale-content">
          <p className="finale-kicker text-[11px] uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-5">
            The Flip
          </p>
          <SplitHeading
            as="h2"
            text="Ready to make money\nwork?"
            highlight={['work?']}
            emClass="text-[#d4af37] glow-gold"
            className="finale-title glow-cream text-[#FBF9F0] text-5xl md:text-7xl font-medium leading-[1.02] mb-7"
          />
          <p className="finale-sub text-white/70 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Join SpendSmart — free forever for the first 10,000 users. Turn every coin into a story
            that ends in savings.
          </p>
          <div className="finale-actions flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => go(PATH.dashboard)}
              className="inline-flex items-center gap-3 bg-white text-black text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              Start Free
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-5 h-5 text-white" />
              </span>
            </button>
            <button
              onClick={() => go(PATH.dashboard)}
              className="px-8 py-3 rounded-full border border-white/25 text-white/80 font-medium hover:border-white/60 hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FinaleSection;