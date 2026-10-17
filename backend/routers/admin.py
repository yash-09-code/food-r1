import os
import uuid
import csv
import io
from datetime import datetime, timezone, date
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from typing import List, Optional, Dict, Any

from backend.database import get_db
from backend.models.models import (
    User, RestaurantSetting, WebsiteContent, Category, MenuItem,
    MenuItemVariant, MenuItemAddon, RestaurantTable, Order, OrderItem,
    Payment, Refund, Reservation, Promotion, GalleryImage, Testimonial, AuditLog
)
from backend.schemas.schemas import (
    UserOut, CategoryCreate, CategoryUpdate, CategoryOut,
    MenuItemCreate, MenuItemUpdate, MenuItemOut, TableCreate, TableUpdate, TableOut,
    OrderOut, OrderStatusUpdate, ReservationUpdate, ReservationOut,
    PromotionCreate, PromotionOut, GalleryImageCreate, GalleryImageOut,
    WebsiteContentUpdate, DashboardStatsOut, RefundCreate
)
from backend.routers.auth import require_admin
from backend.services.qr_service import generate_table_qr
from backend.services.cashfree_service import cashfree_service
from backend.core.config import settings

router = APIRouter(prefix="/api/admin", tags=["Admin Dashboard"], dependencies=[Depends(require_admin)])

def log_audit(db: Session, email: str, action: str, details: str):
    log = AuditLog(user_email=email, action=action, details=details)
    db.add(log)
    db.commit()

# --- Dashboard Stats ---
@router.get("/dashboard", response_model=DashboardStatsOut)
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_orders = db.query(Order).count()
    
    # Today's orders
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    today_orders = db.query(Order).filter(Order.created_at >= today_start).count()

    # Revenue from verified payments
    total_revenue_val = db.query(func.sum(Order.total_amount)).filter(Order.payment_status == "SUCCESS").scalar() or 0.0
    today_revenue_val = db.query(func.sum(Order.total_amount)).filter(
        Order.payment_status == "SUCCESS",
        Order.created_at >= today_start
    ).scalar() or 0.0

    pending_orders = db.query(Order).filter(Order.status.in_(["PENDING_PAYMENT", "CONFIRMED", "ACCEPTED", "PREPARING"])).count()
    active_tables_count = db.query(RestaurantTable).filter(RestaurantTable.is_active == True).count()
    upcoming_reservations = db.query(Reservation).filter(Reservation.status.in_(["PENDING", "CONFIRMED"])).count()

    # Bestselling dishes
    bestsellers_rows = db.query(
        OrderItem.item_name,
        func.sum(OrderItem.quantity).label("sold_count"),
        func.sum(OrderItem.subtotal_price).label("total_sales")
    ).group_by(OrderItem.item_name).order_by(func.sum(OrderItem.quantity).desc()).limit(5).all()

    bestsellers = [
        {"name": row[0], "sold": int(row[1]), "sales": float(row[2])}
        for row in bestsellers_rows
    ]

    return DashboardStatsOut(
        total_orders=total_orders,
        today_orders=today_orders,
        total_revenue=round(total_revenue_val, 2),
        today_revenue=round(today_revenue_val, 2),
        pending_orders=pending_orders,
        active_tables_count=active_tables_count,
        upcoming_reservations=upcoming_reservations,
        bestsellers=bestsellers
    )

# --- Menu Management ---
@router.get("/menu/items", response_model=List[MenuItemOut])
def get_all_menu_items(db: Session = Depends(get_db)):
    return db.query(MenuItem).options(
        joinedload(MenuItem.category),
        joinedload(MenuItem.variants),
        joinedload(MenuItem.addons)
    ).order_by(MenuItem.id.desc()).all()

