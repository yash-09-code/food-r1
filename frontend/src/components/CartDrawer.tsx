import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Utensils } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    tableNumber,
    clearCart
  } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FCFAF5] shadow-2xl flex flex-col border-l border-[#E8E2D5] animate-fade-in">
          {/* Header */}
          <div className="p-5 border-b border-[#E8E2D5] bg-[#F7F3E8] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#173D2D] text-[#C6A15B] flex items-center justify-center shadow">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-[#173D2D]">Your Dining Cart</h3>
                {tableNumber ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#173D2D]/10 text-[#173D2D]">
                    <Utensils className="w-3 h-3 text-[#C6A15B]" /> Table {tableNumber}
                  </span>
                ) : (
                  <span className="text-xs text-[#77786F]">Takeaway / Delivery / Dine-in</span>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-[#77786F] hover:text-[#173D2D] rounded-lg hover:bg-stone-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#E8E2D5]">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-[#F7F3E8] flex items-center justify-center text-[#C6A15B] mb-4">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <h4 className="font-heading text-lg font-bold text-[#242820]">Your cart is empty</h4>
                <p className="text-sm text-[#77786F] mt-1 mb-6">
                  Explore our artisanal delicacies and handcrafted botanical elixirs.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/menu');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-sm font-semibold hover:bg-[#123023] transition-all shadow"
                >
                  Browse Menu
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4 items-start">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#E8E2D5] shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#F7F3E8] flex items-center justify-center text-[#173D2D] font-heading font-bold text-lg border border-[#E8E2D5] shrink-0">
                      S&S
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className="font-heading font-bold text-sm text-[#242820] truncate">
                      {item.name}
                    </h5>

                    {item.variant && (
                      <p className="text-xs text-[#C6A15B] font-medium mt-0.5">
                        Size: {item.variant.name}
                      </p>
                    )}

                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-[#77786F] mt-0.5 line-clamp-1">
                        + {item.addons.map((a) => a.name).join(', ')}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-[#173D2D] text-sm">
                        ₹{item.subtotal.toFixed(2)}
                      </span>

                      <div className="flex items-center border border-[#E8E2D5] rounded-lg bg-white overflow-hidden shadow-sm">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 hover:bg-stone-100 text-[#77786F] hover:text-[#173D2D] transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-semibold text-[#242820]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 hover:bg-stone-100 text-[#77786F] hover:text-[#173D2D] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer with Checkout CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#E8E2D5] bg-[#F7F3E8] space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#77786F]">Subtotal</span>
                <span className="font-bold text-[#242820] text-base">₹{subtotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-[#77786F]">
                Taxes, service, and packaging charges are computed securely on checkout.
              </p>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cart');
                  }}
                  className="flex-1 py-3 rounded-xl border border-[#173D2D] text-[#173D2D] font-semibold text-sm hover:bg-[#173D2D]/5 transition-colors text-center"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/checkout');
                  }}
                  className="flex-[2] py-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-semibold text-sm hover:bg-[#123023] transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
