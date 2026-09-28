import { apiFetch } from './client.js';

export interface MenuCategoryDto {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isPublished: boolean;
}

export interface MenuItemDto {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  currency: string;
  category: MenuCategoryDto | string;
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
}

export const menuApi = {
  // Categories
  getCategories: (all = false) =>
    apiFetch<{ success: boolean; data: MenuCategoryDto[] }>(`/api/menu/categories${all ? '?all=true' : ''}`),

  createCategory: (data: Partial<MenuCategoryDto>) =>
    apiFetch<{ success: boolean; data: MenuCategoryDto }>('/api/menu/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCategory: (id: string, data: Partial<MenuCategoryDto>) =>
    apiFetch<{ success: boolean; data: MenuCategoryDto }>(`/api/menu/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCategory: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/menu/categories/${id}`, {
      method: 'DELETE',
    }),

  // Items
  getItems: (params?: {
    category?: string;
    search?: string;
    dietary?: string;
    featured?: boolean;
    chefChoice?: boolean;
    seasonal?: boolean;
    all?: boolean;
    status?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.dietary) query.set('dietary', params.dietary);
    if (params?.featured) query.set('featured', 'true');
    if (params?.chefChoice) query.set('chefChoice', 'true');
    if (params?.seasonal) query.set('seasonal', 'true');
    if (params?.all) query.set('all', 'true');
    if (params?.status) query.set('status', params.status);
    return apiFetch<{ success: boolean; data: MenuItemDto[] }>(`/api/menu/items?${query.toString()}`);
  },

  getItemById: (id: string) =>
    apiFetch<{ success: boolean; data: MenuItemDto }>(`/api/menu/items/${id}`),

  createItem: (data: Partial<MenuItemDto>) =>
    apiFetch<{ success: boolean; data: MenuItemDto }>('/api/menu/items', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateItem: (id: string, data: Partial<MenuItemDto>) =>
    apiFetch<{ success: boolean; data: MenuItemDto }>(`/api/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteItem: (id: string) =>
    apiFetch<{ success: boolean; message: string }>(`/api/menu/items/${id}`, {
      method: 'DELETE',
    }),
};
