from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, Float, String, Boolean, Text, DateTime, ForeignKey, Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from backend.database import Base

def utcnow():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    role = Column(String(50), default="customer")  # admin, staff, customer
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    orders = relationship("Order", back_populates="user")

class RestaurantSetting(Base):
    __tablename__ = "restaurant_settings"

    key = Column(String(100), primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class WebsiteContent(Base):
    __tablename__ = "website_content"

    id = Column(Integer, primary_key=True, index=True)
    section_key = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=True)
    subtitle = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    button_text = Column(String(100), nullable=True)
    button_url = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Float, nullable=False)  # In INR
    image_url = Column(String(500), nullable=True)
    is_veg = Column(Boolean, default=True)
    is_vegan = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    spice_level = Column(Integer, default=0)  # 0: Mild, 1: Medium, 2: Hot, 3: Extra Hot
    preparation_time = Column(Integer, default=20)  # Minutes
    is_featured = Column(Boolean, default=False)
    is_bestseller = Column(Boolean, default=False)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    category = relationship("Category", back_populates="items")
    variants = relationship("MenuItemVariant", back_populates="menu_item", cascade="all, delete-orphan")
    addons = relationship("MenuItemAddon", back_populates="menu_item", cascade="all, delete-orphan")

class MenuItemVariant(Base):
    __tablename__ = "menu_item_variants"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g., Regular, Large, Full, Half
    price_adjustment = Column(Float, default=0.0)  # Added to base_price

    menu_item = relationship("MenuItem", back_populates="variants")

class MenuItemAddon(Base):
    __tablename__ = "menu_item_addons"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    name = Column(String(100), nullable=False)  # e.g. Extra Truffle Butter, Burrata
    price = Column(Float, default=0.0)

    menu_item = relationship("MenuItem", back_populates="addons")

class RestaurantTable(Base):
    __tablename__ = "restaurant_tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String(50), unique=True, index=True, nullable=False)  # e.g., T01, T05
    capacity = Column(Integer, default=4)
    location_tag = Column(String(100), default="Main Dining")  # Terrace, Garden, Main Dining, Private Lounge
    qr_code_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

    orders = relationship("Order", back_populates="table")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_reference = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    customer_email = Column(String(255), nullable=True)
    order_type = Column(String(50), default="dine_in")  # dine_in, pickup, delivery
    table_id = Column(Integer, ForeignKey("restaurant_tables.id"), nullable=True)
    table_number_snapshot = Column(String(50), nullable=True)
    delivery_address = Column(Text, nullable=True)
    special_instructions = Column(Text, nullable=True)

    # Billing snapshots (calculated on backend)
    subtotal = Column(Float, default=0.0)
    discount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    service_fee = Column(Float, default=0.0)
    packaging_fee = Column(Float, default=0.0)
    delivery_fee = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)

    # Statuses
    # PENDING_PAYMENT -> CONFIRMED -> ACCEPTED -> PREPARING -> READY -> SERVED / COMPLETED / CANCELLED
    status = Column(String(50), default="PENDING_PAYMENT", index=True)
    payment_status = Column(String(50), default="PENDING", index=True)  # PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    user = relationship("User", back_populates="orders")
    table = relationship("RestaurantTable", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, nullable=True)
    item_name = Column(String(255), nullable=False)
    variant_name = Column(String(100), nullable=True)
    addons_summary = Column(Text, nullable=True)
    unit_price = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    subtotal_price = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    cashfree_order_id = Column(String(100), unique=True, index=True, nullable=False)
    cashfree_payment_id = Column(String(100), nullable=True)
    payment_session_id = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="PENDING")  # PENDING, SUCCESS, FAILED, CANCELLED, REFUNDED
    payment_method = Column(String(100), nullable=True)
    raw_response = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    order = relationship("Order", back_populates="payments")
    refunds = relationship("Refund", back_populates="payment", cascade="all, delete-orphan")

class Refund(Base):
    __tablename__ = "refunds"

    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    order_id = Column(Integer, nullable=False)
    refund_id = Column(String(100), unique=True, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="SUCCESS")
    reason = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    payment = relationship("Payment", back_populates="refunds")

class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(Integer, primary_key=True, index=True)
    reservation_code = Column(String(100), unique=True, index=True, nullable=False)
    guest_name = Column(String(255), nullable=False)
    guest_email = Column(String(255), nullable=False)
    guest_phone = Column(String(50), nullable=False)
    reservation_date = Column(String(20), nullable=False)  # YYYY-MM-DD
    reservation_time = Column(String(20), nullable=False)  # HH:MM
    guest_count = Column(Integer, default=2)
    seating_preference = Column(String(100), default="Indoor Dining")
    special_requests = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING")  # PENDING, CONFIRMED, REJECTED, COMPLETED, CANCELLED
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow)

class Promotion(Base):
    __tablename__ = "promotions"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(50), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    discount_type = Column(String(20), default="percentage")  # percentage or fixed
    discount_value = Column(Float, nullable=False)
    min_order_amount = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)

class GalleryImage(Base):
    __tablename__ = "gallery_images"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    category = Column(String(100), default="Ambience")  # Ambience, Dishes, Cocktails, Chef
    image_url = Column(String(500), nullable=False)
    display_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

class Testimonial(Base):
    __tablename__ = "testimonials"

    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_title = Column(String(255), default="Epicurean Guest")
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_approved = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utcnow)
