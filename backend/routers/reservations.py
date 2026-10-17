import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.database import get_db
from backend.models.models import Reservation, User, RestaurantSetting
from backend.schemas.schemas import ReservationCreate, ReservationOut
from backend.routers.auth import get_current_user

router = APIRouter(prefix="/api/reservations", tags=["Reservations"])

def generate_reservation_code() -> str:
    now_str = datetime.now().strftime("%Y%m%d")
    short_uuid = uuid.uuid4().hex[:6].upper()
    return f"RES-{now_str}-{short_uuid}"

@router.get("/availability")
def check_availability(date: str, time: str, guests: int, db: Session = Depends(get_db)):
    """
    Check if a slot is available on the specified date & time.
    """
    # Fetch max bookings allowed per time slot
    max_slot_guests = 40  # Maximum dining capacity per time slot

    active_bookings = db.query(Reservation).filter(
        Reservation.reservation_date == date,
        Reservation.reservation_time == time,
        Reservation.status.in_(["PENDING", "CONFIRMED"])
    ).all()

    total_booked_guests = sum(b.guest_count for b in active_bookings)
    available_seats = max(0, max_slot_guests - total_booked_guests)

    return {
        "date": date,
        "time": time,
        "requested_guests": guests,
        "is_available": available_seats >= guests,
        "remaining_capacity": available_seats
    }

@router.post("", response_model=ReservationOut)
def book_reservation(
    res_in: ReservationCreate,
    db: Session = Depends(get_db)
):
    # Validate party size
    if res_in.guest_count < 1 or res_in.guest_count > 20:
        raise HTTPException(status_code=400, detail="Party size must be between 1 and 20 guests. For larger events, please contact us directly.")

    # Check capacity
    active_bookings = db.query(Reservation).filter(
        Reservation.reservation_date == res_in.reservation_date,
        Reservation.reservation_time == res_in.reservation_time,
        Reservation.status.in_(["PENDING", "CONFIRMED"])
    ).all()

    booked = sum(b.guest_count for b in active_bookings)
    if booked + res_in.guest_count > 40:
        raise HTTPException(status_code=400, detail=f"Sorry, our dining room is fully committed at {res_in.reservation_time} on {res_in.reservation_date}. Please choose another time.")

    res_code = generate_reservation_code()
    reservation = Reservation(
        reservation_code=res_code,
        guest_name=res_in.guest_name,
        guest_email=res_in.guest_email.lower(),
        guest_phone=res_in.guest_phone,
        reservation_date=res_in.reservation_date,
        reservation_time=res_in.reservation_time,
        guest_count=res_in.guest_count,
        seating_preference=res_in.seating_preference or "Indoor Dining",
        special_requests=res_in.special_requests,
        status="CONFIRMED"  # Auto-confirm with verified availability
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation

@router.get("/{code}", response_model=ReservationOut)
def get_reservation(code: str, db: Session = Depends(get_db)):
    res = db.query(Reservation).filter(Reservation.reservation_code == code.strip().upper()).first()
    if not res:
        raise HTTPException(status_code=404, detail="Reservation not found")
    return res

@router.get("/user/my-reservations", response_model=List[ReservationOut])
def get_user_reservations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    return db.query(Reservation).filter(
        Reservation.guest_email == current_user.email.lower()
    ).order_by(Reservation.created_at.desc()).all()
