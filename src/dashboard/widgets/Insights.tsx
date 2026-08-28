import React, { useEffect, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DashboardConfig, Tx, fmt, todayISO, insightsFor } from '../engine';

interface InsightsProps {
  cfg: DashboardConfig;
  tx: Tx[];
  toggles: Record<string, boolean>;
  streak: number;
}

const Insights: React.FC<InsightsProps> = ({ cfg, tx, toggles, streak }) => {
  const [idx, setIdx] = useState(0);
  const textRef = useRef<HTMLParagraphElement | null>(null);

  const spentToday = tx
    .filter((t) => t.date === todayISO() && t.cat !== 'Savings')
    .reduce((s, t) => s + t.amount, 0);

  const list = insightsFor(cfg, spentToday, tx, toggles, streak);
  const current = list[Math.min(idx, list.length - 1)] || 'Your autonomy is watching your money.';

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => i + 1), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !textRef.current) return;
    gsap.fromTo(textRef.current, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' });
  }, [idx]);

  return (
    <div className="rounded-2xl bg-[#17142B] p-6 relative overflow-hidden">
      <div
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #b8960c 0%, transparent 60%)' }}
      />
      <div className="relative z-10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-[#18241C] flex items-center justify-center shrink-0">
          <Sparkles size={18} className="text-[#d4af37]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#d4af37] font-semibold">
              ● autonomous
            </span>
          </div>
          <p ref={textRef} className="text-white/85 text-base md:text-lg leading-relaxed">
            {current}
          </p>
          <p className="text-xs text-white/40 mt-3 flex items-center gap-2">
            {list.map((_, i) => (
              <span
                key={i}
                className="inline-block w-1.5 h-1.5 rounded-full transition-colors duration-300"
                style={{ background: i === Math.min(idx, list.length - 1) ? '#d4af37' : 'rgba(255,255,255,0.2)' }}
              />
            ))}
            <span className="ml-auto">regenerating · {fmt(cfg.dailyAllowance)}/day allowance</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Insights;