from fastapi import APIRouter, HTTPException, Depends
from app.schemas.api_setu import (
    DocVerificationRequest,
    DocVerificationResponse,
    SampleDocumentsResponse
)
from app.services.api_setu_service import ApiSetuService
from app.core.config import settings

router = APIRouter()

@router.get("/status", tags=["API Setu Developer Sandbox"])
def get_gateway_status():
    """
    Returns API Setu Gateway Health & Sandbox Mode Status
    """
    return {
        "status": "online",
        "gateway": "API Setu • National API Exchange",
        "mode": settings.API_SETU_MODE,
        "is_sandbox": settings.API_SETU_MODE.lower() == "sandbox",
        "supported_documents": [
            "income_certificate",
            "ration_card_bpl",
            "aadhaar_npci_dbt",
            "caste_certificate"
        ],
        "state_registries": [
            "Uttar Pradesh e-District",
            "Bihar e-Kalyan / PDS",
            "Madhya Pradesh e-District",
            "National NPCI PFMS Portal",
            "DigiLocker DPI Exchange"
        ]
    }

@router.get("/samples", response_model=SampleDocumentsResponse, tags=["API Setu Developer Sandbox"])
def get_sample_test_documents():
    """
    Returns pre-configured sample documents for instant 1-click testing in UI
    """
    return ApiSetuService.get_sample_documents()

@router.post("/verify", response_model=DocVerificationResponse, tags=["API Setu Developer Sandbox"])
def verify_citizen_document(payload: DocVerificationRequest):
    """
    Verifies citizen welfare certificate / DBT status via API Setu Sandbox Gateway
    """
    if not payload.doc_number or not payload.doc_number.strip():
        raise HTTPException(
            status_code=400,
            detail="Document number or Application ID is required for API Setu verification."
        )

    try:
        return ApiSetuService.verify_document(payload)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"API Setu verification failed: {str(e)}"
        )