@router.post("/menu/items", response_model=MenuItemOut)
def create_menu_item(item_in: MenuItemCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    dish = MenuItem(
        category_id=item_in.category_id,
        name=item_in.name,
        slug=item_in.slug.lower(),
        description=item_in.description,
        base_price=item_in.base_price,
        image_url=item_in.image_url,
        is_veg=item_in.is_veg,
        is_vegan=item_in.is_vegan,
        is_gluten_free=item_in.is_gluten_free,
        spice_level=item_in.spice_level,
        preparation_time=item_in.preparation_time,
        is_featured=item_in.is_featured,
        is_bestseller=item_in.is_bestseller,
        is_available=item_in.is_available
    )
    db.add(dish)
    db.flush()

    if item_in.variants:
        for v in item_in.variants:
            db.add(MenuItemVariant(menu_item_id=dish.id, name=v.name, price_adjustment=v.price_adjustment))

    if item_in.addons:
        for a in item_in.addons:
            db.add(MenuItemAddon(menu_item_id=dish.id, name=a.name, price=a.price))

    db.commit()
    db.refresh(dish)
    log_audit(db, admin.email, "CREATE_MENU_ITEM", f"Created dish {dish.name} (#{dish.id})")
    return dish

@router.put("/menu/items/{item_id}", response_model=MenuItemOut)
def update_menu_item(item_id: int, item_in: MenuItemUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    dish = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")

    update_data = item_in.dict(exclude_unset=True)
    variants_data = update_data.pop("variants", None)
    addons_data = update_data.pop("addons", None)

    for field, val in update_data.items():
        setattr(dish, field, val)

    if variants_data is not None:
        db.query(MenuItemVariant).filter(MenuItemVariant.menu_item_id == dish.id).delete()
        for v in variants_data:
            db.add(MenuItemVariant(menu_item_id=dish.id, name=v["name"], price_adjustment=v.get("price_adjustment", 0.0)))

    if addons_data is not None:
        db.query(MenuItemAddon).filter(MenuItemAddon.menu_item_id == dish.id).delete()
        for a in addons_data:
            db.add(MenuItemAddon(menu_item_id=dish.id, name=a["name"], price=a.get("price", 0.0)))

    db.commit()
    db.refresh(dish)
    log_audit(db, admin.email, "UPDATE_MENU_ITEM", f"Updated dish {dish.name} (#{dish.id})")
    return dish

@router.delete("/menu/items/{item_id}")
def delete_menu_item(item_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    dish = db.query(MenuItem).filter(MenuItem.id == item_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    name = dish.name
    db.delete(dish)
    db.commit()
    log_audit(db, admin.email, "DELETE_MENU_ITEM", f"Deleted dish {name} (#{item_id})")
    return {"message": f"Dish '{name}' deleted successfully"}

# --- Categories ---
@router.get("/categories", response_model=List[CategoryOut])
def get_all_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.display_order).all()

@router.post("/categories", response_model=CategoryOut)
def create_category(cat_in: CategoryCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    cat = Category(**cat_in.dict())
    db.add(cat)
    db.commit()
    db.refresh(cat)
    log_audit(db, admin.email, "CREATE_CATEGORY", f"Created category {cat.name}")
    return cat

@router.put("/categories/{category_id}", response_model=CategoryOut)
def update_category(category_id: int, cat_in: CategoryUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for field, val in cat_in.dict(exclude_unset=True).items():
        setattr(cat, field, val)
    db.commit()
    db.refresh(cat)
    return cat

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    cat = db.query(Category).filter(Category.id == category_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted successfully"}

# --- Tables Management ---
@router.get("/tables", response_model=List[TableOut])
def get_all_tables(db: Session = Depends(get_db)):
    tables = db.query(RestaurantTable).order_by(RestaurantTable.table_number).all()
    # Ensure QR codes are generated
    for t in tables:
        if not t.qr_code_url:
            t.qr_code_url = generate_table_qr(t.table_number)
    db.commit()
    return tables

@router.post("/tables", response_model=TableOut)
def create_table(tbl_in: TableCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    clean_num = tbl_in.table_number.strip().upper()
    existing = db.query(RestaurantTable).filter(RestaurantTable.table_number == clean_num).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Table '{clean_num}' already exists")

    qr_url = generate_table_qr(clean_num)
    table = RestaurantTable(
        table_number=clean_num,
        capacity=tbl_in.capacity,
        location_tag=tbl_in.location_tag,
        qr_code_url=qr_url,
        is_active=tbl_in.is_active
    )
    db.add(table)
    db.commit()
    db.refresh(table)
    log_audit(db, admin.email, "CREATE_TABLE", f"Created table {table.table_number}")
    return table

@router.put("/tables/{table_id}", response_model=TableOut)
def update_table(table_id: int, tbl_in: TableUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    for field, val in tbl_in.dict(exclude_unset=True).items():
        setattr(table, field, val)

    if tbl_in.table_number:
        table.table_number = tbl_in.table_number.strip().upper()
        table.qr_code_url = generate_table_qr(table.table_number)

    db.commit()
    db.refresh(table)
    return table

@router.post("/tables/{table_id}/generate-qr", response_model=TableOut)
def regenerate_table_qr(table_id: int, db: Session = Depends(get_db)):
    table = db.query(RestaurantTable).filter(RestaurantTable.id == table_id).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    table.qr_code_url = generate_table_qr(table.table_number)
    db.commit()
    db.refresh(table)
    return table

# --- Orders Management ---
@router.get("/orders", response_model=List[OrderOut])
def get_all_orders(
    status: Optional[str] = None,
    order_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order).options(joinedload(Order.items)).order_by(Order.created_at.desc())

    if status:
        query = query.filter(Order.status == status)
    if order_type:
        query = query.filter(Order.order_type == order_type)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Order.order_reference.ilike(s)) |
            (Order.customer_name.ilike(s)) |
            (Order.customer_phone.ilike(s)) |
            (Order.table_number_snapshot.ilike(s))
        )
    return query.all()

@router.patch("/orders/{order_id}/status", response_model=OrderOut)
def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    valid_statuses = ["PENDING_PAYMENT", "CONFIRMED", "ACCEPTED", "PREPARING", "READY", "SERVED", "COMPLETED", "CANCELLED"]
    new_status = status_update.status.upper()
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid order status. Must be one of: {valid_statuses}")

    old_status = order.status
    order.status = new_status
    db.commit()
    db.refresh(order)
    log_audit(db, admin.email, "UPDATE_ORDER_STATUS", f"Order {order.order_reference} status changed from {old_status} to {new_status}")
    return order

# --- Reservations Management ---
@router.get("/reservations", response_model=List[ReservationOut])
def get_all_reservations(db: Session = Depends(get_db)):
    return db.query(Reservation).order_by(Reservation.reservation_date.desc(), Reservation.reservation_time.desc()).all()

@router.patch("/reservations/{res_id}", response_model=ReservationOut)
def update_reservation(res_id: int, res_in: ReservationUpdate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    res = db.query(Reservation).filter(Reservation.id == res_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")

    for field, val in res_in.dict(exclude_unset=True).items():
        setattr(res, field, val)

    db.commit()
    db.refresh(res)
    log_audit(db, admin.email, "UPDATE_RESERVATION", f"Reservation {res.reservation_code} updated")
    return res

# --- Payments and Refunds ---
@router.get("/payments")
def get_all_payments(db: Session = Depends(get_db)):
    payments = db.query(Payment).order_by(Payment.created_at.desc()).all()
    result = []
    for p in payments:
        order = db.query(Order).filter(Order.id == p.order_id).first()
        result.append({
            "id": p.id,
            "order_id": p.order_id,
            "order_reference": order.order_reference if order else None,
            "customer_name": order.customer_name if order else "Unknown",
            "cashfree_order_id": p.cashfree_order_id,
            "cashfree_payment_id": p.cashfree_payment_id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "created_at": p.created_at,
        })
    return result

@router.post("/payments/{payment_id}/refund")
async def initiate_refund(payment_id: int, req: RefundCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if payment.status != "SUCCESS":
        raise HTTPException(status_code=400, detail="Cannot refund an unverified or unpaid transaction")

    order = db.query(Order).filter(Order.id == payment.order_id).first()
    refund_code = f"REF-{uuid.uuid4().hex[:8].upper()}"

    res = await cashfree_service.create_refund(
        order_reference=order.order_reference if order else payment.cashfree_order_id,
        refund_id=refund_code,
        amount=req.amount,
        reason=req.reason or "Admin authorized refund"
    )

    if not res.get("success"):
        raise HTTPException(status_code=502, detail=res.get("error", "Refund failed"))

    refund = Refund(
        payment_id=payment.id,
        order_id=payment.order_id,
        refund_id=refund_code,
        amount=req.amount,
        status="SUCCESS",
        reason=req.reason
    )
    db.add(refund)
    payment.status = "REFUNDED"
    if order:
        order.payment_status = "REFUNDED"
        order.status = "CANCELLED"
    db.commit()

    log_audit(db, admin.email, "REFUND_PAYMENT", f"Refund {refund_code} for payment #{payment_id} (INR {req.amount})")
    return {"message": "Refund processed successfully", "refund_id": refund_code}

# --- Website Content CMS ---
@router.get("/website-content")
def get_all_website_content(db: Session = Depends(get_db)):
    return db.query(WebsiteContent).order_by(WebsiteContent.display_order).all()

@router.put("/website-content/{section_key}")
def update_website_content(
    section_key: str,
    content_in: WebsiteContentUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    content = db.query(WebsiteContent).filter(WebsiteContent.section_key == section_key).first()
    if not content:
        content = WebsiteContent(section_key=section_key, title="", subtitle="", content="")
        db.add(content)

    for field, val in content_in.dict(exclude_unset=True).items():
        setattr(content, field, val)

    db.commit()
    db.refresh(content)
    log_audit(db, admin.email, "UPDATE_WEBSITE_CONTENT", f"Updated section {section_key}")
    return content

# --- Restaurant Settings ---
@router.get("/settings")
def get_all_settings(db: Session = Depends(get_db)):
    return db.query(RestaurantSetting).all()

@router.post("/settings/batch")
def update_settings_batch(
    settings_dict: Dict[str, str],
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    for key, val in settings_dict.items():
        existing = db.query(RestaurantSetting).filter(RestaurantSetting.key == key).first()
        if existing:
            existing.value = str(val)
        else:
            db.add(RestaurantSetting(key=key, value=str(val)))
    db.commit()
    log_audit(db, admin.email, "UPDATE_SETTINGS", f"Updated settings: {list(settings_dict.keys())}")
    return {"message": "Settings updated successfully"}

# --- Promotions & Gallery ---
@router.get("/promotions", response_model=List[PromotionOut])
def get_admin_promotions(db: Session = Depends(get_db)):
    return db.query(Promotion).all()

@router.post("/promotions", response_model=PromotionOut)
def create_promotion(promo_in: PromotionCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    code = promo_in.code.strip().upper()
    existing = db.query(Promotion).filter(Promotion.code == code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Promotion code already exists")
    promo = Promotion(
        code=code,
        description=promo_in.description,
        discount_type=promo_in.discount_type,
        discount_value=promo_in.discount_value,
        min_order_amount=promo_in.min_order_amount,
        is_active=promo_in.is_active
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo

@router.delete("/promotions/{promo_id}")
def delete_promotion(promo_id: int, db: Session = Depends(get_db)):
    promo = db.query(Promotion).filter(Promotion.id == promo_id).first()
    if promo:
        db.delete(promo)
        db.commit()
    return {"message": "Promotion deleted"}

@router.get("/gallery", response_model=List[GalleryImageOut])
def get_admin_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryImage).order_by(GalleryImage.display_order).all()

@router.post("/gallery", response_model=GalleryImageOut)
def add_gallery_image(g_in: GalleryImageCreate, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    img = GalleryImage(**g_in.dict())
    db.add(img)
    db.commit()
    db.refresh(img)
    return img

@router.delete("/gallery/{img_id}")
def delete_gallery_image(img_id: int, db: Session = Depends(get_db)):
    img = db.query(GalleryImage).filter(GalleryImage.id == img_id).first()
    if img:
        db.delete(img)
        db.commit()
    return {"message": "Gallery image deleted"}

# --- Image Upload ---
@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin: User = Depends(require_admin)):
    allowed_exts = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail="Invalid image file format. Allowed: JPG, PNG, WEBP, GIF")

    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    return {"url": f"/uploads/{unique_filename}", "filename": unique_filename}

# --- CSV Export Reports ---
@router.get("/reports/sales-csv")
def export_sales_csv(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Order Reference", "Date", "Customer Name", "Phone", "Order Type",
        "Table", "Subtotal (INR)", "Discount", "Tax", "Total Amount (INR)",
        "Order Status", "Payment Status"
    ])

    for o in orders:
        writer.writerow([
            o.order_reference,
            o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "",
            o.customer_name,
            o.customer_phone,
            o.order_type,
            o.table_number_snapshot or "-",
            o.subtotal,
            o.discount,
            o.tax_amount,
            o.total_amount,
            o.status,
            o.payment_status
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sales_report_{datetime.now().strftime('%Y%m%d')}.csv"}
    )
