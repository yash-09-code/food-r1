import React, { useEffect, useState } from 'react';
import {
  QrCode, Plus, Download, Printer, RefreshCw,
  Utensils, Check, X, Eye
} from 'lucide-react';
import { adminService, tableService } from '../services/restaurantService';
import { RestaurantTable } from '../types';
import { useToast } from '../context/ToastContext';

export const AdminTables: React.FC = () => {
  const toast = useToast();
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [locationTag, setLocationTag] = useState('Main Dining Hall');

  // Print Card Preview Modal
  const [selectedTable, setSelectedTable] = useState<RestaurantTable | null>(null);

  const loadTables = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTables();
      setTables(data);
    } catch (err: any) {
      toast.error('Failed to load restaurant tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    try {
      await adminService.createTable({
        table_number: tableNumber.trim().toUpperCase(),
        capacity: Number(capacity),
        location_tag: locationTag.trim(),
        is_active: true,
      });
      toast.success(`Table ${tableNumber.toUpperCase()} created with generated QR code!`);
      setModalOpen(false);
      setTableNumber('');
      loadTables();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create table.');
    }
  };

  const handleRegenerateQr = async (tableId: number, num: string) => {
    try {
      await adminService.regenerateQr(tableId);
      toast.success(`QR card re-generated for Table ${num}.`);
      loadTables();
    } catch (err: any) {
      toast.error('Failed to re-generate QR code.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Dining Stations & Table QR Engine
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
            Tables & Smart QR Ordering
          </h2>
        </div>

        <div className="flex gap-2">
          <a
            href={tableService.getGeneralQrUrl()}
            download="general_menu_qr.png"
            className="px-4 py-2 rounded-xl border border-[#E8E2D5] bg-white text-xs font-bold text-[#173D2D] hover:bg-[#F7F3E8] flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>General Homepage QR</span>
          </a>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold hover:bg-[#123023] flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4 text-[#C6A15B]" />
            <span>Add New Table</span>
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#77786F]">Loading table cards...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#173D2D] text-[#C6A15B] font-bold text-sm flex items-center justify-center shadow">
                    {t.table_number}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active Station
                  </span>
                </div>

                <h3 className="font-heading font-bold text-lg text-[#173D2D]">
                  Table {t.table_number}
                </h3>
                <p className="text-xs text-[#77786F] mt-0.5">
                  {t.location_tag} • Capacity: {t.capacity} Guests
                </p>

                {/* QR Code Preview */}
                <div className="mt-4 p-3 rounded-2xl bg-[#FCFAF5] border border-[#E8E2D5] flex items-center justify-center">
                  <img
                    src={tableService.getTableQrUrl(t.table_number)}
                    alt={`QR Code for Table ${t.table_number}`}
                    className="w-36 h-48 object-contain rounded-lg shadow-xs"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E8E2D5] mt-4 flex items-center justify-between gap-2">
                <a
                  href={tableService.getTableQrUrl(t.table_number)}
                  download={`table_${t.table_number}_card.png`}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-[11px] font-bold hover:bg-[#123023] flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5 text-[#C6A15B]" />
                  <span>Download Card</span>
                </a>

                <button
                  onClick={() => setSelectedTable(t)}
                  className="p-2 rounded-xl border border-[#E8E2D5] hover:bg-[#F7F3E8] text-[#173D2D]"
                  title="Preview Print"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Table Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-md w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-4">
            <h3 className="font-heading text-lg font-bold text-[#173D2D]">
              Register Dining Table
            </h3>
            <p className="text-xs text-[#77786F]">
              FastAPI will automatically render a high-resolution QR card with dining instructions.
            </p>

            <form onSubmit={handleCreateTable} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Table Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. T09, T10"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Seating Capacity</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={capacity}
                  onChange={(e) => setCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Dining Zone / Location</label>
                <select
                  value={locationTag}
                  onChange={(e) => setLocationTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
                >
                  <option value="Main Dining Hall">Main Dining Hall</option>
                  <option value="Courtyard Terrace">Courtyard Terrace</option>
                  <option value="Private Dining Salon">Private Dining Salon</option>
                  <option value="Botanical Garden">Botanical Garden</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase"
                >
                  Generate Table & QR
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print Card Preview Modal */}
      {selectedTable && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-sm w-full border border-[#E8E2D5] shadow-2xl p-6 text-center space-y-4">
            <h4 className="font-heading font-bold text-lg text-[#173D2D]">
              Table {selectedTable.table_number} Card Preview
            </h4>

            <div className="p-2 border border-[#E8E2D5] rounded-2xl bg-white">
              <img
                src={tableService.getTableQrUrl(selectedTable.table_number)}
                alt="Table Card"
                className="w-full rounded-xl"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-xs font-bold"
              >
                Print Table Standee
              </button>
              <button
                onClick={() => setSelectedTable(null)}
                className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
