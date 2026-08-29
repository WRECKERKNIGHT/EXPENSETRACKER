import React from 'react';
import { MessageSquareText, Receipt, FileText } from 'lucide-react';
import SplitHeading from './SplitHeading';
import { SAMPLE_SMS, parseBankMessage } from '../dashboard/engine';

const SOURCES = [
  {
    icon: MessageSquareText,
    tag: 'SMS',
    title: 'Debited from bank',
    body: 'HDFC: Rs 4600 debited from A/C ••1234 at PhonePe on 12 Apr',
    chips: ['PhonePe', 'Food', '₹4,600', '12 Apr'],
    accent: true,
  },
  {
    icon: Receipt,
    tag: 'Receipt',
    title: 'Scanned in seconds',
    body: 'BigBasket · MRP ₹640.00 · Paid via UPI 11:42 AM',
    chips: ['BigBasket', 'Essentials', '₹640'],
    accent: false,
  },
  {
    icon: FileText,
    tag: 'PDF',
    title: 'Statement parsed',
    body: 'February statement.pdf — 38 transactions recognised automatically',
    chips: ['38 txns', '−₹12,410', '+₹18,920'],
    accent: false,
  },
];

const SmartParseSection: React.FC = () => (
  <section className="parse-section relative bg-[#F4EFE4] overflow-hidden px-6 py-28">
    <div
      aria-hidden
      className="absolute right-0 top-0 w-[34rem] h-[34rem] rounded-full opacity-20 pointer-events-none"
      style={{ background: 'radial-gradient(circle, #E7DEC7 0%, transparent 62%)' }}
    />
    <div className="relative max-w-[88rem] mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-16 items-start">
      <div>
        <p className="parse-kicker kicker mb-5">The Engine</p>
        <SplitHeading
          as="h2"
          text="Reads what you\nalready ignore."
          highlight={['ignore.']}
          emClass="text-[#B8860B]"
          className="parse-heading text-black text-5xl md:text-7xl font-medium leading-[1.02] mb-7"
        />
        <p className="parse-sub serif-lead text-black/70 text-lg max-w-md leading-relaxed">
          No manual entry. No forgotten chai. SpendSmart turns your bank
          semantics into a living ledger the moment money moves.
        </p>
      </div>

      <div className="parse-grid grid gap-5">
        {SOURCES.map((s) => (
          <div
            key={s.tag}
            className={`parse-card rounded-2xl border p-7 bg-[#FBF9F0] border-[#E7DEC7] ${s.accent ? 'row-span-1' : ''}`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18241C] text-[#d4af37]">
                  <s.icon size={17} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#B8860B]">
                  {s.tag}
                </span>
              </div>
              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-[#d4af37]">
                READ <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#d4af37]" style={{ animation: 'pulse-dot 1.6s ease-in-out infinite' }} />
              </span>
            </div>

            <div className="scan-line relative overflow-hidden rounded-lg bg-white/60 border border-[#E7DEC7] px-5 py-4">
              <div aria-hidden className="scan-sweep absolute inset-x-0 top-0 h-8" />
              <p className="text-black/55 font-mono text-[13px] leading-relaxed">{s.body}</p>
            </div>

            <p className="parse-label mt-4 mb-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-black/35">
              Parsed into
            </p>
            <div className="flex flex-wrap gap-2">
              {s.chips.map((c) => (
                <span key={c} className="rounded-full border border-[#C9A444]/40 bg-[#d4af37]/10 px-3.5 py-1.5 text-xs font-semibold text-[#18241C]">
                  {c}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Live demo — real parser, on this page */}
    <div className="relative max-w-[88rem] mx-auto mt-16 rounded-3xl bg-[#18241C] p-8 md:p-10 overflow-hidden">
      <div
        aria-hidden
        className="absolute right-0 top-0 w-[26rem] h-[26rem] rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 65%)' }}
      />
      <div className="relative grid lg:grid-cols-[1fr_1.2fr] gap-8 items-center">
        <div>
          <p className="kicker kicker-gold mb-4">Try it right now</p>
          <h3 className="text-[#FBF9F0] text-3xl md:text-5xl font-medium leading-[1.05] mb-3">
            Paste a bank SMS, <em className="not-italic text-[#d4af37] glow-gold">watch it parse.</em>
          </h3>
          <p className="text-white/60 text-base max-w-sm leading-relaxed">
            A real parser is running on this page. Paste any of the samples — nothing leaves your browser.
          </p>
        </div>

        <LiveParser />
      </div>
    </div>
  </section>
);

const LiveParser: React.FC = () => {
  const [text, setText] = React.useState(SAMPLE_SMS[0]);
  const parsed = React.useMemo(() => parseBankMessage(text), [text]);
  return (
    <div>
      <textarea
        rows={3}
        className="w-full rounded-2xl border border-white/15 bg-white/[0.06] px-5 py-4 text-sm outline-none focus:border-[#d4af37]/60 transition-colors duration-200 resize-none font-mono text-white/90 placeholder:text-white/30"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2 mt-3">
        {SAMPLE_SMS.slice(0, 3).map((s, i) => (
          <button
            key={i}
            onClick={() => setText(s)}
            className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:border-[#d4af37] hover:text-[#d4af37] transition-colors duration-200 cursor-pointer"
          >
            Sample {i + 1}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-white/[0.04] border border-white/10 p-5">
        {parsed.ok && parsed.amount ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{parsed.name}</p>
              <p className="text-[11px] uppercase tracking-[0.24em] text-[#d4af37] font-semibold mt-0.5">
                {parsed.cat} · {parsed.kind}
              </p>
            </span>
            <span className="font-serif text-2xl text-[#d4af37] glow-gold">
              {parsed.kind === 'credit' ? '+' : '−'}₹{parsed.amount.toLocaleString('en-IN')}
            </span>
          </div>
        ) : (
          <p className="text-white/50 text-sm">Keep typing — the engine reads amount, merchant and category live.</p>
        )}
        <p className="mt-3 text-[11px] text-white/55">Parsed entirely in your browser. Nothing uploaded.</p>
      </div>
    </div>
  );
};

export default SmartParseSection;