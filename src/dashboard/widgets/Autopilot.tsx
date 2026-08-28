import React from 'react';
import { KeyRound, Repeat, Gauge, PiggyBank, BellRing, Sparkles } from 'lucide-react';
import { AUTOPILOT, AutopilotId } from '../engine';

const ICONS: Record<AutopilotId, React.ComponentType<{ size?: number | string; className?: string }>> = {
  rent: KeyRound,
  autopay: Repeat,
  allowance: Gauge,
  ghost: PiggyBank,
  hunter: BellRing,
  advisor: Sparkles,
};

interface AutopilotProps {
  toggles: Record<AutopilotId, boolean>;
  onChange: (id: AutopilotId, on: boolean) => void;
}

const Autopilot: React.FC<AutopilotProps> = ({ toggles, onChange }) => (
  <div className="rounded-2xl bg-[#FBF9F0] border border-[#E7DEC7] p-6">
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-medium text-black" style={{ letterSpacing: '-0.02em' }}>
        Autonomous autopilot
      </h3>
      <span className="text-xs text-[#B8860B] font-semibold animate-pulse">● LIVE</span>
    </div>

    <div className="flex flex-col gap-1">
      {AUTOPILOT.map((a) => {
        const Icon = ICONS[a.id];
        const on = toggles[a.id];
        return (
          <div
            key={a.id}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-200 ${
              on ? 'bg-[#F4EFE4]' : 'opacity-55'
            }`}
          >
            <div className="w-9 h-9 rounded-lg bg-[#18241C] flex items-center justify-center shrink-0">
              <Icon size={16} className="text-[#d4af37]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-black">{a.label}</p>
              <p className="text-xs text-black/45">{a.desc}</p>
            </div>
            <div
              className="sswitch"
              data-on={on}
              role="switch"
              aria-checked={on}
              onClick={() => onChange(a.id, !on)}
            />
          </div>
        );
      })}
    </div>

    <p className="text-xs text-black/40 mt-4 leading-relaxed">
      Switching rules changes every live number above. Rent and bills stay locked regardless.
    </p>
  </div>
);

export default Autopilot;