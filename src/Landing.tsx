import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InfoSection from './components/InfoSection';
import FeatureTicker from './components/FeatureTicker';
import WasteSection from './components/WasteSection';
import DashboardShowcase from './components/DashboardShowcase';
import FeaturesGrid from './components/FeaturesGrid';
import SafetyNetSection from './components/SafetyNetSection';
import HowItWorks from './components/HowItWorks';
import AutopilotTeaser from './components/AutopilotTeaser';
import SecuritySection from './components/SecuritySection';
import SmartParseSection from './components/SmartParseSection';
import StatsSection from './components/StatsSection';
import TestimonialSection from './components/TestimonialSection';
import FinaleSection from './components/FinaleSection';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const Landing: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ── 0. Scroll progress bar ── */
    gsap.to('.scroll-progress', {
      width: '100%',
      ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'max', scrub: 0.3 },
    });

    /* ── 1. Nav + hero entrance ── */
    gsap.fromTo(
      root.querySelector('nav'),
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.15 }
    );
    gsap.fromTo(
      root.querySelectorAll('.hero-animate'),
      { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.14, delay: 0.4 }
    );

    /* ── 1b. Hero title char split ── */
    const heroChars = root.querySelectorAll('.hero-title .sc');
    gsap.set(heroChars, { yPercent: 115, opacity: 0 });
    gsap.to(heroChars, {
      yPercent: 0,
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.035,
      delay: 0.35,
    });

    /* ── 1c. Video intro settle, then scroll parallax ── */
    gsap.fromTo(
      root.querySelector('.hero-video-el'),
      { scale: 1.22, filter: 'brightness(0.55)' },
      { scale: 1.06, filter: 'brightness(1)', duration: 1.8, ease: 'power2.out', delay: 0.1 }
    );
    gsap.fromTo(
      root.querySelector('.hero-glow'),
      { opacity: 0, scale: 0.82 },
      { opacity: 1, scale: 1, duration: 2.2, ease: 'power2.out', delay: 0.5 }
    );
    gsap.fromTo(
      root.querySelector('.hero-title .sc'),
      { textShadow: '0 0 0px rgba(212,175,55,0)' },
      { textShadow: '0 0 28px rgba(212,175,55,0.35)', duration: 1.6, delay: 0.9, stagger: 0.035 }
    );

    /* ── 3. Hero parallax + fade on scroll away ── */
    gsap.to(root.querySelector('.hero-video-el'), {
      scale: 1.25,
      ease: 'none',
      scrollTrigger: {
        trigger: root.querySelector('.hero-scroll'),
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });
    gsap.to(root.querySelector('.hero-fade'), {
      opacity: 0,
      y: -60,
      ease: 'none',
      scrollTrigger: {
        trigger: root.querySelector('.hero-scroll'),
        start: 'top top',
        end: '70% top',
        scrub: 1,
      },
    });

    /* ── 4. Standard section reveals (scrubbed, speed-synced, blur-in) ── */
    root.querySelectorAll<HTMLElement>('.gsap-section').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 72, scale: 0.985, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 94%', end: 'top 40%', scrub: 0.6 },
        }
      );
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) {
        gsap.fromTo(
          inner,
          { y: 60 },
          {
            y: -60,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          }
        );
      }
    });

    /* ── 4b. Split-title char reveals on scroll ── */
    root.querySelectorAll<HTMLElement>('.split-title').forEach((h) => {
      if (h.closest('.dash-show, .waste-section, .safety-section, .auto-section, .finale-section')) return;
      const chars = h.querySelectorAll('.sc');
      gsap.set(chars, { yPercent: 118, opacity: 0 });
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        ease: 'none',
        duration: 0.7,
        stagger: 0.01,
        scrollTrigger: { trigger: h, start: 'top 88%', end: 'top 52%', scrub: 0.5 },
      });
    });

    /* ── 5. Info cards stagger ── */
    const cards = root.querySelector('.gsap-card-grid') as HTMLElement | null;
    if (cards) {
      const gcards = cards.querySelectorAll('.gsap-card');
      gsap.set(gcards, { opacity: 0, y: 70, scale: 0.96 });
      gsap.to(gcards, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        duration: 0.7,
        stagger: 0.06,
        scrollTrigger: { trigger: cards, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
      });
    }

    /* ── Chapter engine: scroll-locked storytelling (pin + scrub) ── */
    const chapter = (
      trigger: Element | null,
      cues: Array<{ sel: string; from: any; to: any; dur?: number }>,
      opts: { pin?: boolean; pinEnd?: string; start?: string; end?: string; exit?: string | null } = {}
    ) => {
      if (!trigger) return;
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: opts.pin ? 'top top' : opts.start ?? 'top 80%',
          end: opts.pin ? opts.pinEnd ?? '+=240%' : opts.end ?? 'top 15%',
          pin: !!opts.pin,
          anticipatePin: 1,
          scrub: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: 'power1.inOut' },
      });
      let t = 0;
      cues.forEach((cue) => {
        const dur = cue.dur ?? 0.1;
        tl.fromTo(cue.sel, cue.from, { ...cue.to, duration: dur }, t);
        t += dur;
      });
      if (opts.exit) {
        tl.to(opts.exit, { opacity: 0, y: -60, scale: 0.97, duration: 0.22 }, t + 0.04);
      }
    };

    /* ── 6. Waste — The Leak (scroll-locked story) ── */
    chapter(
      root.querySelector('.waste-section'),
      [
        { sel: '.waste-chapter', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
        { sel: '.waste-heading', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.waste-heading .sc', from: { yPercent: 120, opacity: 0 }, to: { yPercent: 0, opacity: 1 }, dur: 0.5 },
        { sel: '.waste-mark', from: { opacity: 0, scale: 0.55, rotation: -6 }, to: { opacity: 1, scale: 1, rotation: 0 }, dur: 0.7 },
        { sel: '.waste-line-0', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.waste-line-1', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.waste-line-2', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.waste-line-3', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.waste-stat', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
      ],
      { pin: true, pinEnd: '+=300%', exit: '.waste-stage' }
    );

    /* ── 7. DashboardShowcase ── */
    const phone = root.querySelector('.dash-phone') as HTMLElement | null;
    const goalFill = root.querySelector<SVGCircleElement>('.dash-goal-fill');
    const goalText = root.querySelector<HTMLElement>('.dash-goal-text');
    if (phone) {
      const C = 276.46;
      const counter = { v: 0 };
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.querySelector('.dash-show'), start: 'top 82%', end: 'top 5%', scrub: 0.6 },
        defaults: { ease: 'power1.inOut' },
      });
      tl.fromTo('.dash-kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, 0)
        .fromTo('.dash-show .split-title .sc', { yPercent: 118, opacity: 0 }, { yPercent: 0, opacity: 1 }, 0.01)
        .fromTo(phone, { opacity: 0, y: 90, rotationY: -10, transformPerspective: 900 }, { opacity: 1, y: 0, rotationY: 0 }, 0.06)
        .fromTo('.dash-bullet', { opacity: 0, x: -30 }, { opacity: 1, x: 0, stagger: 0.05 }, 0.14)
        .fromTo(
          phone.querySelectorAll('.dash-chip'),
          { opacity: 0, y: 14, scale: 0.94 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.04 },
          0.26
        )
        .fromTo(
          phone.querySelectorAll('.dash-bar'),
          { height: '0%' },
          { height: (i: number, el: any) => el.getAttribute('data-h') + '%', stagger: 0.03 },
          0.31
        )
        .fromTo(
          goalFill,
          { strokeDashoffset: C },
          { strokeDashoffset: C * (1 - 0.68) },
          0.31
        )
        .to(
          counter,
          {
            v: 0.68,
            onUpdate: () => {
              if (goalText) goalText.textContent = Math.round(counter.v * 100) + '%';
            },
          },
          0.31
        )
        .fromTo(
          phone.querySelectorAll('.dash-tx'),
          { opacity: 0, x: 26 },
          { opacity: 1, x: 0, stagger: 0.04 },
          0.37
        );
    }

    gsap.to(phone, { y: -10, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.2 });

    /* ── 8. Features stagger ── */
    const fg = root.querySelector('.features-grid') as HTMLElement | null;
    if (fg) {
      const fc = fg.querySelectorAll('.feature-card');
      gsap.set(fc, { opacity: 0, y: 54, scale: 0.97, transformPerspective: 900 });
      gsap.to(fc, {
        opacity: 1,
        y: 0,
        scale: 1,
        ease: 'none',
        duration: 0.75,
        stagger: 0.05,
        scrollTrigger: { trigger: fg, start: 'top 85%', end: 'top 25%', scrub: 0.5 },
      });
    }

    /* ── 8b. Feature card 3D tilt on hover ── */
    const tiltCleanups: Array<() => void> = [];
    root.querySelectorAll<HTMLElement>('.tilt-card').forEach((el) => {
      const rx = gsap.quickTo(el, 'rotationX', { duration: 0.35, ease: 'power2' });
      const ry = gsap.quickTo(el, 'rotationY', { duration: 0.35, ease: 'power2' });
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 8);
        rx(-py * 8);
      };
      const onLeave = () => {
        ry(0);
        rx(0);
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      tiltCleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
        ry(0);
        rx(0);
      });
    });

    /* ── 8c. SmartParse cards stagger ── */
    const pgrid = root.querySelector('.parse-grid') as HTMLElement | null;
    if (pgrid) {
      const pc = pgrid.querySelectorAll('.parse-card');
      gsap.set(pc, { opacity: 0, y: 56, rotation: (i: number) => (i % 2 ? 2 : -2) });
      gsap.to(pc, {
        opacity: 1,
        y: 0,
        rotation: 0,
        ease: 'none',
        duration: 0.7,
        stagger: 0.1,
        scrollTrigger: { trigger: pgrid, start: 'top 88%', end: 'top 30%', scrub: 0.6 },
      });
    }

    /* ── 9. SafetyNet — The Shield (scroll-locked story) ── */
    chapter(
      root.querySelector('.safety-section'),
      [
        { sel: '.safety-chapter', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
        { sel: '.safety-heading', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.safety-heading .sc', from: { yPercent: 120, opacity: 0 }, to: { yPercent: 0, opacity: 1 }, dur: 0.5 },
        { sel: '.safety-shield', from: { opacity: 0, scale: 0.6, y: 40 }, to: { opacity: 1, scale: 1, y: 0, ease: 'back.out(1.6)' }, dur: 0.6 },
        { sel: '.safety-line-0', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.safety-line-1', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.safety-line-2', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.safety-line-3', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
      ],
      { pin: true, pinEnd: '+=300%', exit: '.safety-stage' }
    );

    /* ── 10. HowItWorks steps ── */
    const sgrid = root.querySelector('.steps-grid') as HTMLElement | null;
    if (sgrid) {
      const steps = sgrid.querySelectorAll('.step-card');
      gsap.set(steps, { opacity: 0, x: (i: number) => (i % 2 ? 80 : -80), y: 40 });
      gsap.to(steps, {
        opacity: 1,
        x: 0,
        y: 0,
        ease: 'none',
        duration: 0.7,
        stagger: 0.08,
        scrollTrigger: { trigger: sgrid, start: 'top 85%', end: 'top 30%', scrub: 0.5 },
      });
    }

    /* ── 10b. Autopilot — Sense the machine (scroll-locked story) ── */
    chapter(
      root.querySelector('.auto-section'),
      [
        { sel: '.auto-chapter', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.auto-heading', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, dur: 0.45 },
        { sel: '.auto-heading .sc', from: { yPercent: 120, opacity: 0 }, to: { yPercent: 0, opacity: 1 }, dur: 0.5 },
        { sel: '.auto-sub', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.auto-line', from: { opacity: 0, x: -36 }, to: { opacity: 1, x: 0, stagger: 0.12 }, dur: 0.6 },
        { sel: '.auto-word', from: { opacity: 0, scale: 0.82 }, to: { opacity: 1, scale: 1 }, dur: 0.6 },
        { sel: '.auto-card', from: { opacity: 0, y: 90, rotation: 4, scale: 0.95 }, to: { opacity: 1, y: 0, rotation: 0, scale: 1 }, dur: 0.6 },
        { sel: '.auto-cta', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
      ],
      { pin: true, pinEnd: '+=280%', exit: '.auto-stage' }
    );
    gsap.fromTo(
      root.querySelector('.auto-word'),
      { y: 40 },
      {
        y: -40,
        ease: 'none',
        scrollTrigger: { trigger: '.auto-section', start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );

    /* ── 10c. Vault — Your money, your secret (scroll-locked story) ── */
    chapter(
      root.querySelector('.vault-section'),
      [
        { sel: '.vault-chapter', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
        { sel: '.vault-heading', from: { opacity: 0, y: 30 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.vault-heading .sc', from: { yPercent: 120, opacity: 0 }, to: { yPercent: 0, opacity: 1 }, dur: 0.5 },
        { sel: '.vault-sub', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.vault-line-0', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.vault-line-1', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.vault-line-2', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.vault-line-3', from: { opacity: 0, x: -34 }, to: { opacity: 1, x: 0 }, dur: 0.35 },
        { sel: '.vault-card', from: { opacity: 0, y: 90, rotationY: 12, transformPerspective: 900 }, to: { opacity: 1, y: 0, rotationY: 0 }, dur: 0.7 },
        { sel: '.vault-cta', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
      ],
      { pin: true, pinEnd: '+=300%', exit: '.vault-stage' }
    );

    /* ── 11. Stats count-up ── */
    root.querySelectorAll('.stat-count').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-value') || '0');
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top 88%', end: 'bottom 55%', scrub: 1 },
        onUpdate: () => {
          el.textContent = obj.v.toFixed(decimals) + suffix;
        },
      });
    });

    /* ── 12. Testimonial flip-in ── */
    const tcard = root.querySelector('.testimonial-card') as HTMLElement | null;
    if (tcard) {
      gsap.fromTo(
        tcard,
        { opacity: 0, rotationY: -10, y: 46 },
        {
          opacity: 1,
          rotationY: 0,
          y: 0,
          ease: 'none',
          scrollTrigger: { trigger: tcard, start: 'top 86%', end: 'top 42%', scrub: 0.5 },
        }
      );
    }

    /* ── 13. Finale — The Flip (scroll-locked story) ── */
    chapter(
      root.querySelector('.finale-section'),
      [
        { sel: '.finale-mark', from: { opacity: 0, scale: 0.5, rotation: -4 }, to: { opacity: 1, scale: 1, rotation: 0 }, dur: 0.7 },
        { sel: '.finale-kicker', from: { opacity: 0, y: 16 }, to: { opacity: 1, y: 0 }, dur: 0.35 },
        { sel: '.finale-title', from: { opacity: 0, y: 26 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.finale-title .sc', from: { yPercent: 120, opacity: 0 }, to: { yPercent: 0, opacity: 1 }, dur: 0.6 },
        { sel: '.finale-sub', from: { opacity: 0, y: 20 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
        { sel: '.finale-actions', from: { opacity: 0, y: 24 }, to: { opacity: 1, y: 0 }, dur: 0.4 },
      ],
      { pin: true, pinEnd: '+=280%' }
    );

    const refresh = () => ST.refresh();
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      tiltCleanups.forEach((fn) => fn());
      ST.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="flex flex-col bg-[#F4EFE4]">
      {/* Scroll progress bar */}
      <div
        className="scroll-progress fixed top-0 left-0 z-[60] h-[3px] w-0"
        style={{ background: 'linear-gradient(90deg, #d5b256, #b8860b)' }}
      />

      {/* Hero Wrapper */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>

      <div className="gsap-section">
        <InfoSection />
      </div>

      <div className="gsap-section">
        <FeatureTicker />
      </div>

      <WasteSection />

      <div className="gsap-section">
        <DashboardShowcase />
      </div>

      <div className="gsap-section">
        <FeaturesGrid />
      </div>

      <SafetyNetSection />

      <div className="gsap-section">
        <HowItWorks />
      </div>

      <AutopilotTeaser />

      <SecuritySection />

      <div className="gsap-section">
        <SmartParseSection />
      </div>

      <div className="gsap-section">
        <StatsSection />
      </div>

      <div className="gsap-section">
        <TestimonialSection />
      </div>

      <FinaleSection />

      <footer className="bg-[#F4EFE4] px-6 py-12">
        <div className="max-w-[88rem] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-black/50">© {new Date().getFullYear()} SpendSmart. Money, mastered.</p>
          <div className="flex items-center gap-6 text-sm text-black/60 font-medium">
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Features</span>
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Privacy</span>
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;