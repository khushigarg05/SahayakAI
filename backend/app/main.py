from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app.api.v1.api_router import api_router
# Saare models import taaki Base.metadata unhe detect kar sake
import app.models

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    App Startup & Shutdown lifecycle manager:
    Server start hote hi tables automatically SQLite me ban jayengi.
    """
    # Startup: Database tables create karna
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic (if any)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="SahayakAI Welfare Intelligence Platform Backend API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (Frontend Next.js connection ke liye)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root level health check
@app.get("/health", tags=["Health"])
def root_health():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "environment": settings.ENVIRONMENT
    }

# API v1 Routers (/api/v1/...)
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} Backend API!",
        "docs_url": "/docs",
        "health_check": "/health"
    }
