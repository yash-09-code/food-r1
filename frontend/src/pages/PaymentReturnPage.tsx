import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, XCircle, Loader2, ArrowRight,
  ShieldCheck, ShoppingBag
} from 'lucide-react';
import { paymentService } from '../services/restaurantService';

export const PaymentReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get('order_id');

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setIsSuccess(false);
      setMessage('Missing order reference in payment return callback.');
      return;
    }

    const verify = async () => {
      try {
        const res = await paymentService.verifyPaymentStatus(orderId);
        if (res.is_paid || res.status === 'SUCCESS') {
          setIsSuccess(true);
          setMessage('Your payment has been securely confirmed and transmitted to our kitchen.');
        } else {
          // If still pending in Cashfree sandbox, offer quick sandbox verification
          setIsSuccess(false);
          setMessage(res.message || 'Payment is awaiting confirmation from the bank.');
        }
      } catch (err: any) {
        setIsSuccess(false);
        setMessage(err.message || 'Payment verification failed.');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [orderId]);

  const handleRetryVerify = async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      await paymentService.verifySandboxPayment(orderId);
      setIsSuccess(true);
      setMessage('Payment successfully verified in sandbox.');
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E8E2D5] shadow-xl space-y-6">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-[#C6A15B] animate-spin mx-auto" />
            <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
              Verifying Payment with Cashfree...
            </h2>
            <p className="text-xs text-[#77786F]">
              Confirming server-side cryptographic signatures. Please do not close your browser.
            </p>
          </div>
        ) : isSuccess ? (
          <div className="space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#C6A15B] block mb-1">
                Transaction Verified
              </span>
              <h2 className="font-heading text-3xl font-bold text-[#173D2D]">
                Payment Successful!
              </h2>
              <p className="text-sm text-[#77786F] mt-2 leading-relaxed">
                {message}
              </p>
              <p className="text-xs font-bold text-[#173D2D] mt-4 bg-[#F7F3E8] py-2 px-4 rounded-xl inline-block border border-[#E8E2D5]">
                Order Reference: {orderId}
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <Link
                to={`/order/${orderId}`}
                className="flex-1 py-3.5 px-6 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] transition-all shadow flex items-center justify-center gap-2"
              >
                <span>Track Live Order</span>
                <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="w-20 h-20 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 block mb-1">
                Payment Verification Notice
              </span>
              <h2 className="font-heading text-2xl font-bold text-[#173D2D]">
                Pending Bank Confirmation
              </h2>
              <p className="text-sm text-[#77786F] mt-2">
                {message}
              </p>
            </div>

            <div className="pt-4 space-y-3">
              <button
                onClick={handleRetryVerify}
                className="w-full py-3.5 px-6 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] transition-all shadow flex items-center justify-center gap-2"
              >
                <span>Verify Now in Sandbox Mode</span>
              </button>

              <Link
                to="/cart"
                className="block text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Return to Shopping Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
