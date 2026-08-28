import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Brand {
  name: string;
  style: React.CSSProperties;
}

const BRANDS: Brand[] = [
  { name: 'State Bank', style: { fontFamily: 'Georgia, serif', fontWeight: 700, letterSpacing: '-0.02em', fontSize: '15px' } },
  { name: 'HDFC BANK', style: { fontFamily: 'Arial, sans-serif', fontWeight: 900, letterSpacing: '0.08em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'ICICI', style: { fontFamily: 'Trebuchet MS, sans-serif', fontWeight: 600, letterSpacing: '0.01em', fontSize: '15px' } },
  { name: 'PhonePe', style: { fontFamily: 'Courier New, monospace', fontWeight: 700, letterSpacing: '0.12em', fontSize: '13px', textTransform: 'uppercase' as const } },
  { name: 'Google Pay', style: { fontFamily: 'Palatino, Book Antiqua, serif', fontWeight: 400, letterSpacing: '-0.01em', fontSize: '16px' } },
  { name: 'Paytm', style: { fontFamily: 'Impact, Arial Narrow, sans-serif', fontWeight: 400, letterSpacing: '0.04em', fontSize: '14px' } },
  { name: 'Axis', style: { fontFamily: 'Verdana, sans-serif', fontWeight: 700, letterSpacing: '-0.03em', fontSize: '13px' } },
  { name: 'Kotak', style: { fontFamily: 'Arial Black, sans-serif', fontWeight: 900, letterSpacing: '0.06em', fontSize: '14px' } },
];

/* ── Brand Marquee (Hero) ── */
export const BrandMarquee: React.FC = () => {
  const items = [...BRANDS, ...BRANDS];
  return (
    <div className="w-full max-w-md overflow-hidden">
      <div className="marquee-track">
        {items.map((b, i) => (
          <span key={i} className="mx-7 shrink-0 text-black/50 whitespace-nowrap" style={b.style}>
            {b.name}
          </span>
        ))}
      </div>
    </div>
  );
};

/* ── Join Us Button ── */
export const JoinUsButton: React.FC<{ className?: string; label?: string; onClick?: () => void }> = ({ className = '', label = 'Get Started', onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-3 bg-[#18241C] text-white text-base md:text-lg font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer ${className}`}
  >
    {label}
    <span className="bg-white rounded-full p-2">
      <ArrowRight className="w-5 h-5 text-black" />
    </span>
  </button>
);

/* ── Discover Button ── */
export const DiscoverButton: React.FC<{ className?: string; onClick?: () => void }> = ({ className = '', onClick }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-3 bg-[#18241C] text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer ${className}`}
  >
    Discover it
    <span className="bg-white rounded-full p-2">
      <ArrowRight className="w-5 h-5 text-black" />
    </span>
  </button>
);