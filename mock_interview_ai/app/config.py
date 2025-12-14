from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path


def _find_env_file() -> str:
    here = Path(__file__).resolve()
    for parent in here.parents:
        candidate = parent / ".env"
        if candidate.exists():
            return str(candidate)
    return ".env"

class Settings(BaseSettings):
    # API Keys
    OPENROUTER_API_KEY: str
    OPENAI_API_KEY: Optional[str] = None
    GOOGLE_API_KEY: Optional[str] = None
    
    # Application Settings
    APP_NAME: str = "Mock Interview AI"
    DEBUG: bool = False
    VERSION: str = "1.0.0"
    
    # AI Model Settings
    OPENROUTER_MODEL: str = "moonshotai/kimi-k2"
    OPENAI_MODEL: str = "gpt-3.5-turbo"
    TEMPERATURE: float = 0.7
    MAX_TOKENS: int = 1000
    
    # Interview Settings
    DEFAULT_NUM_QUESTIONS: int = 5
    MAX_NUM_QUESTIONS: int = 20
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_AUDIO_FORMATS: list = [".mp3", ".wav", ".m4a", ".ogg"]
    
    class Config:
        env_file = _find_env_file()
        case_sensitive = True

settings = Settings()
