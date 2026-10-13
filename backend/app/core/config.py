from pathlib import Path
from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

# Backend folder ka exact absolute path
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE_PATH = BASE_DIR / ".env"

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "SahayakAI"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    # CORS: Frontend connect karne ke liye
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000"

    # Security & JWT Token Auth
    SECRET_KEY: str = "4414c71e64098a2d65d672c7b44d0d85d2c6ca9025253d519f88e9069b4a7a90"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 Hours

    # Database: Default SQLite
    DATABASE_URL: str = "sqlite:///./sahayak.db"

    # AI & LLM Service Keys (Optional)
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    # ML & Artifacts Paths
    VECTOR_STORE_PATH: str = "./app/ml_artifacts/vector_store"
    MODEL_ARTIFACTS_PATH: str = "./app/ml_artifacts"

    # Pydantic configuration: Absolute path se .env read karega
    model_config = SettingsConfigDict(
        env_file=ENV_FILE_PATH if ENV_FILE_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def sync_database_url(self) -> str:
        """
        Rock-solid SQLite path resolution:
        Chahe server kisi bhi folder se chalao, sahayak.db hamesha backend folder me hi milega!
        """
        if self.DATABASE_URL.startswith("sqlite:///./"):
            db_name = self.DATABASE_URL.replace("sqlite:///./", "")
            return f"sqlite:///{BASE_DIR / db_name}"
        return self.DATABASE_URL

    @property
    def cors_origins_list(self) -> List[str]:
        """Frontend URLs ko list me convert karta hai CORS middleware ke liye"""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
