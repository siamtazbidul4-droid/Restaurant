import React, { useEffect, useState } from 'react';
import { contentApi, ChefDto } from '../../api/content.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const ChefPage: React.FC = () => {
  const [chef, setChef] = useState<ChefDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi
      .getChef()
      .then((res) => {
        if (res.success) setChef(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-40 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
      </div>
    );
  }

  if (!chef) return null;

  return (
    <div className="space-y-20 max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Culinary Leadership"
        title="Meet Chef Laurent Vaneau"
        subtitle="Two decades of dedication to the purity of classical French architecture and modern Nordic botanical cuisine."
        align="left"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Chef Portrait */}
        <div className="lg:col-span-5">
          <div className="aspect-[3/4] bg-[#16161C] border border-white/10 overflow-hidden shadow-2xl sticky top-28">
            <img
              src={chef.image || '/images/chef_portrait.jpg'}
              alt={chef.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Story & Philosophy */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans">
              {chef.position}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-white">{chef.name}</h2>
            <p className="text-xs text-[#E0CEB5] font-sans">{chef.experience}</p>
          </div>

          <blockquote className="font-serif text-xl text-[#F6F4EE] italic border-l-2 border-[#C5A880] pl-5 py-2 leading-relaxed">
            {chef.culinaryPhilosophy}
          </blockquote>

          <div className="space-y-4 text-sm text-[#D1CCC0] font-sans leading-relaxed">
            <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-[#C5A880]">
              {chef.biography}
            </p>
            <p>
              Under his guidance, the Aurelia brigade operates with the quiet discipline of a chamber orchestra. There are no raised voices in the open atelier—only the sizzle of binchotan embers, the precise tap of plating tweezers, and the shared commitment to culinary perfection.
            </p>
          </div>

          {/* Specialties */}
          {chef.specialties?.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#C5A880] font-semibold">
                Culinary Focus & Techniques
              </h4>
              <div className="flex flex-wrap gap-2 text-xs text-[#D1CCC0]">
                {chef.specialties.map((s, idx) => (
                  <span
                    key={idx}
                    className="bg-[#181820] border border-white/10 px-3 py-1.5 text-stone-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-white/10 flex gap-4">
            <Link
              to="/reservations"
              className="px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-colors"
            >
              Taste the Menu
            </Link>
            <Link
              to="/menu"
              className="px-8 py-3 text-xs font-sans uppercase tracking-[0.2em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
            >
              Explore Menu
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
