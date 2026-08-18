import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Wallet, ArrowRight, ChevronDown, Sun, Moon, ScanLine, Sparkles, ShieldCheck,
  PiggyBank, BellRing, Landmark, Lock, TrendingUp, BadgeCheck, Fingerprint, Smartphone, Quote
} from 'lucide-react';
import { AppScreen } from '../types';
import { getTheme, toggleTheme, Theme } from '../services/theme';

declare global {
  interface Window {
    THREE: any;
    gsap: any;
    ScrollTrigger: any;
  }
}

/* ================================================================
   DATA
================================================================ */
const FEATURES = [
  { icon: Smartphone, title: 'SMS Parsing', desc: 'Bank messages become categorized transactions. No typing, no missed spends.', accent: 'var(--gold)' },
  { icon: ScanLine, title: 'Receipt OCR', desc: 'Snap a bill or upload a PDF. Amount, tax, vendor and line items — extracted instantly.', accent: 'var(--brand)' },
  { icon: Sparkles, title: 'AI Advisor', desc: 'Ask "can I afford this jacket after rent?" and get an honest, data-driven answer.', accent: 'var(--gold)' },
  { icon: ShieldCheck, title: 'Rent Shield', desc: 'Rent and fixed bills are locked first. You only see what is truly yours to spend.', accent: 'var(--brand)' },
  { icon: PiggyBank, title: 'Ghost Savings', desc: 'Skip an impulse buy? Log it and watch that money hop into a savings vault.', accent: 'var(--gold)' },
  { icon: BellRing, title: 'Subscription Hunter', desc: 'Recurring charges you never use get flagged with their 1-year burn rate.', accent: 'var(--brand)' },
  { icon: Landmark, title: 'Bank & CSV', desc: 'Link your bank, drop in a CSV, or import messages. Every source, one ledger.', accent: 'var(--gold)' },
  { icon: Fingerprint, title: 'Privacy First', desc: 'Sensitive parsing runs locally. Your money story stays yours.', accent: 'var(--brand)' },
];

const STEPS = [
  { icon: Smartphone, title: 'Connect', desc: 'Link your bank, import SMS, or upload receipts and CSV statements.', num: '01' },
  { icon: Sparkles, title: 'Watch it think', desc: 'AI sorts every transaction into categories and flags repeats in seconds.', num: '02' },
  { icon: TrendingUp, title: 'Get richer', desc: 'A daily allowance, rent shield and forecasts keep you ahead of every bill.', num: '03' },
];

const STATS = [
  { value: 24, suffix: '+', label: 'Smart categories' },
  { value: 98, suffix: '%', label: 'Parsing accuracy' },
  { value: 500, suffix: '+', label: 'Transactions tracked' },
  { value: 3, suffix: ' min', label: 'To full setup' },
];

