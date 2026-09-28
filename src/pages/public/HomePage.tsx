import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { menuApi, MenuItemDto } from '../../api/menu.api.js';
import { contentApi, ChefDto, ExperienceDto, TestimonialDto, GalleryImageDto } from '../../api/content.api.js';
import { settingsApi, RestaurantSettingsDto } from '../../api/settings.api.js';
import { SectionHeading } from '../../components/common/SectionHeading.js';
import { DishCard } from '../../components/common/DishCard.js';
import { Clock, MapPin, Phone, ArrowRight, Star, ShieldCheck, Wine, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [featuredDishes, setFeaturedDishes] = useState<MenuItemDto[]>([]);
  const [chef, setChef] = useState<ChefDto | null>(null);
  const [experiences, setExperiences] = useState<ExperienceDto[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialDto[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImageDto[]>([]);
  const [settings, setSettings] = useState<RestaurantSettingsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      menuApi.getItems({ featured: true }).then((r) => r.success && setFeaturedDishes(r.data.slice(0, 4))),
      contentApi.getChef().then((r) => r.success && setChef(r.data)),
      contentApi.getExperiences().then((r) => r.success && setExperiences(r.data.slice(0, 3))),
      contentApi.getTestimonials().then((r) => r.success && setTestimonials(r.data.slice(0, 3))),
      contentApi.getGallery('All').then((r) => r.success && setGalleryImages(r.data.slice(0, 4))),
      settingsApi.getSettings().then((r) => r.success && setSettings(r.data)),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center text-center overflow-hidden px-5 sm:px-8">
        {/* Background Image with Scrim */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero_dining.jpg"
            alt="Aurelia Grand Dining Room"
            className="w-full h-full object-cover object-center scale-100 animate-in fade-in zoom-in-105 duration-1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0E] via-[#0D0D0E]/60 to-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto pt-24 space-y-6">
          <p className="text-xs sm:text-sm uppercase tracking-[0.3em] text-[#C5A880] font-sans font-medium">
            Haute Cuisine · Upper East Side · New York
          </p>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal text-white tracking-wide leading-tight [text-wrap:balance]">
            {settings?.heroHeadline || 'An Elevated Dining Experience'}
          </h1>

          <p className="text-sm sm:text-lg text-[#F6F4EE]/90 max-w-2xl mx-auto font-sans font-light leading-relaxed [text-wrap:balance]">
            {settings?.heroSubheadline ||
              'Contemporary culinary artistry. Exceptional ingredients. Unforgettable moments.'}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reservations"
              className="w-full sm:w-auto px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-all duration-200 border border-[#C5A880] shadow-lg"
            >
              Reserve a Table
            </Link>
            <Link
              to="/menu"
              className="w-full sm:w-auto px-8 py-4 text-xs font-sans uppercase tracking-[0.25em] bg-black/40 hover:bg-white/10 text-white font-medium transition-all duration-200 border border-white/20 hover:border-[#C5A880]"
            >
              Explore Menu
            </Link>
          </div>

          <div className="pt-10 flex items-center justify-center gap-6 text-xs text-[#D1CCC0] tracking-wider uppercase">
            <span>Michelin Guide Selected</span>
            <span aria-hidden="true">·</span>
            <span>Hyper-Seasonal Terroir</span>
            <span aria-hidden="true">·</span>
            <span>Grand Cru Cellar</span>
          </div>
        </div>
      </section>

      {/* 2. RESTAURANT INTRODUCTION & EDITORIAL STORYTELLING */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Text Left Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
              The Heritage of Aurelia
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide leading-tight [text-wrap:balance]">
              Where Classical Discipline Meets Nordic Clarity
            </h2>
            <div className="w-12 h-[1px] bg-[#C5A880]/60" />

            <div className="space-y-4 text-sm sm:text-base text-[#D1CCC0] font-sans leading-relaxed">
              <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-[#C5A880]">
                Aurelia was born from an unwavering conviction: that true luxury lies not in ostentatious adornment, but in the relentless curation of pure terroir.
              </p>
              <p>
                From diver-harvested Hokkaido scallops kissed by binchotan embers to BMS-11 Miyazaki Wagyu carved tableside with Périgord black winter truffles, every plate reflects hours of architectural distillation.
              </p>
            </div>

            <div className="pt-4 flex items-center gap-6">
              <Link
                to="/our-story"
                className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-[#C5A880] hover:text-white transition-colors"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Asymmetric Image Showcase Right Column (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[4/5] bg-[#16161C] border border-white/10 overflow-hidden shadow-2xl">
              <img
                src="/images/dish_wagyu.jpg"
                alt="Haute Gastronomy Plating"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
            {/* Architectural accent border */}
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border-l border-b border-[#C5A880]/40 -z-10 hidden sm:block" />
          </div>
        </div>
      </section>

      {/* 3. SIGNATURE DISHES (MongoDB Driven) */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        <SectionHeading
          kicker="Culinary Highlights"
          title="Signature Plates"
          subtitle="A preview of our hyper-seasonal tasting compositions, prepared nightly in limited portions."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDishes.map((dish) => (
            <DishCard key={dish._id} item={dish} />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/menu"
            className="inline-flex items-center justify-center px-8 py-3.5 text-xs font-sans uppercase tracking-[0.2em] bg-[#181820] hover:bg-[#23232C] text-white border border-white/15 hover:border-[#C5A880] transition-all"
          >
            Explore Full Digital Menu
          </Link>
        </div>
      </section>

      {/* 4. CULINARY PHILOSOPHY THREE PILLARS */}
      <section className="bg-[#09090B] py-20 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-14">
          <SectionHeading
            kicker="The Foundation"
            title="The Three Tenets"
            subtitle="The uncompromising standards guiding our culinary atelier."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="p-8 bg-[#121217] border border-white/5 space-y-3">
              <span className="font-mono text-xs text-[#C5A880] uppercase tracking-widest">
                01. Terroir Integrity
              </span>
              <h3 className="font-serif text-2xl text-white">Direct-Source Lineage</h3>
              <p className="text-xs text-[#D1CCC0] leading-relaxed font-sans">
                We partner exclusively with multi-generational foragers, biodynamic growers, and sustainable deep-sea divers who honor natural cycles.
              </p>
            </div>

            <div className="p-8 bg-[#121217] border border-white/5 space-y-3">
              <span className="font-mono text-xs text-[#C5A880] uppercase tracking-widest">
                02. Classical Rigor
              </span>
              <h3 className="font-serif text-2xl text-white">Modern Architectural Fire</h3>
              <p className="text-xs text-[#D1CCC0] leading-relaxed font-sans">
                Ancient French sauce architecture harmonizes with Japanese Kishu binchotan charcoal, creating depths of umami without unnecessary heaviness.
              </p>
            </div>

            <div className="p-8 bg-[#121217] border border-white/5 space-y-3">
              <span className="font-mono text-xs text-[#C5A880] uppercase tracking-widest">
                03. Harmonic Restraint
              </span>
              <h3 className="font-serif text-2xl text-white">The Beauty of Omission</h3>
              <p className="text-xs text-[#D1CCC0] leading-relaxed font-sans">
                True gastronomic mastery lies in knowing what to remove. Every ingredient on the dish must justify its presence through undeniable harmony.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MEET OUR CHEF */}
      {chef && (
        <section className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Chef Photo Left */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative aspect-[3/4] bg-[#16161C] border border-white/10 overflow-hidden shadow-2xl">
                <img
                  src={chef.image || '/images/chef_portrait.jpg'}
                  alt={chef.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Chef Bio Right */}
            <div className="lg:col-span-7 order-1 lg:order-2 space-y-6 text-left">
              <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
                Meet the Chef
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide leading-tight">
                {chef.name}
              </h2>
              <p className="text-xs uppercase tracking-wider text-[#E0CEB5] font-sans">
                {chef.position} · {chef.experience}
              </p>
              <div className="w-12 h-[1px] bg-[#C5A880]/60" />

              <blockquote className="font-serif text-lg sm:text-xl text-[#F6F4EE] italic border-l-2 border-[#C5A880] pl-4 py-1 leading-relaxed">
                {chef.culinaryPhilosophy}
              </blockquote>

              <p className="text-xs sm:text-sm text-[#D1CCC0] font-sans leading-relaxed">
                {chef.biography}
              </p>

              <div className="pt-2">
                <Link
                  to="/chef"
                  className="inline-flex items-center gap-2 text-xs font-sans uppercase tracking-[0.2em] text-[#C5A880] hover:text-white transition-colors"
                >
                  <span>Explore Chef's Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. DINING EXPERIENCES PREVIEW */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        <SectionHeading
          kicker="Curated Rituals"
          title="Dining Experiences"
          subtitle="Tailored journeys designed for intimate celebrations, corporate summits, and epicurean discovery."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {experiences.map((exp) => (
            <article
              key={exp._id}
              className="flex flex-col bg-[#141419] border border-white/10 hover:border-[#C5A880]/50 transition-all text-left overflow-hidden group"
            >
              <div className="aspect-[16/9] w-full bg-[#1A1A22] overflow-hidden">
                <img
                  src={exp.image || '/images/hero_dining.jpg'}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#C5A880] font-sans">
                    {exp.category}
                  </span>
                  <h3 className="font-serif text-xl text-white tracking-wide mt-1">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-[#D1CCC0] mt-2 leading-relaxed font-sans">
                    {exp.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <Link
                    to={exp.ctaUrl || '/reservations'}
                    className="inline-flex items-center gap-1.5 text-xs font-sans uppercase tracking-widest text-[#E0CEB5] hover:text-[#C5A880] transition-colors"
                  >
                    <span>{exp.ctaLabel || 'Reserve'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 7. PRIVATE DINING HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative bg-[#121217] border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 space-y-6 text-left">
              <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
                Exclusive Hospitality
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-white tracking-wide">
                Salon Écrin & Subterranean Wine Cellar
              </h2>
              <p className="text-xs sm:text-sm text-[#D1CCC0] leading-relaxed font-sans">
                Surrounded by over 2,500 grand cru vintages, our private dining sanctuary hosts up to 12 esteemed guests with dedicated sommelier service, custom menu choreography, and discreet private entrance.
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <Link
                  to="/private-dining"
                  className="px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-colors"
                >
                  Inquire for Private Events
                </Link>
                <Link
                  to="/experience"
                  className="px-6 py-3 text-xs font-sans uppercase tracking-[0.2em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
            <div className="lg:col-span-5 h-full min-h-[300px] lg:min-h-[420px]">
              <img
                src="/images/private_dining.jpg"
                alt="Private Wine Cellar Salon"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS / CRITICAL ACCLAIM */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
        <SectionHeading
          kicker="Critical Acclaim"
          title="Guest & Epicurean Reviews"
          subtitle="Reflections from our dining patrons and culinary publications."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test) => (
            <div
              key={test._id}
              className="p-8 bg-[#141419] border border-white/5 space-y-4 text-left flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex text-[#C5A880] gap-1">
                  {Array.from({ length: test.rating || 5 }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="font-serif text-sm sm:text-base text-stone-200 italic leading-relaxed">
                  {test.review}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-medium text-white tracking-wide">{test.customerName}</h4>
                  <p className="text-[11px] text-stone-400">{test.roleOrAffiliation}</p>
                </div>
                <span className="text-[11px] font-mono text-[#C5A880]">{test.source}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. RESERVATION CALL TO ACTION */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="bg-gradient-to-r from-[#181820] to-[#121217] border border-[#C5A880]/30 p-10 sm:p-14 text-center space-y-6">
          <p className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Reserve Your Seating
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white tracking-wide">
            An Unforgettable Evening Awaits
          </h2>
          <p className="text-xs sm:text-sm text-[#D1CCC0] max-w-xl mx-auto font-sans leading-relaxed">
            Due to our commitment to artisanal preparation and limited daily seatings, we encourage guests to reserve in advance.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/reservations"
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-sans uppercase tracking-[0.25em] bg-[#C5A880] text-[#0D0D0E] font-semibold hover:bg-[#E0CEB5] transition-colors"
            >
              Check Availability & Book
            </Link>
            <a
              href="tel:+12125550198"
              className="w-full sm:w-auto px-8 py-3.5 text-xs font-sans uppercase tracking-[0.25em] border border-white/20 text-white hover:border-[#C5A880] transition-colors"
            >
              Call Concierge: +1 (212) 555-0198
            </a>
          </div>
        </div>
      </section>

      {/* 10. LOCATION, HOURS & VALET ACCESS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="p-6 bg-[#141419] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#C5A880]">
              <MapPin className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Location</h4>
            </div>
            <p className="text-xs text-[#D1CCC0] leading-relaxed">
              442 Mayfair Boulevard, Upper East Side, New York, NY 10021
            </p>
            <a
              href={settings?.mapUrl || 'https://maps.google.com'}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-[11px] text-[#C5A880] hover:underline pt-1"
            >
              Get Directions →
            </a>
          </div>

          <div className="p-6 bg-[#141419] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#C5A880]">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Service Hours</h4>
            </div>
            <p className="text-xs text-[#D1CCC0] leading-relaxed">
              Tuesday – Sunday: Dinner service from 17:30. Closed Mondays for private buyouts.
            </p>
          </div>

          <div className="p-6 bg-[#141419] border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#C5A880]">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs uppercase tracking-widest font-semibold text-white">Valet & Attire</h4>
            </div>
            <p className="text-xs text-[#D1CCC0] leading-relaxed">
              {settings?.dressCode || 'Smart elegant attire requested. Complimentary private valet parking available.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
