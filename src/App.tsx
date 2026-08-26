import React, { useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import InfoSection from './components/InfoSection';
import BackedBySection from './components/BackedBySection';
import UseCasesSection from './components/UseCasesSection';

declare global {
  interface Window {
    gsap: any;
    ScrollTrigger: any;
  }
}

const App: React.FC = () => {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    const sections = mainRef.current.querySelectorAll('.gsap-section');
    sections.forEach((section) => {
      window.gsap.fromTo(
        section,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Staggered card animations in InfoSection
    const cards = mainRef.current.querySelectorAll('.gsap-card');
    cards.forEach((card, i) => {
      window.gsap.fromTo(
        card,
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          delay: i * 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // Parallax effect on hero video
    const heroVideo = mainRef.current.querySelector('.hero-video');
    if (heroVideo) {
      window.gsap.to(heroVideo, {
        scale: 1.08,
        scrollTrigger: {
          trigger: heroVideo,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.5,
        },
      });
    }

    // Fade-in on nav
    const nav = mainRef.current.querySelector('nav');
    if (nav) {
      window.gsap.fromTo(
        nav,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.2 }
      );
    }

    // Hero content stagger entrance
    const heroContent = mainRef.current.querySelectorAll('.hero-animate');
    window.gsap.fromTo(
      heroContent,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.15,
        delay: 0.4,
      }
    );

    return () => {
      window.ScrollTrigger.getAll().forEach((t: any) => t.kill());
    };
  }, []);

  return (
    <div ref={mainRef} className="flex flex-col bg-[#F5F5F5]">
      {/* Hero Wrapper: Navbar + Hero */}
      <div className="h-screen flex flex-col overflow-hidden">
        <Navbar />
        <HeroSection />
      </div>

      {/* Info Section */}
      <div className="gsap-section">
        <InfoSection />
      </div>

      {/* Backed By Section */}
      <div className="gsap-section">
        <BackedBySection />
      </div>

      {/* Use Cases Section */}
      <div className="gsap-section">
        <UseCasesSection />
      </div>
    </div>
  );
};

export default App;
