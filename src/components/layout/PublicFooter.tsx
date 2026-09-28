import React from 'react';
import { Link } from 'react-router-dom';

export const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#09090B] border-t border-white/10 text-[#D1CCC0] font-sans pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-14 border-b border-white/10">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <Link to="/" className="font-serif text-3xl tracking-[0.25em] text-white uppercase inline-block">
              Aurelia
            </Link>
            <p className="text-xs text-[#D1CCC0] leading-relaxed max-w-sm">
              Contemporary French technique in harmonic dialogue with Nordic minimalism. An intimate sanctuary dedicated to seasonal expression and architectural culinary art.
            </p>
            <div className="pt-2 text-xs text-[#E0CEB5] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Dinner Service: Tue–Sun from 17:30</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/our-story" className="hover:text-white transition-colors">
                  Our Culinary Story
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  Tasting & Seasonal Menu
                </Link>
              </li>
              <li>
                <Link to="/experience" className="hover:text-white transition-colors">
                  Dining Experiences
                </Link>
              </li>
              <li>
                <Link to="/chef" className="hover:text-white transition-colors">
                  Executive Chef Laurent Vaneau
                </Link>
              </li>
              <li>
                <Link to="/gallery" className="hover:text-white transition-colors">
                  Visual Gallery
                </Link>
              </li>
              <li>
                <Link to="/private-dining" className="hover:text-white transition-colors">
                  Private Wine Cellar & Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Hospitality & Hours */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
              Service Hours
            </h4>
            <div className="space-y-1.5 text-xs text-[#D1CCC0]">
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span>Tuesday – Thursday</span>
                <span className="font-mono text-white">17:30 – 23:00</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span>Friday – Saturday</span>
                <span className="font-mono text-white">17:00 – 00:00</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5">
                <span>Sunday</span>
                <span className="font-mono text-white">17:30 – 22:30</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-white/5 text-stone-500">
                <span>Monday</span>
                <span className="uppercase text-[11px]">Private Buyouts Only</span>
              </div>
            </div>
            <p className="text-[11px] text-stone-400 pt-2">
              Attire: Smart Elegant. Valet service available at entrance.
            </p>
          </div>

          {/* Col 4: Location & Concierge */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
              Concierge
            </h4>
            <div className="space-y-2 text-xs">
              <p className="text-white">442 Mayfair Boulevard, Upper East Side</p>
              <p>New York, NY 10021</p>
              <p className="pt-1">
                <a href="tel:+12125550198" className="text-[#C5A880] hover:text-[#E0CEB5] transition-colors">
                  +1 (212) 555-0198
                </a>
              </p>
              <p>
                <a href="mailto:concierge@aurelia-dining.com" className="hover:text-white transition-colors">
                  concierge@aurelia-dining.com
                </a>
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/reservations"
                className="inline-block px-4 py-2 text-[11px] uppercase tracking-[0.18em] border border-[#C5A880]/60 text-[#E0CEB5] hover:bg-[#C5A880] hover:text-[#0D0D0E] transition-all"
              >
                Book a Seating
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            <p>© {currentYear} Aurelia Haute Gastronomy. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-[11px]">
            <Link to="/legal/privacy-policy" className="hover:text-stone-300 transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/terms" className="hover:text-stone-300 transition-colors">
              Terms of Service
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/legal/cancellation-policy" className="hover:text-stone-300 transition-colors">
              Cancellation Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/admin" className="text-[#C5A880]/80 hover:text-[#C5A880] transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
