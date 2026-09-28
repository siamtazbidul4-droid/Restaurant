import React from 'react';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Link } from 'react-router-dom';

export const StoryPage: React.FC = () => {
  return (
    <div className="space-y-24 max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Heritage & Lineage"
        title="The Philosophy of Aurelia"
        subtitle="An intimate exploration of space, culinary architecture, and our reverence for the terroir."
        align="left"
      />

      {/* Chapter 1: The Genesis */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 space-y-4 text-sm sm:text-base text-[#D1CCC0] font-sans leading-relaxed">
          <span className="font-mono text-xs text-[#C5A880] uppercase tracking-widest block">
            Chapter I · The Genesis
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-white">
            Architecture Born of Shadow and Light
          </h3>
          <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-[#C5A880]">
            Founded on Manhattan’s Upper East Side, Aurelia was envisioned not as a conventional dining room, but as a sanctuary from the urban cadence. Smoked French oak paneling, brushed patinated bronze, and hand-troweled limestone absorb acoustics, creating a serene envelope where gastronomy can be experienced with undivided focus.
          </p>
          <p>
            Every table is deliberately spaced with generous breathing room, ensuring conversations remain confidential and intimate throughout the evening.
          </p>
        </div>
        <div className="md:col-span-5 aspect-[4/5] bg-[#16161C] border border-white/10 overflow-hidden shadow-2xl">
          <img
            src="/images/hero_dining.jpg"
            alt="Interior Architecture of Aurelia"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Chapter 2: The Terroir */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-5 order-2 md:order-1 aspect-[4/5] bg-[#16161C] border border-white/10 overflow-hidden shadow-2xl">
          <img
            src="/images/dish_wagyu.jpg"
            alt="Terroir Plating"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="md:col-span-7 order-1 md:order-2 space-y-4 text-sm sm:text-base text-[#D1CCC0] font-sans leading-relaxed">
          <span className="font-mono text-xs text-[#C5A880] uppercase tracking-widest block">
            Chapter II · The Micro-Seasons
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl text-white">
            Reverence for Direct-Source Agriculture
          </h3>
          <p>
            We do not design menus around seasons in the broad quarterly sense; rather, we follow the ephemeral micro-harvests of small family producers. When wild morels emerge after spring rains in the Pacific Northwest or the first Périgord black winter truffles are unearthed in mid-December, our tasting flights immediately adapt.
          </p>
          <p>
            Our seafood arrives daily via direct refrigerated air-courier from Hokkaido auctions and small-boat sustainable divers in the North Atlantic.
          </p>
        </div>
      </section>

      {/* Chapter 3: The Cellar */}
      <section className="p-8 sm:p-12 bg-[#121217] border border-white/10 space-y-6 text-center">
        <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880]">
          Chapter III · The Living Archive
        </span>
        <h3 className="font-serif text-3xl sm:text-4xl text-white max-w-2xl mx-auto">
          A Subterranean Library of 2,500 Grand Cru Bottles
        </h3>
        <p className="text-xs sm:text-sm text-[#D1CCC0] max-w-2xl mx-auto leading-relaxed">
          Curated by Head Sommelier, our subterranean cellar champions iconic domines alongside visionary biodynamic grower-producers. Each wine is cellared under strict humidity and temperature surveillance, uncorked only at the zenith of its expressive maturity.
        </p>
        <div className="pt-4 flex justify-center gap-4">
          <Link
            to="/reservations"
            className="px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-colors"
          >
            Reserve Your Seating
          </Link>
          <Link
            to="/experience"
            className="px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
          >
            Explore Experiences
          </Link>
        </div>
      </section>
    </div>
  );
};
