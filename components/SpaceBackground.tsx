import React from 'react';

const SpaceBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#020617] z-0 pointer-events-none">
      {/* Stars */}
      <div className="absolute inset-0 opacity-40" 
           style={{
             backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px)',
             backgroundSize: '550px 550px, 350px 350px',
             backgroundPosition: '0 0, 40px 60px'
           }}>
      </div>
      
      {/* Central Glow (Green/Teal for Growth Theme) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[60px]"></div>

      {/* Orbit Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-emerald-500/10 opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-teal-500/10 opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-cyan-500/5 opacity-10"></div>

      {/* Planets - Matching Logo Colors */}
      
      {/* Planet 1 - Emerald */}
      <div className="absolute top-1/2 left-1/2 -ml-[300px] -mt-[300px] w-[600px] h-[600px] animate-[spin_20s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.8)]"></div>
      </div>
      
      {/* Planet 2 - Cyan/Blue */}
      <div className="absolute top-1/2 left-1/2 -ml-[450px] -mt-[450px] w-[900px] h-[900px] animate-[spin_35s_linear_infinite]" style={{ animationDirection: 'reverse' }}>
         <div className="absolute top-1/4 left-[10%] w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.6)]"></div>
      </div>

      {/* Planet 3 - White/Star */}
       <div className="absolute top-1/2 left-1/2 -ml-[600px] -mt-[600px] w-[1200px] h-[1200px] animate-[spin_60s_linear_infinite]">
         <div className="absolute bottom-0 right-1/2 w-4 h-4 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>
    </div>
  );
};

export default SpaceBackground;