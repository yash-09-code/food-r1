import React, { useEffect, useState } from 'react';
import {
  Plus, Edit, Trash2, Image, Check, X,
  Utensils, Upload, Eye, EyeOff, Sparkles
} from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { MenuItem, Category, Variant, Addon } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminMenu: React.FC = () => {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'dishes' | 'categories'
  const [activeTab, setActiveTab] = useState<'dishes' | 'categories'>('dishes');

  // Dish Modal State
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Form Fields for Dish
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number>(1);
  const [basePrice, setBasePrice] = useState<number>(350);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [spiceLevel, setSpiceLevel] = useState(1);
  const [prepTime, setPrepTime] = useState(20);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);

  // Category Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImage, setCatImage] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, items] = await Promise.all([
        adminService.getCategories(),
        adminService.getMenuItems(),
      ]);
      setCategories(cats);
      setDishes(items);
      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err: any) {
      toast.error('Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewDishModal = () => {
    setEditingDish(null);
    setName('');
    setSlug('');
    setCategoryId(categories[0]?.id || 1);
    setBasePrice(350);
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80');
    setIsVeg(true);
    setSpiceLevel(1);
    setPrepTime(20);
    setIsFeatured(false);
    setIsBestseller(false);
    setIsAvailable(true);
    setDishModalOpen(true);
  };

  const openEditDishModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setName(dish.name);
    setSlug(dish.slug);
    setCategoryId(dish.category_id);
    setBasePrice(dish.base_price);
    setDescription(dish.description);
    setImageUrl(dish.image_url || '');
    setIsVeg(dish.is_veg);
    setSpiceLevel(dish.spice_level);
    setPrepTime(dish.preparation_time);
    setIsFeatured(dish.is_featured);
    setIsBestseller(dish.is_bestseller);
    setIsAvailable(dish.is_available);
    setDishModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    const dishPayload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase() || name.trim().toLowerCase().replace(/\s+/g, '-'),
      category_id: Number(categoryId),
      base_price: Number(basePrice),
      description: description.trim(),
      image_url: imageUrl.trim() || undefined,
      is_veg: isVeg,
      spice_level: Number(spiceLevel),
      preparation_time: Number(prepTime),
      is_featured: isFeatured,
      is_bestseller: isBestseller,
      is_available: isAvailable,
    };

    try {
      if (editingDish) {
        await adminService.updateMenuItem(editingDish.id, dishPayload);
        toast.success(`Dish '${name}' updated successfully.`);
      } else {
        await adminService.createMenuItem(dishPayload);
        toast.success(`Dish '${name}' created successfully.`);
      }
      setDishModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save dish.');
    }
  };

  const handleDeleteDish = async (id: number, dishName: string) => {
    if (!window.confirm(`Are you sure you want to delete dish '${dishName}'?`)) return;
    try {
      await adminService.deleteMenuItem(id);
      toast.success(`Deleted ${dishName}`);
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete dish.');
    }
  };

  const handleToggleAvailability = async (dish: MenuItem) => {
    try {
      await adminService.updateMenuItem(dish.id, { is_available: !dish.is_available });
      setDishes((prev) =>
        prev.map((d) => (d.id === dish.id ? { ...d, is_available: !dish.is_available } : d))
      );
      toast.success(`${dish.name} is now ${!dish.is_available ? 'Available' : 'Unavailable'}.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update availability.');
    }
  };

  // Image Upload helper
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await adminService.uploadImage(file);
      setImageUrl(res.url);
      toast.success('Food image uploaded successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Image upload failed.');
    }
  };

  // Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCategory({
        name: catName.trim(),
        slug: catSlug.trim().toLowerCase() || catName.trim().toLowerCase().replace(/\s+/g, '-'),
        description: catDesc.trim(),
        image_url: catImage.trim() || undefined,
        display_order: categories.length + 1,
        is_active: true,
      });
      toast.success(`Category '${catName}' added.`);
      setCatModalOpen(false);
      setCatName('');
      setCatSlug('');
      setCatDesc('');
      setCatImage('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Menu Engineering & Recipe Catalog
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
            Dishes & Menu Categories
          </h2>
        </div>

        <div className="flex gap-2">
          {activeTab === 'dishes' ? (
            <button
              onClick={openNewDishModal}
              className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-[#C6A15B]" />
              <span>Add New Dish</span>
            </button>
          ) : (
            <button
              onClick={() => setCatModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4 text-[#C6A15B]" />
              <span>Add Category</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#E8E2D5] pb-2">
        <button
          onClick={() => setActiveTab('dishes')}
          className={`pb-2 text-sm font-bold transition-all ${
            activeTab === 'dishes'
              ? 'text-[#173D2D] border-b-2 border-[#C6A15B]'
              : 'text-[#77786F] hover:text-[#173D2D]'
          }`}
        >
          Menu Items ({dishes.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-2 text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'text-[#173D2D] border-b-2 border-[#C6A15B]'
              : 'text-[#77786F] hover:text-[#173D2D]'
          }`}
        >
          Categories ({categories.length})
        </button>
      </div>

      {/* Dishes View */}
      {activeTab === 'dishes' && (
        <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F3E8] border-b border-[#E8E2D5] text-[#173D2D] font-bold">
                  <th className="py-3.5 px-4">Dish</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Dietary</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {dishes.map((d) => (
                  <tr key={d.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={d.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80'}
                          alt={d.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#E8E2D5]"
                        />
                        <div>
                          <strong className="block text-sm text-[#242820]">{d.name}</strong>
                          <span className="text-[10px] text-[#77786F] line-clamp-1">{d.description}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#173D2D]">
                      {d.category?.name || 'Uncategorized'}
                    </td>
                    <td className="py-3 px-4 font-bold text-sm text-[#242820]">
                      ₹{d.base_price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.is_veg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleAvailability(d)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          d.is_available
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                        }`}
                      >
                        {d.is_available ? 'Available' : 'Unavailable'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditDishModal(d)}
                          className="p-1.5 text-stone-600 hover:text-[#173D2D] hover:bg-[#F7F3E8] rounded-lg transition-colors"
                          title="Edit Dish"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDish(d.id, d.name)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories View */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={c.image_url || 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=400&q=80'}
                  alt={c.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-[#E8E2D5]"
                />
                <div>
                  <h4 className="font-heading font-bold text-sm text-[#173D2D]">{c.name}</h4>
                  <p className="text-[11px] text-[#77786F]">slug: {c.slug}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dish Create / Edit Modal */}
      {dishModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-xl w-full border border-[#E8E2D5] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#E8E2D5] bg-[#F7F3E8] flex justify-between items-center">
              <h3 className="font-heading text-lg font-bold text-[#173D2D]">
                {editingDish ? `Edit ${editingDish.name}` : 'Add New Artisanal Dish'}
              </h3>
              <button
                onClick={() => setDishModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDish} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-[#173D2D]">Dish Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Saffron Malai Tikka"
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#173D2D]">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#173D2D]">Base Price (INR ₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-[#173D2D]">Prep Time (Minutes)</label>
                  <input
                    type="number"
                    value={prepTime}
                    onChange={(e) => setPrepTime(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Description *</label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Artisanal provenance, ingredients, marinade, and cooking technique..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              {/* Image URL & Upload */}
              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Image URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white focus:outline-none"
                  />
                  <label className="px-3 py-2 rounded-xl border border-stone-300 bg-stone-100 hover:bg-stone-200 cursor-pointer flex items-center gap-1 font-bold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Dietary Toggles */}
              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#173D2D]">
                  <input
                    type="checkbox"
                    checked={isVeg}
                    onChange={(e) => setIsVeg(e.target.checked)}
                  />
                  <span>Pure Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#173D2D]">
                  <input
                    type="checkbox"
                    checked={isBestseller}
                    onChange={(e) => setIsBestseller(e.target.checked)}
                  />
                  <span>Bestseller Badge</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-[#173D2D]">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                  />
                  <span>Featured Dish</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#E8E2D5] flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023]"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-md w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-[#173D2D]">Create Menu Category</h3>
            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Category Name (e.g. Artisanal Breads)"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
              />
              <textarea
                rows={2}
                placeholder="Category description..."
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
              />
              <input
                type="text"
                placeholder="Cover Image URL..."
                value={catImage}
                onChange={(e) => setCatImage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase"
                >
                  Save Category
                </button>
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
