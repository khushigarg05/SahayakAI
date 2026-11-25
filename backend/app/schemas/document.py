from typing import List, Optional
from pydantic import BaseModel, Field

class DocumentVerifyResponse(BaseModel):
    document_type: str = Field(..., description="Type of document (income, aadhaar, ration, caste)")
    filename: str = Field(..., description="Uploaded file name")
    is_valid: bool = Field(..., description="Whether document passes statutory pre-screening")
    confidence_score: float = Field(..., description="OCR clarity and structural match percentage (0-100%)")
    clarity_rating: str = Field(..., description="EXCELLENT, GOOD, POOR, BLURRY")
    hologram_or_seal_detected: bool = Field(True, description="Whether official government stamp/QR is detected")
    masked_identifier: Optional[str] = Field(None, description="Masked ID for privacy (e.g. XXXX-XXXX-2134)")
    raw_identifier: Optional[str] = Field(None, description="Extracted identifier (or unmasked last 4)")
    detected_name: Optional[str] = Field(None, description="Citizen full name extracted via OCR")
    detected_dob: Optional[str] = Field(None, description="Date of birth detected on document")
    detected_age: Optional[int] = Field(None, description="Calculated age from DOB")
    detected_gender: Optional[str] = Field(None, description="Gender detected on document")
    detected_date: Optional[str] = Field(None, description="Issue date detected on certificate")
    is_expired: bool = Field(False, description="Whether certificate has expired according to scheme rules")
    findings: List[str] = Field(..., description="Detailed bullet points of the audit inspection")
    recommendation: str = Field(..., description="Actionable recommendation for the applicant")
