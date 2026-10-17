import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  Utensils, Tag, ShieldCheck, ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export const CartPage: React.FC = () => {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    tableNumber,
    clearTable
  } = useCart();
  const navigate = useNavigate();
  const toast = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);

  // Apply Coupon
  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'WELCOME10') {
      if (subtotal < 500) {
        toast.error('WELCOME10 requires a minimum subtotal of ₹500.');
        return;
      }
      const discount = Math.round(subtotal * 0.1 * 100) / 100;
      setAppliedPromo({ code, discount });
      toast.success('Promo code WELCOME10 applied! 10% discount added.');
    } else if (code === 'SAFFRON20') {
      if (subtotal < 1500) {
        toast.error('SAFFRON20 requires a minimum subtotal of ₹1,500.');
        return;
      }
      const discount = Math.round(subtotal * 0.2 * 100) / 100;
      setAppliedPromo({ code, discount });
      toast.success('Promo code SAFFRON20 applied! 20% discount added.');
    } else {
      toast.error('Invalid promotion code. Try WELCOME10 or SAFFRON20.');
    }
  };

  const discountAmount = appliedPromo ? appliedPromo.discount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discountAmount);
  const estimatedTax = Math.round(taxableSubtotal * 0.05 * 100) / 100; // 5% GST
  const estimatedTotal = Math.round((taxableSubtotal + estimatedTax) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-[#F7F3E8] text-[#C6A15B] flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10 opacity-70" />
        </div>
        <h2 className="font-heading text-3xl font-bold text-[#173D2D]">Your Cart is Currently Empty</h2>
        <p className="text-sm text-[#77786F] max-w-md mx-auto mt-2 mb-8">
          You have not added any dishes yet. Explore our handcrafted menu to discover heritage delicacies and botanical refreshments.
        </p>
        <Link
          to="/menu"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-sm tracking-wide uppercase hover:bg-[#123023] transition-all shadow-lg"
        >
          <span>Explore Our Food Menu</span>
          <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
            Review Dining Cart
          </h1>
          <p className="text-xs text-[#77786F] mt-1">
            Carefully verify portion sizes and seasonings before finalizing checkout.
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition-colors flex items-center gap-1 self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Entire Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {tableNumber && (
            <div className="bg-[#173D2D] text-[#F7F3E8] p-4 rounded-2xl flex items-center justify-between border border-[#C6A15B]/30 shadow-sm">
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-[#C6A15B]" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#C6A15B]">
                    Table Identified
                  </p>
                  <p className="text-sm font-semibold">
                    Ordering for Table {tableNumber} (Dine-in Order)
                  </p>
                </div>
              </div>
              <button
                onClick={clearTable}
                className="text-xs underline text-[#F7F3E8]/70 hover:text-white"
              >
                Change
              </button>
            </div>
          )}

          <div className="bg-white rounded-3xl border border-[#E8E2D5] divide-y divide-[#E8E2D5] shadow-xs overflow-hidden">
            {items.map((item) => (
              <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover border border-[#E8E2D5] shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-[#F7F3E8] flex items-center justify-center font-heading font-bold text-xl text-[#173D2D] border border-[#E8E2D5] shrink-0">
                      S&S
                    </div>
                  )}

                  <div>
                    <h3 className="font-heading font-bold text-base text-[#242820]">
                      {item.name}
                    </h3>
                    {item.variant && (
                      <p className="text-xs font-semibold text-[#C6A15B] mt-0.5">
                        Variant: {item.variant.name}
                      </p>
                    )}
                    {item.addons && item.addons.length > 0 && (
                      <p className="text-xs text-[#77786F] mt-0.5">
                        Add-ons: {item.addons.map((a) => a.name).join(', ')}
                      </p>
                    )}
                    <p className="text-xs font-semibold text-[#173D2D] mt-1 sm:hidden">
                      ₹{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E8E2D5]">
                  <div className="hidden sm:block text-right">
                    <p className="font-bold text-base text-[#173D2D]">
                      ₹{item.subtotal.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-[#77786F]">
                      ₹{item.unit_price.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Counter */}
                  <div className="flex items-center border border-[#E8E2D5] rounded-xl bg-[#FCFAF5] overflow-hidden shadow-xs">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 hover:bg-stone-200 text-stone-600 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#242820]">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 hover:bg-stone-200 text-stone-600 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#173D2D] hover:text-[#C6A15B] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Add More Delicacies from Menu</span>
          </Link>
        </div>

        {/* Right: Bill Calculation & Checkout */}
        <div className="space-y-6">
          {/* Promo Code Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-3">
            <h4 className="font-heading font-bold text-sm text-[#173D2D] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#C6A15B]" />
              <span>Promotional Voucher</span>
            </h4>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. WELCOME10"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="flex-1 px-3 py-2 text-xs uppercase font-bold rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
              />
              <button
                onClick={handleApplyCoupon}
                className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] transition-colors"
              >
                Apply
              </button>
            </div>
            {appliedPromo && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                <span>Voucher {appliedPromo.code} Applied (-₹{appliedPromo.discount.toFixed(2)})</span>
                <button
                  onClick={() => setAppliedPromo(null)}
                  className="font-bold underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#173D2D] pb-3 border-b border-[#E8E2D5]">
              Bill Summary
            </h3>

            <div className="space-y-2.5 text-xs text-[#77786F]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#242820]">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Special Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Estimated GST (5.0%)</span>
                <span className="font-semibold text-[#242820]">₹{estimatedTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Packaging & Service Fee</span>
                <span className="font-semibold text-[#242820]">Calculated at Checkout</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E8E2D5] flex justify-between items-baseline">
              <span className="font-heading font-bold text-base text-[#173D2D]">Estimated Total</span>
              <span className="font-heading font-bold text-2xl text-[#173D2D]">
                ₹{estimatedTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { couponCode: appliedPromo?.code } })}
              className="w-full py-4 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-sm tracking-wide uppercase hover:bg-[#123023] transition-all shadow-xl flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#77786F] pt-2">
              <ShieldCheck className="w-4 h-4 text-[#C6A15B]" />
              <span>100% Encrypted & Secure Payment via Cashfree</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
