import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Utensils, Plus, Check, Filter, X,
  Sparkles, Eye, ArrowUpDown
} from 'lucide-react';
import { menuService } from '../services/restaurantService';
import { MenuItem, Category, Variant, Addon } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const MenuPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, tableNumber } = useCart();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & State
  const activeCategory = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState<'all' | 'veg' | 'non_veg'>('all');
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'popular' | ''>('');

  // Customization Modal State
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Load Categories once
  useEffect(() => {
    menuService.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Fetch Dishes on filter changes
  useEffect(() => {
    const fetchDishes = async () => {
      setIsLoading(true);
      try {
        const isVegParam =
          vegFilter === 'veg' ? true : vegFilter === 'non_veg' ? false : undefined;
        const res = await menuService.getMenuItems({
          category_slug: activeCategory || undefined,
          is_veg: isVegParam,
          search: searchQuery || undefined,
          sort_by: sortBy || undefined,
        });
        setDishes(res);
      } catch (err) {
        console.error('Error fetching menu items:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDishes();
  }, [activeCategory, vegFilter, searchQuery, sortBy]);

  const handleOpenCustomize = (dish: MenuItem) => {
    setSelectedDish(dish);
    setSelectedVariant(dish.variants.length > 0 ? dish.variants[0] : undefined);
    setSelectedAddons([]);
    setModalQuantity(1);
  };

  const handleAddCustomizedDish = () => {
    if (!selectedDish) return;
    addToCart(selectedDish, selectedVariant, selectedAddons, modalQuantity);
    toast.success(`Added ${selectedDish.name} to cart.`);
    setSelectedDish(null);
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const modalUnitPrice =
    (selectedDish?.base_price || 0) +
    (selectedVariant?.price_adjustment || 0) +
    selectedAddons.reduce((acc, a) => acc + a.price, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Table Notice if Dine-In */}
      {tableNumber && (
        <div className="bg-[#173D2D] text-[#F7F3E8] p-4 rounded-2xl flex items-center justify-between border border-[#C6A15B]/30 shadow-md animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A15B] text-[#173D2D] flex items-center justify-center font-bold">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <p className="font-heading font-bold text-base text-white">
                Dine-In Menu • Table {tableNumber}
              </p>
              <p className="text-xs text-[#F7F3E8]/70">
                All selections will be transmitted directly to the kitchen for Table {tableNumber}.
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#C6A15B]/20 text-[#C6A15B] border border-[#C6A15B]/40 hidden sm:inline-block">
            Table Verified
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[#C6A15B] text-xs font-bold tracking-widest uppercase block mb-1">
          Culinary Repertoire
        </span>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-[#173D2D]">
          Our Complete Food Menu
        </h1>
        <p className="text-[#77786F] text-sm mt-2">
          Handcrafted dishes seasoned with single-estate spices, clay-pot slow braises, and pure A2 ghee.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-[#E8E2D5] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes, ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Veg / Non-Veg Filters */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setVegFilter('all')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                vegFilter === 'all'
                  ? 'bg-[#173D2D] text-[#F7F3E8]'
                  : 'bg-[#F7F3E8] text-[#77786F] hover:text-[#173D2D]'
              }`}
            >
              All Dishes
            </button>
            <button
              onClick={() => setVegFilter('veg')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vegFilter === 'veg'
                  ? 'bg-emerald-700 text-white shadow'
                  : 'bg-[#F7F3E8] text-[#77786F] hover:text-emerald-700'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Pure Veg</span>
            </button>
            <button
              onClick={() => setVegFilter('non_veg')}
              className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                vegFilter === 'non_veg'
                  ? 'bg-rose-700 text-white shadow'
                  : 'bg-[#F7F3E8] text-[#77786F] hover:text-rose-700'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Non-Veg</span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <ArrowUpDown className="w-4 h-4 text-[#77786F] hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="w-full md:w-auto text-xs font-semibold py-2.5 px-3 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] text-[#242820] focus:outline-none focus:border-[#C6A15B]"
            >
              <option value="">Recommended</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Bestsellers & Popular</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="pt-2 border-t border-[#E8E2D5] flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSearchParams({})}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              !activeCategory
                ? 'bg-[#C6A15B] text-[#173D2D] font-bold shadow-sm'
                : 'bg-[#F7F3E8] text-[#77786F] hover:text-[#173D2D]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSearchParams({ category: cat.slug })}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isSelected
                    ? 'bg-[#C6A15B] text-[#173D2D] font-bold shadow-sm'
                    : 'bg-[#F7F3E8] text-[#77786F] hover:text-[#173D2D]'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-80 animate-pulse border border-[#E8E2D5]" />
          ))}
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-[#E8E2D5]">
          <div className="w-16 h-16 rounded-full bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 opacity-60" />
          </div>
          <h3 className="font-heading text-xl font-bold text-[#173D2D]">No dishes match your filter</h3>
          <p className="text-sm text-[#77786F] mt-2 mb-6">
            Try clearing search queries or switching the dietary toggle.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setVegFilter('all');
              setSearchParams({});
            }}
            className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023]"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dishes.map((dish) => {
            const hasOptions = dish.variants.length > 0 || dish.addons.length > 0;
            return (
              <div
                key={dish.id}
                className="bg-white rounded-2xl overflow-hidden border border-[#E8E2D5] hover:border-[#C6A15B]/50 transition-all shadow-sm hover:shadow-xl flex flex-col group"
              >
                {/* Dish Photo */}
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={dish.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
                    alt={dish.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-[#E8E2D5]">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </div>

                  {dish.is_bestseller && (
                    <span className="absolute top-3 right-3 bg-[#173D2D] text-[#C6A15B] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow">
                      Bestseller
                    </span>
                  )}
                </div>

                {/* Dish Details */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-heading text-lg font-bold text-[#242820] group-hover:text-[#173D2D] transition-colors">
                        {dish.name}
                      </h3>
                      <span className="font-bold text-[#173D2D] text-lg shrink-0">
                        ₹{dish.base_price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-xs text-[#77786F] line-clamp-2 leading-relaxed mb-4">
                      {dish.description}
                    </p>

                    {hasOptions && (
                      <span className="text-[10px] font-semibold text-[#C6A15B] block mb-2">
                        Customizable options available
                      </span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E8E2D5] flex items-center justify-between gap-3">
                    <Link
                      to={`/menu/${dish.slug}`}
                      className="text-xs font-semibold text-[#77786F] hover:text-[#173D2D] flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </Link>

                    {hasOptions ? (
                      <button
                        onClick={() => handleOpenCustomize(dish)}
                        className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] transition-all flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C6A15B]" />
                        <span>Customize & Add</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          addToCart(dish);
                          toast.success(`Added ${dish.name} to cart.`);
                        }}
                        className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] transition-all flex items-center gap-1.5 shadow"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#C6A15B]" />
                        <span>Add to Order</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Customization Modal */}
      {selectedDish && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-lg w-full border border-[#E8E2D5] shadow-2xl overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E2D5] bg-[#F7F3E8] flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C6A15B]">
                  Customize Dish
                </span>
                <h3 className="font-heading text-xl font-bold text-[#173D2D]">
                  {selectedDish.name}
                </h3>
                <p className="text-xs text-[#77786F] mt-1">
                  Select your portion variant and culinary enhancements.
                </p>
              </div>
              <button
                onClick={() => setSelectedDish(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto divide-y divide-[#E8E2D5]">
              {/* Variants Selection */}
              {selectedDish.variants.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-heading text-sm font-bold text-[#173D2D]">
                    Portion / Size
                  </h4>
                  <div className="space-y-2">
                    {selectedDish.variants.map((v) => (
                      <label
                        key={v.name}
                        onClick={() => setSelectedVariant(v)}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedVariant?.name === v.name
                            ? 'border-[#173D2D] bg-[#173D2D]/5 font-bold'
                            : 'border-[#E8E2D5] hover:bg-stone-50'
                        }`}
                      >
                        <span className="text-xs text-[#242820]">{v.name}</span>
                        <span className="text-xs text-[#173D2D]">
                          {v.price_adjustment > 0 ? `+₹${v.price_adjustment.toFixed(2)}` : 'Standard'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons Selection */}
              {selectedDish.addons.length > 0 && (
                <div className="space-y-3 pt-6">
                  <h4 className="font-heading text-sm font-bold text-[#173D2D]">
                    Add-ons & Enhancements
                  </h4>
                  <div className="space-y-2">
                    {selectedDish.addons.map((a) => {
                      const isChecked = selectedAddons.some((x) => x.name === a.name);
                      return (
                        <label
                          key={a.name}
                          onClick={() => toggleAddon(a)}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                            isChecked
                              ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-bold'
                              : 'border-[#E8E2D5] hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center border ${
                                isChecked
                                  ? 'bg-[#173D2D] border-[#173D2D] text-[#C6A15B]'
                                  : 'border-stone-300'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                            </div>
                            <span className="text-xs text-[#242820]">{a.name}</span>
                          </div>
                          <span className="text-xs font-semibold text-[#173D2D]">
                            +₹{a.price.toFixed(2)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Counter */}
              <div className="pt-6 flex items-center justify-between">
                <span className="text-sm font-bold text-[#173D2D]">Quantity</span>
                <div className="flex items-center border border-[#E8E2D5] rounded-xl bg-white overflow-hidden shadow-xs">
                  <button
                    onClick={() => setModalQuantity(Math.max(1, modalQuantity - 1))}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                  >
                    -
                  </button>
                  <span className="px-3 text-sm font-bold">{modalQuantity}</span>
                  <button
                    onClick={() => setModalQuantity(modalQuantity + 1)}
                    className="px-3 py-1.5 text-stone-600 hover:bg-stone-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#E8E2D5] bg-[#F7F3E8] flex items-center justify-between">
              <div>
                <span className="text-xs text-[#77786F]">Total Dish Price</span>
                <p className="font-bold text-[#173D2D] text-lg">
                  ₹{(modalUnitPrice * modalQuantity).toFixed(2)}
                </p>
              </div>

              <button
                onClick={handleAddCustomizedDish}
                className="px-6 py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-sm font-bold hover:bg-[#123023] shadow-lg flex items-center gap-2"
              >
                <span>Add to Order</span>
                <Plus className="w-4 h-4 text-[#C6A15B]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
