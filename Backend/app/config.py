import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb+srv://basitkhatri5555_db_user:rVUXYvkHEjxCYkdn@cluster0.qmxedab.mongodb.net/?appName=Cluster0"
    DATABASE_NAME: str = "oprella_ai"
    PROJECT_NAME: str = "Oprella AI API"
    SECRET_KEY: str = "supersecretjwtkey_change_in_production_123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    
    class Config:
        env_file = ".env"

settings = Settings()