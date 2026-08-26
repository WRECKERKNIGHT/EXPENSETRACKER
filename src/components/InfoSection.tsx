import React from 'react';
import { DiscoverButton } from './Marquee';

const INFO_CARDS = [
  {
    title: 'Always fluid,\nalways pegged.',
    body: 'Keep fully dollar-anchored with on-demand access to funds — no lockups or waits.',
    bg: '#2B2644',
    titleColor: 'text-white',
    bodyColor: 'text-white/60',
  },
  {
    title: 'Fully\nautomated',
    body: 'Skip the task of tuning positions yourself. USD Halo runs in the background for you.',
    bg: '#2B2644',
    titleColor: 'text-white',
    bodyColor: 'text-white/60',
  },
];

const InfoSection: React.FC = () => (
  <section className="bg-[#F5F5F5] px-6 py-24">
    <div className="max-w-[88rem] mx-auto">
      {/* Row 1: 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
        <div>
          <h2
            className="text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
            style={{ letterSpacing: '-0.03em' }}
          >
            Meet USD Halo.
          </h2>
          <DiscoverButton />
        </div>
        <p className="text-black/70 text-2xl md:text-3xl leading-relaxed">
          USD Halo is a reward-earning dollar coin that lets your savings grow while remaining tied to the U.S. dollar.
        </p>
      </div>

      {/* Row 2: 4-col card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: image card, spans 2 cols */}
        <div
          className="gsap-card rounded-2xl overflow-hidden col-span-1 lg:col-span-2"
          style={{
            backgroundImage: 'url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260423_164207_f243351d-ed59-48ec-83a0-a5e996bdbe3c.png&w=1280&q=85)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="p-7 min-h-80 flex flex-col justify-between">
            <p
              className="text-black text-2xl font-medium leading-snug"
              style={{ letterSpacing: '-0.02em' }}
            >
              Savings that bloom
            </p>
            <p className="text-black/70 text-base max-w-xs">
              Gain steady returns as your dollar tokens are routed into top-performing DeFi strategies.
            </p>
          </div>
        </div>

        {/* Card 2 & 3 */}
        {INFO_CARDS.map((card, i) => (
          <div
            key={i}
            className="gsap-card rounded-2xl p-7 min-h-80 flex flex-col justify-between"
            style={{ backgroundColor: card.bg }}
          >
            <p className={`text-2xl font-medium leading-snug whitespace-pre-line ${card.titleColor}`}>
              {card.title}
            </p>
            <p className={`text-base ${card.bodyColor}`}>
              {card.body}
            </p>
          </div>
        ))}

        {/* Card 4: empty spacer or additional content */}
        <div className="gsap-card rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-white/50 border border-gray-100">
          <p
            className="text-black text-2xl font-medium leading-snug"
            style={{ letterSpacing: '-0.02em' }}
          >
            Built for scale
          </p>
          <p className="text-black/70 text-base max-w-xs">
            Enterprise-grade infrastructure designed to handle millions in TVL with zero downtime.
          </p>
        </div>
      </div>
    </div>
  </section>
);

export default InfoSection;
