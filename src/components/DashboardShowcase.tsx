import React from 'react';
import { ArrowDownLeft, ArrowUpLeft, CheckCircle2, Crown } from 'lucide-react';
import Coin3D from './Coin3D';
import SplitHeading from './SplitHeading';

const BULLETS = [
  {
    title: 'Goal card',
    desc: 'Watch your savings ring fill as you save — every deposit counts.',
  },
  {
    title: 'Daily allowance',
    desc: 'Know exactly what is truly left to spend after rent and bills.',
  },
  {
    title: 'Runway & streak',
    desc: 'See how long your money lasts and how many days you stayed ahead.',
  },
  {
    title: 'Charts',
    desc: 'Every leak becomes obvious the moment it happens.',
  },
];

const BARS = [38, 62, 44, 78, 55, 88, 70];
const TXS = [
  { icon: ArrowDownLeft, name: 'Swiggy', note: 'Lunch', amount: '-₹286', color: '#18241C' },
  { icon: ArrowUpLeft, name: 'Salary', note: 'HDFC · Monthly', amount: '+₹62,000', color: '#B8860B' },
  { icon: ArrowDownLeft, name: 'Netflix', note: 'Subscription', amount: '-₹649', color: '#18241C' },
];

const DashboardShowcase: React.FC = () => (
  <section className="dash-show bg-[#F4EFE4] px-6 py-28 overflow-hidden">
    <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-14 items-center">
      {/* Copy */}
      <div>
        <p className="dash-kicker text-[#B8860B] text-xs uppercase tracking-[0.4em] font-semibold mb-4">
          Your Dashboard
        </p>
        <SplitHeading
          as="h2"
          text="Your money,\ncentre stage."
          highlight={['stage.']}
          className="split-title text-black text-4xl md:text-6xl font-medium leading-[1.05] mb-8"
          style={{ letterSpacing: '-0.04em' }}
        />
        <div className="flex flex-col gap-6">
          {BULLETS.map((b) => (
            <div key={b.title} className="dash-bullet flex items-start gap-4">
              <CheckCircle2 size={22} className="mt-1 shrink-0 text-[#B8860B]" />
              <div>
                <h3 className="text-lg font-medium text-black leading-snug">{b.title}</h3>
                <p className="text-black/60 leading-relaxed">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phone mockup */}
      <div className="relative flex justify-center">
        <div className="dash-coin-0 absolute -top-6 left-2 z-10">
          <Coin3D size={52} label="10" />
        </div>
        <div className="dash-coin-1 absolute -bottom-8 right-0 z-10">
          <Coin3D size={68} label="10" symbolBack="₹" />
        </div>

        <div
          className="dash-phone relative w-full max-w-sm rounded-[2.5rem] p-3"
          style={{
            background: 'linear-gradient(150deg, #18241C, #0C120E)',
            boxShadow: '0 30px 80px rgba(15,24,18,0.45)',
          }}
        >
          <div className="rounded-[2rem] bg-[#F4EFE4] p-5 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-black/50 font-semibold">
                  SpendSmart
                </p>
                <p className="text-xl text-black font-medium" style={{ letterSpacing: '-0.03em' }}>
                  Good evening, Harsh
                </p>
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #d5b256, #b8860b)' }}
              >
                <Crown size={16} className="text-white" />
              </div>
            </div>

            {/* Goal ring widget */}
            <div className="dash-chip bg-[#FBF9F0] border border-[#E7DEC7] rounded-2xl p-4 flex items-center gap-4">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="44" fill="none" stroke="#E9E0CB" strokeWidth="9" />
                  <circle
                    className="dash-goal-fill"
                    cx="50"
                    cy="50"
                    r="44"
                    fill="none"
                    stroke="url(#goldGrad)"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray="276.46"
                    strokeDashoffset="276.46"
                  />
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#d5b256" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="dash-goal-text absolute inset-0 flex items-center justify-center text-sm font-semibold text-[#B8860B]">
                  0%
                </span>
              </div>
              <div>
                <p className="text-black font-medium">Rainy-day fund</p>
                <p className="text-sm text-black/55">₹46,230 / ₹68,000 goal</p>
                <p className="text-xs text-black/40 mt-1">You saved ₹1,120 today · 12-day streak</p>
              </div>
            </div>

            {/* Money chip row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="dash-chip bg-[#FBF9F0] border border-[#E7DEC7] rounded-2xl px-4 py-3">
                <p className="text-xs text-black/50 font-medium">Daily allowance</p>
                <p className="text-lg text-black font-semibold" style={{ letterSpacing: '-0.02em' }}>
                  ₹742 left
                </p>
              </div>
              <div className="dash-chip bg-[#18241C] rounded-2xl px-4 py-3">
                <p className="text-xs text-white/50 font-medium">Rent auto-set</p>
                <p className="text-lg text-white font-semibold" style={{ letterSpacing: '-0.02em' }}>
                  ₹15,000
                </p>
              </div>
            </div>

            {/* Chart */}
            <div className="dash-chip bg-[#FBF9F0] border border-[#E7DEC7] rounded-2xl px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-black font-medium">This week</p>
                <p className="text-xs text-black/40">-8.2% spend</p>
              </div>
              <div className="dash-chart flex items-end gap-2 h-24">
                {BARS.map((h, i) => (
                  <div
                    key={i}
                    className="dash-bar flex-1 rounded-md"
                    data-h={h}
                    style={{
                      height: 0,
                      background: i === 5 ? 'linear-gradient(180deg, #d5b256, #b8860b)' : '#D9CFB8',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="flex flex-col gap-2">
              {TXS.map((t) => (
                <div
                  key={t.name}
                  className="dash-tx bg-[#FBF9F0] border border-[#E7DEC7] rounded-2xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${t.color}14` }}>
                    <t.icon size={16} style={{ color: t.color }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-black font-medium leading-none mb-1">{t.name}</p>
                    <p className="text-xs text-black/45">{t.note}</p>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: t.color }}>
                    {t.amount}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DashboardShowcase;