from fastapi import APIRouter

router = APIRouter()

@router.get("/health", summary="Health Check")
def health_check():
    return {
        "status": "ok",
        "service": "SahayakAI Backend",
        "database": "connected"
    }
