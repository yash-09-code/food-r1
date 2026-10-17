import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Clock, Flame, ShieldAlert, Check, Plus,
  Minus, ShoppingBag, Utensils
} from 'lucide-react';
import { menuService } from '../services/restaurantService';
import { MenuItem, Variant, Addon } from '../types';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const MenuItemDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart, tableNumber } = useCart();
  const toast = useToast();

  const [dish, setDish] = useState<MenuItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<Variant | undefined>(undefined);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      menuService.getMenuItem(slug)
        .then((res) => {
          setDish(res);
          if (res.variants && res.variants.length > 0) {
            setSelectedVariant(res.variants[0]);
          }
        })
        .catch(() => {
          toast.error('Dish details could not be found.');
          navigate('/menu');
        })
        .finally(() => setIsLoading(false));
    }
  }, [slug]);

  if (isLoading || !dish) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.name === addon.name)
        ? prev.filter((a) => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const unitPrice =
    dish.base_price +
    (selectedVariant?.price_adjustment || 0) +
    selectedAddons.reduce((acc, a) => acc + a.price, 0);

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(dish, selectedVariant, selectedAddons, quantity);
    toast.success(`Added ${quantity}x ${dish.name} to cart.`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Back button */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[#77786F] hover:text-[#173D2D] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Food Menu</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm">
        {/* Left: Dish Visual */}
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-square border border-[#E8E2D5]">
            <img
              src={dish.image_url || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80'}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-xs p-2 rounded-xl border border-[#E8E2D5]">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </div>
          </div>

          {/* Quick Specifications */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#E8E2D5]">
              <Clock className="w-4 h-4 text-[#C6A15B] mx-auto mb-1" />
              <span className="text-[10px] uppercase text-[#77786F] block">Prep Time</span>
              <span className="text-xs font-bold text-[#173D2D]">{dish.preparation_time} mins</span>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#E8E2D5]">
              <Flame className="w-4 h-4 text-[#C6A15B] mx-auto mb-1" />
              <span className="text-[10px] uppercase text-[#77786F] block">Spice Level</span>
              <span className="text-xs font-bold text-[#173D2D]">
                {dish.spice_level === 0 ? 'Mild' : dish.spice_level === 1 ? 'Medium' : 'Spicy'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#E8E2D5]">
              <Utensils className="w-4 h-4 text-[#C6A15B] mx-auto mb-1" />
              <span className="text-[10px] uppercase text-[#77786F] block">Dining Mode</span>
              <span className="text-xs font-bold text-[#173D2D]">
                {tableNumber ? `Table ${tableNumber}` : 'All Modes'}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Specifications, Customization & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
                {dish.category?.name || 'Artisanal Selection'}
              </span>
              {dish.is_bestseller && (
                <span className="text-[10px] bg-[#173D2D] text-[#C6A15B] px-2 py-0.5 rounded-full font-bold">
                  Bestseller
                </span>
              )}
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
              {dish.name}
            </h1>

            <p className="font-bold text-2xl text-[#173D2D]">
              ₹{dish.base_price.toFixed(2)}
            </p>

            <p className="text-sm text-[#77786F] leading-relaxed">
              {dish.description}
            </p>

            {/* Variants */}
            {dish.variants && dish.variants.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[#E8E2D5]">
                <h4 className="font-heading font-bold text-sm text-[#173D2D]">
                  Select Portion Size
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {dish.variants.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVariant?.name === v.name
                          ? 'border-[#173D2D] bg-[#173D2D]/5 font-bold shadow-xs'
                          : 'border-[#E8E2D5] hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-xs text-[#242820] block">{v.name}</span>
                      <span className="text-xs text-[#173D2D] block mt-0.5">
                        {v.price_adjustment > 0 ? `+₹${v.price_adjustment.toFixed(2)}` : 'Included'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {dish.addons && dish.addons.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-[#E8E2D5]">
                <h4 className="font-heading font-bold text-sm text-[#173D2D]">
                  Culinary Accompaniments
                </h4>
                <div className="space-y-2">
                  {dish.addons.map((a) => {
                    const isChecked = selectedAddons.some((x) => x.name === a.name);
                    return (
                      <button
                        key={a.name}
                        onClick={() => toggleAddon(a)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isChecked
                            ? 'border-[#C6A15B] bg-[#C6A15B]/10 font-bold'
                            : 'border-[#E8E2D5] hover:bg-stone-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
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
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-[#E8E2D5] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-[#77786F]">Subtotal for Dish</span>
                <p className="font-heading font-bold text-2xl text-[#173D2D]">
                  ₹{totalPrice.toFixed(2)}
                </p>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center border border-[#E8E2D5] rounded-xl bg-white overflow-hidden shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-stone-600 hover:bg-stone-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-4 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-sm tracking-wide uppercase hover:bg-[#123023] transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-[#C6A15B]" />
              <span>Add to Dining Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
