# Saffron & Sage — Premium Restaurant Website & QR Table Ordering Platform

A production-ready, full-stack dining platform featuring a customer-facing responsive web application, React-based operations admin console, Python FastAPI backend, SQLite database, smart QR-code table detection, order tracking, table reservations, and Cashfree online payment gateway integration.

---

## 1. System Architecture

```text
food_r1/
├── frontend/                     # React 19 + TypeScript + Vite + Tailwind CSS
│   ├── public/
│   ├── src/
│   │   ├── admin/                # Admin Console (Dashboard, Orders, Menu, Tables, etc.)
│   │   ├── components/           # Reusable components (CartDrawer, Toasts, etc.)
│   │   ├── context/              # React Context (Auth, Cart, Toast)
│   │   ├── layouts/              # PublicLayout and AdminLayout
│   │   ├── pages/                # Customer Pages (Home, Menu, Dish, Cart, Checkout, etc.)
│   │   ├── services/             # Centralized API service (FastAPI client)
│   │   ├── types/                # TypeScript interface definitions
│   │   ├── App.tsx               # Client-side router configuration
│   │   ├── index.css             # Tailwind v4 theme, fonts, and print stylesheets
│   │   └── main.tsx              # Application entrypoint
│   ├── index.html                # Google Fonts & Cashfree v3 Checkout SDK
│   ├── vite.config.ts            # Vite config with Tailwind plugin and dev proxy
│   └── package.json
├── backend/                      # Python 3.11+ FastAPI REST API
│   ├── core/
│   │   ├── config.py             # Pydantic BaseSettings & Environment variables
│   │   └── security.py           # Bcrypt password hashing & JWT token handling
│   ├── database.py               # SQLAlchemy SQLite engine & session management
│   ├── models/
│   │   └── models.py             # ORM models (Users, Dishes, Tables, Orders, Payments, etc.)
│   ├── routers/
│   │   ├── admin.py              # Operations dashboard, Menu CRUD, CMS, and reports
│   │   ├── auth.py               # Authentication (register, login, me, reset)
│   │   ├── menu.py               # Dishes, categories, and dietary filters
│   │   ├── orders.py             # Safe cart recalculation and order creation
│   │   ├── payments.py           # Cashfree session creation, verification & webhooks
│   │   ├── public.py             # Public settings, website CMS content, location
│   │   ├── reservations.py       # Table capacity validation and booking
│   │   └── tables.py             # QR table validation and QR code streaming
│   ├── schemas/
│   │   └── schemas.py            # Pydantic request & response validation schemas
│   ├── services/
│   │   ├── cashfree_service.py   # Cashfree PG REST integration and signature check
│   │   ├── order_service.py      # Server-side pricing recalculation & taxes
│   │   └── qr_service.py         # Pillow + qrcode standee generator
│   ├── tests/
│   │   └── test_api.py           # Pytest suite for API endpoints
│   ├── uploads/                  # Uploaded food imagery & generated table QR PNGs
│   ├── main.py                   # FastAPI app with CORS & static file mounts
│   ├── seed.py                   # Initial database seeder
│   ├── requirements.txt
│   └── .env
└── README.md
```

---

## 2. Default Credentials & Quick Access

### User Accounts (Pre-Seeded)

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@saffronsage.in` | `Admin@123456` | Full Admin Console & Financial Controls |
| **Floor Captain** | `staff@saffronsage.in` | `Staff@123456` | Kitchen Tickets & Reservation Management |
| **Guest Patron** | `guest@saffronsage.in` | `Customer@123456` | Order History & Profile |

*One-click credential fill buttons are provided on the login page (`/login`) for convenience.*

---

## 3. Getting Started & Development

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### Backend Setup
1. Open a terminal in the root directory:
   ```bash
   python -m pip install -r backend/requirements.txt
   ```
2. Initialize and seed the SQLite database:
   ```bash
   python -m backend.seed
   ```
   *(This automatically creates users, menu items, table standees, and restaurant settings).*
3. Run the FastAPI development server:
   ```bash
   python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - API Docs: `http://127.0.0.1:8000/docs`

### Frontend Setup
1. Open a second terminal in the `frontend` directory:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. Open your browser at `http://localhost:5173`.

---

## 4. Key Workflows

### A. Smart QR Table Ordering Workflow
1. **Normal Scanning (`http://localhost:5173/`)**:
   - Opens the luxury homepage with story, food preview, location, and reservations. No table is assigned.
