import { Router, Request, Response } from 'express';
import { MenuService } from '../services/menu.service.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.middleware.js';
import { pickAllowed } from '../utils/request.js';
import type { IMenuCategory } from '../models/MenuCategory.js';
import type { IMenuItem } from '../models/MenuItem.js';

const router = Router();

/** Editable menu fields — protects `_id`, `__v` and payment/internal keys. */
const CATEGORY_FIELDS = ['name', 'slug', 'description', 'sortOrder', 'isPublished'] as const;

const MENU_ITEM_FIELDS = [
  'name',
  'slug',
  'description',
  'shortDescription',
  'price',
  'currency',
  'category',
  'ingredients',
  'dietaryTags',
  'allergens',
  'availabilityStatus',
  'image',
  'galleryImages',
  'isFeatured',
  'isChefChoice',
  'isPopular',
  'isNewArrival',
  'isSeasonal',
  'sortOrder',
  'isPublished',
  'preparationTime',
  'calorieInfo',
] as const;

// Public: GET /api/menu/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const onlyPublished = req.query.all !== 'true';
    const categories = await MenuService.getCategories(onlyPublished);
    res.json({ success: true, data: categories });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: POST /api/menu/categories
router.post('/categories', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const category = await MenuService.createCategory(
      pickAllowed<Partial<IMenuCategory>>(req.body, CATEGORY_FIELDS),
      req.user?.email
    );
    res.status(201).json({ success: true, data: category });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: PUT /api/menu/categories/:id
router.put('/categories/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const category = await MenuService.updateCategory(
      req.params.id,
      pickAllowed<Partial<IMenuCategory>>(req.body, CATEGORY_FIELDS),
      req.user?.email
    );
    res.json({ success: true, data: category });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: DELETE /api/menu/categories/:id
router.delete('/categories/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await MenuService.deleteCategory(req.params.id, req.user?.email);
    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Public: GET /api/menu/items
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { category, search, dietary, featured, chefChoice, seasonal, all, status } = req.query;

    const items = await MenuService.getMenuItems({
      category: category as string,
      search: search as string,
      dietary: dietary as string,
      featured: featured === 'true',
      chefChoice: chefChoice === 'true',
      seasonal: seasonal === 'true',
      onlyPublished: all !== 'true',
      status: status as string,
    });

    res.json({ success: true, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public: GET /api/menu/items/:id
router.get('/items/:id', async (req: Request, res: Response) => {
  try {
    const item = await MenuService.getMenuItemById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: POST /api/menu/items
router.post('/items', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await MenuService.createMenuItem(
      pickAllowed<Partial<IMenuItem>>(req.body, MENU_ITEM_FIELDS),
      req.user?.email
    );
    res.status(201).json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: PUT /api/menu/items/:id
router.put('/items/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const item = await MenuService.updateMenuItem(
      req.params.id,
      pickAllowed<Partial<IMenuItem>>(req.body, MENU_ITEM_FIELDS),
      req.user?.email
    );
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: DELETE /api/menu/items/:id
router.delete('/items/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    await MenuService.deleteMenuItem(req.params.id, req.user?.email);
    res.json({ success: true, message: 'Menu item deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
