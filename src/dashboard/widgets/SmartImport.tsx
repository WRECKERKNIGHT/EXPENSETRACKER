import React, { useState } from 'react';
import { ScanLine, Wand2, X } from 'lucide-react';
import { parseBankMessage, SAMPLE_SMS, Tx, fmt, todayISO } from '../engine';
import { nextId } from '../storage';

interface SmartImportProps {
  onAdd: (t: Tx) => void;
}

const textareaCls =
  'w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-[#B8860B] transition-colors duration-200 resize-none font-mono';

const SmartImport: React.FC<SmartImportProps> = ({ onAdd }) => {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [last, setLast] = useState<ReturnType<typeof parseBankMessage> | null>(null);

  const parse = () => {
    const r = parseBankMessage(text);
    if (r.ok && r.amount) {
      setLast(r);
      setError(null);
    } else {
      setLast(null);
      setError(r.reason ?? 'Could not read that message.');
    }
  };

  const importIt = () => {
    if (!last?.ok || !last.name || !last.amount || !last.cat) return;
    onAdd({
      id: nextId(),
      name: last.name,
      amount: last.amount,
      cat: last.cat,
      date: todayISO(),
    });
    setText('');
    setLast(null);
    setError(null);
  };

  const useSample = (s: string) => {
    setText(s);
    setError(null);
    setLast(null);
  };

  return (
    <div className="rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#18241C] text-[#d4af37]">
            <ScanLine size={18} />
          </span>
          <div>
            <h3 className="text-lg font-medium text-black">Smart Import</h3>
            <p className="text-xs text-black/45">Paste a bank SMS or UPI alert — parsed on your device.</p>
          </div>
        </div>
      </div>

      <textarea
        className={`${textareaCls} mt-4`}
        rows={3}
        placeholder={'Paste an SMS like…\n"HDFC Bank: Rs 4600 debited from A/C **1234 at PhonePe on 12-04 REF/3249/88"'}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {SAMPLE_SMS.slice(0, 3).map((s, i) => (
          <button
            key={i}
            onClick={() => useSample(s)}
            className="rounded-full border border-[#E7DEC7] px-3 py-1 text-xs text-black/55 hover:border-[#C9A444] hover:text-black transition-colors duration-200 cursor-pointer"
          >
            Sample {i + 1}
          </button>
        ))}
        <button
          onClick={parse}
          disabled={!text.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-[#18241C] text-white text-xs font-medium px-4 py-2 hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
        >
          <Wand2 size={13} /> Parse it
        </button>
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#c0392b]/5 border border-[#c0392b]/20 px-4 py-3 text-sm text-[#c0392b]">
          <X size={14} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {last?.ok && (
        <div className="mt-3 rounded-xl border border-[#C9A444]/40 bg-[#d4af37]/5 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.26em] text-[#B8860B] mb-2">
            {last.kind === 'credit' ? 'Credit detected' : 'Parsed into'} · {last.reason}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex-1 min-w-0">
              <p className="font-medium text-black truncate">{last.name}</p>
              <p className="text-xs text-black/45">{last.cat}</p>
            </span>
            <span className={`font-serif text-xl ${last.kind === 'credit' ? 'text-[#2a7a4b]' : 'text-black'}`}>
              {last.kind === 'credit' ? '+' : '−'}{fmt(last.amount ?? 0)}
            </span>
            <button
              onClick={importIt}
              disabled={last.kind === 'credit'}
              className="shine-btn inline-flex items-center gap-2 rounded-full bg-[#18241C] text-white text-sm font-medium px-5 py-2 hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import
            </button>
          </div>
        </div>
      )}

      <p className="text-[11px] text-black/35 mt-3 leading-relaxed">
        Parsing runs entirely on this device — nothing you paste ever leaves the browser.
      </p>
    </div>
  );
};

export default SmartImport;