import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Public Pages
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { MenuItemDetailPage } from './pages/MenuItemDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { PaymentReturnPage } from './pages/PaymentReturnPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { LocationPage } from './pages/LocationPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountPage } from './pages/AccountPage';

// Admin Pages
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminOrders } from './admin/AdminOrders';
import { AdminMenu } from './admin/AdminMenu';
import { AdminTables } from './admin/AdminTables';
import { AdminReservations } from './admin/AdminReservations';
import { AdminPayments } from './admin/AdminPayments';
import { AdminWebsite } from './admin/AdminWebsite';
import { AdminSettings } from './admin/AdminSettings';
import { AdminReports } from './admin/AdminReports';

export const App: React.FC = () => {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <Routes>
              {/* Public Website Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="menu/:slug" element={<MenuItemDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="payment/return" element={<PaymentReturnPage />} />
                <Route path="order/:reference" element={<OrderTrackingPage />} />
                <Route path="reservations" element={<ReservationsPage />} />
                <Route path="location" element={<LocationPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="account" element={<AccountPage />} />
              </Route>

              {/* Admin Portal Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="categories" element={<AdminMenu />} />
                <Route path="tables" element={<AdminTables />} />
                <Route path="reservations" element={<AdminReservations />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="website" element={<AdminWebsite />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="reports" element={<AdminReports />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
};

export default App;
