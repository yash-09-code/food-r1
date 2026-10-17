from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
import os
from backend.database import get_db
from backend.models.models import RestaurantTable
from backend.schemas.schemas import TableValidateRequest, TableValidateResponse, TableOut
from backend.services.qr_service import generate_table_qr, generate_general_qr
from backend.core.config import settings

router = APIRouter(prefix="/api/public/tables", tags=["Tables & QR"])

@router.post("/validate", response_model=TableValidateResponse)
def validate_table(req: TableValidateRequest, db: Session = Depends(get_db)):
    clean_number = req.table_number.strip().upper()
    table = db.query(RestaurantTable).filter(
        RestaurantTable.table_number == clean_number,
        RestaurantTable.is_active == True
    ).first()

    if not table:
        return TableValidateResponse(
            valid=False,
            message=f"Table '{req.table_number}' is not recognized or currently inactive. Please check with restaurant staff.",
            table=None
        )

    # Make sure QR code file exists
    if not table.qr_code_url or not os.path.exists(os.path.join(settings.BASE_DIR, table.qr_code_url.lstrip('/'))):
        qr_url = generate_table_qr(table.table_number)
        table.qr_code_url = qr_url
        db.commit()
        db.refresh(table)

    return TableValidateResponse(
        valid=True,
        message=f"Welcome! Connected to Table {table.table_number}.",
        table=TableOut.model_validate(table)
    )

@router.get("/general-qr")
def get_general_qr():
    qr_url = generate_general_qr()
    filepath = os.path.join(settings.BASE_DIR, qr_url.lstrip('/'))
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type="image/png", filename="saffron_sage_menu_qr.png")
    raise HTTPException(status_code=404, detail="QR code not found")

@router.get("/{table_number}/qr")
def get_table_qr_image(table_number: str, db: Session = Depends(get_db)):
    clean_number = table_number.strip().upper()
    table = db.query(RestaurantTable).filter(RestaurantTable.table_number == clean_number).first()
    if not table:
        raise HTTPException(status_code=404, detail="Table does not exist")

    qr_url = generate_table_qr(table.table_number)
    filepath = os.path.join(settings.BASE_DIR, qr_url.lstrip('/'))
    return FileResponse(filepath, media_type="image/png", filename=f"table_{clean_number}_card.png")
