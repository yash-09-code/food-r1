import httpx

def test_full_journey():
    # 1. Fetch menu
    dishes = httpx.get('http://127.0.0.1:8000/api/menu/items').json()
    assert len(dishes) > 0
    d1 = dishes[0]
    print(f"1. Selected Dish: {d1['name']} (Base: INR {d1['base_price']})")

    # 2. Place Order for Table T05
    order_payload = {
        'customer_name': 'Aarav Singhania',
        'customer_phone': '9876543210',
        'customer_email': 'aarav@example.com',
        'order_type': 'dine_in',
        'table_number': 'T05',
        'items': [{'menu_item_id': d1['id'], 'quantity': 2}]
    }
    res_order = httpx.post('http://127.0.0.1:8000/api/orders', json=order_payload).json()
    ref = res_order['order_reference']
    print(f"2. Order Placed: {ref} | Table: {res_order['table_number_snapshot']} | Total: INR {res_order['total_amount']}")

    # 3. Create Cashfree Payment Order
    res_cf = httpx.post('http://127.0.0.1:8000/api/payments/create-order', json={'order_reference': ref}).json()
    assert 'payment_session_id' in res_cf
    print(f"3. Cashfree Payment Session Created: {res_cf['payment_session_id']}")

    # 4. Verify Sandbox Payment
    res_ver = httpx.post('http://127.0.0.1:8000/api/payments/verify-sandbox', json={'order_reference': ref}).json()
    assert res_ver['status'] == 'SUCCESS'
    print(f"4. Payment Verification: {res_ver['status']}")

    # 5. Check Live Order Status
    res_status = httpx.get(f'http://127.0.0.1:8000/api/orders/{ref}/status').json()
    assert res_status['payment_status'] == 'SUCCESS'
    assert res_status['status'] == 'CONFIRMED'
    print(f"5. Final Order Status: {res_status['status']} | Payment: {res_status['payment_status']}")

    # 6. Admin Update Status to PREPARING
    login_res = httpx.post('http://127.0.0.1:8000/api/auth/login', json={
        'email': 'admin@saffronsage.in',
        'password': 'Admin@123456'
    }).json()
    token = login_res['access_token']
    headers = {'Authorization': f'Bearer {token}'}

    patch_res = httpx.patch(
        f"http://127.0.0.1:8000/api/admin/orders/{res_status['id']}/status",
        headers=headers,
        json={'status': 'PREPARING'}
    ).json()
    assert patch_res['status'] == 'PREPARING'
    print(f"6. Admin Kitchen Status Updated to: {patch_res['status']}")

    print("\nAll End-to-End Restaurant Workflows Verified Successfully!")

if __name__ == '__main__':
    test_full_journey()
