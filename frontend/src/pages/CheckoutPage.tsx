import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck, CreditCard, Utensils, ShoppingBag, Truck,
  MapPin, AlertCircle, ArrowRight, Loader2, Sparkles, CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { orderService, paymentService, publicService } from '../services/restaurantService';

declare global {
  interface Window {
    Cashfree?: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, tableNumber, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const couponCodeFromState = (location.state as any)?.couponCode || '';

  // Form State
  const [customerName, setCustomerName] = useState(user?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [orderType, setOrderType] = useState<'dine_in' | 'pickup' | 'delivery'>(
    tableNumber ? 'dine_in' : 'dine_in'
  );
  const [customTableNumber, setCustomTableNumber] = useState(tableNumber || 'T01');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [couponCode, setCouponCode] = useState(couponCodeFromState);

  // Settings for fees
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fallback / Sandbox Simulation Modal
  const [simModalOpen, setSimModalOpen] = useState(false);
  const [pendingRef, setPendingRef] = useState<string | null>(null);

  useEffect(() => {
    publicService.getSettings().then(setSettings).catch(() => {});
  }, []);

  // Update table if context changes
  useEffect(() => {
    if (tableNumber) {
      setCustomTableNumber(tableNumber);
      setOrderType('dine_in');
    }
  }, [tableNumber]);

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  // Fees calculation
  const taxRate = parseFloat(settings.tax_rate_percent || '5.0') / 100.0;
  const packagingFee = orderType !== 'dine_in' ? parseFloat(settings.packaging_fee || '25.0') : 0.0;
  const deliveryFee = orderType === 'delivery' ? parseFloat(settings.delivery_fee || '40.0') : 0.0;
  const estimatedTax = Math.round(subtotal * taxRate * 100) / 100;
  const estimatedTotal = Math.round((subtotal + estimatedTax + packagingFee + deliveryFee) * 100) / 100;

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }
    if (orderType === 'dine_in' && !customTableNumber.trim()) {
      toast.error('Please provide a table number for dine-in dining.');
      return;
    }
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      toast.error('Please provide your complete delivery address.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Build backend order payload
      const orderPayload = {
        customer_name: customerName.trim(),
        customer_phone: cleanPhone,
        customer_email: customerEmail.trim() || undefined,
        order_type: orderType,
        table_number: orderType === 'dine_in' ? customTableNumber.trim().toUpperCase() : undefined,
        delivery_address: orderType === 'delivery' ? deliveryAddress.trim() : undefined,
        special_instructions: specialInstructions.trim() || undefined,
        coupon_code: couponCode.trim() || undefined,
        items: items.map((i) => ({
          menu_item_id: i.menu_item_id,
          variant_name: i.variant?.name || undefined,
          addons: i.addons.map((a) => a.name),
          quantity: i.quantity,
        })),
      };

      // 2. Create pending order on backend
      const createdOrder = await orderService.createOrder(orderPayload);
      const ref = createdOrder.order_reference;
      setPendingRef(ref);

      // 3. Initiate Cashfree payment session
      const cfSession = await paymentService.createPaymentSession(ref);

      // 4. Trigger Cashfree Checkout
      if (window.Cashfree && cfSession.payment_session_id && !cfSession.payment_session_id.includes('sim')) {
        const cashfree = new window.Cashfree({
          mode: cfSession.environment === 'PRODUCTION' ? 'production' : 'sandbox',
        });
        clearCart();
        cashfree.checkout({
          paymentSessionId: cfSession.payment_session_id,
          redirectTarget: '_self',
        });
      } else {
        // In sandbox simulation or when test keys need local simulation
        setSimModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to place order. Please review your selections.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    if (!pendingRef) return;
    try {
      await paymentService.verifySandboxPayment(pendingRef);
      clearCart();
      navigate(`/payment/return?order_id=${pendingRef}`);
    } catch (err: any) {
      toast.error(err.message || 'Payment simulation failed.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-[#173D2D]">
          Finalize Dining Order
        </h1>
        <p className="text-xs text-[#77786F] mt-1">
          Complete patron details and settle securely using Cashfree Online Gateway.
        </p>
      </div>

      <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Patron & Dining Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#173D2D]">
              Select Dining Mode
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('dine_in')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  orderType === 'dine_in'
                    ? 'border-[#173D2D] bg-[#173D2D] text-[#F7F3E8] shadow-md'
                    : 'border-[#E8E2D5] bg-[#FCFAF5] text-[#242820] hover:bg-stone-50'
                }`}
              >
                <Utensils className={`w-5 h-5 mx-auto mb-2 ${orderType === 'dine_in' ? 'text-[#C6A15B]' : 'text-[#173D2D]'}`} />
                <span className="font-bold text-xs block">Dine-In</span>
                <span className="text-[10px] opacity-80 block mt-0.5">At Your Table</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  orderType === 'pickup'
                    ? 'border-[#173D2D] bg-[#173D2D] text-[#F7F3E8] shadow-md'
                    : 'border-[#E8E2D5] bg-[#FCFAF5] text-[#242820] hover:bg-stone-50'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 mx-auto mb-2 ${orderType === 'pickup' ? 'text-[#C6A15B]' : 'text-[#173D2D]'}`} />
                <span className="font-bold text-xs block">Takeaway</span>
                <span className="text-[10px] opacity-80 block mt-0.5">Self Pickup</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  orderType === 'delivery'
                    ? 'border-[#173D2D] bg-[#173D2D] text-[#F7F3E8] shadow-md'
                    : 'border-[#E8E2D5] bg-[#FCFAF5] text-[#242820] hover:bg-stone-50'
                }`}
              >
                <Truck className={`w-5 h-5 mx-auto mb-2 ${orderType === 'delivery' ? 'text-[#C6A15B]' : 'text-[#173D2D]'}`} />
                <span className="font-bold text-xs block">Delivery</span>
                <span className="text-[10px] opacity-80 block mt-0.5">Doorstep Courier</span>
              </button>
            </div>

            {/* Dine-In Table Input */}
            {orderType === 'dine_in' && (
              <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
                <label className="text-xs font-bold text-[#173D2D] block">
                  Table Identifier
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={customTableNumber}
                    onChange={(e) => setCustomTableNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. T05"
                    className="w-36 px-4 py-2 text-sm font-bold tracking-wider uppercase rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] text-[#173D2D] focus:outline-none focus:border-[#C6A15B]"
                  />
                  <span className="text-xs text-[#77786F]">
                    {tableNumber ? '(Locked from Table QR scan)' : 'Enter the table number shown on your table card'}
                  </span>
                </div>
              </div>
            )}

            {/* Delivery Address Input */}
            {orderType === 'delivery' && (
              <div className="pt-3 border-t border-[#E8E2D5] space-y-2">
                <label className="text-xs font-bold text-[#173D2D] block">
                  Complete Delivery Address *
                </label>
                <textarea
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street address, apartment/villa number, landmarks, Bengaluru..."
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
                />
              </div>
            )}
          </div>

          {/* Patron Contact Information */}
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-base text-[#173D2D]">
              Patron Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173D2D]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Vikramaditya Roy"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#173D2D]">Mobile Phone (10 digits) *</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#173D2D]">Email Address (for receipt & order tracking)</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. patron@example.com"
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#173D2D]">Special Cooking Instructions / Dietary Allergies</label>
                <textarea
                  rows={2}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="e.g. Less spicy, nut allergy, extra coriander, celebratory candle..."
                  className="w-full px-4 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Cashfree Payment CTA */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-lg text-[#173D2D] pb-3 border-b border-[#E8E2D5]">
              Payment Summary
            </h3>

            {/* Quick item listing */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((i) => (
                <div key={i.id} className="flex justify-between text-xs text-[#242820]">
                  <span className="truncate pr-2">{i.quantity}x {i.name}</span>
                  <span className="font-semibold shrink-0">₹{i.subtotal.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E2D5] space-y-2 text-xs text-[#77786F]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#242820]">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST ({settings.tax_rate_percent || '5'}%)</span>
                <span className="font-semibold text-[#242820]">₹{estimatedTax.toFixed(2)}</span>
              </div>
              {packagingFee > 0 && (
                <div className="flex justify-between">
                  <span>Packaging Fee</span>
                  <span className="font-semibold text-[#242820]">₹{packagingFee.toFixed(2)}</span>
                </div>
              )}
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Courier</span>
                  <span className="font-semibold text-[#242820]">₹{deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E8E2D5] flex justify-between items-baseline">
              <span className="font-heading font-bold text-base text-[#173D2D]">Final Amount</span>
              <span className="font-heading font-bold text-2xl text-[#173D2D]">
                ₹{estimatedTotal.toFixed(2)}
              </span>
            </div>

            {/* Payment Gateway Box */}
            <div className="p-4 rounded-2xl bg-[#F7F3E8] border border-[#C6A15B]/30 space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#C6A15B]" />
                <span className="font-bold text-xs text-[#173D2D]">Cashfree Payment Gateway</span>
              </div>
              <p className="text-[11px] text-[#77786F] leading-relaxed">
                UPI, Credit / Debit Cards, NetBanking, and Wallets are handled with bank-grade 256-bit encryption. Cash-on-delivery is disabled.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-sm tracking-wide uppercase hover:bg-[#123023] disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#C6A15B]" />
                  <span>Contacting Cashfree...</span>
                </>
              ) : (
                <>
                  <span>Pay ₹{estimatedTotal.toFixed(2)} with Cashfree</span>
                  <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Sandbox Simulation Modal (for developer testing & seamless sandbox fallback) */}
      {simModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-md w-full border border-[#C6A15B] shadow-2xl p-8 text-center animate-fade-in space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#173D2D] text-[#C6A15B] flex items-center justify-center mx-auto shadow-md">
              <CreditCard className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] block mb-1">
                Cashfree Sandbox Simulator
              </span>
              <h3 className="font-heading text-2xl font-bold text-[#173D2D]">
                Verify Online Payment
              </h3>
              <p className="text-xs text-[#77786F] mt-2 leading-relaxed">
                Order <strong>{pendingRef}</strong> has been registered in SQLite. Since the system is configured in Cashfree Sandbox environment, you can trigger verified server-side payment confirmation.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSimulatePaymentSuccess}
                className="w-full py-3.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C6A15B]" />
                <span>Simulate Cashfree Payment Success</span>
              </button>

              <button
                onClick={() => setSimModalOpen(false)}
                className="w-full py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