const TICKER_ITEMS = [
  'Track every rupee', 'Protect your rent', 'AI-powered insights', 'Ghost savings',
  'Receipt OCR', 'Bank connected', 'Subscription hunter', 'No more spreadsheets',
  'Daily allowance', 'On-device privacy',
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
   UTILITIES
================================================================ */
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const ease = (t: number) => t * t * (3 - 2 * t);
const range = (p: number, a: number, b: number) => ease(clamp((p - a) / (b - a), 0, 1));
const crossFade = (p: number, inS: number, inE: number, outS: number) =>
  clamp((p - inS) / (inE - inS), 0, 1) * clamp(1 - (p - outS) / 0.08, 0, 1);

/* ================================================================
   HOOKS
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

function useScrollVelocity(): number {
  const [v, setV] = useState(0);
  const ref = useRef({ y: 0, t: Date.now(), vel: 0 });
  useEffect(() => {
    let raf = 0;
    const decay = () => {
      ref.current.vel *= 0.9;
      if (Math.abs(ref.current.vel) < 0.1) ref.current.vel = 0;
      setV(ref.current.vel);
      raf = requestAnimationFrame(decay);
    };
    raf = requestAnimationFrame(decay);
    const onScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - ref.current.t, 1);
      ref.current.vel = (window.scrollY - ref.current.y) / dt * 16;
      ref.current.y = window.scrollY;
      ref.current.t = now;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);
  return v;
}

/* ================================================================
   CANVAS COIN TEXTURES
================================================================ */
function createCoinCanvas(side: 'obverse' | 'reverse'): HTMLCanvasElement {
  const S = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext('2d')!;
  const cx = S / 2, cy = S / 2, r = S * 0.45;

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

  const grad = ctx.createRadialGradient(cx * 0.82, cy * 0.72, 0, cx, cy, r * 1.3);
  grad.addColorStop(0, '#fce588');
  grad.addColorStop(0.22, '#f0c94d');
  grad.addColorStop(0.5, '#d4af37');
  grad.addColorStop(0.78, '#b8960c');
  grad.addColorStop(1, '#8a6510');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, S, S);

  ctx.strokeStyle = 'rgba(100,75,10,0.65)'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.95, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2); ctx.stroke();

  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2;
    ctx.fillStyle = 'rgba(90,65,8,0.75)';
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.885, cy + Math.sin(a) * r * 0.885, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

  if (side === 'obverse') {
    ctx.fillStyle = 'rgba(85,60,5,0.85)';
    ctx.fillRect(cx - 55, cy + 55, 110, 18);
    ctx.beginPath(); ctx.arc(cx, cy + 55, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(cx - 6, cy - 30, 12, 85);
    ctx.beginPath(); ctx.arc(cx, cy - 40, 32, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 95); ctx.lineTo(cx - 40, cy - 42); ctx.lineTo(cx + 40, cy - 42);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(85,60,5,0.5)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy - 95, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(75,55,5,0.9)';
    ctx.font = `bold ${S * 0.038}px sans-serif`;
    ctx.fillText('सत्यमेव जयते', cx, cy + 110);
    ctx.font = `bold ${S * 0.048}px sans-serif`;
    ctx.fillText('INDIA', cx, cy + 165);
  } else {
    ctx.fillStyle = 'rgba(85,60,5,0.9)';
    ctx.font = `900 ${S * 0.2}px sans-serif`;
    ctx.fillText('₹10', cx, cy - 25);
    ctx.font = `bold ${S * 0.055}px sans-serif`;
    ctx.fillText('2026', cx, cy + 105);
    ctx.font = `${S * 0.042}px sans-serif`;
    ctx.fillText('भारत', cx, cy + 170);
    ctx.strokeStyle = 'rgba(85,60,5,0.4)'; ctx.lineWidth = 1.5;
    [-1, 1].forEach(s => {
      ctx.beginPath();
      ctx.moveTo(cx + s * 110, cy - 130);
      for (let j = 0; j < 6; j++) {
        const y2 = cy - 130 + j * 32;
        ctx.quadraticCurveTo(cx + s * 130, y2 + 16, cx + s * 110, y2 + 32);
      }
      ctx.stroke();
    });
  }
  return canvas;
}

