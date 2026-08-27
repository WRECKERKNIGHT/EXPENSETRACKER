import React from 'react';

interface Coin3DProps {
  size?: number;
  symbol?: string;
  symbolBack?: string;
}

const Coin3D: React.FC<Coin3DProps> = ({ size = 64, symbol = '$', symbolBack = 'H' }) => {
  const face: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    border: `${Math.max(2, size * 0.03)}px solid rgba(138, 101, 16, 0.45)`,
    background: 'radial-gradient(circle at 34% 30%, #fdf6d8, #f0c94d 52%, #b8960c 100%)',
    boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -3px 6px rgba(0,0,0,0.35)',
  };

  return (
    <div style={{ width: size, height: size, position: 'relative', transformStyle: 'preserve-3d' }}>
      <div style={{ ...face }}>
        <span style={{ fontWeight: 900, color: '#5d4306', fontSize: size * 0.42 }}>{symbol}</span>
      </div>
      <div style={{ ...face, transform: 'rotateY(180deg)' }}>
        <span style={{ fontWeight: 900, color: '#5d4306', fontSize: size * 0.36 }}>{symbolBack}</span>
      </div>
    </div>
  );
};

export default Coin3D;