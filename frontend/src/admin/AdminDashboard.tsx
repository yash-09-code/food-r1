import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingBag, Clock, Users, Utensils,
  TrendingUp, ArrowRight, CheckCircle2, ChevronRight
} from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { DashboardStats, Order } from '../types';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [statsData, ordersData] = await Promise.all([
          adminService.getDashboard(),
          adminService.getOrders({ status: undefined }),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData.slice(0, 5));
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs text-[#77786F]">Loading Real-Time Analytics...</p>
      </div>
    );
  }

  const kpis = [
    {
      title: 'Total Verified Revenue',
      value: `₹${(stats?.total_revenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      subtitle: `Today: ₹${(stats?.today_revenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-100',
    },
    {
      title: 'Total Placed Orders',
      value: stats?.total_orders || 0,
      subtitle: `Today: ${stats?.today_orders || 0} orders`,
      icon: ShoppingBag,
      color: 'text-amber-700 bg-amber-100',
    },
    {
      title: 'Pending In Kitchen',
      value: stats?.pending_orders || 0,
      subtitle: 'Active prep & dispatch',
      icon: Clock,
      color: 'text-indigo-700 bg-indigo-100',
    },
    {
      title: 'Upcoming Bookings',
      value: stats?.upcoming_reservations || 0,
      subtitle: 'Confirmed reservations',
      icon: Users,
      color: 'text-rose-700 bg-rose-100',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Operational Overview
          </span>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#173D2D]">
            Restaurant Pulse & Metrics
          </h2>
        </div>

        <div className="flex gap-3">
          <Link
            to="/admin/orders"
            className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] flex items-center gap-1.5 shadow"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Manage Orders</span>
          </Link>
          <Link
            to="/admin/menu"
            className="px-4 py-2 rounded-xl border border-[#E8E2D5] bg-white text-[#173D2D] text-xs font-bold hover:bg-[#F7F3E8] flex items-center gap-1.5 shadow-xs"
          >
            <Utensils className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Dishes & Menu</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.title}
              className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-medium text-[#77786F]">{kpi.title}</p>
                <h3 className="font-heading font-bold text-2xl text-[#242820] mt-1">
                  {kpi.value}
                </h3>
                <p className="text-[11px] font-semibold text-[#173D2D] mt-1">
                  {kpi.subtitle}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 2-Column Section: Bestsellers & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <h3 className="font-heading font-bold text-lg text-[#173D2D]">
              Recent Live Orders
            </h3>
            <Link
              to="/admin/orders"
              className="text-xs font-bold text-[#C6A15B] hover:text-[#173D2D] flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#E8E2D5]">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-[#77786F] py-8 text-center">No orders recorded yet.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="py-3.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-[#173D2D]">{o.order_reference}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F7F3E8] text-[#173D2D]">
                        {o.order_type.toUpperCase()}
                      </span>
                      {o.table_number_snapshot && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C6A15B]/20 text-[#173D2D]">
                          Table {o.table_number_snapshot}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#77786F]">
                      Patron: <strong>{o.customer_name}</strong> • {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <p className="font-bold text-[#242820]">₹{o.total_amount.toFixed(2)}</p>
                      <p className="text-[10px] font-semibold text-emerald-700">{o.payment_status}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        o.status === 'CONFIRMED'
                          ? 'bg-amber-100 text-amber-800'
                          : o.status === 'PREPARING'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bestselling Dishes (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D5]">
            <h3 className="font-heading font-bold text-lg text-[#173D2D]">
              Culinary Bestsellers
            </h3>
            <TrendingUp className="w-4 h-4 text-[#C6A15B]" />
          </div>

          <div className="space-y-3">
            {stats?.bestsellers && stats.bestsellers.length > 0 ? (
              stats.bestsellers.map((dish, idx) => (
                <div
                  key={dish.name}
                  className="p-3 rounded-2xl bg-[#FCFAF5] border border-[#E8E2D5] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#173D2D] text-[#C6A15B] font-bold text-[10px] flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <div>
                      <strong className="block text-[#242820] truncate max-w-[130px]">{dish.name}</strong>
                      <span className="text-[10px] text-[#77786F]">{dish.sold} orders placed</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#173D2D]">₹{dish.sales.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#77786F] py-6 text-center">
                Awaiting initial order history to compute sales volume.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
