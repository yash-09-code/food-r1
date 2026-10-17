import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.models import MenuItem, MenuItemVariant, MenuItemAddon, RestaurantTable, Order, OrderItem, Promotion, RestaurantSetting
from backend.schemas.schemas import OrderCreate

def generate_order_reference() -> str:
    now_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"ORD-{now_str}-{short_uuid}"

def calculate_and_create_order(db: Session, order_in: OrderCreate, user_id: int = None) -> Order:
    if not order_in.items:
        raise HTTPException(status_code=400, detail="Cannot place an empty order")

    # 1. Validate Table if Dine-In
    table_id = None
    table_snapshot = None
    if order_in.order_type == "dine_in":
        if not order_in.table_number:
            raise HTTPException(status_code=400, detail="Table number is required for dine-in orders")
        table = db.query(RestaurantTable).filter(
            RestaurantTable.table_number == order_in.table_number.upper(),
            RestaurantTable.is_active == True
        ).first()
        if not table:
            raise HTTPException(status_code=400, detail=f"Table {order_in.table_number} is invalid or inactive")
        table_id = table.id
        table_snapshot = table.table_number

    # 2. Fetch Restaurant Settings for fees and taxes
    settings_rows = db.query(RestaurantSetting).all()
    config = {s.key: s.value for s in settings_rows}

    tax_rate = float(config.get("tax_rate_percent", 5.0)) / 100.0  # 5% GST standard
    packaging_fee_rate = float(config.get("packaging_fee", 25.0)) if order_in.order_type in ["pickup", "delivery"] else 0.0
    delivery_fee_rate = float(config.get("delivery_fee", 40.0)) if order_in.order_type == "delivery" else 0.0
    service_fee_rate = float(config.get("service_fee", 0.0)) if order_in.order_type == "dine_in" else 0.0

    # 3. Calculate Cart Items safely from DB
    subtotal = 0.0
    prepared_items = []

    for item_in in order_in.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == item_in.menu_item_id,
            MenuItem.is_available == True
        ).first()
        if not menu_item:
            raise HTTPException(status_code=400, detail=f"Menu item #{item_in.menu_item_id} is unavailable or does not exist")

        unit_price = menu_item.base_price

        # Variant calculation
        variant_name = None
        if item_in.variant_name:
            variant = db.query(MenuItemVariant).filter(
                MenuItemVariant.menu_item_id == menu_item.id,
                MenuItemVariant.name == item_in.variant_name
            ).first()
            if variant:
                unit_price += variant.price_adjustment
                variant_name = variant.name

        # Add-ons calculation
        addons_summary_list = []
        if item_in.addons:
            for addon_name in item_in.addons:
                addon = db.query(MenuItemAddon).filter(
                    MenuItemAddon.menu_item_id == menu_item.id,
                    MenuItemAddon.name == addon_name
                ).first()
                if addon:
                    unit_price += addon.price
                    addons_summary_list.append(addon.name)

        qty = max(1, item_in.quantity)
        item_subtotal = round(unit_price * qty, 2)
        subtotal += item_subtotal

        prepared_items.append({
            "menu_item_id": menu_item.id,
            "item_name": menu_item.name,
            "variant_name": variant_name,
            "addons_summary": ", ".join(addons_summary_list) if addons_summary_list else None,
            "unit_price": unit_price,
            "quantity": qty,
            "subtotal_price": item_subtotal,
        })

    subtotal = round(subtotal, 2)

    # 4. Check Coupon / Discount
    discount = 0.0
    if order_in.coupon_code:
        promo = db.query(Promotion).filter(
            Promotion.code == order_in.coupon_code.upper(),
            Promotion.is_active == True
        ).first()
        if promo and subtotal >= promo.min_order_amount:
            if promo.discount_type == "percentage":
                discount = round((subtotal * promo.discount_value) / 100.0, 2)
            else:
                discount = min(subtotal, round(promo.discount_value, 2))

    taxable_amount = max(0.0, subtotal - discount)
    tax_amount = round(taxable_amount * tax_rate, 2)
    service_fee = round(service_fee_rate, 2)
    packaging_fee = round(packaging_fee_rate, 2)
    delivery_fee = round(delivery_fee_rate, 2)

    total_amount = round(taxable_amount + tax_amount + service_fee + packaging_fee + delivery_fee, 2)

    # 5. Create Order record in DB
    order_ref = generate_order_reference()
    new_order = Order(
        order_reference=order_ref,
        user_id=user_id,
        customer_name=order_in.customer_name,
        customer_phone=order_in.customer_phone,
        customer_email=order_in.customer_email,
        order_type=order_in.order_type,
        table_id=table_id,
        table_number_snapshot=table_snapshot,
        delivery_address=order_in.delivery_address,
        special_instructions=order_in.special_instructions,
        subtotal=subtotal,
        discount=discount,
        tax_amount=tax_amount,
        service_fee=service_fee,
        packaging_fee=packaging_fee,
        delivery_fee=delivery_fee,
        total_amount=total_amount,
        status="PENDING_PAYMENT",
        payment_status="PENDING"
    )
    db.add(new_order)
    db.flush()

    # 6. Add order items
    for item_data in prepared_items:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)

    db.commit()
    db.refresh(new_order)
    return new_order