/* ================================================================
   THREE.JS COIN SCENE
================================================================ */
const CoinScene: React.FC<{ progress: number; velocity: number }> = ({ progress, velocity }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !window.THREE) return;

    const THREE = window.THREE;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    container.appendChild(renderer.domElement);

    const geom = new THREE.CylinderGeometry(1.3, 1.3, 0.1, 128);
    const headsTex = new THREE.CanvasTexture(createCoinCanvas('obverse'));
    const tailsTex = new THREE.CanvasTexture(createCoinCanvas('reverse'));
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.12 });
    const headsMat = new THREE.MeshStandardMaterial({ map: headsTex, metalness: 0.88, roughness: 0.22 });
    const tailsMat = new THREE.MeshStandardMaterial({ map: tailsTex, metalness: 0.88, roughness: 0.22 });
    const coin = new THREE.Mesh(geom, [headsMat, tailsMat, edgeMat]);
    coin.rotation.x = Math.PI / 2;
    scene.add(coin);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dLight = new THREE.DirectionalLight(0xffffff, 2);
    dLight.position.set(5, 8, 5); scene.add(dLight);
    const fLight = new THREE.DirectionalLight(0xffd700, 0.5);
    fLight.position.set(-4, -3, 4); scene.add(fLight);
    const rLight = new THREE.PointLight(0xffd700, 0.7, 14);
    rLight.position.set(0, 5, -4); scene.add(rLight);

    const pCount = 45;
    const pGeom = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const particles = new THREE.Points(pGeom, new THREE.PointsMaterial({
      color: 0xd4af37, size: 0.03, transparent: true, opacity: 0.45
    }));
    scene.add(particles);

    let raf = 0, visible = true;
    const render = () => {
      if (!visible) return;
      raf = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    const obs = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) render(); }, { threshold: 0 });
    obs.observe(container);

    const resize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);
    render();
    sceneRef.current = { coin, particles, renderer, camera, scene };

    return () => {
      cancelAnimationFrame(raf); obs.disconnect();
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { coin, particles, camera } = sceneRef.current;
    coin.rotation.z = progress * Math.PI * 6;
    coin.rotation.x = Math.PI / 2 + Math.sin(progress * Math.PI * 2) * 0.35;
    camera.position.z = 5 - progress * 2;
    camera.position.y = Math.sin(progress * Math.PI) * -0.3;
    particles.rotation.y = progress * Math.PI * 3;
    particles.rotation.x = progress * Math.PI * 1.5;
  }, [progress, velocity]);

  return <div ref={containerRef} className="w-full h-full" />;
};

/* ================================================================
   ANIMATED COMPONENTS
================================================================ */
const Reveal: React.FC<{
  className?: string;
  variant?: 'up' | 'left' | 'right' | 'scale';
  delay?: 'd1' | 'd2' | 'd3' | 'd4';
}> = ({ children, className = '', variant = 'up', delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => { if (en.isIntersecting) { el.classList.add('in'); obs.unobserve(el); } });
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  const v = variant === 'left' ? 'reveal-left' : variant === 'right' ? 'reveal-right' : variant === 'scale' ? 'reveal-scale' : '';
  return <div ref={ref} className={`reveal ${v} ${delay ? `reveal-${delay}` : ''} ${className}`}>{children}</div>;
};

const CountUp: React.FC<{ to: number; prefix?: string; suffix?: string; className?: string }> = ({
  to, prefix = '', suffix = '', className = ''
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
      const tick = (now: number) => {
        const t = clamp((now - start) / 1600, 0, 1);
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
      {prefix}{val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}{suffix}
    </span>
  );
};

/* ================================================================
   NAVIGATION
================================================================ */
const Navigation: React.FC<{
  theme: Theme;
  onTheme: () => void;
  onNavigate: (s: AppScreen) => void;
}> = ({ theme, onTheme, onNavigate }) => {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${solid ? 'bg-app/80 backdrop-blur-2xl border-b border-app/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-soft flex items-center justify-center shadow-card-soft">
            <Wallet size={18} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="font-display font-black text-xl tracking-tight">SpendSmart</span>
            <p className="text-[10px] uppercase tracking-[0.22em] text-gold font-bold">Money, mastered</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onTheme} className="w-10 h-10 rounded-full border border-app bg-surface/50 flex items-center justify-center hover:border-gold-soft transition-all duration-300" aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={16} className="text-gold" /> : <Moon size={16} className="text-brand" />}
          </button>
          <button onClick={() => onNavigate('login')} className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold border border-app bg-surface/50 hover:border-gold-soft transition-all duration-300">
            Sign In
          </button>
          <button onClick={() => onNavigate('signup')} className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-gold-soft to-gold text-white hover:brightness-110 transition-all shadow-card-soft duration-300">
            Get Started <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </header>
  );
};

