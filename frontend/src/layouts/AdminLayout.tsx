import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, UtensilsCrossed, QrCode,
  CalendarDays, CreditCard, Globe, Settings, FileSpreadsheet,
  LogOut, ExternalLink, Menu, X, ShieldAlert, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout, isStaff, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#C6A15B] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Role Protection
  if (!user || !isStaff) {
    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-[#E8E2D5] shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[#173D2D]">Access Restricted</h2>
          <p className="text-sm text-[#77786F] mt-2 mb-6">
            Administrator or staff privileges are required to access this portal. Please log in with authorized credentials.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 py-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] font-semibold text-sm hover:bg-[#123023] transition-colors"
            >
              Go to Sign In
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-2.5 rounded-xl border border-[#E8E2D5] text-[#242820] font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Live Orders', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu & Dishes', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Tables & QR Codes', path: '/admin/tables', icon: QrCode },
    { name: 'Reservations', path: '/admin/reservations', icon: CalendarDays },
    { name: 'Payments & Refunds', path: '/admin/payments', icon: CreditCard },
    { name: 'Website CMS', path: '/admin/website', icon: Globe },
    { name: 'Settings & Taxes', path: '/admin/settings', icon: Settings },
    { name: 'Reports & Export', path: '/admin/reports', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen bg-[#F7F3E8]/60 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#173D2D] text-[#F7F3E8] flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-[#C6A15B]/20 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C6A15B] text-[#173D2D] flex items-center justify-center font-heading font-bold text-xl shadow">
              S&S
            </div>
            <div>
              <span className="font-heading text-lg font-bold block leading-none">Saffron & Sage</span>
              <span className="text-[10px] tracking-wider uppercase text-[#C6A15B] font-semibold">
                Admin Console
              </span>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#C6A15B] text-[#173D2D] shadow-md font-bold'
                    : 'text-[#F7F3E8]/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#173D2D]' : 'text-[#C6A15B]'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Staff Profile and Logout in Sidebar Footer */}
        <div className="p-4 border-t border-[#C6A15B]/20 bg-[#123023]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#C6A15B]/20 border border-[#C6A15B] text-[#C6A15B] flex items-center justify-center font-bold text-xs shrink-0">
                {user.full_name.charAt(0)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{user.full_name}</p>
                <p className="text-[10px] text-[#C6A15B] uppercase font-semibold">{user.role}</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              title="Sign Out"
              className="p-2 text-white/60 hover:text-rose-400 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-[#E8E2D5] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-[#173D2D] hover:bg-stone-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-heading text-xl font-bold text-[#173D2D] hidden sm:block">
              Operations & Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Link to public website */}
            <Link
              to="/"
              target="_blank"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#E8E2D5] text-[#173D2D] hover:bg-[#F7F3E8] transition-colors"
            >
              <span>View Live Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C6A15B]" />
            </Link>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
