import React, { useEffect, useRef } from 'react';
import { Target } from 'lucide-react';
import { DashboardConfig, Tx, fmt, todayISO } from '../engine';

interface GoalRingProps {
  cfg: DashboardConfig;
  tx: Tx[];
  toggles: Record<string, boolean>;
}

const C = 2 * Math.PI * 44;

const GoalRing: React.FC<GoalRingProps> = ({ cfg, tx, toggles }) => {
  const ringRef = useRef<SVGCircleElement | null>(null);
  const textRef = useRef<HTMLSpanElement | null>(null);
  const objRef = useRef({ v: 0 });

  const today = todayISO();
  const dayOfMonth = new Date().getDate();
  const monthPrefix = today.slice(0, 7);

  const realSaved = tx
    .filter((t) => t.cat === 'Savings' && t.date.startsWith(monthPrefix))
    .reduce((s, t) => s + t.amount, 0);
  const ghostSaved = toggles['ghost'] ? Math.round((cfg.monthlySave / 30) * dayOfMonth) : 0;

  const total = realSaved + ghostSaved;
  const goal = cfg.inputs.goal;
  const pct = goal > 0 ? Math.min(1, total / goal) : 0;

  useEffect(() => {
    const gsap = window.gsap;
    if (!gsap || !ringRef.current || !textRef.current) return;
    objRef.current.v = 0;
    gsap.to(objRef.current, {
      v: pct,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => {
        const v = objRef.current.v;
        if (ringRef.current) ringRef.current.style.strokeDashoffset = `${C * (1 - v)}`;
        if (textRef.current) textRef.current.textContent = `${Math.round(v * 100)}%`;
      },
    });
  }, [pct]);

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Target size={17} className="text-[#B8860B]" />
        <h3 className="text-lg font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
          Savings goal
        </h3>
      </div>

      <div className="relative w-44 h-44 mx-auto mb-6">
        <svg className="w-44 h-44 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#EDE8F5" strokeWidth="9" />
          <circle
            ref={ringRef}
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="url(#ringGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C}
          />
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f0c94d" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
          </defs>
        </svg>
        <span
          ref={textRef}
          className="absolute inset-0 flex flex-col items-center justify-center text-xl font-semibold text-[#B8860B]"
        >
          0%
        </span>
      </div>

      <div className="flex justify-between text-sm mb-1">
        <p className="text-black/60">{fmt(total)} saved</p>
        <p className="text-black/45">goal {fmt(goal)}</p>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#EDE8F5' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct * 100}%`, background: 'linear-gradient(90deg, #f0c94d, #b8860b)' }}
        />
      </div>
      <p className="text-xs text-black/45 mt-3 leading-relaxed">
        {toggles['ghost'] ? 'Ghost savings contributes automatically as you skip spends.' : 'Toggle Ghost savings to auto-accelerate this ring.'}
      </p>
    </div>
  );
};

export default GoalRing;