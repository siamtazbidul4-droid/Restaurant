import React, { useState } from 'react';
import { MenuItemDto } from '../../api/menu.api.js';
import { Utensils } from 'lucide-react';
import { Modal } from '../ui/Modal.js';

interface DishCardProps {
  item: MenuItemDto;
}

export const DishCard: React.FC<DishCardProps> = ({ item }) => {
  const [imgError, setImgError] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isAvailable = item.availabilityStatus === 'Available';
  const categoryName = typeof item.category === 'object' ? item.category.name : '';

  return (
    <>
      <article
        onClick={() => setIsDetailOpen(true)}
        className="group cursor-pointer flex flex-col bg-[#141419] border border-white/10 hover:border-[#C5A880]/50 transition-all duration-300 overflow-hidden text-left"
      >
        {/* Image Container with Fallback */}
        <div className="relative aspect-[4/3] w-full bg-[#1A1A22] overflow-hidden">
          {!imgError && item.image ? (
            <img
              src={item.image}
              alt={item.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#1C1C24] to-[#121217] text-stone-500">
              <Utensils className="w-8 h-8 text-[#C5A880]/60 mb-2" />
              <span className="text-xs tracking-wider uppercase text-stone-400 font-serif">{categoryName || 'Culinary Art'}</span>
            </div>
          )}

          {/* Status overlay if sold out or unavailable */}
          {!isAvailable && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <span className="text-xs uppercase tracking-widest text-[#E0CEB5] border border-[#C5A880]/60 px-3 py-1 bg-black/60">
                {item.availabilityStatus}
              </span>
            </div>
          )}

          {/* Chef's Choice subtle watermark indicator */}
          {item.isChefChoice && isAvailable && (
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm border border-[#C5A880]/40 px-2.5 py-0.5 text-[10px] uppercase tracking-widest text-[#C5A880]">
              Chef's Selection
            </div>
          )}
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
          <div>
            {/* Zero-Pill Metadata Line: Quiet unboxed text with · separators */}
            <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#C5A880] mb-1 font-sans">
              <span>{categoryName}</span>
              {item.isSeasonal && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-[#E0CEB5]">Seasonal</span>
                </>
              )}
            </div>

            <h3 className="font-serif text-lg sm:text-xl text-white tracking-wide group-hover:text-[#C5A880] transition-colors leading-snug">
              {item.name}
            </h3>

            <p className="text-xs text-[#D1CCC0] line-clamp-2 mt-1.5 leading-relaxed font-sans">
              {item.shortDescription || item.description}
            </p>
          </div>

          {/* Price & Dietary Line */}
          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
            {/* Dietary Tags as quiet inline text */}
            <div className="text-[11px] text-stone-400 truncate max-w-[65%]">
              {item.dietaryTags?.length > 0 ? (
                item.dietaryTags.slice(0, 2).join(' · ')
              ) : (
                <span className="italic">Haute Cuisine</span>
              )}
            </div>

            <div className="font-mono text-base font-semibold text-white tracking-tight tabular-nums">
              ${item.price}
            </div>
          </div>
        </div>
      </article>

      {/* Dish Detail Dialog */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={item.name}
        subtitle={`${categoryName} · $${item.price} USD`}
        maxWidth="lg"
      >
        <div className="space-y-5">
          {/* Main Image */}
          {item.image && (
            <div className="relative aspect-[16/9] w-full bg-[#1A1A22] overflow-hidden border border-white/10">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div>
            <h4 className="text-xs uppercase tracking-widest text-[#C5A880] mb-1 font-sans">
              Culinary Composition
            </h4>
            <p className="text-sm text-[#F6F4EE] leading-relaxed font-sans">{item.description}</p>
          </div>

          {/* Key Ingredients */}
          {item.ingredients?.length > 0 && (
            <div>
              <h4 className="text-xs uppercase tracking-widest text-[#C5A880] mb-2 font-sans">
                Signature Ingredients & Terroir
              </h4>
              <div className="text-xs text-[#D1CCC0] leading-relaxed">
                {item.ingredients.join(' · ')}
              </div>
            </div>
          )}

          {/* Allergens & Dietary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
            <div>
              <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">
                Dietary Indicators
              </span>
              <p className="text-stone-200">
                {item.dietaryTags?.length > 0 ? item.dietaryTags.join(', ') : 'Standard Gastronomy'}
              </p>
            </div>
            <div>
              <span className="text-stone-400 block mb-1 uppercase tracking-wider text-[10px]">
                Contains Allergens
              </span>
              <p className="text-stone-200">
                {item.allergens?.length > 0 ? item.allergens.join(', ') : 'None identified'}
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-white/10">
            <span className="text-xs text-stone-400">
              Status: <span className="text-white font-medium">{item.availabilityStatus}</span>
            </span>
            <button
              onClick={() => setIsDetailOpen(false)}
              className="px-4 py-2 text-xs font-sans uppercase tracking-widest bg-[#1F1F28] hover:bg-[#2A2A38] text-white border border-white/10 transition-colors"
            >
              Close Details
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
