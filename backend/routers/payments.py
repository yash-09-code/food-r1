import json
import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.models.models import Order, Payment
from backend.schemas.schemas import PaymentSessionCreate, PaymentSessionOut
from backend.services.cashfree_service import cashfree_service
from backend.core.security import verify_cashfree_webhook_signature
from backend.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payments", tags=["Cashfree Payments"])

@router.post("/create-order", response_model=PaymentSessionOut)
async def create_payment_order(req: PaymentSessionCreate, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_reference == req.order_reference.strip().upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.payment_status == "SUCCESS":
        raise HTTPException(status_code=400, detail="This order has already been paid successfully")

    # Call Cashfree to generate payment session
    cf_res = await cashfree_service.create_order(
        order_reference=order.order_reference,
        amount=order.total_amount,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        customer_email=order.customer_email
    )

    if not cf_res.get("success"):
        raise HTTPException(status_code=502, detail="Failed to initiate Cashfree payment session")

    # Create or update Payment entry
    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
    if not payment:
        payment = Payment(
            order_id=order.id,
            cashfree_order_id=cf_res["cashfree_order_id"],
            payment_session_id=cf_res["payment_session_id"],
            amount=order.total_amount,
            currency="INR",
            status="PENDING",
            raw_response=cf_res.get("raw_response")
        )
        db.add(payment)
    else:
        payment.cashfree_order_id = cf_res["cashfree_order_id"]
        payment.payment_session_id = cf_res["payment_session_id"]
        payment.amount = order.total_amount
        payment.status = "PENDING"
        payment.raw_response = cf_res.get("raw_response")

    db.commit()

    return PaymentSessionOut(
        order_reference=order.order_reference,
        payment_session_id=cf_res["payment_session_id"],
        cashfree_order_id=cf_res["cashfree_order_id"],
        amount=order.total_amount,
        currency="INR",
        environment=settings.CASHFREE_ENV.upper()
    )

@router.get("/{reference}/status")
async def verify_payment_status(reference: str, db: Session = Depends(get_db)):
    """
    Verifies the payment status with Cashfree and updates the database order idempotently.
    """
    order = db.query(Order).filter(Order.order_reference == reference.strip().upper()).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = db.query(Payment).filter(Payment.order_id == order.id).first()

    # If already verified as paid
    if order.payment_status == "SUCCESS":
        return {
            "order_reference": order.order_reference,
            "status": "SUCCESS",
            "order_status": order.status,
            "is_paid": True,
            "message": "Payment verified successfully"
        }

    # Query Cashfree
    cf_check = await cashfree_service.get_order_status(order.order_reference)
    
    if cf_check.get("is_paid"):
        order.payment_status = "SUCCESS"
        order.status = "CONFIRMED"
        if payment:
            payment.status = "SUCCESS"
        db.commit()
        return {
            "order_reference": order.order_reference,
            "status": "SUCCESS",
            "order_status": order.status,
            "is_paid": True,
            "message": "Payment verified successfully via Cashfree"
        }

    return {
        "order_reference": order.order_reference,
        "status": order.payment_status,
        "order_status": order.status,
        "is_paid": False,
        "message": f"Payment is currently {order.payment_status}"
    }

@router.post("/verify-sandbox")
async def verify_sandbox_payment(req: dict, db: Session = Depends(get_db)):
    """
    Simulated verification for sandbox test environments and demonstration.
    Only permitted in SANDBOX mode.
    """
    if settings.CASHFREE_ENV.upper() != "SANDBOX":
        raise HTTPException(status_code=403, detail="Sandbox simulation is disabled in production")

    order_ref = req.get("order_reference", "").strip().upper()
    order = db.query(Order).filter(Order.order_reference == order_ref).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    payment = db.query(Payment).filter(Payment.order_id == order.id).first()

    # Mark as verified
    order.payment_status = "SUCCESS"
    if order.status == "PENDING_PAYMENT":
        order.status = "CONFIRMED"

    if payment:
        payment.status = "SUCCESS"
        payment.cashfree_payment_id = f"cf_sim_pay_{order_ref}"

    db.commit()
    return {
        "success": True,
        "order_reference": order.order_reference,
        "status": "SUCCESS",
        "order_status": order.status,
        "message": "Payment verified in Cashfree sandbox mode"
    }

@router.post("/cashfree/webhook")
async def cashfree_webhook(
    request: Request,
    x_webhook_signature: Optional[str] = Header(None, alias="x-webhook-signature"),
    x_webhook_timestamp: Optional[str] = Header(None, alias="x-webhook-timestamp"),
    db: Session = Depends(get_db)
):
    raw_body = await request.body()
    body_str = raw_body.decode("utf-8")

    # If secret is set and signature header provided, verify signature
    if x_webhook_signature and settings.CASHFREE_CLIENT_SECRET != "TEST_CLIENT_SECRET":
        valid = verify_cashfree_webhook_signature(x_webhook_signature, body_str, x_webhook_timestamp or "")
        if not valid:
            logger.warning("Invalid Cashfree webhook signature")
            raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        data = json.loads(body_str)
        # Cashfree webhook data structure: data.order.order_id or data.data.order.order_id
        order_data = data.get("data", {}).get("order", {}) or data.get("order", {})
        order_id = order_data.get("order_id")
        payment_data = data.get("data", {}).get("payment", {}) or data.get("payment", {})
        payment_status = payment_data.get("payment_status")

        if order_id:
            order = db.query(Order).filter(Order.order_reference == order_id).first()
            if order:
                payment = db.query(Payment).filter(Payment.order_id == order.id).first()
                if payment_status == "SUCCESS":
                    order.payment_status = "SUCCESS"
                    if order.status == "PENDING_PAYMENT":
                        order.status = "CONFIRMED"
                    if payment:
                        payment.status = "SUCCESS"
                        payment.cashfree_payment_id = payment_data.get("cf_payment_id")
                elif payment_status in ["FAILED", "USER_DROPPED", "CANCELLED"]:
                    if order.payment_status != "SUCCESS":
                        order.payment_status = "FAILED"
                        if payment:
                            payment.status = "FAILED"
                db.commit()

        return {"status": "ok"}
    except Exception as e:
        logger.error(f"Error handling Cashfree webhook: {str(e)}")
        return {"status": "error", "detail": str(e)}
