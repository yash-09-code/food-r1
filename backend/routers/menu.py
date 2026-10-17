from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from backend.database import get_db
from backend.models.models import Category, MenuItem
from backend.schemas.schemas import CategoryOut, MenuItemOut

router = APIRouter(prefix="/api/menu", tags=["Menu & Dishes"])

@router.get("/categories", response_model=List[CategoryOut])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.is_active == True).order_by(Category.display_order).all()

@router.get("/items", response_model=List[MenuItemOut])
def get_menu_items(
    category_slug: Optional[str] = None,
    is_veg: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query(None, regex="^(price_asc|price_desc|popular)$"),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).options(
        joinedload(MenuItem.category),
        joinedload(MenuItem.variants),
        joinedload(MenuItem.addons)
    ).filter(MenuItem.is_available == True)

    if category_slug:
        query = query.join(MenuItem.category).filter(Category.slug == category_slug)

    if is_veg is not None:
        query = query.filter(MenuItem.is_veg == is_veg)

    if search:
        search_filter = f"%{search.strip()}%"
        query = query.filter(
            (MenuItem.name.ilike(search_filter)) | 
            (MenuItem.description.ilike(search_filter))
        )

    if sort_by == "price_asc":
        query = query.order_by(MenuItem.base_price.asc())
    elif sort_by == "price_desc":
        query = query.order_by(MenuItem.base_price.desc())
    elif sort_by == "popular":
        query = query.order_by(MenuItem.is_bestseller.desc(), MenuItem.is_featured.desc())
    else:
        query = query.order_by(MenuItem.id.asc())

    return query.all()

@router.get("/featured", response_model=List[MenuItemOut])
def get_featured_items(db: Session = Depends(get_db)):
    return db.query(MenuItem).options(
        joinedload(MenuItem.category),
        joinedload(MenuItem.variants),
        joinedload(MenuItem.addons)
    ).filter(
        MenuItem.is_available == True,
        (MenuItem.is_featured == True) | (MenuItem.is_bestseller == True)
    ).limit(8).all()

@router.get("/items/{item_id_or_slug}", response_model=MenuItemOut)
def get_menu_item(item_id_or_slug: str, db: Session = Depends(get_db)):
    query = db.query(MenuItem).options(
        joinedload(MenuItem.category),
        joinedload(MenuItem.variants),
        joinedload(MenuItem.addons)
    )
    if item_id_or_slug.isdigit():
        item = query.filter(MenuItem.id == int(item_id_or_slug)).first()
    else:
        item = query.filter(MenuItem.slug == item_id_or_slug).first()

    if not item:
        raise HTTPException(status_code=404, detail="Dish not found")
    return item