2. **Table QR Scanning (`http://localhost:5173/?table=T05`)**:
   - Frontend reads `table` URL parameter and calls `POST /api/public/tables/validate`.
   - FastAPI verifies that Table T05 exists and is active.
   - The verified table context is locked in `CartContext` and persisted across reloads in `localStorage`.
   - The user is automatically forwarded to `/menu` with the sticky banner: **"Ordering from Table T05"**.
   - Checkout defaults to `dine_in` and attaches Table T05 to the verified database order.
   - If an invalid table like `?table=T99` is scanned, the backend rejects it with an alert.

### B. Cashfree Online Payment Flow
- **Gateway**: Cashfree Online Payment Gateway (Cashfree is the sole gateway; cash-on-delivery is disabled).
- **Environment**: Configurable via `CASHFREE_ENV=SANDBOX` or `PRODUCTION`.
- **Checkout Process**:
  1. Patron fills in details at `/checkout` and clicks **Pay with Cashfree**.
  2. FastAPI recalculates all item prices, variant add-ons, 5% GST, and packaging fees server-side (preventing frontend tampering).
  3. FastAPI creates a Cashfree order session via `POST /pg/orders`.
  4. In live mode, Cashfree JS SDK v3 opens the checkout modal.
  5. In sandbox test mode, the simulation modal allows clicking **Simulate Cashfree Payment Success**.
  6. Backend verifies payment authenticity through `GET /api/payments/{reference}/status` and Cashfree webhooks (`/api/payments/cashfree/webhook`) using HMAC-SHA256 signature verification.
  7. The order status updates from `PENDING_PAYMENT` to `CONFIRMED`.

### C. Live Order Tracking
- Route: `/order/:reference`
- Real-time polling updates order status:
  `Confirmed` ➔ `Accepted` ➔ `Preparing` ➔ `Ready` ➔ `Served` ➔ `Completed`.
- Includes a **Print Receipt / Kitchen Ticket** feature formatted for thermal and standard printers.

### D. Table Reservations & Capacity Checking
- Route: `/reservations`
- Patron selects date, time, and party size (1–20 guests).
- Backend enforces dining capacity limits (`GET /api/reservations/availability`), preventing double-booking and over-committing the dining room.

### E. Operations Admin Console
- Route: `/admin` (Protected with role check; non-admin users are blocked).
- **Dashboard**: Real-time KPI cards (Verified Revenue, Orders, Pending Prep, Reservations), Bestsellers chart, and recent orders.
- **Live Orders**: Filter by status and dining mode; update kitchen status; view/print full kitchen tickets.
- **Menu Management**: Add/Edit/Delete dishes and categories, upload images, set base price, manage portion variants and add-on pricing, toggle availability.
- **Table Management**: Register tables with seat capacity, generate high-resolution QR code standee cards (using Pillow), preview and download PNG standees.
- **Payments & Refunds**: Track verified transaction IDs, inspect failed transactions, authorize and process customer refunds.
- **Website CMS**: Live editing of Hero title/subtitle/image, brand story, top announcement ribbon, and footer without code changes.
- **Settings**: Configure GST tax rate %, packaging fees, delivery charges, phone, address, and Google Maps embed URL.
- **Sales Reports**: One-click RFC-4180 CSV export of order history.

---

## 5. Automated Tests

Run backend automated tests using pytest:
```bash
python -m pytest backend/tests/test_api.py
```
Run end-to-end integration test:
```bash
python test_e2e_flow.py
```
Run frontend production build verification:
```bash
cd frontend
npm run build
```

---

## 6. Environment Variables Reference

### Backend (`backend/.env`)
```env
SECRET_KEY=saffron-and-sage-super-secure-production-secret-key-987654321
DATABASE_URL=sqlite:///./restaurant.db
FRONTEND_BASE_URL=http://localhost:5173
BACKEND_BASE_URL=http://localhost:8000

# Cashfree Configuration
CASHFREE_CLIENT_ID=TEST_CLIENT_ID
CASHFREE_CLIENT_SECRET=TEST_CLIENT_SECRET
CASHFREE_ENV=SANDBOX
CASHFREE_API_VERSION=2023-08-01
```

### Frontend (`frontend/.env`)
```env
VITE_API_BASE_URL=/api
```
