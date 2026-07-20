import React, { useEffect, useRef } from 'react';

const SpaceBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number; hue: number }[] = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Create star particles
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        hue: Math.random() > 0.7 ? 200 + Math.random() * 60 : 0, // some colored stars
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        // Twinkle
        const twinkle = 0.5 + Math.sin(Date.now() * 0.002 + p.x * 0.01) * 0.5;
        
        if (p.hue > 0) {
          ctx.fillStyle = `hsla(${p.hue}, 70%, 80%, ${p.opacity * twinkle})`;
          ctx.shadowColor = `hsla(${p.hue}, 70%, 80%, 0.5)`;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * twinkle})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
          ctx.shadowBlur = 4;
        }
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
      {/* Canvas star field */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ opacity: 0.7 }} />

      {/* Nebula layers */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(168, 85, 247, 0.06) 0%, transparent 50%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 55%)' }} />

      {/* Aurora borealis bands */}
      <div className="absolute top-0 left-0 w-full h-1/2 overflow-hidden opacity-30">
        <div className="absolute w-[200%] h-[300px] -top-20 -left-1/4" style={{
          background: 'linear-gradient(180deg, transparent, rgba(16,185,129,0.08), rgba(6,182,212,0.06), transparent)',
          filter: 'blur(40px)',
          animation: 'aurora 12s ease-in-out infinite',
        }} />
        <div className="absolute w-[150%] h-[200px] top-20 left-0" style={{
          background: 'linear-gradient(180deg, transparent, rgba(139,92,246,0.06), rgba(99,102,241,0.04), transparent)',
          filter: 'blur(50px)',
          animation: 'aurora 18s ease-in-out infinite reverse',
        }} />
      </div>

      {/* Central radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full" style={{
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 40%, transparent 70%)',
        filter: 'blur(60px)',
        animation: 'aurora 20s ease-in-out infinite',
      }} />

      {/* Orbit rings with subtle glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-indigo-500/[0.06]" style={{ transform: 'translate(-50%, -50%) rotateX(75deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]" style={{ animation: 'orbit 20s linear infinite' }} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-purple-500/[0.04]" style={{ transform: 'translate(-50%, -50%) rotateX(70deg) rotateZ(30deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.7)]" style={{ animation: 'orbit 35s linear infinite reverse' }} />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-cyan-500/[0.03]" style={{ transform: 'translate(-50%, -50%) rotateX(68deg) rotateZ(-15deg)' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]" style={{ animation: 'orbit 50s linear infinite' }} />
      </div>
    </div>
  );
};

export default SpaceBackground;
