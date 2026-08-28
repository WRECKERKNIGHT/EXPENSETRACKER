import React from 'react';
import { ArrowRight } from 'lucide-react';
import Coin3D from './Coin3D';

const FinaleSection: React.FC = () => (
  <section className="finale-section relative bg-[#2B2644] overflow-hidden">
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
        <div className="relative h-56 flex items-center justify-center mb-8">
          <div className="finale-ring absolute w-56 h-56 rounded-full border-2 border-[#d4af37]/40" style={{ opacity: 0 }} />
          <div className="finale-coin relative">
            <Coin3D size={132} label="10" symbolBack="SM" />
          </div>
        </div>

        <div className="finale-content" style={{ opacity: 0 }}>
          <p className="text-[11px] uppercase tracking-[0.4em] text-[#d4af37] font-semibold mb-5">
            The Flip
          </p>
          <h2
            className="text-white text-4xl md:text-6xl font-medium leading-[1.05] mb-7"
            style={{ letterSpacing: '-0.04em' }}
          >
            Ready to make money<br />
            <em className="text-[#d4af37]">work?</em>
          </h2>
          <p className="text-white/70 text-base md:text-lg max-w-md mx-auto mb-10 leading-relaxed">
            Join SpendSmart — free forever for the first 10,000 users. Turn every coin into a story
            that ends in savings.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="inline-flex items-center gap-3 bg-white text-black text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
              Start Free
              <span className="bg-black rounded-full p-2">
                <ArrowRight className="w-5 h-5 text-white" />
              </span>
            </button>
            <button className="px-8 py-3 rounded-full border border-white/25 text-white/80 font-medium hover:border-white/60 hover:text-white transition-colors duration-200 cursor-pointer">
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default FinaleSection;