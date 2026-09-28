import React, { useEffect, useState, useCallback } from 'react';
import { menuApi, MenuCategoryDto, MenuItemDto } from '../../api/menu.api.js';
import { Modal } from '../../components/ui/Modal.js';
import { ConfirmModal } from '../../components/ui/ConfirmModal.js';
import { Input } from '../../components/ui/Input.js';
import { Select } from '../../components/ui/Select.js';
import { Textarea } from '../../components/ui/Textarea.js';
import { Button } from '../../components/ui/Button.js';
import { ImageUploader } from '../../components/ui/ImageUploader.js';
import { useToast } from '../../context/ToastContext.js';
import { Plus, Edit2, Trash2, Loader2, Search, Utensils } from 'lucide-react';

export const AdminMenuPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');
  const [categories, setCategories] = useState<MenuCategoryDto[]>([]);
  const [items, setItems] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Item Modal
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemDto | null>(null);
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null);
  const [isDeletingItem, setIsDeletingItem] = useState(false);

  // Category Modal
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategoryDto | null>(null);
  const [deleteCatId, setDeleteCatId] = useState<string | null>(null);
  const [isDeletingCat, setIsDeletingCat] = useState(false);

  // Item Form Data
  const [itemForm, setItemForm] = useState<any>({
    name: '',
    shortDescription: '',
    description: '',
    price: 45,
    currency: 'USD',
    category: '',
    ingredients: '',
    dietaryTags: '',
    allergens: '',
    availabilityStatus: 'Available',
    image: '',
    isFeatured: false,
    isChefChoice: false,
    isPopular: false,
    isSeasonal: false,
    isPublished: true,
  });

  // Cat Form Data
  const [catForm, setCatForm] = useState<any>({
    name: '',
    slug: '',
    description: '',
    sortOrder: 1,
    isPublished: true,
  });

  const { success, error } = useToast();

  const loadData = useCallback(() => {
    setLoading(true);
    Promise.all([menuApi.getCategories(true), menuApi.getItems({ all: true })])
      .then(([resCat, resItems]) => {
        if (resCat.success) setCategories(resCat.data || []);
        if (resItems.success) setItems(resItems.data || []);
      })
      .catch((err) => error(err.message))
      .finally(() => setLoading(false));
  }, [error]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Item
  const handleOpenCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      name: '',
      shortDescription: '',
      description: '',
      price: 65,
      currency: 'USD',
      category: categories[0]?._id || '',
      ingredients: '',
      dietaryTags: 'Chef Recommended, Gluten-free',
      allergens: '',
      availabilityStatus: 'Available',
      image: '/images/dish_wagyu.jpg',
      isFeatured: false,
      isChefChoice: true,
      isPopular: false,
      isSeasonal: true,
      isPublished: true,
    });
    setIsItemModalOpen(true);
  };

  // Open Edit Item
  const handleOpenEditItem = (item: MenuItemDto) => {
    setEditingItem(item);
    setItemForm({
      name: item.name,
      shortDescription: item.shortDescription || '',
      description: item.description,
      price: item.price,
      currency: item.currency || 'USD',
      category: typeof item.category === 'object' ? item.category._id : item.category,
      ingredients: item.ingredients?.join(', ') || '',
      dietaryTags: item.dietaryTags?.join(', ') || '',
      allergens: item.allergens?.join(', ') || '',
      availabilityStatus: item.availabilityStatus,
      image: item.image || '',
      isFeatured: item.isFeatured,
      isChefChoice: item.isChefChoice,
      isPopular: item.isPopular,
      isSeasonal: item.isSeasonal,
      isPublished: item.isPublished,
    });
    setIsItemModalOpen(true);
  };

  // Submit Item
  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        ingredients: itemForm.ingredients ? itemForm.ingredients.split(',').map((s: string) => s.trim()) : [],
        dietaryTags: itemForm.dietaryTags ? itemForm.dietaryTags.split(',').map((s: string) => s.trim()) : [],
        allergens: itemForm.allergens ? itemForm.allergens.split(',').map((s: string) => s.trim()) : [],
      };

      if (editingItem) {
        await menuApi.updateItem(editingItem._id, payload);
        success('Menu item updated.');
      } else {
        await menuApi.createItem(payload);
        success('Menu item added to catalogue.');
      }

      setIsItemModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deleteItemId) return;
    try {
      setIsDeletingItem(true);
      await menuApi.deleteItem(deleteItemId);
      success('Menu item removed.');
      setDeleteItemId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Failed to remove menu item.');
    } finally {
      setIsDeletingItem(false);
    }
  };

  // Open Create Cat
  const handleOpenCreateCat = () => {
    setEditingCategory(null);
    setCatForm({
      name: '',
      slug: '',
      description: '',
      sortOrder: categories.length + 1,
      isPublished: true,
    });
    setIsCatModalOpen(true);
  };

  // Open Edit Cat
  const handleOpenEditCat = (cat: MenuCategoryDto) => {
    setEditingCategory(cat);
    setCatForm(cat);
    setIsCatModalOpen(true);
  };

  // Submit Cat
  const handleCatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await menuApi.updateCategory(editingCategory._id, catForm);
        success('Category updated.');
      } else {
        await menuApi.createCategory(catForm);
        success('Category created.');
      }
      setIsCatModalOpen(false);
      loadData();
    } catch (err: any) {
      error(err.message || 'Operation failed.');
    }
  };

  // Delete Cat
  const handleDeleteCat = async () => {
    if (!deleteCatId) return;
    try {
      setIsDeletingCat(true);
      await menuApi.deleteCategory(deleteCatId);
      success('Category removed.');
      setDeleteCatId(null);
      loadData();
    } catch (err: any) {
      error(err.message || 'Cannot remove category with existing dishes.');
    } finally {
      setIsDeletingCat(false);
    }
  };

  // Filter Items
  const filteredItems = items.filter((item) => {
    if (selectedCategory !== 'all') {
      const catId = typeof item.category === 'object' ? item.category._id : item.category;
      if (catId !== selectedCategory) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!item.name.toLowerCase().includes(q) && !item.description?.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/10 gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.25em] text-[#C5A880] font-sans font-medium">
            Atelier Catalog
          </span>
          <h1 className="font-serif text-3xl text-white">Menu & Categories</h1>
        </div>

        <div className="flex gap-2">
          {activeTab === 'items' ? (
            <Button onClick={handleOpenCreateItem} size="md">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Dish</span>
            </Button>
          ) : (
            <Button onClick={handleOpenCreateCat} size="md">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              <span>Add Category</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('items')}
          className={`py-2 text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
            activeTab === 'items'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Menu Items ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`py-2 text-xs font-sans uppercase tracking-[0.2em] transition-colors ${
            activeTab === 'categories'
              ? 'text-[#C5A880] border-b-2 border-[#C5A880] font-semibold'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Tab 1: Menu Items */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="bg-[#141419] p-3.5 border border-white/10 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1A1A22] border border-white/10 text-xs text-white pl-9 pr-3 py-2 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              <span className="text-[11px] text-stone-400 uppercase">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[#1A1A22] border border-white/10 text-xs text-white px-3 py-1.5 outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-24 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#C5A880]" />
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#141419] border border-white/10">
              <table className="w-full text-left text-xs text-[#D1CCC0]">
                <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
                  <tr>
                    <th className="py-3 px-4">Dish</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Availability</th>
                    <th className="py-3 px-4">Highlights</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredItems.map((item) => (
                    <tr key={item._id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt=""
                              className="w-10 h-10 object-cover bg-stone-900 border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#1F1F28] flex items-center justify-center shrink-0 border border-white/5">
                              <Utensils className="w-4 h-4 text-[#C5A880]" />
                            </div>
                          )}
                          <div>
                            <p className="font-serif text-sm font-medium text-white">{item.name}</p>
                            <p className="text-[11px] text-stone-400 line-clamp-1">
                              {item.shortDescription || item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {typeof item.category === 'object' ? item.category.name : 'Unknown'}
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-white tabular-nums">
                        ${item.price}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 text-[10px] uppercase font-sans tracking-wider border ${
                            item.availabilityStatus === 'Available'
                              ? 'border-emerald-600/50 bg-emerald-950/40 text-emerald-300'
                              : 'border-rose-600/50 bg-rose-950/40 text-rose-300'
                          }`}
                        >
                          {item.availabilityStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1.5 flex-wrap">
                          {item.isFeatured && (
                            <span className="text-[10px] text-[#C5A880] border border-[#C5A880]/30 px-1.5 py-0.5">
                              Featured
                            </span>
                          )}
                          {item.isChefChoice && (
                            <span className="text-[10px] text-[#E0CEB5] border border-white/20 px-1.5 py-0.5">
                              Chef Pick
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditItem(item)}
                          className="p-1.5 text-stone-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteItemId(item._id)}
                          className="p-1.5 text-rose-400 hover:text-rose-200"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Categories */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-[#141419] border border-white/10">
            <table className="w-full text-left text-xs text-[#D1CCC0]">
              <thead className="bg-[#181820] text-stone-400 uppercase tracking-wider text-[10px] border-b border-white/10 font-sans">
                <tr>
                  <th className="py-3 px-4">Category Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Sort Order</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 font-serif text-sm font-medium text-white">
                      {c.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-400">{c.slug}</td>
                    <td className="py-3 px-4 text-stone-400 max-w-sm truncate">{c.description}</td>
                    <td className="py-3 px-4 font-mono text-white">{c.sortOrder}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditCat(c)}
                        className="p-1.5 text-stone-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteCatId(c._id)}
                        className="p-1.5 text-rose-400 hover:text-rose-200"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Item Modal with ImageUploader */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItem ? 'Edit Culinary Dish' : 'Add New Culinary Dish'}
        subtitle="Upload asset to Cloudinary or media store and set dietary specifications"
        maxWidth="xl"
      >
        <form onSubmit={handleItemSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Dish Name"
                required
                value={itemForm.name}
                onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                placeholder="e.g. Hokkaido Scallop & Ossetra Caviar"
              />
            </div>
            <Input
              label="Price (USD)"
              type="number"
              min="0"
              required
              value={itemForm.price}
              onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Course Category"
              required
              value={itemForm.category}
              onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Kitchen Availability"
              value={itemForm.availabilityStatus}
              onChange={(e) => setItemForm({ ...itemForm, availabilityStatus: e.target.value })}
            >
              <option value="Available">Available for Service</option>
              <option value="Unavailable">Temporarily Unavailable</option>
              <option value="Sold Out">Sold Out Tonight</option>
            </Select>
          </div>

          <Input
            label="Short Description (Card Subtitle)"
            value={itemForm.shortDescription}
            onChange={(e) => setItemForm({ ...itemForm, shortDescription: e.target.value })}
            placeholder="Brief 1-sentence poetic essence"
          />

          <Textarea
            label="Full Gastronomic Description"
            required
            rows={3}
            value={itemForm.description}
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            placeholder="Detailed description of ingredients, preparation method, and plating."
          />

          {/* Cloudinary Image Uploader */}
          <div className="py-2">
            <ImageUploader
              label="Dish Presentation Image (Cloudinary / Media Store)"
              value={itemForm.image}
              onChange={(url) => setItemForm({ ...itemForm, image: url })}
              altText={itemForm.name}
              aspectRatio="4:3"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Signature Ingredients (comma separated)"
              value={itemForm.ingredients}
              onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
              placeholder="e.g. Scallop, Ossetra Caviar, Chive Oil"
            />
            <Input
              label="Dietary Tags (comma separated)"
              value={itemForm.dietaryTags}
              onChange={(e) => setItemForm({ ...itemForm, dietaryTags: e.target.value })}
              placeholder="e.g. Gluten-free, Chef Recommended"
            />
          </div>

          <Input
            label="Allergens (comma separated)"
            value={itemForm.allergens}
            onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
            placeholder="e.g. Shellfish, Dairy, Tree Nuts"
          />

          {/* Checkboxes */}
          <div className="flex flex-wrap gap-5 pt-2 text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isFeatured}
                onChange={(e) => setItemForm({ ...itemForm, isFeatured: e.target.checked })}
                className="accent-[#C5A880]"
              />
              <span>Feature on Homepage</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isChefChoice}
                onChange={(e) => setItemForm({ ...itemForm, isChefChoice: e.target.checked })}
                className="accent-[#C5A880]"
              />
              <span>Chef's Choice Selection</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={itemForm.isSeasonal}
                onChange={(e) => setItemForm({ ...itemForm, isSeasonal: e.target.checked })}
                className="accent-[#C5A880]"
              />
              <span>Seasonal Harvest</span>
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingItem ? 'Save Changes' : 'Create Dish'}</Button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal
        isOpen={isCatModalOpen}
        onClose={() => setIsCatModalOpen(false)}
        title={editingCategory ? 'Edit Menu Category' : 'Create Menu Category'}
        maxWidth="md"
      >
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <Input
            label="Category Name"
            required
            value={catForm.name}
            onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            placeholder="e.g. Pâtisserie & Desserts"
          />

          <Input
            label="Display Sort Order"
            type="number"
            value={catForm.sortOrder}
            onChange={(e) => setCatForm({ ...catForm, sortOrder: Number(e.target.value) })}
          />

          <Textarea
            label="Category Description"
            rows={2}
            value={catForm.description}
            onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
            placeholder="Brief introduction for this course collection."
          />

          <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsCatModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Item */}
      <ConfirmModal
        isOpen={Boolean(deleteItemId)}
        onClose={() => setDeleteItemId(null)}
        onConfirm={handleDeleteItem}
        title="Remove Menu Item"
        message="Are you sure you wish to delete this dish from the menu catalog?"
        isLoading={isDeletingItem}
      />

      {/* Confirm Delete Category */}
      <ConfirmModal
        isOpen={Boolean(deleteCatId)}
        onClose={() => setDeleteCatId(null)}
        onConfirm={handleDeleteCat}
        title="Remove Category"
        message="Are you sure? Categories containing existing dishes cannot be deleted until dishes are reassigned."
        isLoading={isDeletingCat}
      />
    </div>
  );
};
