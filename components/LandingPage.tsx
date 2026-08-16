import React, { useState, useEffect, useRef } from 'react';
import {
  Wallet, ArrowRight, ChevronDown, Sun, Moon, ScanLine, Sparkles, ShieldCheck,
  PiggyBank, BellRing, Landmark, Lock, TrendingUp, BadgeCheck, Fingerprint, Smartphone, Quote
} from 'lucide-react';
import { AppScreen } from '../types';
import { getTheme, toggleTheme, Theme } from '../services/theme';

/* ================================================================
   Helpers
================================================================ */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const range = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a), 0, 1));
const crossFade = (p: number, inStart: number, inEnd: number, outStart: number) =>
  clamp((p - inStart) / (inEnd - inStart), 0, 1) * clamp(1 - (p - outStart) / 0.07, 0, 1);

/* ================================================================
   Hooks
================================================================ */
function useScrollProgress(ref: React.RefObject<HTMLElement>): number {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const compute = () => {
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setP(total > 0 ? clamp(-rect.top, 0, total) / total : 0);
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(compute); };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, [ref]);
  return p;
}

function useGlobalScroll() {
  const [y, setY] = useState(0);
  const [vh, setVh] = useState(() => (typeof window !== 'undefined' ? window.innerHeight : 800));
  useEffect(() => {
    let raf = 0;
    const compute = () => { setY(window.scrollY); setVh(window.innerHeight); };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(compute); };
    const onResize = () => compute();
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onResize); };
  }, []);
  return { y, vh };
}

const Reveal: React.FC<{
  className?: string;
  variant?: 'up' | 'left' | 'right' | 'scale';
  delay?: 'd1' | 'd2' | 'd3' | 'd4';
}> = ({ children, className = '', variant = 'up', delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { el.classList.add('in'); obs.unobserve(el); } });
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const v = variant === 'left' ? 'reveal-left' : variant === 'right' ? 'reveal-right' : variant === 'scale' ? 'reveal-scale' : '';
  return (
    <div ref={ref} className={`reveal ${v} ${delay ? `reveal-${delay}` : ''} ${className}`}>
      {children}
    </div>
  );
};

