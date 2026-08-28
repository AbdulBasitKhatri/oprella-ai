import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "shop_db"
    PROJECT_NAME: str = "Oprella AI API"

    class Config:
        env_file = ".env"

settings = Settings()