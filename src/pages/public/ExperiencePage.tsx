import React, { useEffect, useState } from 'react';
import { contentApi, ExperienceDto } from '../../api/content.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';

export const ExperiencePage: React.FC = () => {
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi
      .getExperiences()
      .then((res) => {
        if (res.success) setExperiences(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20 max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Curated Rituals"
        title="Gastronomic Experiences"
        subtitle="Every dining format at Aurelia is choreographed to foster sensory discovery, conversation, and timeless memory."
      />

      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : (
        <div className="space-y-16">
          {experiences.map((exp, idx) => (
            <div
              key={exp._id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-6 sm:p-10 bg-[#141419] border border-white/10 ${
                idx % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={`lg:col-span-6 ${idx % 2 === 1 ? 'lg:order-2' : 'lg:order-1'}`}>
                <div className="aspect-[16/10] w-full bg-[#181820] overflow-hidden border border-white/5">
                  <img
                    src={exp.image || '/images/hero_dining.jpg'}
                    alt={exp.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div className={`lg:col-span-6 space-y-4 ${idx % 2 === 1 ? 'lg:order-1' : 'lg:order-2'}`}>
                <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
                  {exp.category}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white tracking-wide">
                  {exp.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#D1CCC0] font-sans leading-relaxed">
                  {exp.description}
                </p>

                <div className="pt-4 flex items-center gap-4">
                  <Link
                    to={exp.ctaUrl || '/reservations'}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-colors"
                  >
                    <span>{exp.ctaLabel || 'Reserve Experience'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sommelier & Private Buyout Callout */}
      <div className="p-8 sm:p-12 bg-[#121217] border border-[#C5A880]/30 text-center space-y-4">
        <h3 className="font-serif text-2xl sm:text-3xl text-white">Full Dining Room Buyouts</h3>
        <p className="text-xs sm:text-sm text-[#D1CCC0] max-w-xl mx-auto leading-relaxed">
          For milestone galas, private brand launches, and executive retreats, Aurelia accommodates buyouts for up to 65 seated patrons with tailored culinary direction from Chef Laurent Vaneau.
        </p>
        <div className="pt-2">
          <Link
            to="/private-dining"
            className="inline-block px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
          >
            Inquire for Full Buyout
          </Link>
        </div>
      </div>
    </div>
  );
};
