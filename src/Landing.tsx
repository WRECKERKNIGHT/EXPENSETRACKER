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
      { scale: 1.3 },
      { scale: 1.14, duration: 1.6, ease: 'power2.out', delay: 0.1 }
    );

    /* ── 2. Hero coin idle float ── */
    gsap.to('.hero-coin', { y: -16, rotation: 10, duration: 5, ease: 'sine.inOut', yoyo: true, repeat: -1 });

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

    /* ── 4. Standard section reveals ── */
    const reveals = root.querySelectorAll('.gsap-section');
    gsap.set(reveals, { opacity: 0, y: 60 });
    reveals.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' },
      });
    });

    /* ── 4b. Split-title char reveals on scroll ── */
    root.querySelectorAll('.split-title').forEach((h) => {
      const chars = h.querySelectorAll('.sc');
      gsap.set(chars, { yPercent: 115, opacity: 0 });
      gsap.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.02,
        scrollTrigger: { trigger: h, start: 'top 88%', toggleActions: 'play none none none' },
      });
    });

    /* ── 5. Info cards stagger ── */
    const icards = root.querySelectorAll('.gsap-card');
    gsap.set(icards, { opacity: 0, y: 50, scale: 0.96 });
    gsap.to(icards, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.1,
      ease: 'power3.out',
      scrollTrigger: { trigger: root.querySelector('.gsap-card-grid'), start: 'top 85%' },
    });

    /* ── 6. Waste — pinned scroll story (The Leak) ── */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.waste-section'),
          start: 'top top',
          end: '+=380%',
          pin: true,
          scrub: 1,
        },
      })
      .fromTo('.waste-chapter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0)
      .fromTo('.waste-heading', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.05 }, 0.02)
      .fromTo(
        '.waste-heading .sc',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.05, stagger: 0.02 },
        0.03
      )
      .fromTo('.waste-line-0', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.06 }, 0.07)
      .fromTo('.waste-line-1', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.06 }, 0.14)
      .fromTo('.waste-line-2', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.06 }, 0.21)
      .fromTo('.waste-line-3', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.06 }, 0.28)
      .fromTo(
        '.waste-coin-0',
        { opacity: 0, y: -140, rotation: 0 },
        { opacity: 1, y: 220, rotation: 540, duration: 0.12 },
        0.08
      )
      .fromTo(
        '.waste-coin-1',
        { opacity: 0, y: -180, rotation: 0 },
        { opacity: 1, y: 170, rotation: -540, duration: 0.12 },
        0.14
      )
      .fromTo(
        '.waste-coin-2',
        { opacity: 0, y: -220, rotation: 0 },
        { opacity: 1, y: 120, rotation: 720, duration: 0.12 },
        0.2
      )
      .fromTo(
        '.waste-coin-3',
        { opacity: 0, y: -260, rotation: 0 },
        { opacity: 1, y: 60, rotation: -720, duration: 0.12 },
        0.26
      )
      .fromTo('.waste-stat', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.06 }, 0.38)
      .to('.waste-stage', { opacity: 0, y: -50, duration: 0.08 }, 0.92);

    /* ── 7. DashboardShowcase ── */
    gsap.fromTo(
      root.querySelector('.dash-phone'),
      { opacity: 0, y: 60, rotationY: -8, transformPerspective: 900 },
      {
        opacity: 1,
        y: 0,
        rotationY: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.dash-phone', start: 'top 80%', toggleActions: 'play none none none' },
      }
    );
    root.querySelectorAll('.dash-bullet').forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: -40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.dash-phone', start: 'top 78%' },
        }
      );
    });

    const goalFill = root.querySelector<SVGCircleElement>('.dash-goal-fill');
    const goalText = root.querySelector<HTMLElement>('.dash-goal-text');
    if (goalFill && goalText) {
      const C = 276.46;
      const target = 0.68;
      const obj = { v: 0 };
      const tt = { trigger: '.dash-phone', start: 'top 70%', toggleActions: 'play none none none' };
      gsap.fromTo(
        goalFill,
        { strokeDashoffset: C },
        { strokeDashoffset: C * (1 - target), duration: 1.8, ease: 'power2.inOut', scrollTrigger: tt }
      );
      gsap.to(obj, {
        v: target,
        duration: 1.8,
        ease: 'power2.inOut',
        scrollTrigger: tt,
        onUpdate: () => {
          goalText.textContent = Math.round(obj.v * 100) + '%';
        },
      });
    }

    const bars = root.querySelectorAll('.dash-bar');
    gsap.to(bars, {
      height: (i: number, el: any) => el.getAttribute('data-h') + '%',
      duration: 0.6,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.dash-phone', start: 'top 65%', toggleActions: 'play none none none' },
    });
    root.querySelectorAll('.dash-chip').forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          delay: i * 0.08,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.dash-phone', start: 'top 60%' },
        }
      );
    });
    root.querySelectorAll('.dash-tx').forEach((el, i) => {
      gsap.fromTo(
        el,
        { opacity: 0, x: 40 },
        {
          opacity: 1,
          x: 0,
          duration: 0.5,
          delay: i * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.dash-phone', start: 'top 55%' },
        }
      );
    });
    gsap.to('.dash-coin-0', { y: -14, rotation: 10, duration: 4.5, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    gsap.to('.dash-coin-1', { y: -18, rotation: -12, duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 0.5 });

    /* ── 8. Features stagger ── */
    const fc = root.querySelectorAll('.feature-card');
    gsap.set(fc, { opacity: 0, y: 46, scale: 0.95 });
    gsap.to(fc, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.09,
      scrollTrigger: { trigger: root.querySelector('.features-grid'), start: 'top 82%' },
    });

    /* ── 9. SafetyNet — pinned scroll story ── */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.safety-section'),
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: 1,
        },
      })
      .fromTo('.safety-chapter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0)
      .fromTo('.safety-heading', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.05 }, 0.02)
      .fromTo(
        '.safety-heading .sc',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.05, stagger: 0.02 },
        0.03
      )
      .fromTo('.safety-coin-0', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.1)
      .fromTo('.safety-coin-1', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.17)
      .fromTo('.safety-coin-2', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.24)
      .fromTo('.safety-coin-3', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.31)
      .fromTo(
        '.safety-shield',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(1.7)' },
        0.38
      )
      .fromTo('.safety-line-0', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.48)
      .fromTo('.safety-line-1', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.56)
      .fromTo('.safety-line-2', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.64)
      .to('.safety-stage', { opacity: 0, y: -50, duration: 0.07 }, 0.94);

    /* ── 10. HowItWorks steps ── */
    const steps = root.querySelectorAll('.step-card');
    steps.forEach((el, i) => gsap.set(el, { opacity: 0, x: i % 2 ? 70 : -70, y: 30 }));
    gsap.to(steps, {
      opacity: 1,
      x: 0,
      y: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.16,
      scrollTrigger: { trigger: root.querySelector('.steps-grid'), start: 'top 82%' },
    });

    /* ── 11. Stats count-up ── */
    root.querySelectorAll('.stat-count').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-value') || '0');
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' },
        onUpdate: () => {
          el.textContent = obj.v.toFixed(decimals) + suffix;
        },
      });
    });

    /* ── 12. Testimonial flip-in ── */
    gsap.fromTo(
      root.querySelector('.testimonial-card'),
      { opacity: 0, rotationY: -14, y: 50 },
      {
        opacity: 1,
        rotationY: 0,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.testimonial-card', start: 'top 85%' },
      }
    );

    /* ── 13. Finale — pinned coin flip ── */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.finale-section'),
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
        },
      })
      .fromTo(
        '.finale-coin',
        { rotationY: -360, rotationX: 10, scale: 0.6, transformPerspective: 900 },
        { rotationY: 360, rotationX: -4, scale: 1, duration: 0.55, ease: 'power1.inOut' },
        0.02
      )
      .fromTo(
        '.finale-ring',
        { scale: 0.4, opacity: 0, rotation: -20 },
        { scale: 1.25, opacity: 0.7, rotation: 0, duration: 0.55 },
        0.02
      )
      .fromTo('.finale-content', { opacity: 0, y: 44 }, { opacity: 1, y: 0, duration: 0.1 }, 0.45)
      .fromTo(
        '.finale-title .sc',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.06, stagger: 0.015 },
        0.5
      )
      .to('.finale-stage', { opacity: 0, scale: 0.96, duration: 0.06 }, 0.95);

    return () => {
      ST.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="flex flex-col bg-[#F5F5F5]">
      {/* Scroll progress bar */}
      <div
        className="scroll-progress fixed top-0 left-0 z-[60] h-[3px] w-0"
        style={{ background: 'linear-gradient(90deg, #f0c94d, #b8860b)' }}
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

      <div className="gsap-section">
        <StatsSection />
      </div>

      <div className="gsap-section">
        <TestimonialSection />
      </div>

      <FinaleSection />

      <footer className="bg-[#F5F5F5] px-6 py-12">
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