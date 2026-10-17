from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from backend.database import get_db
from backend.models.models import Order, User
from backend.schemas.schemas import OrderCreate, OrderOut
from backend.services.order_service import calculate_and_create_order
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/orders", tags=["Orders"])

@router.post("", response_model=OrderOut)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    user_id = current_user.id if current_user else None
    order = calculate_and_create_order(db=db, order_in=order_in, user_id=user_id)
    return order

@router.get("/{reference}/status", response_model=OrderOut)
def get_order_status(reference: str, db: Session = Depends(get_db)):
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.order_reference == reference.strip().upper()).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

@router.get("/user/my-orders", response_model=List[OrderOut])
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    orders = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()
    return orders
