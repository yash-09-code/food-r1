import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_public_website_and_settings():
    res_web = client.get("/api/public/website")
    assert res_web.status_code == 200
    data = res_web.json()
    assert "hero" in data

    res_set = client.get("/api/public/settings")
    assert res_set.status_code == 200
    assert res_set.json().get("restaurant_name") == "Saffron & Sage Fine Dining"

def test_table_qr_validation():
    # Valid active table
    res_valid = client.post("/api/public/tables/validate", json={"table_number": "T05"})
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert data_valid["valid"] is True
    assert data_valid["table"]["table_number"] == "T05"

    # Nonexistent table
    res_invalid = client.post("/api/public/tables/validate", json={"table_number": "T99"})
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["valid"] is False
    assert data_invalid["table"] is None

def test_menu_categories_and_items():
    res_cat = client.get("/api/menu/categories")
    assert res_cat.status_code == 200
    categories = res_cat.json()
    assert len(categories) > 0

    res_items = client.get("/api/menu/items")
    assert res_items.status_code == 200
    items = res_items.json()
    assert len(items) > 0

    # Test filtering veg
    res_veg = client.get("/api/menu/items?is_veg=true")
    assert res_veg.status_code == 200
    for it in res_veg.json():
        assert it["is_veg"] is True

def test_order_creation_and_recalculation():
    # Fetch first dish
    res_items = client.get("/api/menu/items")
    item = res_items.json()[0]

    order_payload = {
        "customer_name": "Test Patron",
        "customer_phone": "9876543210",
        "customer_email": "patron@example.com",
        "order_type": "dine_in",
        "table_number": "T05",
        "items": [
            {
                "menu_item_id": item["id"],
                "quantity": 2
            }
        ]
    }
    res_order = client.post("/api/orders", json=order_payload)
    assert res_order.status_code == 200
    order = res_order.json()
    assert order["table_number_snapshot"] == "T05"
    assert order["status"] == "PENDING_PAYMENT"
    assert order["total_amount"] > 0
    # Expected subtotal = base_price * 2
    assert order["subtotal"] == round(item["base_price"] * 2, 2)

    # Test tracking status
    ref = order["order_reference"]
    res_track = client.get(f"/api/orders/{ref}/status")
    assert res_track.status_code == 200
    assert res_track.json()["order_reference"] == ref

def test_cashfree_payment_creation_and_sandbox_verification():
    # 1. Create order
    res_items = client.get("/api/menu/items")
    item = res_items.json()[0]
    order_payload = {
        "customer_name": "Cashfree Patron",
        "customer_phone": "9998887776",
        "order_type": "dine_in",
        "table_number": "T01",
        "items": [{"menu_item_id": item["id"], "quantity": 1}]
    }
    res_order = client.post("/api/orders", json=order_payload)
    order = res_order.json()
    ref = order["order_reference"]

    # 2. Initiate Cashfree session
    res_cf = client.post("/api/payments/create-order", json={"order_reference": ref})
    assert res_cf.status_code == 200
    cf_data = res_cf.json()
    assert "payment_session_id" in cf_data

    # 3. Verify in sandbox
    res_verify = client.post("/api/payments/verify-sandbox", json={"order_reference": ref})
    assert res_verify.status_code == 200
    assert res_verify.json()["status"] == "SUCCESS"

    # 4. Check order status is updated to CONFIRMED
    res_status = client.get(f"/api/orders/{ref}/status")
    assert res_status.json()["payment_status"] == "SUCCESS"
    assert res_status.json()["status"] == "CONFIRMED"

def test_reservation_booking():
    res_payload = {
        "guest_name": "Vikram Seth",
        "guest_email": "vikram@example.com",
        "guest_phone": "9812345678",
        "reservation_date": "2026-10-25",
        "reservation_time": "19:30",
        "guest_count": 4,
        "seating_preference": "Courtyard Terrace"
    }
    res_book = client.post("/api/reservations", json=res_payload)
    assert res_book.status_code == 200
    res_data = res_book.json()
    assert res_data["status"] == "CONFIRMED"
    assert "RES-" in res_data["reservation_code"]

def test_admin_auth_and_protection():
    # Unauthenticated request to admin route should fail with 401
    res_unauth = client.get("/api/admin/dashboard")
    assert res_unauth.status_code == 401

    # Login as admin
    res_login = client.post("/api/auth/login", json={
        "email": "admin@saffronsage.in",
        "password": "Admin@123456"
    })
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Authenticated admin request
    headers = {"Authorization": f"Bearer {token}"}
    res_dash = client.get("/api/admin/dashboard", headers=headers)
    assert res_dash.status_code == 200
    dash_data = res_dash.json()
    assert "total_orders" in dash_data
    assert "active_tables_count" in dash_data
