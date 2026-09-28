import { MenuCategory, IMenuCategory } from '../models/MenuCategory.js';
import { MenuItem, IMenuItem } from '../models/MenuItem.js';
import { AuditLog } from '../models/AuditLog.js';

export class MenuService {
  // Categories
  static async getCategories(onlyPublished = true) {
    const filter = onlyPublished ? { isPublished: true } : {};
    return MenuCategory.find(filter).sort({ sortOrder: 1, name: 1 });
  }

  static async createCategory(data: Partial<IMenuCategory>, actor = 'Admin') {
    const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await MenuCategory.create({ ...data, slug });
    await AuditLog.create({
      actor,
      action: 'CATEGORY_CREATED',
      resource: 'MenuCategory',
      resourceId: category._id.toString(),
      metadata: { name: category.name },
    });
    return category;
  }

  static async updateCategory(id: string, data: Partial<IMenuCategory>, actor = 'Admin') {
    const category = await MenuCategory.findByIdAndUpdate(id, data, { new: true });
    if (!category) throw new Error('Category not found');
    await AuditLog.create({
      actor,
      action: 'CATEGORY_UPDATED',
      resource: 'MenuCategory',
      resourceId: id,
      metadata: data,
    });
    return category;
  }

  static async deleteCategory(id: string, actor = 'Admin') {
    const itemsCount = await MenuItem.countDocuments({ category: id });
    if (itemsCount > 0) {
      throw new Error(`Cannot delete category with ${itemsCount} existing menu items. Reassign or delete items first.`);
    }
    const cat = await MenuCategory.findByIdAndDelete(id);
    await AuditLog.create({
      actor,
      action: 'CATEGORY_DELETED',
      resource: 'MenuCategory',
      resourceId: id,
      metadata: { name: cat?.name },
    });
    return cat;
  }

  // Menu Items
  static async getMenuItems(query: {
    category?: string;
    search?: string;
    dietary?: string;
    featured?: boolean;
    chefChoice?: boolean;
    seasonal?: boolean;
    onlyPublished?: boolean;
    status?: string;
  }) {
    const filter: any = {};

    if (query.onlyPublished !== false) {
      filter.isPublished = true;
    }

    if (query.category) {
      // Find category by slug or ID
      const cat = await MenuCategory.findOne({
        $or: [{ slug: query.category }, { _id: query.category.match(/^[0-9a-fA-F]{24}$/) ? query.category : null }],
      });
      if (cat) {
        filter.category = cat._id;
      }
    }

    if (query.dietary) {
      filter.dietaryTags = { $in: [new RegExp(query.dietary, 'i')] };
    }

    if (query.featured) {
      filter.isFeatured = true;
    }

    if (query.chefChoice) {
      filter.isChefChoice = true;
    }

    if (query.seasonal) {
      filter.isSeasonal = true;
    }

    if (query.status) {
      filter.availabilityStatus = query.status;
    }

    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [
        { name: regex },
        { description: regex },
        { shortDescription: regex },
        { ingredients: { $in: [regex] } },
        { dietaryTags: { $in: [regex] } },
      ];
    }

    return MenuItem.find(filter)
      .populate('category')
      .sort({ sortOrder: 1, isFeatured: -1, createdAt: -1 });
  }

  static async getMenuItemById(id: string) {
    return MenuItem.findById(id).populate('category');
  }

  static async createMenuItem(data: Partial<IMenuItem>, actor = 'Admin') {
    const slug = data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const item = await MenuItem.create({ ...data, slug });
    await AuditLog.create({
      actor,
      action: 'MENU_ITEM_CREATED',
      resource: 'MenuItem',
      resourceId: item._id.toString(),
      metadata: { name: item.name, price: item.price },
    });
    return item.populate('category');
  }

  static async updateMenuItem(id: string, data: Partial<IMenuItem>, actor = 'Admin') {
    const item = await MenuItem.findByIdAndUpdate(id, data, { new: true }).populate('category');
    if (!item) throw new Error('Menu item not found');
    await AuditLog.create({
      actor,
      action: 'MENU_ITEM_UPDATED',
      resource: 'MenuItem',
      resourceId: id,
      metadata: data,
    });
    return item;
  }

  static async deleteMenuItem(id: string, actor = 'Admin') {
    const item = await MenuItem.findByIdAndDelete(id);
    await AuditLog.create({
      actor,
      action: 'MENU_ITEM_DELETED',
      resource: 'MenuItem',
      resourceId: id,
      metadata: { name: item?.name },
    });
    return item;
  }
}
