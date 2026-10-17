from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.database import get_db
from backend.models.models import WebsiteContent, RestaurantSetting, Testimonial, GalleryImage, Promotion
from backend.schemas.schemas import TestimonialOut, GalleryImageOut, PromotionOut

router = APIRouter(prefix="/api/public", tags=["Public Website"])

@router.get("/website")
def get_website_content(db: Session = Depends(get_db)) -> Dict[str, Any]:
    contents = db.query(WebsiteContent).filter(WebsiteContent.is_active == True).order_by(WebsiteContent.display_order).all()
    result = {}
    for c in contents:
        result[c.section_key] = {
            "title": c.title,
            "subtitle": c.subtitle,
            "content": c.content,
            "image_url": c.image_url,
            "button_text": c.button_text,
            "button_url": c.button_url,
        }
    return result

@router.get("/settings")
def get_public_settings(db: Session = Depends(get_db)) -> Dict[str, str]:
    settings = db.query(RestaurantSetting).all()
    # Return key-value pairs
    return {s.key: s.value for s in settings}

@router.get("/location")
def get_location_info(db: Session = Depends(get_db)):
    settings_rows = db.query(RestaurantSetting).all()
    cfg = {s.key: s.value for s in settings_rows}
    return {
        "restaurant_name": cfg.get("restaurant_name", "Saffron & Sage Fine Dining"),
        "address": cfg.get("address", "Plot 42, Heritage Boulevard, Indiranagar, Bengaluru, Karnataka 560038"),
        "phone": cfg.get("phone", "+91 80 4965 2100"),
        "email": cfg.get("email", "reservations@saffronsage.in"),
        "latitude": cfg.get("latitude", "12.9716"),
        "longitude": cfg.get("longitude", "77.6412"),
        "map_embed_url": cfg.get("map_embed_url", "https://maps.google.com/maps?q=12.9716,77.6412&hl=en&z=15&output=embed"),
        "opening_hours": cfg.get("opening_hours", "Mon - Sun: 12:00 PM – 11:30 PM"),
        "weekly_holidays": cfg.get("weekly_holidays", "None (Open 7 Days)"),
        "temporary_closure_notice": cfg.get("temporary_closure_notice", ""),
    }

@router.get("/testimonials", response_model=List[TestimonialOut])
def get_testimonials(db: Session = Depends(get_db)):
    return db.query(Testimonial).filter(Testimonial.is_approved == True).order_by(Testimonial.display_order).all()

@router.get("/gallery", response_model=List[GalleryImageOut])
def get_gallery(db: Session = Depends(get_db)):
    return db.query(GalleryImage).filter(GalleryImage.is_active == True).order_by(GalleryImage.display_order).all()

@router.get("/promotions", response_model=List[PromotionOut])
def get_active_promotions(db: Session = Depends(get_db)):
    return db.query(Promotion).filter(Promotion.is_active == True).all()
