export interface Variant {
  id?: number;
  name: string;
  price_adjustment: number;
}

export interface Addon {
  id?: number;
  name: string;
  price: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export interface MenuItem {
  id: number;
  category_id: number;
  category?: Category;
  name: string;
  slug: string;
  description: string;
  base_price: number;
  image_url?: string;
  is_veg: boolean;
  is_vegan?: boolean;
  is_gluten_free?: boolean;
  spice_level: number;
  preparation_time: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_available: boolean;
  variants: Variant[];
  addons: Addon[];
}

export interface CartItem {
  id: string; // unique cart line id (dishId + variant + addons)
  menu_item_id: number;
  name: string;
  image_url?: string;
  variant?: Variant;
  addons: Addon[];
  unit_price: number;
  quantity: number;
  subtotal: number;
}

export interface RestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  location_tag: string;
  qr_code_url?: string;
  is_active: boolean;
}

export interface OrderItem {
  id: number;
  menu_item_id?: number;
  item_name: string;
  variant_name?: string;
  addons_summary?: string;
  unit_price: number;
  quantity: number;
  subtotal_price: number;
}

export interface Order {
  id: number;
  order_reference: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  order_type: 'dine_in' | 'pickup' | 'delivery';
  table_id?: number;
  table_number_snapshot?: string;
  delivery_address?: string;
  special_instructions?: string;
  subtotal: number;
  discount: number;
  tax_amount: number;
  service_fee: number;
  packaging_fee: number;
  delivery_fee: number;
  total_amount: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'ACCEPTED' | 'PREPARING' | 'READY' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  payment_status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
}

export interface Reservation {
  id: number;
  reservation_code: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  reservation_date: string;
  reservation_time: string;
  guest_count: number;
  seating_preference: string;
  special_requests?: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED' | 'CANCELLED';
  admin_notes?: string;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'admin' | 'staff' | 'customer';
  is_active: boolean;
}

export interface Promotion {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  is_active: boolean;
}

export interface GalleryImage {
  id: number;
  title: string;
  category: string;
  image_url: string;
  display_order: number;
  is_active: boolean;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  customer_title?: string;
  rating: number;
  comment: string;
  avatar_url?: string;
}

export interface DashboardStats {
  total_orders: number;
  today_orders: number;
  total_revenue: number;
  today_revenue: number;
  pending_orders: number;
  active_tables_count: number;
  upcoming_reservations: number;
  bestsellers: { name: string; sold: number; sales: number }[];
}
