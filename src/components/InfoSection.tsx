import React from 'react';
import { DiscoverButton } from './Marquee';
import SplitHeading from './SplitHeading';
import Coin3D from './Coin3D';

const INFO_CARDS = [
  {
    title: 'Rent first.',
    body: 'Rent and fixed bills get locked before anything else. You only see what is truly yours to spend.',
  },
  {
    title: 'Fully\nautomated',
    body: 'Skip typing expenses yourself. SMS parsing and OCR handle the heavy lifting in the background.',
  },
  {
    title: 'Private by\ndesign',
    body: 'Sensitive parsing runs locally on your device. Your money story stays yours.',
  },
];

const InfoSection: React.FC = () => (
  <section id="about" className="relative overflow-hidden bg-[#F4EFE4] px-6 py-24">
    <div className="float-coin absolute hidden lg:block right-10 bottom-16" data-dist="70">
      <Coin3D size={46} label="10" />
    </div>
    <div className="max-w-[88rem] mx-auto">
      {/* Row 1: 2-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 items-start">
        <div>
          <SplitHeading
            as="h2"
            text="Meet SpendSmart."
            className="split-title text-black text-4xl md:text-5xl font-medium leading-tight mb-8"
            style={{ letterSpacing: '-0.03em' }}
          />
          <DiscoverButton />
        </div>
        <p className="font-serif text-black/70 text-2xl md:text-3xl leading-snug">
          SpendSmart is the smart ledger that parses your bank messages, scans receipts and uses AI
          to turn every rupee into clear, actionable insight — automatically.
        </p>
      </div>

      {/* Row 2: 4-col card grid */}
      <div className="gsap-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <h3 className="text-black text-2xl font-medium leading-snug mb-3">
              One ledger,<br />every rupee.
            </h3>
            <p className="text-black/70 text-base max-w-xs">
              Transactions from every bank, UPI app and receipt land in one living ledger —
              categorized, searchable, always at hand.
            </p>
          </div>
        </div>

        {/* Cards 2–4 */}
        <div
          className="gsap-card rounded-2xl p-7 min-h-80 flex flex-col justify-between"
          style={{ backgroundColor: '#18241C' }}
        >
          <h3 className="text-2xl font-medium leading-snug whitespace-pre-line text-white">
            {INFO_CARDS[0].title}
          </h3>
          <p className="text-base text-white/60">{INFO_CARDS[0].body}</p>
        </div>

        <div
          className="gsap-card rounded-2xl p-7 min-h-80 flex flex-col justify-between"
          style={{ backgroundColor: '#18241C' }}
        >
          <h3 className="text-2xl font-medium leading-snug whitespace-pre-line text-white">
            {INFO_CARDS[1].title}
          </h3>
          <p className="text-base text-white/60">{INFO_CARDS[1].body}</p>
        </div>

        <div className="gsap-card rounded-2xl p-7 min-h-80 flex flex-col justify-between bg-[#FBF9F0] border border-[#E7DEC7]">
          <h3 className="text-black text-2xl font-medium leading-snug">
            {INFO_CARDS[2].title.split('\n')[0]}
            {INFO_CARDS[2].title.includes('\n') ? <><br />{INFO_CARDS[2].title.split('\n')[1]}</> : null}
          </h3>
          <p className="text-black/70 text-base max-w-xs">{INFO_CARDS[2].body}</p>
        </div>
      </div>
    </div>
  </section>
);

export default InfoSection;