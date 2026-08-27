import React from 'react';
import { BrandMarquee, JoinUsButton } from './Marquee';

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
          <h1
            className="hero-animate text-black text-5xl md:text-6xl font-medium leading-tight max-w-xl mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Your Wealth<br />Works
          </h1>

          <p
            className="hero-animate text-black/70 text-base md:text-lg max-w-md mb-8 leading-relaxed"
            style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
          >
            An automated, reward-powered digital dollar built for native passive earnings and effortless connection into DeFi.
          </p>

          <div className="hero-animate">
            <JoinUsButton />
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