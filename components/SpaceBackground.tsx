
import React from 'react';

const SpaceBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-black z-0 pointer-events-none">
      {/* Stars */}
      <div className="absolute inset-0 opacity-40" 
           style={{
             backgroundImage: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 3px), radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 2px)',
             backgroundSize: '550px 550px, 350px 350px',
             backgroundPosition: '0 0, 40px 60px'
           }}>
      </div>
      
      {/* Sun / Central Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px]"></div>

      {/* Orbit Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/5 opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-white/5 opacity-20"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] rounded-full border border-white/5 opacity-10"></div>

      {/* Planets - Using CSS Animation */}
      <div className="absolute top-1/2 left-1/2 -ml-[300px] -mt-[300px] w-[600px] h-[600px] animate-[spin_20s_linear_infinite]">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 shadow-[0_0_20px_rgba(99,102,241,0.8)]"></div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -ml-[450px] -mt-[450px] w-[900px] h-[900px] animate-[spin_35s_linear_infinite]" style={{ animationDirection: 'reverse' }}>
         <div className="absolute top-1/4 left-[10%] w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_0_30px_rgba(249,115,22,0.6)]"></div>
      </div>

       <div className="absolute top-1/2 left-1/2 -ml-[600px] -mt-[600px] w-[1200px] h-[1200px] animate-[spin_60s_linear_infinite]">
         <div className="absolute bottom-0 right-1/2 w-6 h-6 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
      </div>
    </div>
  );
};

export default SpaceBackground;
