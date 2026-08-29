import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { PieChart } from 'lucide-react';
import { CATEGORIES, Category, Tx, fmt } from '../engine';

const COLORS: Record<Category, string> = {
  Food: '#B8860B',
  Transport: '#18241C',
  Shopping: '#8a5d0b',
  Subscriptions: '#a06a15',
  Utilities: '#5c4f8a',
  Savings: '#c9a227',
  Other: '#aaa7bd',
};

const LAST_DAYS = 14;

const monthPrefix = new Date().toISOString().slice(0, 7);

interface ChartsProps {
  tx: Tx[];
}

const Charts: React.FC<ChartsProps> = ({ tx }) => {
  const barsRef = useRef<HTMLDivElement | null>(null);

  const monthly = tx.filter((t) => t.date.startsWith(monthPrefix) && t.cat !== 'Savings');
  const total = monthly.reduce((s, t) => s + t.amount, 0);

  const shares = CATEGORIES.map((c) => ({
    cat: c,
    val: monthly.filter((t) => t.cat === c).reduce((s, t) => s + t.amount, 0),
  })).filter((s) => s.val > 0);

  let acc = 0;
  const stops = shares.map((s) => {
    const p = total > 0 ? (s.val / total) * 100 : 0;
    const seg = `${acc}% ${Math.min(100, acc + p)}%`;
    acc += p;
    return `${COLORS[s.cat]} ${seg}`;
  });

  const days = [...Array(LAST_DAYS)].map((_, i) => {
    const d = new Date(Date.now() - (LAST_DAYS - 1 - i) * 864e5).toISOString().slice(0, 10);
    return tx.filter((t) => t.date === d && t.cat !== 'Savings').reduce((s, t) => s + t.amount, 0);
  });
  const max = Math.max(...days, 1);

  useEffect(() => {
    if (!barsRef.current) return;
    const bars = barsRef.current.querySelectorAll<HTMLElement>('.c-bar');
    gsap.fromTo(
      bars,
      { height: '4%' },
      { height: (i: number, el: any) => `${((parseFloat(el.dataset.h || '0')) / max) * 100}%`, duration: 0.7, ease: 'power3.out', stagger: 0.05 }
    );
  }, [tx, max]);

  const renderDay = (d: string) => new Date(d + 'T00:00:00').getDate();

  return (
    <div className="rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
      <div className="flex items-center gap-2 mb-6">
        <PieChart size={17} className="text-[#B8860B]" />
        <h3 className="text-lg font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
          Where money flows
        </h3>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Donut */}
        <div>
          <div className="flex items-center gap-6">
            <div
              className="relative w-40 h-40 rounded-full shrink-0"
              style={{
                background: stops.length
                  ? `conic-gradient(from -90deg, ${stops.join(', ')})`
                  : '#E9E0CB',
                WebkitMask: 'radial-gradient(closest-side, transparent 60%, #000 61%)',
                mask: 'radial-gradient(closest-side, transparent 60%, #000 61%)',
              }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-black" style={{ letterSpacing: '-0.02em' }}>
                  {fmt(total)}
                </span>
                <span className="text-xs text-black/45">this month</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {shares.map((s) => (
                <div key={s.cat} className="flex items-center gap-2 text-sm">
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ background: COLORS[s.cat] }} />
                  <span className="text-black/70 min-w-24">{s.cat}</span>
                  <span className="font-semibold text-black">{fmt(s.val)}</span>
                </div>
              ))}
              {shares.length === 0 && <p className="text-sm text-black/40">No spends this month yet.</p>}
            </div>
          </div>
        </div>

        {/* 14-day bars */}
        <div>
          <div ref={barsRef} className="flex items-end gap-2 h-40 mb-3">
            {days.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
                <div
                  className="c-bar w-full rounded-md"
                  data-h={v}
                  style={{
                    height: `${(v / max) * 100}%`,
                    background: i === LAST_DAYS - 1 ? 'linear-gradient(180deg, #d5b256, #b8860b)' : '#DCD4EA',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-black/40">
            <span>{renderDay(new Date(Date.now() - (LAST_DAYS - 1) * 864e5).toISOString().slice(0, 10))} {new Date().toLocaleString('en-IN', { month: 'short' })}</span>
            <span>today · {fmt(days[LAST_DAYS - 1])}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;