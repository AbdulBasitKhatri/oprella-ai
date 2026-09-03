import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://basitkhatri5555_db_user:rVUXYvkHEjxCYkdn@cluster0.qmxedab.mongodb.net/?appName=Cluster0"
    DATABASE_NAME: str = "oprella_ai"
    PROJECT_NAME: str = "Oprella AI API"
    SECRET_KEY: str = "supersecretjwtkey_change_in_production_123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    GEMINI_API_KEY: str = "AIzaSyA5_UCz3jLnit13Lbgg7BgvOzsVKhMiQK0"
    GEMINI_MODEL: str = "gemini-3.1-flash-lite-preview"
    ADMIN_SEED_PASSWORD: str = "@dmin"
    
    class Config:
        env_file = ".env"

settings = Settings()