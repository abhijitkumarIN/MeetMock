import os
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    """Application settings and configuration."""
    
    # Server settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",  # Alternative dev port
    ]
    
    # Add production origins from environment
    if os.getenv("FRONTEND_URL"):
        ALLOWED_ORIGINS.append(os.getenv("FRONTEND_URL"))
    
    # WebSocket settings
    WS_HEARTBEAT_INTERVAL: int = 30  # seconds
    WS_TIMEOUT: int = 60  # seconds
    
    # Room settings
    MAX_ROOM_SIZE: int = int(os.getenv("MAX_ROOM_SIZE", "10"))
    ROOM_CLEANUP_INTERVAL: int = 300  # 5 minutes
    
    # Autocomplete settings
    MAX_SUGGESTIONS: int = 5
    AUTOCOMPLETE_TIMEOUT: float = 1.0  # seconds
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    # API settings
    API_V1_PREFIX: str = ""
    PROJECT_NAME: str = "Pair Programming API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Real-time collaborative code editor API"

# Global settings instance
settings = Settings()