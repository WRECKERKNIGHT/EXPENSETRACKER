import React from 'react';

const Money3D: React.FC = () => {

  return (
    <div className="relative w-full h-[420px] md:h-[480px] perspective-1000" style={{ perspective: '1200px' }} aria-hidden="true">
      {/* Central glowing orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full morph-blob bg-gradient-to-br from-indigo-500/30 via-purple-500/20 to-cyan-500/30 blur-xl glow-ring-pulse" />
      
      {/* Orbit rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-indigo-500/10" style={{ transform: 'translate(-50%, -50%) rotateX(70deg)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-52 h-52 rounded-full border border-purple-500/10" style={{ transform: 'translate(-50%, -50%) rotateX(75deg) rotateZ(30deg)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-cyan-500/5" style={{ transform: 'translate(-50%, -50%) rotateX(65deg) rotateZ(-20deg)' }} />

      {/* Floating Coin 1 - Large Gold */}
      <div className="money-item stagger-in absolute" style={{ top: '15%', left: '20%' }}>
        <div className="float-3d" style={{ animationDelay: '0s' }}>
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] border-2 border-amber-300/50" style={{ transformStyle: 'preserve-3d' }}>
            <span className="text-2xl font-black text-amber-900/80" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.4)' }}>₹</span>
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-t from-amber-600/20 to-transparent money-spin-3d" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      {/* Floating Coin 2 - Silver */}
      <div className="money-item stagger-in absolute" style={{ top: '60%', right: '15%' }}>
        <div className="float-3d" style={{ animationDelay: '0.5s', animationDuration: '7s' }}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 via-gray-200 to-slate-400 flex items-center justify-center shadow-[0_0_25px_rgba(148,163,184,0.3),inset_0_2px_4px_rgba(255,255,255,0.5),inset_0_-2px_4px_rgba(0,0,0,0.15)] border border-slate-200/60">
            <span className="text-lg font-black text-slate-700/70">$</span>
          </div>
        </div>
      </div>

      {/* Floating Coin 3 - Rose Gold */}
      <div className="money-item stagger-in absolute" style={{ top: '25%', right: '25%' }}>
        <div className="float-3d" style={{ animationDelay: '1s', animationDuration: '9s' }}>
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-300 via-pink-400 to-rose-500 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-2px_4px_rgba(0,0,0,0.15)] border border-rose-200/50">
            <span className="text-sm font-black text-rose-900/60">€</span>
          </div>
        </div>
      </div>

      {/* Floating Bill - Stylized */}
      <div className="money-item stagger-in absolute" style={{ top: '50%', left: '10%' }}>
        <div className="float-3d" style={{ animationDelay: '0.3s', animationDuration: '8s' }}>
          <div className="w-24 h-14 rounded-xl bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.3)] border border-emerald-300/40" style={{ transform: 'rotateZ(-8deg) rotateY(15deg)', transformStyle: 'preserve-3d' }}>
            <div className="flex items-center gap-1">
              <span className="text-lg font-black text-emerald-900/60">₹</span>
              <span className="text-xs font-bold text-emerald-900/40">500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Coin 4 - Copper */}
      <div className="money-item stagger-in absolute" style={{ bottom: '20%', left: '35%' }}>
        <div className="float-3d" style={{ animationDelay: '1.5s', animationDuration: '6s' }}>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3),inset_0_2px_4px_rgba(255,255,255,0.3),inset_0_-2px_4px_rgba(0,0,0,0.2)] border border-orange-300/40">
            <span className="text-sm font-black text-orange-900/60">¢</span>
          </div>
        </div>
      </div>

      {/* Floating Coin 5 - Platinum */}
      <div className="money-item stagger-in absolute" style={{ top: '10%', left: '55%' }}>
        <div className="float-3d" style={{ animationDelay: '0.8s', animationDuration: '10s' }}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-300 via-purple-400 to-violet-500 flex items-center justify-center shadow-[0_0_18px_rgba(139,92,246,0.3),inset_0_1px_3px_rgba(255,255,255,0.4)] border border-violet-200/40">
            <span className="text-xs font-black text-violet-900/60">¥</span>
          </div>
        </div>
      </div>

      {/* Floating Bill 2 - Dollar style */}
      <div className="money-item stagger-in absolute" style={{ bottom: '15%', right: '20%' }}>
        <div className="float-3d" style={{ animationDelay: '1.2s', animationDuration: '7.5s' }}>
          <div className="w-20 h-12 rounded-lg bg-gradient-to-br from-cyan-400 via-sky-500 to-cyan-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-300/40" style={{ transform: 'rotateZ(5deg) rotateY(-10deg)', transformStyle: 'preserve-3d' }}>
            <div className="flex items-center gap-1">
              <span className="text-sm font-black text-cyan-900/60">$</span>
              <span className="text-[10px] font-bold text-cyan-900/40">100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Central 3D rotating coin stack */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ transformStyle: 'preserve-3d', animation: 'money-spin 8s linear infinite' }}>
        <div className="relative" style={{ transformStyle: 'preserve-3d' }}>
          <div className="w-28 h-28 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5),0_0_100px_rgba(245,158,11,0.2)] border-2 border-amber-300/60" style={{ transform: 'translateZ(12px)', transformStyle: 'preserve-3d' }}>
            <span className="text-4xl font-black text-amber-900/70" style={{ textShadow: '0 2px 4px rgba(255,255,255,0.3)' }}>₹</span>
          </div>
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br from-amber-600 to-yellow-700" style={{ transform: 'translateZ(-4px)' }} />
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br from-amber-700 to-yellow-800" style={{ transform: 'translateZ(-10px)' }} />
          <div className="absolute inset-0 w-28 h-28 rounded-full bg-gradient-to-br from-amber-800 to-yellow-900" style={{ transform: 'translateZ(-16px)' }} />
        </div>
      </div>

      {/* Sparkle particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-white/60"
          style={{
            top: `${15 + Math.sin(i * 1.2) * 35 + 35}%`,
            left: `${15 + Math.cos(i * 0.9) * 35 + 35}%`,
            animation: `particle-float ${3 + i * 0.5}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
            boxShadow: '0 0 6px rgba(255,255,255,0.5)',
          }}
        />
      ))}

      {/* Bottom glow reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-gradient-to-t from-amber-500/10 to-transparent rounded-full blur-2xl" />
    </div>
  );
};

export default Money3D;
