import React from 'react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center text-center px-5 sm:px-8 pt-20 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[#C5A880]">
          404 · Terroir Not Found
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white tracking-wide">
          An Unmapped Course
        </h1>
        <p className="text-xs sm:text-sm text-[#D1CCC0] leading-relaxed">
          The vintage or page you are seeking does not reside in our current cellar or dining archives.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-medium hover:bg-[#E0CEB5] transition-colors"
          >
            Return to Sanctuary
          </Link>
          <Link
            to="/menu"
            className="w-full sm:w-auto px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
          >
            Explore Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
