import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  category: mongoose.Types.ObjectId;
  ingredients: string[];
  dietaryTags: string[];
  allergens: string[];
  availabilityStatus: 'Available' | 'Unavailable' | 'Sold Out' | 'Temporarily Unavailable';
  image: string;
  galleryImages: string[];
  isFeatured: boolean;
  isChefChoice: boolean;
  isPopular: boolean;
  isNewArrival: boolean;
  isSeasonal: boolean;
  sortOrder: number;
  isPublished: boolean;
  preparationTime?: number;
  calorieInfo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    shortDescription: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    ingredients: { type: [String], default: [] },
    dietaryTags: { type: [String], default: [] }, // e.g. Vegetarian, Vegan, Gluten-free, Chef Recommended
    allergens: { type: [String], default: [] }, // e.g. Dairy, Shellfish, Tree Nuts, Eggs
    availabilityStatus: {
      type: String,
      enum: ['Available', 'Unavailable', 'Sold Out', 'Temporarily Unavailable'],
      default: 'Available',
    },
    image: { type: String, default: '' },
    galleryImages: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isChefChoice: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isSeasonal: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    preparationTime: { type: Number },
    calorieInfo: { type: String },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

MenuItemSchema.index({ category: 1 });
MenuItemSchema.index({ isPublished: 1, isFeatured: 1 });
MenuItemSchema.index({ name: 'text', description: 'text', ingredients: 'text' });

export const MenuItem = mongoose.models.MenuItem || mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);
