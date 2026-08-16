import React from 'react';

interface ProgressRingProps {
  pct: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ pct, size = 96, strokeWidth = 9, label, sublabel }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, pct));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-3)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--gold)" />
            <stop offset="100%" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {label !== undefined ? (
          <>
            <span className="font-display font-bold text-xl leading-none" style={{ fontSize: size * 0.19 }}>
              {label}
            </span>
            {sublabel && <span className="text-[10px] text-faint font-semibold mt-0.5">{sublabel}</span>}
          </>
        ) : (
          <span className="font-display font-bold leading-none" style={{ fontSize: size * 0.19 }}>
            {clamped.toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ProgressRing;
