import React from 'react';
import { BackersMarquee } from './Marquee';

const BackedBySection: React.FC = () => (
  <section className="bg-[#F5F5F5] px-6">
    <div className="max-w-[88rem] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 items-center py-16">
      <div className="md:col-span-1">
        <p className="text-black/70 text-base leading-relaxed">
          Funded by premier partners<br />
          and forward-thinking leaders.
        </p>
      </div>
      <div className="md:col-span-3">
        <BackersMarquee />
      </div>
    </div>
  </section>
);

export default BackedBySection;
