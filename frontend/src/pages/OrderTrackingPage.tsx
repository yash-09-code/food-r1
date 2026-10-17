import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, ChefHat, Utensils, Printer,
  RefreshCw, ArrowLeft, Phone, MapPin, Sparkles, Check
} from 'lucide-react';
import { orderService } from '../services/restaurantService';
import { Order } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchOrder = async () => {
    if (!reference) return;
    try {
      const data = await orderService.getOrderStatus(reference);
      setOrder(data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error('Error fetching order status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds for real-time kitchen updates
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [reference]);

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <h2 className="font-heading text-xl font-bold text-[#173D2D]">Locating Order Details...</h2>
      </div>
    );
  }

  const steps = [
    { key: 'CONFIRMED', label: 'Order Confirmed', desc: 'Payment verified & order queued' },
    { key: 'ACCEPTED', label: 'Kitchen Accepted', desc: 'Chef received your ticket' },
    { key: 'PREPARING', label: 'Preparing & Cooking', desc: 'Crafting dishes with fresh botanicals' },
    { key: 'READY', label: 'Ready', desc: order.order_type === 'dine_in' ? 'Dishes being served to table' : 'Ready for collection' },
    { key: 'SERVED', label: 'Served / Dispatched', desc: 'Delivered to your table' },
    { key: 'COMPLETED', label: 'Completed', desc: 'Thank you for dining with us' },
  ];

  const getStepIndex = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PENDING_PAYMENT') return -1;
    if (s === 'CONFIRMED') return 0;
    if (s === 'ACCEPTED') return 1;
    if (s === 'PREPARING') return 2;
    if (s === 'READY') return 3;
    if (s === 'SERVED') return 4;
    if (s === 'COMPLETED') return 5;
    return 0;
  };

  const currentStepIdx = getStepIndex(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Live Dining Tracker
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#173D2D]">
            Order #{order.order_reference}
          </h1>
          <p className="text-xs text-[#77786F] mt-1 flex items-center gap-2">
            <span>Last checked: {lastRefreshed.toLocaleTimeString()}</span>
            <span>•</span>
            <button
              onClick={fetchOrder}
              className="hover:text-[#173D2D] inline-flex items-center gap-1 font-semibold underline"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold text-[#173D2D] hover:bg-[#F7F3E8] flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#C6A15B]" />
            <span>Print Receipt</span>
          </button>
          <Link
            to="/menu"
            className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] flex items-center gap-1.5 shadow"
          >
            <span>Order More</span>
          </Link>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E8E2D5]">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#173D2D] text-[#C6A15B] flex items-center justify-center font-bold">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-[#77786F]">Current Status</p>
              <h3 className="font-heading font-bold text-xl text-[#173D2D]">
                {order.status.replace('_', ' ')}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            {order.table_number_snapshot && (
              <span className="px-3 py-1.5 rounded-full bg-[#173D2D]/10 text-[#173D2D] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#C6A15B]" />
                Table {order.table_number_snapshot}
              </span>
            )}
            <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800">
              Payment: {order.payment_status}
            </span>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="relative">
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-0.5 bg-[#E8E2D5] -translate-y-1/2 z-0" />
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 relative z-10">
            {steps.map((st, idx) => {
              const isPastOrCurrent = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              return (
                <div key={st.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCurrent
                        ? 'bg-[#C6A15B] text-[#173D2D] ring-4 ring-[#C6A15B]/30 scale-110 shadow'
                        : isPastOrCurrent
                        ? 'bg-[#173D2D] text-[#F7F3E8]'
                        : 'bg-[#FCFAF5] border border-[#E8E2D5] text-stone-400'
                    }`}
                  >
                    {isPastOrCurrent && !isCurrent ? (
                      <Check className="w-4 h-4 text-[#C6A15B]" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isCurrent ? 'text-[#173D2D]' : 'text-stone-500'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Details & Summary Card (also used for print) */}
      <div id="printable-ticket" className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E2D5] shadow-sm space-y-6">
        <div className="flex justify-between items-start pb-4 border-b border-[#E8E2D5]">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#173D2D]">
              Saffron & Sage Fine Dining
            </h3>
            <p className="text-xs text-[#77786F]">
              Plot 42, Heritage Boulevard, Indiranagar, Bengaluru
            </p>
            <p className="text-xs text-[#77786F] mt-1">
              Guest: <strong>{order.customer_name}</strong> • Phone: {order.customer_phone}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-[#173D2D] block">
              Dining Mode: {order.order_type.toUpperCase()}
            </span>
            {order.table_number_snapshot && (
              <span className="text-xs font-extrabold text-[#C6A15B] block mt-0.5">
                TABLE: {order.table_number_snapshot}
              </span>
            )}
            <span className="text-[11px] text-[#77786F] block mt-1">
              {new Date(order.created_at).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="divide-y divide-[#E8E2D5]">
          {order.items.map((it) => (
            <div key={it.id} className="py-3 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-[#242820]">
                  {it.quantity}x {it.item_name}
                </span>
                {it.variant_name && (
                  <span className="text-[#C6A15B] ml-2 font-medium">({it.variant_name})</span>
                )}
                {it.addons_summary && (
                  <p className="text-[11px] text-[#77786F] mt-0.5">+ {it.addons_summary}</p>
                )}
              </div>
              <span className="font-bold text-[#173D2D]">
                ₹{it.subtotal_price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        {/* Pricing Breakdown */}
        <div className="pt-4 border-t border-[#E8E2D5] space-y-1.5 text-xs text-[#77786F]">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-[#242820]">₹{order.subtotal.toFixed(2)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Promotion Discount</span>
              <span>-₹{order.discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>GST Amount</span>
            <span className="text-[#242820]">₹{order.tax_amount.toFixed(2)}</span>
          </div>
          {order.packaging_fee > 0 && (
            <div className="flex justify-between">
              <span>Packaging Fee</span>
              <span className="text-[#242820]">₹{order.packaging_fee.toFixed(2)}</span>
            </div>
          )}
          {order.delivery_fee > 0 && (
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-[#242820]">₹{order.delivery_fee.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-3 border-t border-[#E8E2D5] flex justify-between font-bold text-base text-[#173D2D]">
            <span>Total Paid (via Cashfree)</span>
            <span>₹{order.total_amount.toFixed(2)}</span>
          </div>
        </div>

        {order.special_instructions && (
          <div className="p-3 rounded-xl bg-[#FCFAF5] border border-[#E8E2D5] text-xs text-[#77786F]">
            <strong>Kitchen Notes:</strong> {order.special_instructions}
          </div>
        )}
      </div>
    </div>
  );
};
