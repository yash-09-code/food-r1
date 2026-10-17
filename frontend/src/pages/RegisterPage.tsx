import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast.error('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must contain at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      toast.success('Your patron account has been registered successfully!');
      navigate('/account');
    } catch (err: any) {
      toast.error(err.message || 'Registration failed. Email may already be in use.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 border border-[#E8E2D5] shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#173D2D] text-[#C6A15B] font-heading font-bold text-2xl flex items-center justify-center mx-auto shadow-md">
            S&S
          </div>
          <h1 className="font-heading text-2xl font-bold text-[#173D2D]">
            Create a Patron Account
          </h1>
          <p className="text-xs text-[#77786F]">
            Store dining preferences, reorder signature dishes, and track table sessions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#173D2D]">Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Gayatri Sen"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#173D2D]">Email Address *</label>
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
            <label className="text-xs font-bold text-[#173D2D]">Mobile Phone</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-[#E8E2D5] bg-[#FCFAF5] focus:outline-none focus:border-[#C6A15B] text-[#242820]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#173D2D]">Password (min 6 chars) *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#77786F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
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
            <span>{isSubmitting ? 'Registering Account...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4 text-[#C6A15B]" />
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#77786F]">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#173D2D] underline">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
