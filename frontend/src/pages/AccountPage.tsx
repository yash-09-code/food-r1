import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, ShoppingBag, CalendarDays, LogOut,
  ChevronRight, Utensils, Clock, CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderService, reservationService } from '../services/restaurantService';
import { Order, Reservation } from '../types';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations'>('orders');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    const loadData = async () => {
      try {
        const [userOrders, userRes] = await Promise.all([
          orderService.getMyOrders().catch(() => []),
          reservationService.getMyReservations().catch(() => []),
        ]);
        setOrders(userOrders);
        setReservations(userRes);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#173D2D] text-[#C6A15B] font-heading font-bold text-2xl flex items-center justify-center shadow-md">
            {user.full_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[#173D2D]">
              {user.full_name}
            </h1>
            <p className="text-xs text-[#77786F]">
              {user.email} • {user.phone || 'Phone not added'}
            </p>
            <span className="inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#F7F3E8] text-[#C6A15B] border border-[#E8E2D5]">
              {user.role} Account
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {(user.role === 'admin' || user.role === 'staff') && (
            <Link
              to="/admin"
              className="px-4 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:border-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-[#E8E2D5] pb-2">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all ${
            activeTab === 'orders'
              ? 'text-[#173D2D] border-b-2 border-[#C6A15B]'
              : 'text-[#77786F] hover:text-[#173D2D]'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Dining Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reservations')}
          className={`flex items-center gap-2 pb-2 text-sm font-bold transition-all ${
            activeTab === 'reservations'
              ? 'text-[#173D2D] border-b-2 border-[#C6A15B]'
              : 'text-[#77786F] hover:text-[#173D2D]'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Table Bookings ({reservations.length})</span>
        </button>
      </div>

      {/* Orders List */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5]">
              <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-[#173D2D]">No orders found</h3>
              <p className="text-xs text-[#77786F] mt-1 mb-6">
                You have not placed any orders yet under this account.
              </p>
              <Link
                to="/menu"
                className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold"
              >
                Explore Menu
              </Link>
            </div>
          ) : (
            orders.map((o) => (
              <div
                key={o.id}
                className="bg-white rounded-2xl p-6 border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-xs text-[#173D2D]">
                      {o.order_reference}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-stone-100 text-stone-700">
                      {o.order_type}
                    </span>
                    {o.table_number_snapshot && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#173D2D]/10 text-[#173D2D]">
                        Table {o.table_number_snapshot}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#77786F]">
                    {new Date(o.created_at).toLocaleString()} • {o.items.length} items
                  </p>
                  <p className="text-xs font-bold text-[#173D2D] mt-2">
                    Total: ₹{o.total_amount.toFixed(2)} ({o.payment_status})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      o.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {o.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/order/${o.order_reference}`}
                    className="p-2 rounded-xl bg-[#F7F3E8] text-[#173D2D] hover:bg-[#173D2D] hover:text-[#F7F3E8] transition-colors"
                    title="Track Order"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Reservations List */}
      {activeTab === 'reservations' && (
        <div className="space-y-4">
          {reservations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D5]">
              <CalendarDays className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-heading font-bold text-lg text-[#173D2D]">No bookings found</h3>
              <p className="text-xs text-[#77786F] mt-1 mb-6">
                You currently do not have any table reservations registered.
              </p>
              <Link
                to="/reservations"
                className="px-5 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold"
              >
                Book a Table
              </Link>
            </div>
          ) : (
            reservations.map((res) => (
              <div
                key={res.id}
                className="bg-white rounded-2xl p-6 border border-[#E8E2D5] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-xs text-[#173D2D]">
                      {res.reservation_code}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-stone-100 text-stone-700">
                      {res.seating_preference}
                    </span>
                  </div>
                  <p className="text-xs text-[#77786F]">
                    {res.reservation_date} at {res.reservation_time} • {res.guest_count} Guests
                  </p>
                  {res.special_requests && (
                    <p className="text-xs text-[#77786F] mt-1 italic">
                      Note: "{res.special_requests}"
                    </p>
                  )}
                </div>

                <div>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      res.status === 'CONFIRMED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
