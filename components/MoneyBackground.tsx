import React from 'react';

const Coin: React.FC<{ size: number; className?: string; rot?: number }> = ({ size, className = '', rot = 0 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" className={className} style={{ transform: `rotate(${rot}deg)` }}>
    <circle cx="24" cy="24" r="22" fill="var(--gold)" stroke="var(--gold-soft)" strokeWidth="2" />
    <circle cx="24" cy="24" r="17" fill="none" stroke="var(--gold-ink)" strokeWidth="1.5" opacity="0.6" />
    <circle cx="24" cy="24" r="13" fill="none" stroke="var(--gold-ink)" strokeWidth="1" opacity="0.4" />
    <text x="24" y="30" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontSize="17" fill="var(--gold-ink)">$</text>
  </svg>
);

const TinyBill: React.FC<{ w?: number; className?: string; rot?: number }> = ({ w = 60, className = '', rot = 0 }) => (
  <svg width={w} height={w * 0.42} viewBox="0 0 100 42" className={className} style={{ transform: `rotate(${rot}deg)` }}>
    <rect x="1" y="1" width="98" height="40" rx="5" fill="var(--brand-deep)" stroke="var(--brand)" strokeWidth="1.5" />
    <rect x="5" y="5" width="90" height="32" rx="3.5" fill="none" stroke="var(--brand)" strokeWidth="0.75" opacity="0.7" />
    <circle cx="18" cy="21" r="8" fill="var(--brand-deep)" stroke="var(--brand)" strokeWidth="0.8" />
    <circle cx="82" cy="21" r="8" fill="var(--brand-deep)" stroke="var(--brand)" strokeWidth="0.8" />
    <text x="50" y="26" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="700" fontSize="13" fill="var(--text)">$</text>
  </svg>
);

const MoneyBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {/* Soft tonal blobs */}
      <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 65%)' }} />
      <div className="absolute bottom-0 -left-32 w-[520px] h-[520px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 65%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 60%)' }} />

      {/* Floating 2D coins & bills */}
      <div className="absolute top-[12%] left-[8%] animate-float opacity-40"><Coin size={26} /></div>
      <div className="absolute top-[22%] right-[10%] animate-float-slow opacity-30"><TinyBill w={70} rot={-8} /></div>
      <div className="absolute bottom-[18%] left-[14%] animate-float-slow opacity-30"><TinyBill w={58} rot={10} /></div>
      <div className="absolute bottom-[26%] right-[16%] animate-float opacity-40"><Coin size={34} /></div>
      <div className="absolute top-[55%] left-[4%] animate-float opacity-25"><Coin size={18} /></div>
      <div className="absolute top-[8%] right-[30%] animate-float opacity-25"><Coin size={20} /></div>
    </div>
  );
};

export default MoneyBackground;
