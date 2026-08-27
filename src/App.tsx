import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InfoSection from './components/InfoSection';
import BackedBySection from './components/BackedBySection';
import UseCasesSection from './components/UseCasesSection';
import FeatureTicker from './components/FeatureTicker';
import RewardsSection from './components/RewardsSection';
import FeaturesGrid from './components/FeaturesGrid';
import PegSection from './components/PegSection';
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

const App: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root || !window.gsap || !window.ScrollTrigger) return;
    const gsap = window.gsap;
    const ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

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

    /* ── 2. Hero parallax + fade on scroll away ── */
    gsap.to(root.querySelector('.hero-video-el'), {
      scale: 1.14,
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

    /* ── 3. Standard section reveals ── */
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

    /* ── 4. Info cards stagger ── */
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

    /* ── 5. UseCases video parallax ── */
    gsap.fromTo(
      root.querySelector('.usecases-video'),
      { scale: 1.12 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: root.querySelector('.usecases-media'),
          start: 'top 95%',
          end: 'top 15%',
          scrub: 1,
        },
      }
    );

    /* ── 6. Rewards — pinned scroll story ── */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.rewards-section'),
          start: 'top top',
          end: '+=380%',
          pin: true,
          scrub: 1,
        },
      })
      .fromTo('.rewards-chapter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0)
      .fromTo('.rewards-heading', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.05 }, 0.02)
      .fromTo(
        '.rewards-line-0',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.06 },
        0.07
      )
      .fromTo(
        '.rewards-line-1',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.06 },
        0.14
      )
      .fromTo(
        '.rewards-line-2',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.06 },
        0.21
      )
      .fromTo(
        '.rewards-line-3',
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: 0.06 },
        0.28
      )
      .fromTo(
        '.rewards-coin-0',
        { opacity: 0, y: -140, rotation: 0 },
        { opacity: 1, y: 220, rotation: 540, duration: 0.12 },
        0.08
      )
      .fromTo(
        '.rewards-coin-1',
        { opacity: 0, y: -180, rotation: 0 },
        { opacity: 1, y: 170, rotation: -540, duration: 0.12 },
        0.14
      )
      .fromTo(
        '.rewards-coin-2',
        { opacity: 0, y: -220, rotation: 0 },
        { opacity: 1, y: 120, rotation: 720, duration: 0.12 },
        0.2
      )
      .fromTo(
        '.rewards-coin-3',
        { opacity: 0, y: -260, rotation: 0 },
        { opacity: 1, y: 60, rotation: -720, duration: 0.12 },
        0.26
      )
      .fromTo('.rewards-stat', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.06 }, 0.38)
      .to('.rewards-stage', { opacity: 0, y: -50, duration: 0.08 }, 0.92);

    /* ── 7. Features stagger ── */
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

    /* ── 8. Peg — pinned scroll story ── */
    gsap
      .timeline({
        scrollTrigger: {
          trigger: root.querySelector('.peg-section'),
          start: 'top top',
          end: '+=340%',
          pin: true,
          scrub: 1,
        },
      })
      .fromTo('.peg-chapter', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.05 }, 0)
      .fromTo('.peg-heading', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.05 }, 0.02)
      .fromTo('.peg-coin-0', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.1)
      .fromTo('.peg-coin-1', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.17)
      .fromTo('.peg-coin-2', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.24)
      .fromTo('.peg-coin-3', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.08 }, 0.31)
      .fromTo(
        '.peg-shield',
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.08, ease: 'back.out(1.7)' },
        0.38
      )
      .fromTo('.peg-line-0', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.48)
      .fromTo('.peg-line-1', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.56)
      .fromTo('.peg-line-2', { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.05 }, 0.64)
      .to('.peg-stage', { opacity: 0, y: -50, duration: 0.07 }, 0.94);

    /* ── 9. HowItWorks steps ── */
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

    /* ── 10. Stats count-up ── */
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

    /* ── 11. Testimonial flip-in ── */
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

    /* ── 12. Finale — pinned coin flip ── */
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
      .to('.finale-stage', { opacity: 0, scale: 0.96, duration: 0.06 }, 0.95);

    return () => {
      ST.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="flex flex-col bg-[#F5F5F5]">
      {/* Hero Wrapper */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>

      <div className="gsap-section">
        <InfoSection />
      </div>

      <div className="gsap-section">
        <BackedBySection />
      </div>

      <div className="gsap-section">
        <FeatureTicker />
      </div>

      <RewardsSection />

      <div className="gsap-section">
        <FeaturesGrid />
      </div>

      <PegSection />

      <div className="gsap-section">
        <HowItWorks />
      </div>

      <div className="gsap-section">
        <UseCasesSection />
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
          <p className="text-sm text-black/50">© {new Date().getFullYear()} USD Halo. Money, mastered.</p>
          <div className="flex items-center gap-6 text-sm text-black/60 font-medium">
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Docs</span>
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Privacy</span>
            <span className="hover:text-black transition-colors duration-200 cursor-pointer">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;