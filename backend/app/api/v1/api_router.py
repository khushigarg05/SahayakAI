from fastapi import APIRouter
from app.api.v1 import (
    health,
    auth,
    schemes,
    risk,
    kiosks,
    chat,
    grievances,
    documents,
    profile,
    dashboard
)

api_router = APIRouter()

# 1. Health check router
api_router.include_router(health.router, tags=["Health"])

# 2. Authentication & OTP router (/api/v1/auth)
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication & OTP"])

# 3. Schemes Catalog & Rule Engine (/api/v1/schemes)
api_router.include_router(schemes.router, prefix="/schemes", tags=["Schemes & Rule Engine"])

# 4. ML Risk & SHAP Power Endpoint (/api/v1/risk)
api_router.include_router(risk.router, prefix="/risk", tags=["Risk & SHAP Explainability"])

# 5. Kiosk Locator & QR Token (/api/v1/kiosks)
api_router.include_router(kiosks.router, prefix="/kiosks", tags=["Kiosk Locator & Appointment Token"])

# 6. Multilingual AI Scheme Chatbot (/api/v1/chat)
api_router.include_router(chat.router, prefix="/chat", tags=["Multilingual AI Scheme Chatbot"])

# 7. CPGRAMS AI Grievance Redressal (/api/v1/grievances)
api_router.include_router(grievances.router, prefix="/grievances", tags=["CPGRAMS Grievance Redressal"])

# 8. Document Pre-Screening OCR (/api/v1/documents)
api_router.include_router(documents.router, prefix="/documents", tags=["Document Pre-Verification"])

# 9. Citizen Profile Management (/api/v1/profile)
api_router.include_router(profile.router, prefix="/profile", tags=["Citizen Profile"])

# 10. Consolidated Dashboard & Regional Analytics (/api/v1/dashboard)
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Welfare Dashboard & Analytics"])
