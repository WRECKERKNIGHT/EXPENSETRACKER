import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialSection: React.FC = () => (
  <section className="bg-[#F5F5F5] px-6 py-24">
    <div className="max-w-4xl mx-auto">
      <div className="testimonial-card relative rounded-3xl bg-[#2B2644] p-10 md:p-16 overflow-hidden">
        <Quote size={56} className="text-[#d4af37]/25 absolute top-8 right-8" />
        <div
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ background: 'linear-gradient(to bottom, #d4af37, #b8960c)' }}
        />
        <p
          className="text-white text-xl md:text-3xl leading-snug mb-10 pl-6 font-medium"
          style={{ letterSpacing: '-0.02em' }}
        >
          "I moved my treasury to USD Halo and never looked back. Yields settle daily,
          withdrawals are instant, and it just runs. It feels like money, finally working."
        </p>
        <div className="flex items-center gap-4 pl-6">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-[#5d4306] text-sm"
            style={{ background: 'radial-gradient(circle at 34% 30%, #fdf6d8, #f0c94d 52%, #b8960c 100%)' }}
          >
            RK
          </div>
          <div>
            <p className="text-white font-medium">Rahul K.</p>
            <p className="text-sm text-white/50">Treasury lead · Web3 infra</p>
          </div>
          <div className="ml-auto flex gap-1 text-[#d4af37]">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i}>★</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default TestimonialSection;