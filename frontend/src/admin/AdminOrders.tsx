import React, { useEffect, useState } from 'react';
import {
  Search, Filter, Printer, Clock, Utensils,
  Eye, CheckCircle2, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { Order } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminOrders: React.FC = () => {
  const toast = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [orderTypeFilter, setOrderTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getOrders({
        status: statusFilter || undefined,
        order_type: orderTypeFilter || undefined,
        search: searchQuery || undefined,
      });
      setOrders(data);
    } catch (err: any) {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, orderTypeFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const updated = await adminService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated);
      }
      toast.success(`Order ${updated.order_reference} status updated to ${newStatus}.`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order status.');
    }
  };

  const statuses = [
    'CONFIRMED', 'ACCEPTED', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED'
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Kitchen & Service Station
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
            Order Management & Dispatch
          </h2>
        </div>

        <button
          onClick={fetchOrders}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-bold text-[#173D2D] hover:bg-[#F7F3E8] flex items-center gap-1.5 shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-[#E8E2D5] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search reference, patron, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B]"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none text-[#242820]"
          >
            <option value="">All Statuses</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Order Type Dropdown */}
          <select
            value={orderTypeFilter}
            onChange={(e) => setOrderTypeFilter(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none text-[#242820]"
          >
            <option value="">All Types</option>
            <option value="dine_in">Dine-In</option>
            <option value="pickup">Takeaway / Pickup</option>
            <option value="delivery">Courier Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77786F]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77786F]">
            No dining orders matching current query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F3E8] border-b border-[#E8E2D5] text-[#173D2D] font-bold">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Patron</th>
                  <th className="py-3.5 px-4">Mode / Table</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#173D2D]">
                      {o.order_reference}
                      <span className="block text-[10px] text-[#77786F] font-normal">
                        {new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#242820]">
                      {o.customer_name}
                      <span className="block text-[10px] text-[#77786F]">{o.customer_phone}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="uppercase font-bold text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                        {o.order_type}
                      </span>
                      {o.table_number_snapshot && (
                        <span className="ml-1.5 font-bold text-[#173D2D] text-[11px]">
                          Table {o.table_number_snapshot}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#242820]">
                      ₹{o.total_amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          o.payment_status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {o.payment_status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                        className="py-1 px-2 rounded-lg border border-[#E8E2D5] bg-[#FCFAF5] font-bold text-[11px] text-[#173D2D] focus:outline-none"
                      >
                        {statuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 text-[#173D2D] hover:bg-[#F7F3E8] rounded-lg transition-colors"
                        title="View Full Ticket"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Ticket Detail / Kitchen Print Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-lg w-full border border-[#E8E2D5] shadow-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E8E2D5] bg-[#F7F3E8] flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B]">
                  Kitchen Ticket & Receipt
                </span>
                <h3 className="font-heading text-xl font-bold text-[#173D2D]">
                  Order #{selectedOrder.order_reference}
                </h3>
                <p className="text-xs text-[#77786F]">
                  Patron: <strong>{selectedOrder.customer_name}</strong> • {selectedOrder.customer_phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Items List */}
            <div className="p-6 overflow-y-auto space-y-4 divide-y divide-[#E8E2D5] text-xs">
              <div className="flex justify-between pb-3">
                <span className="text-[#77786F]">Dining Station:</span>
                <strong className="text-[#173D2D] uppercase font-bold">
                  {selectedOrder.order_type} {selectedOrder.table_number_snapshot && `(Table ${selectedOrder.table_number_snapshot})`}
                </strong>
              </div>

              {selectedOrder.special_instructions && (
                <div className="py-2.5 bg-amber-50 border border-amber-200 p-3 rounded-xl text-amber-900">
                  <strong>Special Instructions:</strong> {selectedOrder.special_instructions}
                </div>
              )}

              <div className="pt-3 space-y-2">
                <h4 className="font-heading font-bold text-sm text-[#173D2D]">Ordered Dishes</h4>
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-bold text-sm text-[#242820]">{it.quantity}x {it.item_name}</span>
                      {it.variant_name && <span className="text-[#C6A15B] ml-2 font-medium">({it.variant_name})</span>}
                      {it.addons_summary && <p className="text-[11px] text-[#77786F]">+ {it.addons_summary}</p>}
                    </div>
                    <span className="font-bold text-[#173D2D]">₹{it.subtotal_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-1.5 text-[#77786F]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="text-[#242820]">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST):</span>
                  <span className="text-[#242820]">₹{selectedOrder.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-[#173D2D] pt-2 border-t border-[#E8E2D5]">
                  <span>Total Amount Paid:</span>
                  <span>₹{selectedOrder.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#E8E2D5] bg-[#F7F3E8] flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl border border-[#173D2D] text-[#173D2D] text-xs font-bold hover:bg-[#173D2D]/5 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Ticket</span>
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
