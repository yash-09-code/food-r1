import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure parent directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.core.config import settings
from backend.database import Base, engine
from backend.seed import seed_database
from backend.routers import auth, public, menu, tables, orders, payments, reservations, admin

# Initialize DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Saffron & Sage Fine Dining API",
    description="Full-stack restaurant platform with QR table ordering, Cashfree payments, reservations, and admin CMS.",
    version="1.0.0"
)

# CORS Configuration
origins = [
    settings.FRONTEND_BASE_URL,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For flexible local dev and mobile testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static Uploads directory for images and QR codes
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.QR_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(public.router)
app.include_router(menu.router)
app.include_router(tables.router)
app.include_router(orders.router)
app.include_router(payments.router)
app.include_router(reservations.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seed notice: {e}")

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Saffron & Sage Fine Dining API",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
