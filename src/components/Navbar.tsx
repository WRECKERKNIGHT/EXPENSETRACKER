import React from 'react';
import LogoIcon from './LogoIcon';

const NAV_LINKS = ['Network', 'Ecosystem', 'Rewards', 'Help', 'News'];

const Navbar: React.FC = () => (
  <nav className="absolute top-0 left-0 right-0 z-20 px-6 py-5">
    <div className="flex items-center justify-between max-w-[88rem] mx-auto">
      <div className="flex items-center gap-2.5">
        <LogoIcon className="w-7 h-7 text-black" />
        <span className="text-2xl font-medium tracking-tight text-black">Halo</span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {NAV_LINKS.map((link) => (
          <a
            key={link}
            href={`#${link.toLowerCase()}`}
            className="text-base text-gray-700 hover:text-black font-medium transition-colors duration-200"
          >
            {link}
          </a>
        ))}
      </div>

      <button className="bg-black text-white text-base font-medium px-7 py-2.5 rounded-full hover:bg-gray-800 transition-colors duration-200 cursor-pointer">
        Open Wallet
      </button>
    </div>
  </nav>
);

export default Navbar;
