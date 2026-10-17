from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# --- Auth Schemas ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    phone: Optional[str] = None
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

class PasswordReset(BaseModel):
    email: EmailStr
    new_password: str = Field(..., min_length=6)

# --- Settings & Content ---
class SettingOut(BaseModel):
    key: str
    value: str
    description: Optional[str] = None

class SettingUpdate(BaseModel):
    value: str

class WebsiteContentOut(BaseModel):
    id: int
    section_key: str
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    button_text: Optional[str] = None
    button_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

    class Config:
        from_attributes = True

class WebsiteContentUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    button_text: Optional[str] = None
    button_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

# --- Category & Menu ---
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: int = 0
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None

class CategoryOut(CategoryBase):
    id: int

    class Config:
        from_attributes = True

class VariantBase(BaseModel):
    name: str
    price_adjustment: float = 0.0

class VariantOut(VariantBase):
    id: int

    class Config:
        from_attributes = True

class AddonBase(BaseModel):
    name: str
    price: float = 0.0

class AddonOut(AddonBase):
    id: int

    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    category_id: int
    name: str
    slug: str
    description: Optional[str] = None
    base_price: float
    image_url: Optional[str] = None
    is_veg: bool = True
    is_vegan: bool = False
    is_gluten_free: bool = False
    spice_level: int = 0
    preparation_time: int = 20
    is_featured: bool = False
    is_bestseller: bool = False
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    variants: Optional[List[VariantBase]] = []
    addons: Optional[List[AddonBase]] = []

class MenuItemUpdate(BaseModel):
    category_id: Optional[int] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[float] = None
    image_url: Optional[str] = None
    is_veg: Optional[bool] = None
    is_vegan: Optional[bool] = None
    is_gluten_free: Optional[bool] = None
    spice_level: Optional[int] = None
    preparation_time: Optional[int] = None
    is_featured: Optional[bool] = None
    is_bestseller: Optional[bool] = None
    is_available: Optional[bool] = None
    variants: Optional[List[VariantBase]] = None
    addons: Optional[List[AddonBase]] = None

class MenuItemOut(MenuItemBase):
    id: int
    category: Optional[CategoryOut] = None
    variants: List[VariantOut] = []
    addons: List[AddonOut] = []

    class Config:
        from_attributes = True

# --- Table & QR ---
class TableCreate(BaseModel):
    table_number: str
    capacity: int = 4
    location_tag: str = "Main Dining"
    is_active: bool = True

class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    capacity: Optional[int] = None
    location_tag: Optional[str] = None
    is_active: Optional[bool] = None

class TableOut(BaseModel):
    id: int
    table_number: str
    capacity: int
    location_tag: str
    qr_code_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class TableValidateRequest(BaseModel):
    table_number: str

class TableValidateResponse(BaseModel):
    valid: bool
    message: str
    table: Optional[TableOut] = None

# --- Orders & Checkout ---
class OrderItemIn(BaseModel):
    menu_item_id: int
    variant_name: Optional[str] = None
    addons: Optional[List[str]] = []
    quantity: int = 1

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    order_type: str = "dine_in"  # dine_in, pickup, delivery
    table_number: Optional[str] = None
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    coupon_code: Optional[str] = None
    items: List[OrderItemIn]

class OrderItemOut(BaseModel):
    id: int
    menu_item_id: Optional[int] = None
    item_name: str
    variant_name: Optional[str] = None
    addons_summary: Optional[str] = None
    unit_price: float
    quantity: int
    subtotal_price: float

    class Config:
        from_attributes = True

class OrderOut(BaseModel):
    id: int
    order_reference: str
    customer_name: str
    customer_phone: str
    customer_email: Optional[str] = None
    order_type: str
    table_id: Optional[int] = None
    table_number_snapshot: Optional[str] = None
    delivery_address: Optional[str] = None
    special_instructions: Optional[str] = None
    subtotal: float
    discount: float
    tax_amount: float
    service_fee: float
    packaging_fee: float
    delivery_fee: float
    total_amount: float
    status: str
    payment_status: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[OrderItemOut] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: str

# --- Payments ---
class PaymentSessionCreate(BaseModel):
    order_reference: str

class PaymentSessionOut(BaseModel):
    order_reference: str
    payment_session_id: str
    cashfree_order_id: str
    amount: float
    currency: str
    environment: str

class RefundCreate(BaseModel):
    amount: float
    reason: Optional[str] = None

# --- Reservations ---
class ReservationCreate(BaseModel):
    guest_name: str
    guest_email: EmailStr
    guest_phone: str
    reservation_date: str  # YYYY-MM-DD
    reservation_time: str  # HH:MM
    guest_count: int = 2
    seating_preference: Optional[str] = "Indoor Dining"
    special_requests: Optional[str] = None

class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None
    reservation_date: Optional[str] = None
    reservation_time: Optional[str] = None
    guest_count: Optional[int] = None

class ReservationOut(BaseModel):
    id: int
    reservation_code: str
    guest_name: str
    guest_email: str
    guest_phone: str
    reservation_date: str
    reservation_time: str
    guest_count: int
    seating_preference: str
    special_requests: Optional[str] = None
    status: str
    admin_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# --- Promotions, Gallery, Testimonials ---
class PromotionCreate(BaseModel):
    code: str
    description: Optional[str] = None
    discount_type: str = "percentage"
    discount_value: float
    min_order_amount: float = 0.0
    is_active: bool = True

class PromotionOut(PromotionCreate):
    id: int

    class Config:
        from_attributes = True

class GalleryImageCreate(BaseModel):
    title: str
    category: str = "Ambience"
    image_url: str
    display_order: int = 0
    is_active: bool = True

class GalleryImageOut(GalleryImageCreate):
    id: int

    class Config:
        from_attributes = True

class TestimonialCreate(BaseModel):
    customer_name: str
    customer_title: Optional[str] = "Epicurean Guest"
    rating: int = 5
    comment: str
    avatar_url: Optional[str] = None

class TestimonialOut(TestimonialCreate):
    id: int
    is_approved: bool
    display_order: int

    class Config:
        from_attributes = True

class DashboardStatsOut(BaseModel):
    total_orders: int
    today_orders: int
    total_revenue: float
    today_revenue: float
    pending_orders: int
    active_tables_count: int
    upcoming_reservations: int
    bestsellers: List[dict]
