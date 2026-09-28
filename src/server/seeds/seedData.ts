import bcrypt from 'bcryptjs';
import { AdminUser } from '../models/AdminUser.js';
import { RestaurantSettings } from '../models/RestaurantSettings.js';
import { DiningTable } from '../models/DiningTable.js';
import { MenuCategory } from '../models/MenuCategory.js';
import { MenuItem } from '../models/MenuItem.js';
import { Chef } from '../models/Chef.js';
import { Experience } from '../models/Experience.js';
import { GalleryImage } from '../models/GalleryImage.js';
import { Testimonial } from '../models/Testimonial.js';
import { Announcement } from '../models/Announcement.js';
import { Reservation } from '../models/Reservation.js';
import { Notification } from '../models/Notification.js';

export async function seedInitialData() {
  // 1. Admin User (server-side AUTH identity — separate from the contact
  //    notification recipient CONTACT_NOTIFICATION_EMAIL in the email service).
  const configuredEmail = (
    process.env.ADMIN_AUTH_EMAIL ||
    process.env.ADMIN_EMAIL ||
    'admin@aurelia.com'
  ).toLowerCase().trim();
  const existingAdmin = await AdminUser.findOne({ email: configuredEmail });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const configuredPassword = process.env.ADMIN_PASSWORD || 'AureliaAdmin2026!';
    const passwordHash = await bcrypt.hash(configuredPassword, salt);
    await AdminUser.create({
      name: 'Maitre D’ / Executive Management',
      email: configuredEmail,
      passwordHash,
      role: 'Owner',
      isActive: true,
    });
    console.log(`[Seed] Initial Admin user seeded (${configuredEmail})`);
  }

  // 2. Restaurant Settings
  const settingsCount = await RestaurantSettings.countDocuments();
  if (settingsCount === 0) {
    await RestaurantSettings.create({
      restaurantName: 'AURELIA',
      tagline: 'Haute Cuisine & Epicurean Sanctuary',
      description:
        'Nestled in Manhattan’s Upper East Side, Aurelia celebrates the dialogue between classical French technique and Nordic minimalism. Every service is a choreographed presentation of hyper-seasonal ingredients, rare vintages, and discreet luxury.',
      heroHeadline: 'An Elevated Dining Experience',
      heroSubheadline: 'Contemporary culinary artistry. Exceptional ingredients. Unforgettable moments.',
      logo: '/images/hero_dining.jpg',
      favicon: '',
      phone: '+1 (212) 555-0198',
      email: 'concierge@aurelia-dining.com',
      address: '442 Mayfair Boulevard, Upper East Side',
      city: 'New York',
      postalCode: '10021',
      country: 'United States',
      mapUrl: 'https://maps.google.com/?q=442+Mayfair+Blvd+New+York+NY',
      latitude: 40.768,
      longitude: -73.965,
      parkingInformation: 'Complimentary private valet parking available at our private porte-cochère.',
      dressCode: 'Smart elegant attire requested. Jackets recommended for gentlemen; athletic wear and open footwear are strictly prohibited.',
      currency: 'USD',
      currencySymbol: '$',
      timezone: 'America/New_York',
      defaultReservationDuration: 90,
      maxPartySizeOnline: 8,
      minAdvanceNoticeHours: 2,
      maxAdvanceNoticeDays: 60,
      reservationPolicy:
        'Reservations are held for up to 15 minutes past the scheduled seating time. Please inform our host team of any changes.',
      cancellationPolicy:
        'We respectfully request at least 24 hours advance notice for cancellations or modifications. Private salons require 72 hours notice.',
      socialLinks: {
        instagram: 'https://instagram.com/aureliadining',
        facebook: 'https://facebook.com/aureliadining',
        michelinGuide: 'https://guide.michelin.com',
      },
      openingHours: [
        { day: 'Monday', isClosed: true, openTime: '17:30', closeTime: '23:00' },
        { day: 'Tuesday', isClosed: false, openTime: '17:30', closeTime: '23:00' },
        { day: 'Wednesday', isClosed: false, openTime: '17:30', closeTime: '23:00' },
        { day: 'Thursday', isClosed: false, openTime: '17:30', closeTime: '23:00' },
        { day: 'Friday', isClosed: false, openTime: '17:00', closeTime: '00:00' },
        { day: 'Saturday', isClosed: false, openTime: '17:00', closeTime: '00:00' },
        { day: 'Sunday', isClosed: false, openTime: '17:30', closeTime: '22:30' },
      ],
      blockedDates: [],
    });
    console.log('[Seed] Restaurant settings initialized');
  }

  // 3. Dining Tables
  const tableCount = await DiningTable.countDocuments();
  if (tableCount === 0) {
    const tables = [
      { tableNumber: 'T-01', capacity: 2, type: 'window', zone: 'Main Dining Room', description: 'Intimate window banquette with avenue view', sortOrder: 1 },
      { tableNumber: 'T-02', capacity: 2, type: 'booth', zone: 'Main Dining Room', description: 'Plush velvet alcove booth', sortOrder: 2 },
      { tableNumber: 'T-03', capacity: 2, type: 'standard', zone: 'Main Dining Room', description: 'Central dining salon table', sortOrder: 3 },
      { tableNumber: 'T-04', capacity: 4, type: 'window', zone: 'Main Dining Room', description: 'Spacious four-top near garden terrace', sortOrder: 4 },
      { tableNumber: 'T-05', capacity: 4, type: 'standard', zone: 'Main Dining Room', description: 'Center salon table', sortOrder: 5 },
      { tableNumber: 'T-06', capacity: 4, type: 'booth', zone: 'Mezzanine', description: 'Elevated mezzanine vantage booth', sortOrder: 6 },
      { tableNumber: 'T-07', capacity: 6, type: 'standard', zone: 'Main Dining Room', description: 'Round mahogany family dining table', sortOrder: 7 },
      { tableNumber: 'T-08', capacity: 6, type: 'booth', zone: 'Mezzanine', description: 'Curved banquette for celebratory gatherings', sortOrder: 8 },
      { tableNumber: 'T-09', capacity: 8, type: 'standard', zone: 'Main Dining Room', description: 'Grand oval table for executive parties', sortOrder: 9 },
      { tableNumber: 'SALON-01', capacity: 12, type: 'private_salon', zone: 'Private Cellar', description: 'Exclusive sommelier cellar salon with dedicated service team', sortOrder: 10 },
    ];
    await DiningTable.insertMany(tables);
    console.log('[Seed] Dining tables seeded');
  }

  // 4. Menu Categories
  let categories = await MenuCategory.find();
  if (categories.length === 0) {
    categories = await MenuCategory.insertMany([
      { name: 'Entrées & Starters', slug: 'starters', description: 'Delicate sensory introductions crafted with hyper-seasonal marine and botanical elements.', sortOrder: 1, isPublished: true },
      { name: 'Principal Plates', slug: 'mains', description: 'Artisanal meats and dry-aged delicacies prepared over binchotan embers and heritage reductions.', sortOrder: 2, isPublished: true },
      { name: 'Marine & Shellfish', slug: 'seafood', description: 'Sustainably dived coastal treasures accompanied by preserved citrus and sea infusions.', sortOrder: 3, isPublished: true },
      { name: 'Pâtisserie & Desserts', slug: 'desserts', description: 'Architectural confections pairing single-estate chocolates with rare infusions.', sortOrder: 4, isPublished: true },
      { name: 'Cellar & Reserve Pairings', slug: 'cellar', description: 'Biodynamic grower champagnes, grand crus, and zero-proof botanical elixirs.', sortOrder: 5, isPublished: true },
    ]);
    console.log('[Seed] Menu categories seeded');
  }

  // 5. Menu Items
  const itemsCount = await MenuItem.countDocuments();
  if (itemsCount === 0 && categories.length > 0) {
    const startersCat = categories.find((c) => c.slug === 'starters') || categories[0];
    const mainsCat = categories.find((c) => c.slug === 'mains') || categories[1];
    const seafoodCat = categories.find((c) => c.slug === 'seafood') || categories[2];
    const dessertsCat = categories.find((c) => c.slug === 'desserts') || categories[3];
    const cellarCat = categories.find((c) => c.slug === 'cellar') || categories[4];

    await MenuItem.insertMany([
      {
        name: 'Hokkaido Scallop & Ossetra Caviar',
        slug: 'hokkaido-scallop-caviar',
        shortDescription: 'Pan-seared divergence diver scallop, sea urchin emulsion, Royal Ossetra caviar.',
        description: 'Diver-caught Hokkaido sea scallop gently caramelized over binchotan coals, set on a silken sea urchin velouté, finished with Royal Ossetra sturgeon caviar and edible gold leaf.',
        price: 48,
        currency: 'USD',
        category: startersCat._id,
        ingredients: ['Hokkaido Scallop', 'Ossetra Caviar', 'Sea Urchin Emulsion', 'Chive Essence', 'Edible Gold Leaf'],
        dietaryTags: ['Gluten-free', 'Chef Recommended'],
        allergens: ['Shellfish', 'Fish', 'Dairy'],
        availabilityStatus: 'Available',
        image: '/images/dish_scallop.jpg',
        isFeatured: true,
        isChefChoice: true,
        isPopular: true,
        isNewArrival: false,
        isSeasonal: true,
        sortOrder: 1,
        isPublished: true,
      },
      {
        name: 'A5 Miyazaki Wagyu & Winter Truffle',
        slug: 'a5-miyazaki-wagyu-truffle',
        shortDescription: 'Charcoal-kissed A5 beef filet, parsnip silk, Perigord black truffle jus.',
        description: 'Prime BMS-11 Miyazaki Wagyu tenderloin finished over Japanese oak charcoal, served alongside velouté of roasted heritage parsnips, glazed morel mushrooms, and tableside shavings of French winter black truffle.',
        price: 115,
        currency: 'USD',
        category: mainsCat._id,
        ingredients: ['Miyazaki A5 Wagyu', 'Black Winter Truffle', 'Heritage Parsnip', 'Morel Mushrooms', 'Shallot Glaze'],
        dietaryTags: ['Gluten-free', 'Chef Recommended'],
        allergens: ['Dairy'],
        availabilityStatus: 'Available',
        image: '/images/dish_wagyu.jpg',
        isFeatured: true,
        isChefChoice: true,
        isPopular: true,
        isNewArrival: false,
        isSeasonal: true,
        sortOrder: 2,
        isPublished: true,
      },
      {
        name: 'Glacier 51 Toothfish en Papillote',
        slug: 'glacier-51-toothfish',
        shortDescription: 'Wild Antarctic sea bass, dashi beurre blanc, sea succulents, finger lime.',
        description: 'Sustainably harvested deep-ocean toothfish poached gently in parchment with kombu butter, finger lime pearls, baby leeks, and a pristine champagne dashi reduction.',
        price: 82,
        currency: 'USD',
        category: seafoodCat._id,
        ingredients: ['Toothfish', 'Dashi Reduction', 'Champagne Beurre Blanc', 'Finger Lime', 'Sea Fennel'],
        dietaryTags: ['Gluten-free'],
        allergens: ['Fish', 'Dairy'],
        availabilityStatus: 'Available',
        image: '/images/dish_scallop.jpg',
        isFeatured: true,
        isChefChoice: false,
        isPopular: true,
        isNewArrival: true,
        isSeasonal: false,
        sortOrder: 3,
        isPublished: true,
      },
      {
        name: 'Heritage Duck Breast & Spiced Fig',
        slug: 'heritage-duck-breast-fig',
        shortDescription: 'Dry-aged Rohan duck, roasted black mission fig, lavender honey lacquer.',
        description: '14-day dry-aged duck breast with crispy honey-glazed skin, roasted black mission figs, sunchoke puree, and a reduction of aged Banyuls vinegar and lavender.',
        price: 74,
        currency: 'USD',
        category: mainsCat._id,
        ingredients: ['Rohan Duck Breast', 'Black Mission Fig', 'Lavender Honey', 'Sunchoke Silk', 'Banyuls Reduction'],
        dietaryTags: ['Gluten-free'],
        allergens: [],
        availabilityStatus: 'Available',
        image: '/images/dish_wagyu.jpg',
        isFeatured: true,
        isChefChoice: true,
        isPopular: false,
        isNewArrival: false,
        isSeasonal: true,
        sortOrder: 4,
        isPublished: true,
      },
      {
        name: 'Grand Cru Valrhona Sphere',
        slug: 'grand-cru-valrhona-sphere',
        shortDescription: '70% Guanaja dark chocolate, smoked hazelnut praline, gold caramel pour.',
        description: 'A delicate sphere of 70% single-origin dark chocolate encasing hazelnut feuilletine, Tahitian vanilla bean gelato, and molten smoked fleur de sel caramel poured tableside.',
        price: 28,
        currency: 'USD',
        category: dessertsCat._id,
        ingredients: ['Valrhona Guanaja 70%', 'Piedmont Hazelnut', 'Tahitian Vanilla', 'Smoked Caramel'],
        dietaryTags: ['Vegetarian', 'Chef Recommended'],
        allergens: ['Dairy', 'Tree Nuts', 'Gluten', 'Eggs'],
        availabilityStatus: 'Available',
        image: '/images/dish_wagyu.jpg',
        isFeatured: true,
        isChefChoice: false,
        isPopular: true,
        isNewArrival: false,
        isSeasonal: false,
        sortOrder: 5,
        isPublished: true,
      },
      {
        name: 'Sommelier Grand Tasting Pairing',
        slug: 'sommelier-grand-tasting-pairing',
        shortDescription: 'Seven curated pours from premier crus and biodynamic grower estates.',
        description: 'An expansive flight of 7 vintages hand-selected by Head Sommelier to accompany our Nine-Course Tasting Menu, including rare back-vintages from Burgundy and Bordeaux.',
        price: 185,
        currency: 'USD',
        category: cellarCat._id,
        ingredients: ['Rare Vintages', 'Grand Crus', 'Artisanal Grower Champagnes'],
        dietaryTags: ['Vegan'],
        allergens: ['Sulphites'],
        availabilityStatus: 'Available',
        image: '/images/private_dining.jpg',
        isFeatured: false,
        isChefChoice: true,
        isPopular: true,
        isNewArrival: false,
        isSeasonal: false,
        sortOrder: 6,
        isPublished: true,
      },
    ]);
    console.log('[Seed] Menu items seeded');
  }

  // 6. Chef
  const chefCount = await Chef.countDocuments();
  if (chefCount === 0) {
    await Chef.create({
      name: 'Chef Laurent Vaneau',
      position: 'Chef Patron & Culinary Director',
      experience: 'Two Decades of Haute Gastronomy in Paris, Copenhagen & New York',
      biography:
        'Trained under iconic culinary luminaries in Paris and Kyoto, Chef Laurent Vaneau brings a minimalist, product-first sensibility to Aurelia. His philosophy centers on absolute reverence for the terroir: letting the uncompromised purity of prime seafood, dry-aged proteins, and wild botanical infusions resonate without superfluous noise.',
      culinaryPhilosophy:
        '“True culinary luxury is not complexity for its own sake—it is the unrelenting discipline of stripping away the unnecessary until only clarity, memory, and texture remain.”',
      specialties: ['Hyper-Seasonal Tasting Menus', 'Koji Fermentations & Sea Extracts', 'Charcoal & Binchotan Infusions', 'Modern French Sauces'],
      image: '/images/chef_portrait.jpg',
      isPublished: true,
    });
    console.log('[Seed] Chef profile seeded');
  }

  // 7. Experiences
  const experienceCount = await Experience.countDocuments();
  if (experienceCount === 0) {
    await Experience.insertMany([
      {
        title: 'Nine-Course Chef’s Degustation',
        category: 'Fine Dining',
        description:
          'A three-hour sensory voyage through seasonal terroir, featuring unannounced surprise courses, tableside tea distillations, and bespoke wine choreography.',
        image: '/images/hero_dining.jpg',
        ctaLabel: 'Reserve Tasting',
        ctaUrl: '/reservations',
        sortOrder: 1,
        isPublished: true,
      },
      {
        title: 'Private Sommelier Wine Cellar',
        category: 'Private Dining',
        description:
          'Seated within our temperature-controlled 2,500-bottle subterranean sanctuary. Accommodates up to 12 esteemed guests with custom menu consultations.',
        image: '/images/private_dining.jpg',
        ctaLabel: 'Inquire Salon',
        ctaUrl: '/private-dining',
        sortOrder: 2,
        isPublished: true,
      },
      {
        title: 'Twilight Salon & Cocktail Reverie',
        category: 'Romantic Dinner',
        description:
          'Intimate candlelit velvet banquettes paired with botanical aperitifs, rare caviar service, and bespoke dessert flights.',
        image: '/images/dish_scallop.jpg',
        ctaLabel: 'Reserve Banquette',
        ctaUrl: '/reservations',
        sortOrder: 3,
        isPublished: true,
      },
    ]);
    console.log('[Seed] Experiences seeded');
  }

  // 8. Gallery Images
  const galleryCount = await GalleryImage.countDocuments();
  if (galleryCount === 0) {
    await GalleryImage.insertMany([
      {
        title: 'The Main Dining Room at Twilight',
        altText: 'Atmospheric candlelit dining salon with white linen and dark smoked oak',
        caption: 'Architecture crafted to celebrate shadow, warm luminescence, and acoustics.',
        category: 'Atmosphere',
        imageUrl: '/images/hero_dining.jpg',
        sortOrder: 1,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'A5 Miyazaki Wagyu Plating',
        altText: 'Haute gastronomy plating of A5 wagyu with winter truffles and parsnip silk',
        caption: 'Binchotan seared Miyazaki tenderloin with shaved black winter truffles.',
        category: 'Food',
        imageUrl: '/images/dish_wagyu.jpg',
        sortOrder: 2,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Hokkaido Scallop & Ossetra Caviar',
        altText: 'Seared scallop on sea urchin emulsion with caviar and gold leaf',
        caption: 'Sea urchin foam, champagne beurre blanc, and Royal Ossetra sturgeon caviar.',
        category: 'Food',
        imageUrl: '/images/dish_scallop.jpg',
        sortOrder: 3,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'Chef Laurent Vaneau in the Kitchen',
        altText: 'Chef Laurent Vaneau plating an artisanal course',
        caption: 'Precision and discipline in our open culinary atelier.',
        category: 'Chef',
        imageUrl: '/images/chef_portrait.jpg',
        sortOrder: 4,
        isFeatured: true,
        isPublished: true,
      },
      {
        title: 'The Private Subterranean Wine Salon',
        altText: 'Exclusive private dining room surrounded by illuminated wine displays',
        caption: 'Our private room accommodates up to 12 guests for milestone celebrations.',
        category: 'Private Dining',
        imageUrl: '/images/private_dining.jpg',
        sortOrder: 5,
        isFeatured: true,
        isPublished: true,
      },
    ]);
    console.log('[Seed] Gallery seeded');
  }

  // 9. Testimonials
  const testCount = await Testimonial.countDocuments();
  if (testCount === 0) {
    await Testimonial.insertMany([
      {
        customerName: 'Marcus Sterling',
        roleOrAffiliation: 'International Epicurean Review',
        review:
          '“Aurelia redefines modern haute dining. The scallop and sea urchin emulsion was a masterclass in balance, while the pacing and cellar pairings were second to none.”',
        rating: 5,
        date: '2026-08-14',
        source: 'Gastronomy International',
        isPublished: true,
        sortOrder: 1,
      },
      {
        customerName: 'Elena Rostova',
        roleOrAffiliation: 'Private Dining Host',
        review:
          '“Hosting our anniversary in the subterranean cellar was an unforgettable experience. The discretion of the sommelier team and the wagyu course left our guests spellbound.”',
        rating: 5,
        date: '2026-09-02',
        source: 'Private Guest Book',
        isPublished: true,
        sortOrder: 2,
      },
      {
        customerName: 'Jonathan Hayes',
        roleOrAffiliation: 'Culinary Critic',
        review:
          '“Every dish feels like an architectural poem. Chef Laurent Vaneau has stripped away the pretension and left pure, visceral flavor on the plate.”',
        rating: 5,
        date: '2026-09-18',
        source: 'Manhattan Dining Chronicle',
        isPublished: true,
        sortOrder: 3,
      },
    ]);
    console.log('[Seed] Testimonials seeded');
  }

  // 10. Announcement
  const annCount = await Announcement.countDocuments();
  if (annCount === 0) {
    await Announcement.create({
      title: 'Autumn Black Truffle & Game Degustation',
      description: 'Exclusive 9-course seasonal tasting menu featuring wild black winter truffles from Périgord. Limited seatings each evening.',
      priority: 'high',
      startDate: '2026-09-01',
      endDate: '2026-11-30',
      ctaLabel: 'Reserve Your Table',
      ctaUrl: '/reservations',
      isPublished: true,
    });
    console.log('[Seed] Announcements seeded');
  }

  // 11. Initial Sample Reservation & Notification
  const resCount = await Reservation.countDocuments();
  if (resCount === 0) {
    const table = await DiningTable.findOne({ tableNumber: 'T-01' });
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const sampleRes = await Reservation.create({
      reference: 'AURL-8F42K',
      date: dateStr,
      time: '19:00',
      durationMinutes: 90,
      guests: 2,
      name: 'Victoria Hawthorne',
      email: 'victoria.hawthorne@luxury-estates.com',
      phone: '+1 (212) 555-8821',
      seatingPreference: 'Window Banquette',
      specialRequest: 'Celebrating wedding anniversary. Dietary note: shellfish allergy.',
      dietaryRequirements: ['Shellfish'],
      status: 'Confirmed',
      source: 'Website',
      table: table?._id,
    });

    await Notification.create({
      title: 'New Table Reservation',
      message: `Victoria Hawthorne reserved Table T-01 for 2 guests on ${dateStr} at 19:00 (AURL-8F42K)`,
      type: 'reservation',
      link: `/admin/reservations?ref=${sampleRes.reference}`,
    });
  }
}
