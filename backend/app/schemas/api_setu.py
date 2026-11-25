from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field

class DocVerificationRequest(BaseModel):
    doc_type: str = Field(..., description="Type of document: income, ration, dbt, caste")
    doc_number: str = Field(..., description="Certificate / Card / Account Number")
    state: Optional[str] = Field("Uttar Pradesh", description="Issuing State")
    citizen_name: Optional[str] = Field(None, description="Name on record (optional match)")
    aadhaar_last_four: Optional[str] = Field(None, description="Last 4 digits of Aadhaar if applicable")

class DocVerificationResponse(BaseModel):
    status: str = Field(..., description="verified | expired | rejected | not_found")
    is_valid: bool = Field(..., description="Whether document is currently valid for welfare use")
    is_expired: bool = Field(False, description="Whether certificate validity period has lapsed")
    doc_type: str
    doc_number: str
    holder_name: str
    authority: str
    issue_date: Optional[str] = None
    expiry_date: Optional[str] = None
    verified_via: str = "API Setu • National e-Governance Division (MeitY)"
    signature_hash: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    message: str
    message_hi: str

class SampleDocumentItem(BaseModel):
    doc_type: str
    doc_number: str
    label: str
    label_hi: str
    expected_status: str
    details: str
    details_hi: str
    auto_fill: Dict[str, Any]

class SampleDocumentsResponse(BaseModel):
    sandbox_mode: bool
    samples: List[SampleDocumentItem]
