import React, { useEffect, useState, useMemo } from 'react';
import { menuApi, MenuCategoryDto, MenuItemDto } from '../../api/menu.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { DishCard } from '../../components/common/DishCard.js';
import { Search, Loader2 } from 'lucide-react';

export const MenuPage: React.FC = () => {
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDietary, setSelectedDietary] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      menuApi.getCategories().then((res) => res.success && setCategories(res.data)),
      menuApi.getItems().then((res) => res.success && setItems(res.data)),
    ]).finally(() => setLoading(false));
  }, []);

  // Filter items in memory or server aware
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all') {
        const catId = typeof item.category === 'object' ? item.category._id : item.category;
        const catSlug = typeof item.category === 'object' ? item.category.slug : '';
        if (catId !== selectedCategory && catSlug !== selectedCategory) {
          return false;
        }
      }

      // Dietary filter
      if (selectedDietary !== 'all') {
        const hasTag = item.dietaryTags?.some((t) => t.toLowerCase() === selectedDietary.toLowerCase());
        if (!hasTag) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesShort = item.shortDescription?.toLowerCase().includes(q);
        const matchesIngredients = item.ingredients?.some((i) => i.toLowerCase().includes(q));
        if (!matchesName && !matchesDesc && !matchesShort && !matchesIngredients) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, selectedDietary, searchQuery]);

  const dietaryOptions = ['All', 'Chef Recommended', 'Gluten-free', 'Vegetarian', 'Vegan'];

  return (
    <div className="space-y-16 pb-24 pt-28 max-w-7xl mx-auto px-5 sm:px-8">
      {/* Page Header */}
      <SectionHeading
        kicker="Culinary Repertoire"
        title="The Seasonal Degustation & À La Carte"
        subtitle="Presented in harmonious sequences reflecting the micro-seasons of land and sea. Each creation is crafted with obsessive devotion to purity."
      />

      {/* Controls: Search, Category Tabs, Dietary Filter */}
      <div className="space-y-6 pt-4">
        {/* Search Bar & Dietary Filter Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#141419] p-4 border border-white/10">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1A1A22] border border-white/10 focus:border-[#C5A880] text-xs text-white pl-9 pr-4 py-2.5 outline-none transition-colors placeholder:text-stone-500"
            />
          </div>

          {/* Dietary Filter Segmented Control */}
          <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto w-full md:w-auto">
            <span className="text-[11px] uppercase tracking-wider text-stone-400 mr-1 hidden sm:inline">
              Dietary:
            </span>
            {dietaryOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedDietary(opt.toLowerCase() === 'all' ? 'all' : opt)}
                className={`px-3 py-1.5 text-xs font-sans tracking-wider transition-colors whitespace-nowrap ${
                  (opt.toLowerCase() === 'all' && selectedDietary === 'all') ||
                  selectedDietary.toLowerCase() === opt.toLowerCase()
                    ? 'bg-[#C5A880] text-[#0D0D0E] font-medium'
                    : 'text-stone-300 hover:text-white bg-[#1A1A22] border border-white/5'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs (Segmented Buttons) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 text-xs font-sans uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            All Courses
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setSelectedCategory(cat._id)}
              className={`px-5 py-2.5 text-xs font-sans uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                selectedCategory === cat._id
                  ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-stone-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
          <p className="text-xs uppercase tracking-widest">Consulting the Kitchen Atelier...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-[#141419]/50 border border-white/5">
          <p className="font-serif text-2xl text-white">No dishes matched your selection.</p>
          <p className="text-xs text-stone-400">
            Try adjusting your search query or selecting another dietary tag.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedDietary('all');
              setSearchQuery('');
            }}
            className="mt-2 px-4 py-2 text-xs font-sans uppercase tracking-widest text-[#C5A880] border border-[#C5A880]/40 hover:bg-[#C5A880]/10 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <DishCard key={item._id} item={item} />
          ))}
        </div>
      )}

      {/* Dietary Note at Bottom */}
      <div className="p-8 bg-[#121216] border border-white/10 text-center space-y-2 text-xs text-[#D1CCC0] max-w-3xl mx-auto">
        <h4 className="font-serif text-lg text-white">Dietary & Allergen Accommodations</h4>
        <p className="leading-relaxed">
          We honor guest dietary preferences and allergies with dedicated culinary adaptations. Kindly specify any allergies during reservation or inform your sommelier upon arrival.
        </p>
      </div>
    </div>
  );
};