const CountUp: React.FC<{ to: number; prefix?: string; suffix?: string; decimals?: number; className?: string }> = ({
  to, prefix = '', suffix = '', decimals = 0, className = ''
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      const start = performance.now();
      const dur = 1600;
      const tick = (now: number) => {
        const t = clamp((now - start) / dur, 0, 1);
        setVal(to * ease(t));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [to]);
  return (
    <span ref={ref} className={className}>
      {prefix}{val.toLocaleString('en-IN', { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}
    </span>
  );
};

/* ================================================================
   2D Illustrations — flat, money-theme
================================================================ */
const BillFront: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 260 112" className={className} preserveAspectRatio="none">
    <rect x="2" y="2" width="256" height="108" rx="12" fill="#cbd7b0" stroke="#93a379" strokeWidth="2.5" />
    <rect x="9" y="9" width="242" height="94" rx="8" fill="none" stroke="#a9ba91" strokeWidth="1.5" strokeDasharray="4 4" />
    <rect x="26" y="24" width="208" height="64" rx="6" fill="#d8e2c2" stroke="#a9ba91" strokeWidth="1" />
    <circle cx="48" cy="56" r="18" fill="#cbd7b0" stroke="#93a379" strokeWidth="1.5" />
    <circle cx="212" cy="56" r="18" fill="#cbd7b0" stroke="#93a379" strokeWidth="1.5" />
    <text x="48" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="19" fill="#5f7149">$</text>
    <text x="212" y="62" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="19" fill="#5f7149">$</text>
    <text x="130" y="68" textAnchor="middle" fontFamily="Fraunces, serif" fontWeight="900" fontSize="32" fill="#4c5c38">100</text>
    <text x="38" y="36" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="9" fill="#6c7d54">ONE HUNDRED</text>
    <text x="208" y="36" textAnchor="end" fontFamily="Outfit, sans-serif" fontWeight="700" fontSize="9" fill="#6c7d54">ONE HUNDRED</text>
    <text x="130" y="102" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="600" fontSize="10" fill="#6c7d54">SPENDSMART RESERVE NOTE</text>
  </svg>
);

const CoinFace: React.FC<{ side: 'heads' | 'tails' }> = ({ side }) => {
  const grad = 'radial-gradient(circle at 34% 30%, #f3e29a, #cfa92c 52%, #8a6510 100%)';
  return (
    <div className="w-full h-full rounded-full flex items-center justify-center"
      style={{ background: grad, boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)' }}>
      <div className="w-[68%] h-[68%] rounded-full border border-[#8a6510] opacity-60 flex items-center justify-center">
        <div className="w-full h-full rounded-full border border-[#8a6510] opacity-50 flex items-center justify-center">
          <span className="font-display font-black text-[#5d4306]">
            {side === 'heads' ? '$' : '★'}
          </span>
        </div>
      </div>
    </div>
  );
};

const FlipCoin: React.FC<{ rotation: number; size: number; className?: string }> = ({ rotation, size, className = '' }) => (
  <div className={`preserve-3d relative rounded-full ${className}`} style={{ width: size, height: size, transform: `rotateY(${rotation}deg)` }}>
    <div className="absolute inset-0 backface-hidden rounded-full"><CoinFace side="heads" /></div>
    <div className="absolute inset-0 backface-hidden rounded-full" style={{ transform: 'rotateY(180deg)' }}><CoinFace side="tails" /></div>
  </div>
);

/* ================================================================
   Feature data
================================================================ */
const FEATURES = [
  { icon: Smartphone, title: 'SMS & Notification Parsing', desc: 'Bank messages become categorized transactions. No typing, no missed spends.', tile: 'var(--brand)' },
  { icon: ScanLine, title: 'Receipt OCR', desc: 'Snap a bill or upload a PDF. Amount, tax, vendor and line items are extracted instantly.', tile: 'var(--gold)' },
  { icon: Sparkles, title: 'AI Financial Advisor', desc: 'Ask “can I afford this jacket after rent?” and get an honest, data-driven answer.', tile: 'var(--brand)' },
  { icon: ShieldCheck, title: 'Rent & Bill Protection', desc: 'Rent and fixed bills are locked first. You only see what is truly yours to spend.', tile: 'var(--gold)' },
  { icon: PiggyBank, title: 'Ghost Savings', desc: 'Skip an impulse buy? Log it and watch that money hop into a savings vault automatically.', tile: 'var(--brand)' },
  { icon: BellRing, title: 'Subscription Hunter', desc: 'Recurring charges you never use get flagged with their 1-year burn rate.', tile: 'var(--gold)' },
  { icon: Landmark, title: 'Bank & CSV Connect', desc: 'Link your bank, drop in a CSV, or import messages. Every source, one ledger.', tile: 'var(--brand)' },
  { icon: Fingerprint, title: 'Privacy-First', desc: 'Sensitive parsing runs locally. Your money story stays yours — not a cloud vendor’s.', tile: 'var(--gold)' },
];

const TICKER_ITEMS = [
  'Track every rupee', 'Protect your rent', 'AI-powered insights', 'Ghost savings',
  'Receipt OCR', 'Bank connected', 'Subscription hunter', 'No more spreadsheets',
  'Daily spending allowance', 'On-device privacy',
];

const STEPS = [
  { icon: Smartphone, title: 'Connect', desc: 'Link your bank, import SMS, or upload receipts and CSV statements.', num: '01' },
  { icon: Sparkles, title: 'Watch it think', desc: 'AI sorts every transaction into categories and flags repeats in seconds.', num: '02' },
  { icon: TrendingUp, title: 'Get richer', desc: 'A daily allowance, rent shield and forecasts keep you ahead of every bill.', num: '03' },
];

const STATS = [
  { value: 24, suffix: '+', label: 'Smart categories' },
  { value: 98, suffix: '%', label: 'Parsing accuracy' },
  { value: 42, suffix: 'k+', label: 'Tracked by users' },
  { value: 3, suffix: ' min', label: 'To full setup' },
];

const LEAK_LINES = [
  '₹180 a month on coffee runs — gone.',
  '₹500 on subscriptions you never open.',
  '₹60 in charges that just… happen.',
  'Small leaks. Big yearly losses.',
];

const NET_LINES = [
  'Rent gets locked in first. Always.',
  'Bills fly on autopilot — zero drama.',
  'You only see what is truly yours.',
  'That is your honest daily allowance.',
];

/* ================================================================
   LandingPage
================================================================ */
interface LandingPageProps {
  onNavigate: (screen: AppScreen) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const leakRef = useRef<HTMLDivElement>(null);
  const netRef = useRef<HTMLDivElement>(null);
  const finaleRef = useRef<HTMLDivElement>(null);
  const heroP = useScrollProgress(heroRef);
  const leakP = useScrollProgress(leakRef);
  const netP = useScrollProgress(netRef);
  const finalP = useScrollProgress(finaleRef);
  const { y } = useGlobalScroll();

  const [theme, setTheme] = useState<Theme>(getTheme());
  const [navSolid, setNavSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setNavSolid(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleTheme = () => setTheme(toggleTheme());

  /* ---- hero phase computations ---- */
  const unroll = range(heroP, 0.02, 0.42);
  const coinDrop = range(heroP, 0.44, 0.74);
  const land = range(heroP, 0.78, 1);
  const heroOut = 1 - range(heroP, 0.93, 1);

  const t1 = crossFade(heroP, 0.0, 0.06, 0.2) * heroOut;
  const t2 = crossFade(heroP, 0.14, 0.24, 0.42) * heroOut;
  const t3 = crossFade(heroP, 0.4, 0.5, 0.76) * heroOut;
  const t4 = crossFade(heroP, 0.76, 0.86, 1.0);

  const tubeW = Math.max(9, 52 * (1 - unroll));
  const billW = unroll * 100;
  const billRotY = (1 - unroll) * -22;
  const coinTop = 8 + coinDrop * 62;
  const coinRotY = coinDrop * 900;
  const coinScale = 0.55 + coinDrop * 0.45;

  /* ---- leak scene ---- */
  const leakStep = (i: number) => range(leakP, i * 0.16, i * 0.16 + 0.1);
  const leakEnd = range(leakP, 0.72, 0.86);
  const leakCoin = (i: number) => {
    const s = range(leakP, 0.16 + i * 0.14, 0.26 + i * 0.14);
    return { opacity: clamp(s * 3, 0, 1), y: 0 + s * 120, rot: s * 360 * (i % 2 ? 1 : -1) };
  };

  /* ---- safety net scene ---- */
  const lockStep = (i: number) => range(netP, i * 0.16, i * 0.16 + 0.12);
  const shieldIn = range(netP, 0.7, 0.88);

  /* ---- finale ---- */
  const coinSpin = finalP * 1260;
  const finalText = range(finalP, 0.4, 0.6);

  const floatingCoinY = Math.max(0, y - 0.55 * (typeof window !== 'undefined' ? window.innerHeight : 800));

  return (
    <div className="relative min-h-screen bg-app text-app font-sans overflow-x-hidden">
      {/* ================= NAV ================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navSolid ? 'bg-app/85 backdrop-blur-xl border-b border-app shadow-card-soft' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-deep to-brand flex items-center justify-center shadow-card-soft">
              <Wallet size={20} className="text-white" />
            </div>
            <div className="leading-none">
              <span className="font-display font-black text-xl tracking-tight">SpendSmart</span>
              <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Money, mastered</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTheme}
              className="w-10 h-10 rounded-full border border-app bg-surface flex items-center justify-center hover:border-gold-soft transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} className="text-gold" /> : <Moon size={18} className="text-brand" />}
            </button>
            <button
              onClick={() => onNavigate('login')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-app bg-surface hover:border-gold-soft transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigate('signup')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-br from-brand-deep to-brand text-white hover:brightness-110 transition-all shadow-card-soft"
            >
              Get Started <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO (scroll-pinned: 320vh) ================= */}
      <section ref={heroRef} className="relative h-[320vh]">
        <div className="sticky top-0 h-screen overflow-hidden bg-app">
          <MoneyScape />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
            {/* Text area (crossfading phases) */}
            <div className="relative w-full max-w-4xl h-[34vh]">
              <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t1, transform: `translateY(${(1 - t1) * 26}px)` }}>
                <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-gold font-bold mb-4">Scroll to unfold</p>
                <h1 className="heading-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
                  Every coin has<br />a <span className="italic text-gold">story.</span>
                </h1>
                <p className="mt-5 text-sm md:text-lg text-soft max-w-xl mx-auto">
                  SpendSmart reads the story your money is already writing — and helps you rewrite it.
                </p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t2, transform: `translateY(${(1 - t2) * 26}px)` }}>
                <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-gold font-bold mb-4">A smarter banknote</p>
                <h1 className="heading-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
                  Watch your money<br /><span className="italic text-gold">unfold.</span>
                </h1>
                <p className="mt-5 text-sm md:text-lg text-soft max-w-xl mx-auto">
                  Every transaction — from bank SMS to paper receipts — lands in one living ledger.
                </p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t3, transform: `translateY(${(1 - t3) * 26}px)` }}>
                <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-gold font-bold mb-4">One flip can change it</p>
                <h1 className="heading-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
                  Flip your<br /><span className="italic text-gold">finances.</span>
                </h1>
                <p className="mt-5 text-sm md:text-lg text-soft max-w-xl mx-auto">
                  AI forecasts your runway and protects rent before you ever overspend.
                </p>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t4, transform: `translateY(${(1 - t4) * 20}px)` }}>
                <p className="text-xs md:text-sm uppercase tracking-[0.35em] text-gold font-bold mb-4">Heads up.</p>
                <h1 className="heading-serif text-4xl md:text-6xl lg:text-7xl leading-[1.05]">
                  Money, <span className="italic text-gold">mastered.</span>
                </h1>
                <p className="mt-5 text-sm md:text-lg text-soft max-w-xl mx-auto">
                  Track less. Keep more. Let SpendSmart be your second brain for cash.
                </p>
              </div>
            </div>

            {/* CTA row */}
            <div className="relative w-full max-w-md h-[10vh] flex items-center justify-center gap-3 sm:gap-4 px-4" style={{ opacity: t4, transform: `translateY(${(1 - t4) * 18}px)` }}>
              <button
                onClick={() => onNavigate('signup')}
                className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-br from-brand-deep to-brand hover:brightness-110 transition-all shadow-card flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                Start Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold border border-app bg-surface hover:border-gold-soft transition-all text-sm sm:text-base"
              >
                Sign In
              </button>
            </div>

            {/* Stage: bill + coin */}
            <div className="relative w-full max-w-md h-[26vh] min-h-[190px] mt-2">
              {/* rolled tube */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 rounded-lg transition-none"
                style={{
                  width: tubeW,
                  height: 104,
                  zIndex: 3,
                  opacity: unroll > 0.97 ? (1 - (unroll - 0.97) / 0.03) : 1,
                  background: 'linear-gradient(90deg, #7c8f63, #a9ba91 35%, #7c8f63 60%, #5f7149 85%)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.35), inset 0 -2px 6px rgba(0,0,0,0.3), 0 14px 26px -12px rgba(0,0,0,0.45)',
                }}
              />
              {/* unrolling bill */}
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2"
                style={{
                  width: billW,
                  height: 104,
                  zIndex: 2,
                  transformOrigin: 'left center',
                  transform: `rotateY(${billRotY}deg)`,
                  opacity: clamp(unroll * 2.4, 0, 1),
                  filter: `drop-shadow(0 18px 26px rgba(0,0,0,${0.3 * unroll}))`,
                }}
              >
                <BillFront className="w-full h-full" />
              </div>
              {/* ground shadow */}
              <div
                className="absolute left-0 bottom-0 h-4 rounded-full"
                style={{
                  width: `${billW}%`,
                  opacity: 0.22 * unroll,
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.7), transparent 70%)',
                }}
              />

              {/* flipping coin */}
              <div
                className="absolute left-1/2"
                style={{
                  top: coinTop,
                  zIndex: 4,
                  opacity: coinDrop > 0 ? clamp(coinDrop * 3, 0, 1) : 0,
                  transform: `translateX(-50%) translateY(${coinDrop * 30}px) scale(${coinScale})`,
                }}
              >
                <FlipCoin rotation={coinRotY} size={62} />
              </div>

              {/* settled glow ring */}
              <div
                className="absolute left-1/2 rounded-full border-2 border-gold transition-none"
                style={{
                  top: coinTop,
                  width: 80,
                  height: 80,
                  transform: `translateX(-50%) scale(${1 + land * 0.5})`,
                  opacity: 0.55 * land,
                  boxShadow: '0 0 40px rgba(212,175,55,0.35)',
                  pointerEvents: 'none',
                }}
              />
              <div
                className="absolute left-1/2 top-0 font-display italic text-gold"
                style={{
                  transform: 'translateX(-50%)',
                  opacity: land,
                  marginTop: coinTop + 74,
                  fontSize: 15,
                }}
              >
                On heads — it stays with you.
              </div>
            </div>

            {/* scroll cue */}
            <div className="absolute bottom-6 inset-x-0 flex flex-col items-center gap-2" style={{ opacity: (1 - range(heroP, 0.03, 0.12)) * heroOut }}>
              <span className="text-[11px] uppercase tracking-[0.3em] text-soft font-bold">Scroll</span>
              <ChevronDown size={22} className="text-gold animate-bounce-slow" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= FLOATING PAGE COIN ================= */}
      <div
        className="fixed right-5 md:right-10 z-40 pointer-events-none"
        style={{
          top: 0,
          opacity: clamp((y - 0.5 * (typeof window !== 'undefined' ? window.innerHeight : 800)) / 260, 0, 1),
          transform: `translateY(${floatingCoinY * 0.55}px)`,
        }}
      >
        <div className="preserve-3d" style={{ transform: `rotateY(${y * 1.1}deg) rotateX(${y * 0.3}deg)` }}>
          <div className="w-12 h-12 rounded-full backface-hidden"><CoinFace side="heads" /></div>
          <div className="w-12 h-12 rounded-full backface-hidden absolute inset-0" style={{ transform: 'rotateY(180deg)' }}><CoinFace side="tails" /></div>
        </div>
      </div>

      {/* ================= TICKER STRIP ================= */}
      <div className="ticker-strip py-4 overflow-hidden relative">
        <div className="flex w-max animate-ticker gap-12 pr-12">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="flex items-center gap-3 shrink-0 text-sm font-bold text-soft uppercase tracking-[0.18em]">
              <span className="text-gold text-base">✦</span> {item}
            </span>
          ))}
        </div>
      </div>

      {/* ================= STORY 1 — THE SILENT LEAK ================= */}
      <section ref={leakRef} className="relative h-[260vh] bg-app">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* text */}
            <div className="relative">
              <Reveal className="mb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-gold font-bold">Chapter 01 — The Leak</p>
              </Reveal>
              <Reveal>
                <h2 className="heading-serif text-4xl md:text-6xl mb-10 leading-[1.05]">
                  Money doesn't vanish. It <span className="italic text-gold">drips.</span>
                </h2>
              </Reveal>
              <div className="relative h-52 md:h-60">
                {LEAK_LINES.map((line, i) => {
                  const s = leakStep(i);
                  return (
                    <div key={i} className="absolute inset-x-0 flex items-center gap-3" style={{ top: i * 44, opacity: s, transform: `translateY(${(1 - s) * 18}px)` }}>
                      <span className="w-2 h-2 rounded-full bg-gold" style={{ opacity: s }} />
                      <p className="text-lg md:text-2xl font-semibold">{line}</p>
                    </div>
                  );
                })}
                <div className="absolute inset-x-0 flex items-center gap-4" style={{ top: 4 * 44 + 6, opacity: leakEnd, transform: `translateY(${(1 - leakEnd) * 18}px)` }}>
                  <p className="heading-serif text-3xl md:text-4xl text-gold font-black">₹24,000+</p>
                  <p className="text-soft font-medium">leaked last year,<br />one small bill at a time.</p>
                </div>
              </div>
            </div>

            {/* visual: coin waterfall */}
            <Reveal variant="scale" className="relative h-72 md:h-96">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-56 h-72">
                  {/* upright bill */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ width: 180, opacity: clamp(leakP * 3, 0, 1) }}>
                    <BillFront className="w-full" />
                  </div>
                  {/* falling coins */}
                  {[0, 1, 2, 3].map((i) => {
                    const c = leakCoin(i);
                    return (
                      <div key={i} className="absolute left-1/2" style={{ top: 40, opacity: c.opacity, transform: `translateX(-50%) translateY(${c.y}px)` }}>
                        <div className="preserve-3d" style={{ transform: `rotateY(${c.rot}deg)` }}>
                          <div className="w-12 h-12 rounded-full backface-hidden"><CoinFace side={i % 2 ? 'tails' : 'heads'} /></div>
                          <div className="w-12 h-12 rounded-full backface-hidden absolute inset-0" style={{ transform: 'rotateY(180deg)' }}><CoinFace side={i % 2 ? 'heads' : 'tails'} /></div>
                        </div>
                      </div>
                    );
                  })}
                  {/* drain */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-3 rounded-full bg-black/25" />
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center text-soft text-sm font-bold" style={{ opacity: leakEnd }}>
                    drains straight out.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ================= FEATURES GRID ================= */}
      <section className="relative py-24 md:py-36 bg-app-soft border-y border-app">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.35em] text-gold font-bold mb-4">Chapter 02 — The Fix</p>
            <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05] mb-6">
              Stop leaks. Then <span className="italic text-gold">grow.</span>
            </h2>
            <p className="text-lg text-soft">
              Everything SpendSmart does is built on one idea: automation first, so you never enter a transaction twice.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={(['d1', 'd2', 'd3', 'd4'] as const)[i % 4]}>
                <div className="card-2d h-full p-6 flex flex-col">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: f.tile, boxShadow: 'var(--shadow-soft)' }}
                  >
                    <f.icon size={22} className="text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 leading-snug">{f.title}</h3>
                  <p className="text-sm text-soft leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STORY 2 — THE SAFETY NET ================= */}
      <section ref={netRef} className="relative h-[260vh] bg-app">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center">
          <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-12 items-center">
            {/* visual: locked coin stack */}
            <Reveal variant="scale" className="relative h-72 md:h-96 order-2 lg:order-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-64 h-80">
                  {/* coin stack */}
                  {[0, 1, 2, 3].map((i) => {
                    const s = lockStep(i);
                    return (
                      <div key={i} className="absolute left-1/2" style={{ top: 190 - i * 38, opacity: clamp(s * 2.2, 0, 1), transform: `translateX(-50%) translateY(${(1 - s) * 26}px)` }}>
                        <div className="w-20 h-20 rounded-full shadow-card-soft">
                          <CoinFace side="heads" />
                        </div>
                      </div>
                    );
                  })}
                  {/* vault lid + lock */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-40 h-16 rounded-2xl flex items-center justify-center"
                    style={{
                      top: 66,
                      opacity: shieldIn,
                      transform: `translateX(-50%) translateY(${(1 - shieldIn) * -20}px) scale(${0.7 + shieldIn * 0.3})`,
                      background: 'linear-gradient(145deg, var(--gold-soft), var(--gold))',
                      boxShadow: 'var(--shadow-card-soft)',
                    }}
                  >
                    <Lock size={24} className="text-white" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-2 w-full text-center">
                    <p className="text-soft font-bold" style={{ opacity: shieldIn }}>Rent & bills locked. The rest is yours.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* text */}
            <div className="relative order-1 lg:order-2">
              <Reveal className="mb-4">
                <p className="text-xs uppercase tracking-[0.35em] text-gold font-bold">Chapter 03 — The Shield</p>
              </Reveal>
              <Reveal>
                <h2 className="heading-serif text-4xl md:text-6xl mb-10 leading-[1.05]">
                  Your <span className="italic text-gold">Safety Net.</span>
                </h2>
              </Reveal>
              <div className="relative h-52 md:h-60">
                {NET_LINES.map((line, i) => {
                  const s = netP > 0.1 ? crossFade(netP, i * 0.16, i * 0.16 + 0.1, i * 0.16 + 0.42) : 0;
                  return (
                    <div key={i} className="absolute inset-x-0 flex items-center gap-3" style={{ top: i * 44, opacity: s, transform: `translateY(${(1 - s) * 18}px)` }}>
                      <BadgeCheck size={20} className="text-brand" style={{ opacity: s }} />
                      <p className="text-lg md:text-2xl font-semibold">{line}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="relative py-24 md:py-36 bg-app-soft border-y border-app">
        <div className="max-w-7xl mx-auto px-6 md:px-10">
          <Reveal className="max-w-2xl mb-16">
            <p className="text-xs uppercase tracking-[0.35em] text-gold font-bold mb-4">Chapter 04 — The Flow</p>
            <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05]">
              Three moves. <span className="italic text-gold">That's it.</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={s.num} delay={(['d1', 'd2', 'd3'] as const)[i % 3]}>
                <div className="card-2d relative h-full p-8">
                  <span className="font-display font-black text-6xl text-gold opacity-15 absolute top-4 right-6">{s.num}</span>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-deep to-brand flex items-center justify-center mb-6">
                    <s.icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
                  <p className="text-soft leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="relative py-20 bg-app border-b border-app">
        <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((st, i) => (
            <Reveal key={st.label} delay={(['d1', 'd2', 'd3', 'd4'] as const)[i % 4]} className="text-center">
              <p className="heading-serif text-4xl md:text-6xl font-black text-gold">
                <CountUp to={st.value} suffix={st.suffix} />
              </p>
              <p className="mt-3 text-sm uppercase tracking-[0.2em] text-soft font-bold">{st.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <section className="relative py-24 bg-app">
        <div className="max-w-4xl mx-auto px-6">
          <Reveal>
            <div className="card-2d p-10 md:p-14 relative overflow-hidden">
              <Quote size={56} className="text-gold opacity-20 absolute top-6 left-6" />
              <p className="heading-serif text-2xl md:text-3xl leading-snug italic mb-8 mt-6">
                “I used to check my bank app with my eyes half closed. Now I see one honest number —
                my daily allowance — and I finally stopped sweating rent.”
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center font-bold text-white">
                  AR
                </div>
                <div>
                  <p className="font-bold">Ananya R.</p>
                  <p className="text-sm text-soft">Product designer · Bengaluru</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="text-gold">★</span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FINALE (pinned coin flip + CTA) ================= */}
      <section ref={finaleRef} className="relative h-[240vh] bg-app">
        <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
          <MoneyScape />
          <div className="relative z-10 text-center px-6">
            <div className="relative h-64 w-full flex items-center justify-center mb-4">
              <FlipCoin rotation={coinSpin} size={92} />
              <div
                className="absolute inset-0 m-auto w-40 h-40 rounded-full border-2 border-gold pointer-events-none"
                style={{ opacity: finalText * 0.6, transform: `scale(${1 + finalText * 0.3})`, boxShadow: '0 0 60px rgba(212,175,55,0.35)' }}
              />
            </div>

            <div style={{ opacity: finalText, transform: `translateY(${(1 - finalText) * 26}px)` }}>
              <p className="text-xs uppercase tracking-[0.35em] text-gold font-bold mb-4">Chapter 05 — The Flip</p>
              <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05] mb-6">
                Ready to make money<br /><span className="italic text-gold">work?</span>
              </h2>
              <p className="text-lg text-soft max-w-lg mx-auto mb-10">
                Join SpendSmart and turn every coin into a story that ends in savings.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => onNavigate('signup')}
                  className="group w-full sm:w-auto px-10 py-4 rounded-full font-bold text-white bg-gradient-to-br from-brand-deep to-brand hover:brightness-110 transition-all shadow-card flex items-center justify-center gap-2"
                >
                  Start Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="w-full sm:w-auto px-10 py-4 rounded-full font-bold border border-app bg-surface hover:border-gold-soft transition-all"
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-app bg-app-soft">
        <div className="max-w-7xl mx-auto px-6 md:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-deep to-brand flex items-center justify-center">
              <Wallet size={18} className="text-white" />
            </div>
            <div>
              <p className="font-display font-black">SpendSmart</p>
              <p className="text-xs text-soft">Money, mastered.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-soft">
            <span className="hover:text-gold cursor-pointer transition-colors">Features</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Blog</span>
            <span className="hover:text-gold cursor-pointer transition-colors">Support</span>
          </div>
          <p className="text-xs text-faint">© {new Date().getFullYear()} SpendSmart. Made for the hackathon, built for real life.</p>
        </div>
      </footer>
    </div>
  );
};

const MoneyScape: React.FC = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute -top-32 -right-24 w-[520px] h-[520px] rounded-full opacity-[0.09]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 65%)' }} />
    <div className="absolute -bottom-40 -left-24 w-[560px] h-[560px] rounded-full opacity-[0.08]" style={{ background: 'radial-gradient(circle, var(--brand) 0%, transparent 65%)' }} />
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[760px] h-[760px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 60%)' }} />
    {/* faint bill outlines */}
    <div className="absolute top-[16%] left-[7%] opacity-[0.12] rotate-[-12deg]"><BillFront className="w-40" /></div>
    <div className="absolute bottom-[14%] right-[6%] opacity-[0.12] rotate-[10deg]"><BillFront className="w-44" /></div>
  </div>
);

export default LandingPage;
