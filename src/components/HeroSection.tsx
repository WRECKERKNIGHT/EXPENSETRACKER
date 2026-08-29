import React from 'react';
import SplitHeading from './SplitHeading';
import { BrandMarquee, JoinUsButton } from './Marquee';
import { go, PATH } from '../lib/router';

const HeroSection: React.FC = () => {
  return (
    <div className="hero-scroll flex-1 px-6 pt-20 pb-6 flex items-end">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ height: 'calc(100vh - 96px)' }}
      >
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="hero-video-el object-cover absolute inset-0 w-full h-full"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260423_161253_c72b1869-400f-45ed-ac0c-52f68c2ed5bd.mp4"
        />

        {/* Content Overlay */}
        <div className="hero-glow absolute left-[6%] top-[12%] w-[30rem] h-[20rem] pointer-events-none rounded-full" style={{ background: 'radial-gradient(closest-side, rgba(212,175,55,0.28), transparent 70%)', filter: 'blur(30px)' }} />
        <div className="hero-fade relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
          <p className="hero-animate inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/40 bg-[#18241C]/60 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d4af37] mb-5 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#d4af37]" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
            Private beta · Free forever
          </p>
          <SplitHeading
            as="h1"
            text="Every rupee\nhas a story."
            highlight={['story.']}
            emClass="text-[#d4af37] glow-gold"
            className="hero-title glow-cream text-[#FBF9F0] text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.98] max-w-2xl mb-5"
          />

          <p
            className="hero-animate serif-lead text-[#FBF9F0]/85 text-lg md:text-xl max-w-lg mb-9 leading-snug"
          >
            SpendSmart reads the story your money is already writing — bank SMS, UPI and receipts —
            and turns every rupee into clear, private insight.
          </p>

          <div className="hero-animate">
            <JoinUsButton label="Get Started" onClick={() => go(PATH.dashboard)} />
          </div>

          <div className="hero-animate">
            <BrandMarquee />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;