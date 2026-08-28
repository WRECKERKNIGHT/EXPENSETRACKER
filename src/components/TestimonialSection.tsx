import React, { useEffect, useState } from 'react';
import { Quote } from 'lucide-react';

const SLIDES = [
  {
    quote:
      "After three months I finally know where my salary goes. The daily allowance feature alone saved me from overdraft twice.",
    initials: 'PK',
    name: 'Priya K.',
    role: 'Software engineer · Mumbai',
  },
  {
    quote:
      'The autopilot reads my UPI receipts and sorts everything itself. I just check the dashboard on Sundays. Feels like money manages itself.',
    initials: 'AS',
    name: 'Arjun S.',
    role: 'Product manager · Bengaluru',
  },
  {
    quote:
      'Set a goal in the onboarding and the dashboard figured out what to cut. I saved ₹12,000 in two months without feeling it.',
    initials: 'MR',
    name: 'Meera R.',
    role: 'Designer · Delhi',
  },
];

const TestimonialSection: React.FC = () => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((v) => (v + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[active];

  return (
    <section className="bg-[#F5F5F5] px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <div className="testimonial-card relative rounded-3xl bg-[#2B2644] p-10 md:p-16 overflow-hidden">
          <Quote size={56} className="text-[#d4af37]/25 absolute top-8 right-8" />
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: 'linear-gradient(to bottom, #d4af37, #b8960c)' }}
          />
          <div key={active} className="t-fade transition-all duration-500 ease-out">
            <p
              className="t-quote text-white text-xl md:text-3xl leading-snug mb-10 pl-6 font-medium"
              style={{ letterSpacing: '-0.02em' }}
            >
              "{slide.quote}"
            </p>
            <div className="flex items-center gap-4 pl-6">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-[#5d4306] text-sm"
                style={{ background: 'radial-gradient(circle at 34% 30%, #fdf6d8, #f0c94d 52%, #b8960c 100%)' }}
              >
                {slide.initials}
              </div>
              <div>
                <p className="text-white font-medium">{slide.name}</p>
                <p className="text-sm text-white/50">{slide.role}</p>
              </div>
              <div className="ml-auto flex gap-1 text-[#d4af37]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === active ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Show testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;