import React, { useEffect, useState } from 'react';
import {
  CreditCard, ShieldCheck, RefreshCw, RotateCcw,
  AlertCircle, CheckCircle2, DollarSign
} from 'lucide-react';
import { adminService } from '../services/restaurantService';
import { useToast } from '../context/ToastContext';

export const AdminPayments: React.FC = () => {
  const toast = useToast();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Refund Modal State
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [refundReason, setRefundReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getPayments();
      setPayments(data);
    } catch (err: any) {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const openRefundModal = (p: any) => {
    setSelectedPayment(p);
    setRefundAmount(p.amount);
    setRefundReason('Patron requested cancellation');
    setRefundModalOpen(true);
  };

  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      await adminService.initiateRefund(
        selectedPayment.id,
        Number(refundAmount),
        refundReason
      );
      toast.success(`Refund of ₹${refundAmount} processed successfully.`);
      setRefundModalOpen(false);
      loadPayments();
    } catch (err: any) {
      toast.error(err.message || 'Refund initiation failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#C6A15B] uppercase tracking-wider">
            Financial Ledger & Cashfree Reconciliation
          </span>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
            Payments & Refunds
          </h2>
        </div>

        <button
          onClick={loadPayments}
          className="px-4 py-2 rounded-xl bg-white border border-[#E8E2D5] text-xs font-bold text-[#173D2D] hover:bg-[#F7F3E8] flex items-center gap-1.5 shadow-xs self-start"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#C6A15B]" />
          <span>Sync Transactions</span>
        </button>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-3xl border border-[#E8E2D5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#77786F]">Loading transactions...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#77786F]">
            No Cashfree payment records logged yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F7F3E8] border-b border-[#E8E2D5] text-[#173D2D] font-bold">
                  <th className="py-3.5 px-4">Order Ref</th>
                  <th className="py-3.5 px-4">Patron</th>
                  <th className="py-3.5 px-4">Cashfree Order ID</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Gateway Status</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E2D5]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#173D2D]">
                      {p.order_reference || `#${p.order_id}`}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#242820]">
                      {p.customer_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#77786F] text-[11px]">
                      {p.cashfree_order_id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-sm text-[#242820]">
                      ₹{p.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'REFUNDED'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#77786F]">
                      {new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'SUCCESS' ? (
                        <button
                          onClick={() => openRefundModal(p)}
                          className="px-3 py-1 rounded-lg border border-stone-300 hover:border-rose-400 hover:text-rose-700 font-bold text-[10px] transition-colors"
                        >
                          Refund
                        </button>
                      ) : (
                        <span className="text-stone-400 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FCFAF5] rounded-3xl max-w-md w-full border border-[#E8E2D5] shadow-2xl p-6 space-y-4 animate-fade-in">
            <h3 className="font-heading text-lg font-bold text-[#173D2D]">
              Initiate Cashfree Refund
            </h3>
            <p className="text-xs text-[#77786F]">
              Refund for Order <strong>{selectedPayment.order_reference}</strong> (Paid: ₹{selectedPayment.amount.toFixed(2)})
            </p>

            <form onSubmit={handleProcessRefund} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Refund Amount (INR ₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  max={selectedPayment.amount}
                  required
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#173D2D]">Reason for Refund</label>
                <textarea
                  rows={2}
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g. Item unavailable, patron requested change..."
                  className="w-full px-3 py-2 rounded-xl border border-[#E8E2D5] bg-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-rose-700 text-white font-bold text-xs uppercase hover:bg-rose-800 disabled:opacity-50"
                >
                  {isSubmitting ? 'Processing Refund...' : 'Authorize Refund'}
                </button>
                <button
                  type="button"
                  onClick={() => setRefundModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
