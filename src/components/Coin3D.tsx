import React from 'react';

interface Coin3DProps {
  size?: number;
  symbol?: string;
  symbolBack?: string;
  label?: string;
}

const Coin3D: React.FC<Coin3DProps> = ({ size = 64, symbol = '₹', symbolBack = 'SM', label }) => {
  const disc: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background: [
      'radial-gradient(120% 88% at 28% 20%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.14) 38%, rgba(255,255,255,0) 54%)',
      'radial-gradient(120% 96% at 78% 90%, rgba(86,76,122,0.55) 0%, rgba(86,76,122,0) 50%)',
      'conic-gradient(from 205deg at 50% 50%, #F2F0F7 0%, #D5CFE6 11%, #B7ABCE 23%, #9A8DB6 34%, #8B7EA8 44%, #D0C9E1 55%, #ACA0C4 63%, #8B7EA8 74%, #DDD8EC 85%, #F2F0F7 96%)',
      'linear-gradient(155deg, #E8E4F1 0%, #9B8FB6 100%)',
    ].join(', '),
    boxShadow: [
      `inset 0 0 0 ${Math.max(2, size * 0.05)}px rgba(255,255,255,0.24)`,
      `inset 0 0 0 ${Math.max(3, size * 0.065)}px rgba(74,64,104,0.3)`,
      `inset 0 0 0 ${Math.max(5, size * 0.085)}px rgba(255,255,255,0.09)`,
      `inset 0 ${size * 0.04}px ${size * 0.11}px rgba(255,255,255,0.3)`,
      `inset 0 -${size * 0.05}px ${size * 0.13}px rgba(66,56,94,0.45)`,
      `inset 0 0 ${size * 0.05}px rgba(42,35,62,0.16)`,
    ].join(', '),
  };

  const edgeBevel: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'radial-gradient(closest-side, rgba(0,0,0,0) 88%, rgba(58,50,86,0.2) 95.5%, rgba(42,36,64,0.4) 99%)',
  };

  const grooves: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'repeating-conic-gradient(rgba(68,58,98,0.32) 0deg 4deg, rgba(255,255,255,0.36) 4deg 8deg)',
    opacity: 0.55,
    mask: 'radial-gradient(closest-side, transparent 58%, #000 70%)',
    WebkitMask: 'radial-gradient(closest-side, transparent 58%, #000 70%)',
  };

  const satin: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background: [
      'linear-gradient(112deg, transparent 32%, rgba(255,255,255,0.2) 40%, transparent 47%)',
      'linear-gradient(292deg, transparent 55%, rgba(255,255,255,0.14) 63%, transparent 70%)',
    ].join(', '),
    mixBlendMode: 'soft-light',
  };

  const ornamentRing: React.CSSProperties = {
    position: 'absolute',
    inset: '13.5%',
    borderRadius: '9999px',
    border: `${Math.max(1, size * 0.016)}px solid rgba(255,255,255,0.42)`,
    boxShadow: [
      `inset 0 0 0 ${Math.max(1, size * 0.012)}px rgba(84,73,116,0.28)`,
      `inset 0 1px 0 rgba(255,255,255,0.5)`,
    ].join(', '),
  };

  const medallion: React.CSSProperties = {
    position: 'absolute',
    inset: '27%',
    borderRadius: '9999px',
    background:
      'radial-gradient(circle at 34% 28%, #F5F3FA 0%, #C9BDDD 46%, #9488B2 78%, #83769F 100%)',
    boxShadow: [
      `inset 0 0 0 ${Math.max(1, size * 0.013)}px rgba(255,255,255,0.55)`,
      `inset 0 1px ${Math.max(2, size * 0.03)}px rgba(58,50,86,0.28)`,
      `inset 0 -${Math.max(2, size * 0.025)}px ${Math.max(4, size * 0.06)}px rgba(58,50,86,0.18)`,
    ].join(', '),
  };

  const spec: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 40%)',
    mixBlendMode: 'screen',
  };

  const emblem: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: size * 0.02,
    color: '#665A8C',
    fontWeight: 700,
    textShadow: '0 1px 0 rgba(255,255,255,0.6), 0 -1px 2px rgba(58,50,86,0.55), 0 2px 4px rgba(58,50,86,0.3)',
  };

  const rimShade: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background:
      'radial-gradient(circle closest-side, transparent 30%, rgba(52,44,78,0.16) 100%)',
    mixBlendMode: 'multiply',
    opacity: 0.5,
  };

  return (
    <div
      style={{
        width: size,
        height: size,
        position: 'relative',
        transformStyle: 'preserve-3d',
        filter: [
          'drop-shadow(0 16px 26px rgba(48,42,72,0.32))',
          'drop-shadow(0 4px 10px rgba(30,26,46,0.28))',
          'drop-shadow(0 0 22px rgba(168,156,208,0.3))',
        ].join(' '),
      }}
    >
      <div style={{ ...disc }}>
        <div style={edgeBevel} />
        <div style={grooves} />
        <div style={satin} />
        <div style={ornamentRing} />
        <div style={medallion} />
        <div style={rimShade} />
        <div style={spec} />
        <div style={emblem}>
          <span style={{ fontSize: size * 0.4, lineHeight: 1 }}>{symbol}</span>
          {label ? (
            <span style={{ fontSize: size * 0.115, letterSpacing: '0.28em', marginLeft: '0.28em' }}>
              {label}
            </span>
          ) : null}
        </div>
      </div>
      <div style={{ ...disc, transform: 'rotateY(180deg)' }}>
        <div style={edgeBevel} />
        <div style={grooves} />
        <div style={satin} />
        <div style={ornamentRing} />
        <div style={medallion} />
        <div style={rimShade} />
        <div style={spec} />
        <div style={emblem}>
          <span style={{ fontSize: size * 0.34, letterSpacing: size * 0.015 }}>{symbolBack}</span>
        </div>
      </div>
    </div>
  );
};

export default Coin3D;