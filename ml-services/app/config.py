"""
Configuration settings for ML services
"""

from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Service settings
    SERVICE_NAME: str = "Meri Shikayat ML Services"
    SERVICE_PORT: int = 8000
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5000",
        "http://localhost:5173"
    ]
    
    # Node.js backend URL
    NODE_SERVICE_URL: str = "http://localhost:5000"
    
    # Model paths
    MODEL_DIR: str = "./data/models"
    
    # ML settings
    CATEGORIZATION_CONFIDENCE_THRESHOLD: float = 0.6
    IMAGE_MIN_QUALITY_SCORE: float = 0.5
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
