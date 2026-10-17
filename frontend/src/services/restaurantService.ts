import { apiRequest } from './api';
import {
  Category, MenuItem, RestaurantTable, Order, Reservation,
  User, Promotion, GalleryImage, Testimonial, DashboardStats
} from '../types';

export const publicService = {
  getWebsiteContent: () => apiRequest<Record<string, any>>('/public/website'),
  getSettings: () => apiRequest<Record<string, string>>('/public/settings'),
  getLocation: () => apiRequest<any>('/public/location'),
  getTestimonials: () => apiRequest<Testimonial[]>('/public/testimonials'),
  getGallery: () => apiRequest<GalleryImage[]>('/public/gallery'),
  getPromotions: () => apiRequest<Promotion[]>('/public/promotions'),
};

export const menuService = {
  getCategories: () => apiRequest<Category[]>('/menu/categories'),
  getMenuItems: (params?: { category_slug?: string; is_veg?: boolean; search?: string; sort_by?: string }) => {
    const query = new URLSearchParams();
    if (params?.category_slug) query.set('category_slug', params.category_slug);
    if (params?.is_veg !== undefined) query.set('is_veg', String(params.is_veg));
    if (params?.search) query.set('search', params.search);
    if (params?.sort_by) query.set('sort_by', params.sort_by);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiRequest<MenuItem[]>(`/menu/items${qs}`);
  },
  getMenuItem: (idOrSlug: string | number) => apiRequest<MenuItem>(`/menu/items/${idOrSlug}`),
  getFeaturedItems: () => apiRequest<MenuItem[]>('/menu/featured'),
};

export const tableService = {
  validateTable: (tableNumber: string) =>
    apiRequest<{ valid: boolean; message: string; table?: RestaurantTable }>('/public/tables/validate', {
      method: 'POST',
      body: JSON.stringify({ table_number: tableNumber }),
    }),
  getTableQrUrl: (tableNumber: string) => `/api/public/tables/${tableNumber}/qr`,
  getGeneralQrUrl: () => `/api/public/tables/general-qr`,
};

export const orderService = {
  createOrder: (orderData: any) =>
    apiRequest<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),
  getOrderStatus: (reference: string) => apiRequest<Order>(`/orders/${reference}/status`),
  getMyOrders: () => apiRequest<Order[]>('/orders/user/my-orders'),
};

export const paymentService = {
  createPaymentSession: (orderReference: string) =>
    apiRequest<{
      order_reference: string;
      payment_session_id: string;
      cashfree_order_id: string;
      amount: number;
      currency: string;
      environment: string;
    }>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ order_reference: orderReference }),
    }),
  verifyPaymentStatus: (orderReference: string) =>
    apiRequest<{
      order_reference: string;
      status: string;
      order_status: string;
      is_paid: boolean;
      message: string;
    }>(`/payments/${orderReference}/status`),
  verifySandboxPayment: (orderReference: string) =>
    apiRequest<{
      success: boolean;
      order_reference: string;
      status: string;
      order_status: string;
      message: string;
    }>('/payments/verify-sandbox', {
      method: 'POST',
      body: JSON.stringify({ order_reference: orderReference }),
    }),
};

