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
        <div className="hero-fade relative z-10 flex flex-col items-start justify-start h-full p-12 pt-36">
          <SplitHeading
            as="h1"
            text="Every rupee\nhas a story."
            highlight={['story.']}
            emClass="text-[#d4af37] glow-gold"
            className="hero-title glow-cream text-[#FBF9F0] text-6xl md:text-7xl lg:text-8xl font-medium leading-[0.98] max-w-2xl mb-5"
          />

          <p
            className="hero-animate text-[#FBF9F0]/80 text-base md:text-lg max-w-md mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
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