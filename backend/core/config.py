import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Saffron & Sage Fine Dining"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "saffron-and-sage-super-secure-production-secret-key-987654321")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # URLs
    FRONTEND_BASE_URL: str = os.getenv("FRONTEND_BASE_URL", "http://localhost:5173")
    BACKEND_BASE_URL: str = os.getenv("BACKEND_BASE_URL", "http://localhost:8000")
    
    # Cashfree Configuration
    CASHFREE_CLIENT_ID: str = os.getenv("CASHFREE_CLIENT_ID", "TEST_CLIENT_ID")
    CASHFREE_CLIENT_SECRET: str = os.getenv("CASHFREE_CLIENT_SECRET", "TEST_CLIENT_SECRET")
    CASHFREE_ENV: str = os.getenv("CASHFREE_ENV", "SANDBOX")  # SANDBOX or PRODUCTION
    CASHFREE_API_VERSION: str = os.getenv("CASHFREE_API_VERSION", "2023-08-01")
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")
    QR_DIR: str = os.path.join(BASE_DIR, "uploads", "qrcodes")
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.QR_DIR, exist_ok=True)