/* ================================================================
   HERO SECTION
================================================================ */
const HeroSection: React.FC<{
  onNavigate: (s: AppScreen) => void;
  heroRef: React.RefObject<HTMLDivElement>;
  heroP: number;
  velocity: number;
  theme: Theme;
}> = ({ onNavigate, heroRef, heroP, velocity, theme }) => {
  const t1 = crossFade(heroP, 0.0, 0.08, 0.28);
  const t2 = crossFade(heroP, 0.22, 0.38, 0.55);
  const t3 = crossFade(heroP, 0.5, 0.65, 0.82);
  const t4 = range(heroP, 0.78, 0.95);
  const heroOut = 1 - range(heroP, 0.93, 1);

  const stretchX = clamp(1 + Math.abs(velocity) * 0.008, 1, 1.15);
  const stretchY = clamp(1 - Math.abs(velocity) * 0.003, 0.92, 1);

  return (
    <section ref={heroRef} className="relative h-[400vh]">
      <div className={`sticky top-0 h-screen overflow-hidden ${theme === 'dark' ? 'hero-gradient-dark' : 'hero-gradient-light'}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full opacity-[0.06]" style={{ background: `radial-gradient(circle, var(--gold) 0%, transparent 65%)` }} />
          <div className="absolute bottom-[10%] right-[8%] w-[400px] h-[400px] rounded-full opacity-[0.04]" style={{ background: `radial-gradient(circle, var(--brand) 0%, transparent 65%)` }} />
        </div>

        <div className="absolute inset-0 z-10">
          <CoinScene progress={heroP} velocity={velocity} />
        </div>

        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-4xl h-[38vh]">
            {/* Phase 1 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t1 * heroOut, transform: `translateY(${(1 - t1) * 30}px)` }}>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold mb-5">Scroll to unfold</p>
              <h1 className="heading-serif text-5xl md:text-7xl lg:text-8xl leading-[1.02]" style={{ transform: `scaleX(${stretchX}) scaleY(${stretchY})` }}>
                Every rupee has<br />a <span className="italic text-gold">story.</span>
              </h1>
              <p className="mt-6 text-base md:text-xl text-soft max-w-xl mx-auto font-light leading-relaxed">
                SpendSmart reads the story your money is already writing — and helps you rewrite it.
              </p>
            </div>

            {/* Phase 2 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t2 * heroOut, transform: `translateY(${(1 - t2) * 30}px)` }}>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold mb-5">A smarter ledger</p>
              <h1 className="heading-serif text-5xl md:text-7xl lg:text-8xl leading-[1.02]" style={{ transform: `scaleX(${stretchX}) scaleY(${stretchY})` }}>
                Watch your money<br /><span className="italic text-gold">unfold.</span>
              </h1>
              <p className="mt-6 text-base md:text-xl text-soft max-w-xl mx-auto font-light leading-relaxed">
                Every transaction — from bank SMS to paper receipts — lands in one living ledger.
              </p>
            </div>

            {/* Phase 3 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t3 * heroOut, transform: `translateY(${(1 - t3) * 30}px)` }}>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold mb-5">One flip changes everything</p>
              <h1 className="heading-serif text-5xl md:text-7xl lg:text-8xl leading-[1.02]" style={{ transform: `scaleX(${stretchX}) scaleY(${stretchY})` }}>
                Flip your<br /><span className="italic text-gold">finances.</span>
              </h1>
              <p className="mt-6 text-base md:text-xl text-soft max-w-xl mx-auto font-light leading-relaxed">
                AI forecasts your runway and protects rent before you ever overspend.
              </p>
            </div>

            {/* Phase 4 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4" style={{ opacity: t4, transform: `translateY(${(1 - t4) * 24}px)` }}>
              <p className="text-[11px] md:text-xs uppercase tracking-[0.4em] text-gold font-bold mb-5">Heads up.</p>
              <h1 className="heading-serif text-5xl md:text-7xl lg:text-8xl leading-[1.02]" style={{ transform: `scaleX(${stretchX}) scaleY(${stretchY})` }}>
                Money, <span className="italic text-gold">mastered.</span>
              </h1>
              <p className="mt-6 text-base md:text-xl text-soft max-w-xl mx-auto font-light leading-relaxed">
                Track less. Keep more. Let SpendSmart be your second brain for cash.
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="relative w-full max-w-md h-[10vh] flex items-center justify-center gap-4 px-4 pointer-events-auto" style={{ opacity: t4, transform: `translateY(${(1 - t4) * 20}px)` }}>
            <button onClick={() => onNavigate('signup')} className="group w-full sm:w-auto px-9 py-4 rounded-full font-bold text-white bg-gradient-to-r from-gold-soft to-gold hover:brightness-110 transition-all shadow-card flex items-center justify-center gap-2 text-sm sm:text-base">
              Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => onNavigate('login')} className="w-full sm:w-auto px-9 py-4 rounded-full font-bold border border-app bg-surface/50 hover:border-gold-soft transition-all text-sm sm:text-base backdrop-blur-sm">
              Sign In
            </button>
          </div>

          {/* Scroll cue */}
          <div className="absolute bottom-8 inset-x-0 flex flex-col items-center gap-2 pointer-events-none" style={{ opacity: (1 - range(heroP, 0.04, 0.14)) * heroOut }}>
            <span className="text-[10px] uppercase tracking-[0.35em] text-soft font-bold">Scroll</span>
            <ChevronDown size={20} className="text-gold animate-bounce-slow" />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   TICKER
================================================================ */
const TickerStrip: React.FC = () => (
  <div className="ticker-strip py-5 overflow-hidden relative">
    <div className="flex w-max animate-ticker gap-14 pr-14">
      {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
        <span key={i} className="flex items-center gap-3 shrink-0 text-xs font-bold text-soft uppercase tracking-[0.2em]">
          <span className="text-gold text-sm">✦</span> {item}
        </span>
      ))}
    </div>
  </div>
);

/* ================================================================
   LEAK SECTION
================================================================ */
const LeakSection: React.FC<{
  leakRef: React.RefObject<HTMLDivElement>;
  leakP: number;
}> = ({ leakRef, leakP }) => {
  const step = (i: number) => range(leakP, i * 0.16, i * 0.16 + 0.1);
  const leakEnd = range(leakP, 0.72, 0.86);
  const leakCoin = (i: number) => {
    const s = range(leakP, 0.16 + i * 0.14, 0.26 + i * 0.14);
    return { opacity: clamp(s * 3, 0, 1), y: s * 140, rot: s * 400 * (i % 2 ? 1 : -1) };
  };

  return (
    <section ref={leakRef} className="relative h-[260vh] bg-app">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <Reveal className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold">Chapter 01 — The Leak</p>
            </Reveal>
            <Reveal>
              <h2 className="heading-serif text-4xl md:text-6xl mb-12 leading-[1.05]">
                Money doesn't vanish.<br />It <span className="italic text-gold">drips.</span>
              </h2>
            </Reveal>
            <div className="relative h-56 md:h-64">
              {LEAK_LINES.map((line, i) => {
                const s = step(i);
                return (
                  <div key={i} className="absolute inset-x-0 flex items-center gap-4" style={{ top: i * 48, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                    <span className="w-2.5 h-2.5 rounded-full bg-gold flex-shrink-0" style={{ opacity: s }} />
                    <p className="text-lg md:text-2xl font-semibold">{line}</p>
                  </div>
                );
              })}
              <div className="absolute inset-x-0 flex items-center gap-5" style={{ top: 4 * 48 + 8, opacity: leakEnd, transform: `translateY(${(1 - leakEnd) * 20}px)` }}>
                <p className="heading-serif text-3xl md:text-5xl text-gold font-black">₹24,000+</p>
                <p className="text-soft font-medium text-sm md:text-base">leaked last year,<br />one small bill at a time.</p>
              </div>
            </div>
          </div>

          <Reveal variant="scale" className="relative h-80 md:h-[26rem]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-56 h-80">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-44 h-4 rounded-full bg-black/30" />
                {[0, 1, 2, 3].map((i) => {
                  const c = leakCoin(i);
                  return (
                    <div key={i} className="absolute left-1/2" style={{ top: 30, opacity: c.opacity, transform: `translateX(-50%) translateY(${c.y}px)` }}>
                      <div className="w-14 h-14 rounded-full shadow-card-soft preserve-3d" style={{ transform: `rotateY(${c.rot}deg)`, background: 'radial-gradient(circle at 34% 30%, #f3e29a, #cfa92c 52%, #8a6510 100%)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)' }}>
                        <div className="w-full h-full rounded-full flex items-center justify-center backface-hidden">
                          <span className="font-display font-black text-[#5d4306] text-lg">{i % 2 ? '₹10' : '★'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center text-soft text-sm font-bold w-full" style={{ opacity: leakEnd }}>
                  drains straight out.
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   FEATURES
================================================================ */
const FeaturesSection: React.FC = () => (
  <section className="relative py-28 md:py-40 bg-app-soft border-y border-app">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <Reveal className="max-w-2xl mb-20">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-5">Chapter 02 — The Fix</p>
        <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05] mb-7">
          Stop leaks. Then <span className="italic text-gold">grow.</span>
        </h2>
        <p className="text-lg text-soft font-light leading-relaxed">
          Everything SpendSmart does is built on one idea: automation first, so you never enter a transaction twice.
        </p>
      </Reveal>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(['d1', 'd2', 'd3', 'd4'] as const)[i % 4]}>
            <div className="card-2d h-full p-7 flex flex-col group cursor-default">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110" style={{ background: f.accent }}>
                <f.icon size={20} className="text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2 leading-snug">{f.title}</h3>
              <p className="text-sm text-soft leading-relaxed font-light">{f.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ================================================================
   SAFETY NET
================================================================ */
const SafetyNetSection: React.FC<{
  netRef: React.RefObject<HTMLDivElement>;
  netP: number;
}> = ({ netRef, netP }) => {
  const lockStep = (i: number) => range(netP, i * 0.16, i * 0.16 + 0.12);
  const shieldIn = range(netP, 0.7, 0.88);

  return (
    <section ref={netRef} className="relative h-[260vh] bg-app">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <div className="max-w-7xl mx-auto px-6 md:px-10 w-full grid lg:grid-cols-2 gap-16 items-center">
          <Reveal variant="scale" className="relative h-80 md:h-[26rem] order-2 lg:order-1">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-64 h-80">
                {[0, 1, 2, 3].map((i) => {
                  const s = lockStep(i);
                  return (
                    <div key={i} className="absolute left-1/2" style={{ top: 190 - i * 40, opacity: clamp(s * 2.2, 0, 1), transform: `translateX(-50%) translateY(${(1 - s) * 28}px)` }}>
                      <div className="w-20 h-20 rounded-full shadow-card-soft" style={{ background: 'radial-gradient(circle at 34% 30%, #f3e29a, #cfa92c 52%, #8a6510 100%)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)' }}>
                        <div className="w-full h-full rounded-full flex items-center justify-center border border-[#8a6510]/40">
                          <span className="font-display font-black text-[#5d4306] text-xl">₹</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="absolute left-1/2 -translate-x-1/2 w-40 h-16 rounded-2xl flex items-center justify-center" style={{
                  top: 60, opacity: shieldIn,
                  transform: `translateX(-50%) translateY(${(1 - shieldIn) * -24}px) scale(${0.7 + shieldIn * 0.3})`,
                  background: 'linear-gradient(145deg, var(--gold-soft), var(--gold))',
                  boxShadow: 'var(--shadow-card-soft)',
                }}>
                  <Lock size={24} className="text-white" />
                </div>
                <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-full text-center">
                  <p className="text-soft font-bold text-sm" style={{ opacity: shieldIn }}>Rent & bills locked. The rest is yours.</p>
                </div>
              </div>
            </div>
          </Reveal>

          <div className="relative order-1 lg:order-2">
            <Reveal className="mb-5">
              <p className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold">Chapter 03 — The Shield</p>
            </Reveal>
            <Reveal>
              <h2 className="heading-serif text-4xl md:text-6xl mb-12 leading-[1.05]">
                Your <span className="italic text-gold">Safety Net.</span>
              </h2>
            </Reveal>
            <div className="relative h-56 md:h-64">
              {NET_LINES.map((line, i) => {
                const s = netP > 0.1 ? crossFade(netP, i * 0.16, i * 0.16 + 0.1, i * 0.16 + 0.42) : 0;
                return (
                  <div key={i} className="absolute inset-x-0 flex items-center gap-4" style={{ top: i * 48, opacity: s, transform: `translateX(${(1 - s) * 30}px)` }}>
                    <BadgeCheck size={20} className="text-brand flex-shrink-0" style={{ opacity: s }} />
                    <p className="text-lg md:text-2xl font-semibold">{line}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   HOW IT WORKS
================================================================ */
const HowItWorksSection: React.FC = () => (
  <section className="relative py-28 md:py-40 bg-app-soft border-y border-app">
    <div className="max-w-7xl mx-auto px-6 md:px-10">
      <Reveal className="max-w-2xl mb-20">
        <p className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-5">Chapter 04 — The Flow</p>
        <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05]">
          Three moves. <span className="italic text-gold">That's it.</span>
        </h2>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-8">
        {STEPS.map((s, i) => (
          <Reveal key={s.num} delay={(['d1', 'd2', 'd3'] as const)[i % 3]}>
            <div className="card-2d relative h-full p-9">
              <span className="font-display font-black text-7xl text-gold/[0.08] absolute top-3 right-5">{s.num}</span>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center mb-7 shadow-card-soft">
                <s.icon size={24} className="text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-3">{s.title}</h3>
              <p className="text-soft leading-relaxed font-light">{s.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

/* ================================================================
   STATS
================================================================ */
const StatsSection: React.FC = () => (
  <section className="relative py-24 bg-app border-b border-app">
    <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10">
      {STATS.map((st, i) => (
        <Reveal key={st.label} delay={(['d1', 'd2', 'd3', 'd4'] as const)[i % 4]} className="text-center">
          <p className="heading-serif text-5xl md:text-6xl font-black text-gold">
            <CountUp to={st.value} suffix={st.suffix} />
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.22em] text-soft font-bold">{st.label}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

/* ================================================================
   TESTIMONIAL
================================================================ */
const TestimonialSection: React.FC = () => (
  <section className="relative py-28 bg-app">
    <div className="max-w-4xl mx-auto px-6">
      <Reveal>
        <div className="card-2d p-12 md:p-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold-soft to-gold" />
          <Quote size={48} className="text-gold/20 absolute top-8 right-8" />
          <p className="heading-serif text-2xl md:text-3xl leading-snug italic mb-10 pl-6">
            "I used to check my bank app with my eyes half closed. Now I see one honest number —
            my daily allowance — and I finally stopped sweating rent."
          </p>
          <div className="flex items-center gap-4 pl-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center font-bold text-white text-sm">
              AR
            </div>
            <div>
              <p className="font-bold">Ananya R.</p>
              <p className="text-sm text-soft">Product designer · Bengaluru</p>
            </div>
            <div className="ml-auto flex gap-1 text-gold">
              {[0, 1, 2, 3, 4].map(i => <span key={i}>★</span>)}
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  </section>
);

/* ================================================================
   FINALE
================================================================ */
const FinaleSection: React.FC<{
  finaleRef: React.RefObject<HTMLDivElement>;
  finaleP: number;
  onNavigate: (s: AppScreen) => void;
}> = ({ finaleRef, finaleP, onNavigate }) => {
  const coinSpin = finaleP * 1400;
  const textIn = range(finaleP, 0.35, 0.55);

  return (
    <section ref={finaleRef} className="relative h-[260vh] bg-app">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06]" style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 60%)' }} />
        </div>

        <div className="relative z-10 text-center px-6">
          <div className="relative h-48 w-full flex items-center justify-center mb-6">
            <div className="w-24 h-24 rounded-full preserve-3d" style={{ transform: `rotateY(${coinSpin}deg)` }}>
              <div className="absolute inset-0 backface-hidden rounded-full" style={{ background: 'radial-gradient(circle at 34% 30%, #f3e29a, #cfa92c 52%, #8a6510 100%)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center"><span className="font-display font-black text-[#5d4306] text-2xl">★</span></div>
              </div>
              <div className="absolute inset-0 backface-hidden rounded-full" style={{ transform: 'rotateY(180deg)', background: 'radial-gradient(circle at 34% 30%, #f3e29a, #cfa92c 52%, #8a6510 100%)', boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)' }}>
                <div className="w-full h-full rounded-full flex items-center justify-center"><span className="font-display font-black text-[#5d4306] text-lg">₹10</span></div>
              </div>
            </div>
            <div className="absolute inset-0 m-auto w-36 h-36 rounded-full border-2 border-gold pointer-events-none" style={{ opacity: textIn * 0.5, transform: `scale(${1 + textIn * 0.3})`, boxShadow: '0 0 60px rgba(212,175,55,0.25)' }} />
          </div>

          <div style={{ opacity: textIn, transform: `translateY(${(1 - textIn) * 28}px)` }}>
            <p className="text-[11px] uppercase tracking-[0.4em] text-gold font-bold mb-5">Chapter 05 — The Flip</p>
            <h2 className="heading-serif text-4xl md:text-6xl leading-[1.05] mb-7">
              Ready to make money<br /><span className="italic text-gold">work?</span>
            </h2>
            <p className="text-lg text-soft max-w-lg mx-auto mb-12 font-light">
              Join SpendSmart and turn every coin into a story that ends in savings.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => onNavigate('signup')} className="group w-full sm:w-auto px-10 py-4 rounded-full font-bold text-white bg-gradient-to-r from-gold-soft to-gold hover:brightness-110 transition-all shadow-card flex items-center justify-center gap-2">
                Start Free <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => onNavigate('login')} className="w-full sm:w-auto px-10 py-4 rounded-full font-bold border border-app bg-surface/50 hover:border-gold-soft transition-all backdrop-blur-sm">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ================================================================
   FOOTER
================================================================ */
const Footer: React.FC = () => (
  <footer className="border-t border-app bg-app-soft">
    <div className="max-w-7xl mx-auto px-6 md:px-10 py-14 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-soft to-gold flex items-center justify-center">
          <Wallet size={16} className="text-white" />
        </div>
        <div>
          <p className="font-display font-black">SpendSmart</p>
          <p className="text-xs text-soft">Money, mastered.</p>
        </div>
      </div>
      <div className="flex items-center gap-8 text-sm text-soft font-medium">
        <span className="hover:text-gold cursor-pointer transition-colors">Features</span>
        <span className="hover:text-gold cursor-pointer transition-colors">Privacy</span>
        <span className="hover:text-gold cursor-pointer transition-colors">Blog</span>
        <span className="hover:text-gold cursor-pointer transition-colors">Support</span>
      </div>
      <p className="text-xs text-faint">© {new Date().getFullYear()} SpendSmart. Built for real life.</p>
    </div>
  </footer>
);

/* ================================================================
   MAIN LANDING PAGE
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
  const finaleP = useScrollProgress(finaleRef);
  const velocity = useScrollVelocity();
  const [theme, setTheme] = useState<Theme>(getTheme());
  const handleTheme = () => setTheme(toggleTheme());

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
  }, []);

  return (
    <div className="relative min-h-screen bg-app text-app font-sans overflow-x-hidden">
      <Navigation theme={theme} onTheme={handleTheme} onNavigate={onNavigate} />
      <HeroSection onNavigate={onNavigate} heroRef={heroRef} heroP={heroP} velocity={velocity} theme={theme} />
      <TickerStrip />
      <LeakSection leakRef={leakRef} leakP={leakP} />
      <FeaturesSection />
      <SafetyNetSection netRef={netRef} netP={netP} />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialSection />
      <FinaleSection finaleRef={finaleRef} finaleP={finaleP} onNavigate={onNavigate} />
      <Footer />
    </div>
  );
};

export default LandingPage;
