import React, { useEffect, useState } from 'react';
import {
  CalendarDays, Users, Clock, Search, CheckCircle2,
  XCircle, Filter, Check, X, Phone, Mail
} from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { Reservation } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminReservations: React.FC = () => {
  const toast = useToast();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await adminService.getReservations();
      setReservations(data);
    } catch (err: any) {
      toast.error('Failed to load reservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      const updated = await adminService.updateReservation(id, { status });
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      toast.success(`Booking ${updated.reservation_code} set to ${status}.`);
    } catch (err: any) {
      toast.error('Failed to update booking status.');
    }
  };

  const filtered = reservations.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.guest_name.toLowerCase().includes(q) ||
      r.guest_phone.toLowerCase().includes(q) ||
      r.reservation_code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Guest Concierge & Floor Management
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
            Table Reservations
          </h2>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search guest, phone, code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-[#E8E2D5] bg-white focus:outline-none focus:border-[#C6A15B]"
          />
        </div>
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77786F]">Loading reservations...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77786F]">No reservations recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F3E8] border-b border-[#E8E2D5] text-[#173D2D] font-bold">
                  <th className="py-3.5 px-4">Code</th>
                  <th className="py-3.5 px-4">Guest Details</th>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Party Size</th>
                  <th className="py-3.5 px-4">Ambiance</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#173D2D]">
                      {r.reservation_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="block text-sm text-[#242820]">{r.guest_name}</strong>
                      <span className="text-[11px] text-[#77786F] block">{r.guest_phone}</span>
                      <span className="text-[10px] text-[#77786F] block">{r.guest_email}</span>
                      {r.special_requests && (
                        <span className="text-[10px] text-[#C6A15B] italic block mt-0.5">
                          "{r.special_requests}"
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <strong className="block text-[#173D2D]">{r.reservation_date}</strong>
                      <span className="text-[#C6A15B] font-bold text-[11px]">{r.reservation_time}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#242820]">
                      {r.guest_count} Pax
                    </td>
                    <td className="py-3.5 px-4 font-medium text-stone-700">
                      {r.seating_preference}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          r.status === 'CONFIRMED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : r.status === 'COMPLETED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-bold hover:bg-emerald-800 text-[10px]"
                          >
                            Confirm
                          </button>
                        )}
                        {r.status !== 'COMPLETED' && r.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'COMPLETED')}
                            className="px-2.5 py-1 rounded-lg bg-[#173D2D] text-[#F7F3E8] font-bold hover:bg-[#123023] text-[10px]"
                          >
                            Mark Seated
                          </button>
                        )}
                        {r.status !== 'REJECTED' && r.status !== 'COMPLETED' && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg border border-rose-300 text-rose-700 font-bold hover:bg-rose-50 text-[10px]"
                          >
                            Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
