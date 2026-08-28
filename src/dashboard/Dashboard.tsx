import React from 'react';

const Dashboard: React.FC = () => (
  <div className="min-h-screen bg-[#F5F5F5] px-6 py-8">
    <div className="max-w-[88rem] mx-auto">
      <div className="flex items-center justify-between mb-16">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #f0c94d, #b8860b)' }}
          >
            <span className="text-white text-sm font-semibold">S</span>
          </div>
          <span className="text-xl font-medium tracking-tight text-black">SpendSmart</span>
        </div>
        <button
          onClick={() => {
            window.location.hash = '/';
          }}
          className="text-sm text-black/60 font-medium hover:text-black transition-colors duration-200 cursor-pointer"
        >
          ← Back to site
        </button>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2B2644] flex items-center justify-center mb-6">
          <span className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
        </div>
        <h1 className="text-3xl font-medium text-black" style={{ letterSpacing: '-0.03em' }}>
          Building your autonomous dashboard…
        </h1>
        <p className="text-black/60 mt-3">Questions first. Then your money, mastered.</p>
      </div>
    </div>
  </div>
);

export default Dashboard;