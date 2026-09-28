import React, { useEffect, useState } from 'react';
import { contentApi, GalleryImageDto } from '../../api/content.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { Modal } from '../../components/ui/Modal.js';
import { Loader2 } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImageDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeImage, setActiveImage] = useState<GalleryImageDto | null>(null);
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Atmosphere', 'Food', 'Chef', 'Private Dining'];

  useEffect(() => {
    contentApi
      .getGallery(selectedCategory === 'All' ? undefined : selectedCategory)
      .then((res) => {
        if (res.success) setImages(res.data);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  return (
    <div className="space-y-14 max-w-7xl mx-auto px-5 sm:px-8 pt-28 pb-24 text-left">
      <SectionHeading
        kicker="Visual Anthology"
        title="Atmosphere & Culinary Moments"
        subtitle="An intimate photographic record of our dining rooms, culinary preparations, and rare cellar vintages."
      />

      {/* Category Tabs */}
      <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 text-xs font-sans uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
        </div>
      ) : images.length === 0 ? (
        <p className="text-center py-16 text-xs text-stone-400">No images found in this collection.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => (
            <div
              key={img._id}
              onClick={() => setActiveImage(img)}
              className="group cursor-pointer relative aspect-[4/3] bg-[#16161C] border border-white/10 overflow-hidden"
            >
              <img
                src={img.imageUrl}
                alt={img.altText || img.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A880]">
                  {img.category}
                </span>
                <h4 className="font-serif text-lg text-white mt-0.5">{img.title}</h4>
                {img.caption && <p className="text-xs text-stone-300 mt-1 line-clamp-2">{img.caption}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {activeImage && (
        <Modal
          isOpen={Boolean(activeImage)}
          onClose={() => setActiveImage(null)}
          title={activeImage.title}
          subtitle={activeImage.category}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-[16/10] w-full bg-[#181820] overflow-hidden border border-white/10">
              <img
                src={activeImage.imageUrl}
                alt={activeImage.altText || activeImage.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {activeImage.caption && (
              <p className="text-xs text-[#D1CCC0] leading-relaxed italic">
                {activeImage.caption}
              </p>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
