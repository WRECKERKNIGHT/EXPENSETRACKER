import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Brand {
  name: string;
  style: React.CSSProperties;
}

const BRANDS: Brand[] = [
  { name: 'Stripe', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'Coinbase', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Uniswap', style: { fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px', fontStyle: 'italic' } },
  { name: 'Aave', style: { fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Compound', style: { fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'MakerDAO', style: { fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Chainlink', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
];

const BACKER_BRANDS: Brand[] = [
  { name: 'Fundamental Labs', style: { fontFamily: 'Times New Roman, serif', fontWeight: 400, letterSpacing: '0.02em', fontSize: '14px' } },
  { name: 'KUCOIN', style: { fontFamily: 'Arial Black, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '16px' } },
  { name: 'NGC', style: { fontFamily: 'Impact, sans-serif', fontWeight: 700, letterSpacing: '0.05em', fontSize: '18px' } },
  { name: 'NxGen', style: { fontFamily: 'Georgia, serif', fontWeight: 600, letterSpacing: '-0.02em', fontSize: '17px' } },
  { name: 'Matter Labs', style: { fontFamily: 'Helvetica, sans-serif', fontWeight: 700, letterSpacing: '-0.01em', fontSize: '15px' } },
  { name: 'DEXTools', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '0.06em', fontSize: '14px', textTransform: 'uppercase' as const } },
  { name: 'NGRAVE', style: { fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.18em', fontSize: '14px' } },
  { name: 'Polychain', style: { fontFamily: 'Palatino, serif', fontWeight: 500, letterSpacing: '0.03em', fontSize: '15px' } },
];

/* ── Brand Marquee (Hero) ── */
export const BrandMarquee: React.FC = () => {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="mt-24 w-full max-w-md overflow-hidden">
      <div className="marquee-track">
        {items.map((b, i) => (
          <span key={i} className="mx-7 shrink-0 text-black/60 whitespace-nowrap" style={b.style}>
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Backers Marquee ── */
export const BackersMarquee: React.FC = () => {
  const items = [...BACKER_BRANDS, ...BACKER_BRANDS];
  return (
    <div className="overflow-hidden">
      <div className="backers-track">
        {items.map((b, i) => (
          <span key={i} className="mx-10 shrink-0 text-black/50 whitespace-nowrap" style={b.style}>
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Join Us Button ── */
export const JoinUsButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <button className={`inline-flex items-center gap-3 bg-black text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer ${className}`}>
    Join us
    <span className="bg-white rounded-full p-2">
      <ArrowRight className="w-5 h-5 text-black" />
    </span>
  </button>
);

/* ── Discover Button ── */
export const DiscoverButton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <button className={`inline-flex items-center gap-3 bg-black text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer ${className}`}>
    Discover it
    <span className="bg-white rounded-full p-2">
      <ArrowRight className="w-5 h-5 text-black" />
    </span>
  </button>
);
