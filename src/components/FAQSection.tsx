import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import SplitHeading from './SplitHeading';

const FAQS = [
  {
    q: 'How does SpendSmart read my bank SMS?',
    a: 'We parse the transaction messages that banks and UPI apps already send you — amount, merchant, date and balance. Parsing runs locally on your device, so your raw messages are never uploaded anywhere.',
  },
  {
    q: 'Is my money data stored on a server?',
    a: 'No. Your ledger is built on device. Everything is encrypted, and the vault unlocks only with your biometrics. We have zero access to your balances.',
  },
  {
    q: 'What happens to my rent and fixed bills?',
    a: 'Rent gets locked in first — SpendSmart sets it aside before computing your allowance. Bills are paid from an autopilot pool, and only what is left becomes your daily number.',
  },
  {
    q: 'Do I need to type expenses manually?',
    a: 'Almost never. SMS, UPI and receipts are auto-read and tagged. The few edge cases fall into a one-tap review queue instead of manual bookkeeping.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. Export the full ledger as CSV or PDF anytime — including receipts, tags and category breakdowns. Your data is yours, forever.',
  },
];

const FAQSection: React.FC = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="faq-section relative bg-[#F4EFE4] px-6 py-28">
      <div className="max-w-3xl mx-auto">
        <p className="kicker mx-auto justify-center mb-5">The fine print, in plain words</p>
        <SplitHeading
          as="h2"
          text="Asked, answered."
          highlight={['answered.']}
          emClass="text-[#B8860B]"
          className="text-center text-black text-5xl md:text-6xl font-medium leading-[1.02] mb-12"
        />

        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`faq-item rounded-2xl border bg-[#FBF9F0] transition-colors duration-300 ${isOpen ? 'border-[#C9A444]' : 'border-[#E7DEC7] hover:border-[#C9A444]/50'}`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-medium text-lg text-black">{item.q}</span>
                  <span
                    className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${isOpen ? 'rotate-45 border-[#C9A444] bg-[#18241C] text-[#d4af37]' : 'border-[#E7DEC7] text-black/50'}`}
                  >
                    <Plus size={15} />
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-black/65 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;