export const reservationService = {
  checkAvailability: (date: string, time: string, guests: number) => {
    const q = new URLSearchParams({ date, time, guests: String(guests) });
    return apiRequest<{
      date: string;
      time: string;
      requested_guests: number;
      is_available: boolean;
      remaining_capacity: number;
    }>(`/reservations/availability?${q.toString()}`);
  },
  bookReservation: (data: any) =>
    apiRequest<Reservation>('/reservations', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getReservation: (code: string) => apiRequest<Reservation>(`/reservations/${code}`),
  getMyReservations: () => apiRequest<Reservation[]>('/reservations/user/my-reservations'),
};

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    apiRequest<{ access_token: string; token_type: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    apiRequest<{ access_token: string; token_type: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => apiRequest<User>('/auth/me'),
  logout: () => apiRequest<{ message: string }>('/auth/logout', { method: 'POST' }),
  resetPassword: (data: { email: string; new_password: string }) =>
    apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const adminService = {
  getDashboard: () => apiRequest<DashboardStats>('/admin/dashboard'),
  // Menu items
  getMenuItems: () => apiRequest<MenuItem[]>('/admin/menu/items'),
  createMenuItem: (dish: any) =>
    apiRequest<MenuItem>('/admin/menu/items', {
      method: 'POST',
      body: JSON.stringify(dish),
    }),
  updateMenuItem: (id: number, dish: any) =>
    apiRequest<MenuItem>(`/admin/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dish),
    }),
  deleteMenuItem: (id: number) =>
    apiRequest<{ message: string }>(`/admin/menu/items/${id}`, {
      method: 'DELETE',
    }),
  // Categories
  getCategories: () => apiRequest<Category[]>('/admin/categories'),
  createCategory: (cat: any) =>
    apiRequest<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    }),
  updateCategory: (id: number, cat: any) =>
    apiRequest<Category>(`/admin/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cat),
    }),
  deleteCategory: (id: number) =>
    apiRequest<{ message: string }>(`/admin/categories/${id}`, {
      method: 'DELETE',
    }),
  // Tables
  getTables: () => apiRequest<RestaurantTable[]>('/admin/tables'),
  createTable: (table: any) =>
    apiRequest<RestaurantTable>('/admin/tables', {
      method: 'POST',
      body: JSON.stringify(table),
    }),
  updateTable: (id: number, table: any) =>
    apiRequest<RestaurantTable>(`/admin/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(table),
    }),
  regenerateQr: (id: number) =>
    apiRequest<RestaurantTable>(`/admin/tables/${id}/generate-qr`, {
      method: 'POST',
    }),
  // Orders
  getOrders: (params?: { status?: string; order_type?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.status) q.set('status', params.status);
    if (params?.order_type) q.set('order_type', params.order_type);
    if (params?.search) q.set('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<Order[]>(`/admin/orders${qs}`);
  },
  updateOrderStatus: (orderId: number, status: string) =>
    apiRequest<Order>(`/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  // Reservations
  getReservations: () => apiRequest<Reservation[]>('/admin/reservations'),
  updateReservation: (id: number, data: any) =>
    apiRequest<Reservation>(`/admin/reservations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  // Payments & Refunds
  getPayments: () => apiRequest<any[]>('/admin/payments'),
  initiateRefund: (paymentId: number, amount: number, reason?: string) =>
    apiRequest<any>(`/admin/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ amount, reason }),
    }),
  // CMS Content
  getWebsiteContent: () => apiRequest<any[]>('/admin/website-content'),
  updateWebsiteContent: (sectionKey: string, data: any) =>
    apiRequest<any>(`/admin/website-content/${sectionKey}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  // Settings
  getSettings: () => apiRequest<any[]>('/admin/settings'),
  updateSettingsBatch: (settingsDict: Record<string, string>) =>
    apiRequest<{ message: string }>('/admin/settings/batch', {
      method: 'POST',
      body: JSON.stringify(settingsDict),
    }),
  // Promotions
  getPromotions: () => apiRequest<Promotion[]>('/admin/promotions'),
  createPromotion: (promo: any) =>
    apiRequest<Promotion>('/admin/promotions', {
      method: 'POST',
      body: JSON.stringify(promo),
    }),
  deletePromotion: (id: number) =>
    apiRequest<{ message: string }>(`/admin/promotions/${id}`, {
      method: 'DELETE',
    }),
  // Gallery
  getGallery: () => apiRequest<GalleryImage[]>('/admin/gallery'),
  addGalleryImage: (img: any) =>
    apiRequest<GalleryImage>('/admin/gallery', {
      method: 'POST',
      body: JSON.stringify(img),
    }),
  deleteGalleryImage: (id: number) =>
    apiRequest<{ message: string }>(`/admin/gallery/${id}`, {
      method: 'DELETE',
    }),
  // File Upload
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest<{ url: string; filename: string }>('/admin/upload-image', {
      method: 'POST',
      body: formData,
    });
  },
  getSalesCsvUrl: () => '/api/admin/reports/sales-csv',
};
