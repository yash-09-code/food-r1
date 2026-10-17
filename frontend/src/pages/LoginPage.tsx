import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back to Saffron & Sage!');
      if (email.includes('admin') || email.includes('staff')) {
        navigate('/admin');
      } else {
        navigate('/account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPw: string) => {
    setEmail(demoEmail);
    setPassword(demoPw);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#173D2D] text-[#C6A15B] font-heading font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            S&S
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#173D2D]">
            Sign In to Your Account
          </h1>
          <p className="text-xs text-[#77786F]">
            Access order history, live reservations, and administrative controls.
          </p>
        </div>

        {/* Demo Quick-Fill Buttons */}
        <div className="p-3 rounded-2xl bg-[#FCFAF5] border border-[#E8E2D5] space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#C6A15B] block text-center">
            One-Click Demo Credentials
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <button
              type="button"
              onClick={() => fillDemo('admin@saffronsage.in', 'Admin@123456')}
              className="py-1.5 px-2 rounded-lg bg-[#173D2D] text-[#F7F3E8] text-[10px] font-bold hover:bg-[#123023] transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('staff@saffronsage.in', 'Staff@123456')}
              className="py-1.5 px-2 rounded-lg bg-[#C6A15B] text-[#173D2D] text-[10px] font-bold hover:bg-[#b59048] transition-colors"
            >
              Staff Captain
            </button>
            <button
              type="button"
              onClick={() => fillDemo('guest@saffronsage.in', 'Customer@123456')}
              className="py-1.5 px-2 rounded-lg bg-stone-200 text-[#242820] text-[10px] font-bold hover:bg-stone-300 transition-colors"
            >
              Guest Patron
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#173D2D]">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#173D2D]">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-bold text-xs uppercase tracking-wider hover:bg-[#123023] disabled:opacity-50 transition-all shadow flex items-center justify-center gap-2"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#77786F] space-y-2">
          <p>
            Do not have an account?{' '}
            <Link to="/register" className="font-bold text-[#173D2D] underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
