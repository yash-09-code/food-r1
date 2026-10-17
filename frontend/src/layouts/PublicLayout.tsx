import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Utensils, ShoppingBag, User as UserIcon, Menu as MenuIcon,
  X, Phone, MapPin, Clock, ChevronRight, ShieldCheck, Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { tableService, publicService } from '../services/restaurantService';
import { CartDrawer } from '../components/CartDrawer';

export const PublicLayout: React.FC = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, tableNumber, setTable, clearTable, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [announcement, setAnnouncement] = useState<any>(null);

  // Table QR Detection
  useEffect(() => {
    const tableParam = searchParams.get('table');
    if (tableParam) {
      const validateAndConnect = async () => {
        try {
          const res = await tableService.validateTable(tableParam);
          if (res.valid && res.table) {
            setTable(res.table.table_number, res.table);
            toast.success(`Welcome to Saffron & Sage! Connected to Table ${res.table.table_number}.`);
            // Direct to /menu as specified in requirement 4
            navigate('/menu', { replace: true });
          } else {
            toast.error(res.message || 'Table not found or currently inactive.');
          }
        } catch (err: any) {
          toast.error(err.message || 'Failed to validate table QR code.');
        }
      };
      validateAndConnect();
    }
  }, [searchParams]);

  // Load public settings & announcement
  useEffect(() => {
    publicService.getSettings().then(setSettings).catch(() => {});
    publicService.getWebsiteContent().then((content) => {
      if (content?.announcement) {
        setAnnouncement(content.announcement);
      }
    }).catch(() => {});
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Reservations', path: '/reservations' },
    { name: 'Location', path: '/location' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FCFAF5] text-[#242820]">
      {/* 1. Promotional Announcement Bar */}
      {announcement?.title && (
        <div className="bg-[#173D2D] text-[#F7F3E8] text-xs py-2 px-4 text-center border-b border-[#C6A15B]/30 flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C6A15B] shrink-0" />
          <span className="font-medium tracking-wide">
            <strong className="text-[#C6A15B]">{announcement.title}</strong> — {announcement.subtitle}
          </span>
          {announcement.button_url && (
            <Link
              to={announcement.button_url}
              className="underline hover:text-[#C6A15B] ml-2 font-semibold transition-colors"
            >
              {announcement.button_text || 'Learn More'}
            </Link>
          )}
        </div>
      )}

      {/* 2. Active Table Context Banner */}
      {tableNumber && (
        <div className="bg-[#C6A15B] text-[#173D2D] text-xs sm:text-sm font-semibold py-2 px-4 shadow-sm flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#173D2D]" />
            <span>Ordering from Table {tableNumber} (Dine-In Mode Active)</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/menu"
              className="text-xs bg-[#173D2D] text-[#F7F3E8] px-2.5 py-1 rounded-md hover:bg-[#123023] transition-colors"
            >
              View Menu
            </Link>
            <button
              onClick={() => {
                clearTable();
                toast.info('Table context released.');
              }}
              className="text-xs underline hover:text-black transition-colors"
            >
              Release Table
            </button>
          </div>
        </div>
      )}

      {/* 3. Sticky Desktop & Mobile Header */}
      <header className={`sticky ${tableNumber ? 'top-8' : 'top-0'} z-30 bg-[#FCFAF5]/95 backdrop-blur-md border-b border-[#E8E2D5] transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-full bg-[#173D2D] text-[#C6A15B] flex items-center justify-center font-heading text-xl font-bold shadow-md group-hover:scale-105 transition-transform">
              S&S
            </div>
            <div>
              <span className="font-heading text-xl sm:text-2xl font-bold text-[#173D2D] tracking-tight block leading-tight">
                {settings.restaurant_name || 'Saffron & Sage'}
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#C6A15B] font-semibold block">
                Artisanal Dining & Bar
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors hover:text-[#C6A15B] ${
                    isActive ? 'text-[#173D2D] font-bold border-b-2 border-[#C6A15B] pb-1' : 'text-[#77786F]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Account / Admin */}
            {user ? (
              <Link
                to={user.role === 'admin' || user.role === 'staff' ? '/admin' : '/account'}
                className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl border border-[#E8E2D5] text-[#173D2D] hover:bg-[#F7F3E8] transition-colors"
              >
                <UserIcon className="w-4 h-4 text-[#C6A15B]" />
                <span className="max-w-[90px] truncate">{user.full_name}</span>
                {(user.role === 'admin' || user.role === 'staff') && (
                  <span className="bg-[#173D2D] text-[#C6A15B] text-[9px] px-1.5 py-0.5 rounded">
                    Admin
                  </span>
                )}
              </Link>
            ) : (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-[#77786F] hover:text-[#173D2D] transition-colors"
              >
                <UserIcon className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Cart Button with Count Badge */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-[#173D2D] text-[#F7F3E8] hover:bg-[#123023] transition-all shadow-md flex items-center justify-center"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-[#C6A15B]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#C6A15B] text-[#173D2D] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow animate-fade-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#173D2D] rounded-xl hover:bg-[#F7F3E8] transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FCFAF5] border-b border-[#E8E2D5] px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block text-base font-medium py-2 px-3 rounded-lg text-[#242820] hover:bg-[#F7F3E8] hover:text-[#C6A15B] transition-colors"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-[#E8E2D5] flex flex-col gap-2">
              {user ? (
                <Link
                  to={user.role === 'admin' || user.role === 'staff' ? '/admin' : '/account'}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#173D2D] text-[#F7F3E8] text-sm font-semibold flex items-center justify-between"
                >
                  <span>{user.full_name} ({user.role})</span>
                  <ChevronRight className="w-4 h-4 text-[#C6A15B]" />
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="w-full py-2.5 px-4 rounded-xl border border-[#173D2D] text-[#173D2D] text-sm font-semibold text-center hover:bg-[#173D2D]/5"
                >
                  Customer Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 4. Main Page Body Outlet */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* 5. Cart Drawer Component */}
      <CartDrawer />

      {/* 6. Luxury Footer */}
      <footer className="bg-[#173D2D] text-[#F7F3E8] pt-16 pb-12 border-t border-[#C6A15B]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#C6A15B] text-[#173D2D] flex items-center justify-center font-heading font-bold text-xl">
                S&S
              </div>
              <span className="font-heading text-2xl font-bold tracking-tight">
                {settings.restaurant_name || 'Saffron & Sage'}
              </span>
            </div>
            <p className="text-sm text-[#F7F3E8]/70 leading-relaxed mb-4">
              Artisanal dining honoring ancient Indian spices, cold-pressed cold-climate botanicals, and progressive gastronomy.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#C6A15B] font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Certified Organic & Ethically Sourced Terroir</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-bold text-[#C6A15B] mb-4">Explore</h4>
            <ul className="space-y-2.5 text-sm text-[#F7F3E8]/80">
              <li><Link to="/menu" className="hover:text-[#C6A15B] transition-colors">Our Full Menu</Link></li>
              <li><Link to="/reservations" className="hover:text-[#C6A15B] transition-colors">Reserve a Table</Link></li>
              <li><Link to="/about" className="hover:text-[#C6A15B] transition-colors">Our Culinary Story</Link></li>
              <li><Link to="/gallery" className="hover:text-[#C6A15B] transition-colors">Photo Gallery</Link></li>
              <li><Link to="/location" className="hover:text-[#C6A15B] transition-colors">Location & Hours</Link></li>
              <li><Link to="/admin" className="hover:text-[#C6A15B] transition-colors">Staff / Admin Portal</Link></li>
            </ul>
          </div>

          {/* Column 3: Hours & Holidays */}
          <div>
            <h4 className="font-heading text-lg font-bold text-[#C6A15B] mb-4">Hours of Hospitality</h4>
            <div className="space-y-3 text-sm text-[#F7F3E8]/80">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white">Daily Dining</p>
                  <p>{settings.opening_hours || 'Mon - Sun: 12:00 PM – 11:30 PM'}</p>
                </div>
              </div>
              <p className="text-xs text-[#F7F3E8]/60 pt-2 border-t border-white/10">
                Weekly Holidays: {settings.weekly_holidays || 'Open 7 Days a Week'}
              </p>
            </div>
          </div>

          {/* Column 4: Contact & Reservations */}
          <div>
            <h4 className="font-heading text-lg font-bold text-[#C6A15B] mb-4">Direct Contact</h4>
            <div className="space-y-3 text-sm text-[#F7F3E8]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#C6A15B] shrink-0 mt-0.5" />
                <p>{settings.address || 'Plot 42, Heritage Boulevard, Indiranagar, Bengaluru 560038'}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#C6A15B] shrink-0" />
                <p>{settings.phone || '+91 80 4965 2100'}</p>
              </div>
              <div className="pt-2">
                <Link
                  to="/reservations"
                  className="inline-block px-4 py-2 rounded-xl bg-[#C6A15B] text-[#173D2D] font-bold text-xs uppercase tracking-wider hover:bg-[#b59048] transition-colors shadow"
                >
                  Book a Table Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-[#F7F3E8]/50 gap-4">
          <p>© {new Date().getFullYear()} Saffron & Sage Artisanal Dining. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Powered by Cashfree Online Payments</span>
            <span>•</span>
            <span>QR Smart Table Ordering</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
