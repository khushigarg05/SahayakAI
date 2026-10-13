from fastapi import APIRouter, HTTPException, status
from app.schemas.grievance import GrievanceAnalyzeRequest, GrievanceAnalyzeResponse
from app.services.grievance_service import grievance_service

router = APIRouter()

@router.post(
    "/analyze",
    response_model=GrievanceAnalyzeResponse,
    status_code=status.HTTP_200_OK,
    summary="Citizen Grievance ko CPGRAMS niyam anusar analyze karein"
)
def analyze_grievance(req: GrievanceAnalyzeRequest):
    """
    CPGRAMS AI Grievance Diagnostic Endpoint:
    - Hindi, English ya Hinglish me samasya ka vishleshan karta hai
    - Target Central Ministry aur Nodal Officer nikalta hai
    - Step-by-step action plan aur official toll-free helpline deta hai
    """
    try:
        return grievance_service.analyze(req)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Grievance diagnostic me samasya aayi: {str(e)}"
        )

@router.get(
    "/categories",
    summary="Covered Welfare Grievance Categories ki list"
)
def get_grievance_categories():
    """
    Returns pre-configured welfare grievance categories.
    """
    return {
        "categories": [
            {
                "code": "DBT_BANK_LINKAGE",
                "name": "PM-Kisan / Scholarship DBT Bank Account Seeding",
                "common_issue": "Installment halted due to Aadhaar NPCI seeding mismatch"
            },
            {
                "code": "INCOME_CERT_EXPIRED",
                "name": "Housing / PMAY-G Income Certificate Validity",
                "common_issue": "Application rejected because income certificate > 6 months old"
            },
            {
                "code": "AYUSHMAN_CASHLESS_DENIAL",
                "name": "Ayushman Bharat PM-JAY Hospitalization",
                "common_issue": "Empaneled hospital refusal of cashless treatment"
            },
            {
                "code": "RATION_BIOMETRIC_FAIL",
                "name": "NFSA Ration Card Biometric e-KYC",
                "common_issue": "Fingerprint scanner failure at fair price shop (FPS)"
            }
        ]
    }
