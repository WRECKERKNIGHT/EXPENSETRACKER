import React from 'react';

interface Coin3DProps {
  size?: number;
  symbol?: string;
  symbolBack?: string;
  label?: string;
}

const Coin3D: React.FC<Coin3DProps> = ({ size = 64, symbol = '₹', symbolBack = 'SM', label }) => {
  const face: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    background:
      'radial-gradient(circle at 32% 26%, #fff8d9 0%, #ffe08a 16%, #f2b737 38%, #c8890f 62%, #8a5d0b 100%)',
    boxShadow: `inset 0 2px 3px rgba(255,255,255,0.6), inset 0 -5px 10px rgba(70,45,0,0.5), inset 0 0 0 ${Math.max(2, size * 0.05)}px rgba(120,80,5,0.45)`,
  };

  const ridges: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'repeating-conic-gradient(rgba(80,55,0,0.5) 0deg 7deg, rgba(255,235,170,0.9) 7deg 14deg)',
    opacity: 0.85,
    mask: 'radial-gradient(closest-side, transparent 82%, #000 91%)',
    WebkitMask: 'radial-gradient(closest-side, transparent 82%, #000 91%)',
  };

  const innerRing: React.CSSProperties = {
    position: 'absolute',
    inset: '13%',
    borderRadius: '9999px',
    border: `${Math.max(1, size * 0.022)}px solid rgba(120,80,5,0.4)`,
  };

  const spec: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 34%)',
    mixBlendMode: 'overlay',
  };

  const emblem: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6e4707',
    fontWeight: 900,
    textShadow: '0 1px 0 rgba(255,255,255,0.55), 0 -1px 2px rgba(80,50,0,0.45)',
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        transformStyle: 'preserve-3d',
        filter:
          'drop-shadow(0 12px 20px rgba(0,0,0,0.35)) drop-shadow(0 0 28px rgba(212,175,55,0.4))',
      }}
    >
      <div style={{ ...face }}>
        <div style={ridges} />
        <div style={innerRing} />
        <div style={spec} />
        <div style={emblem}>
          <span style={{ fontSize: size * 0.44, lineHeight: 1 }}>{symbol}</span>
          {label ? (
            <span style={{ fontSize: size * 0.15, letterSpacing: '0.24em', marginLeft: '0.24em', marginTop: -size * 0.02 }}>
              {label}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ ...face, transform: 'rotateY(180deg)' }}>
        <div style={ridges} />
        <div style={innerRing} />
        <div style={spec} />
        <div style={emblem}>
          <span style={{ fontSize: size * 0.3, letterSpacing: size * 0.02 }}>{symbolBack}</span>
        </div>
      </div>
    </div>
  );
};

export default Coin3D;