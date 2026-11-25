from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SchemeBase(BaseModel):
    scheme_code: str = Field(..., examples=["PMAY-G"])
    name: str = Field(..., examples=["Pradhan Mantri Awas Yojana - Gramin"])
    ministry: str = Field(..., examples=["Ministry of Rural Development"])
    category: str = Field(..., examples=["Housing"])
    description: str
    benefits_summary: str
    min_age: Optional[int] = Field(None, ge=0, le=120)
    max_age: Optional[int] = Field(None, ge=0, le=120)
    max_annual_income: Optional[float] = Field(None, ge=0)
    requires_bpl: bool = False
    target_gender: Optional[str] = "All"
    target_caste: Optional[str] = "All"
    required_documents: List[str] = []
    official_url: Optional[str] = None
    is_active: bool = True
    data_source: Optional[str] = "statutory_seed_baseline"
    is_verified_rule: Optional[bool] = False
    rule_complexity: Optional[str] = "simplified_statutory"
    last_verified_at: Optional[str] = "2026-11-24"
    rule_disclaimer: Optional[str] = None

class SchemeCreate(SchemeBase):
    pass

class SchemeResponse(SchemeBase):
    id: int

    class Config:
        from_attributes = True

class SchemeMatchRequest(BaseModel):
    """
    Citizen Data for Rule Engine Matching.
    Either provide citizen_id (auto-fetches profile) OR direct demographic fields.
    """
    citizen_id: Optional[int] = None
    age: Optional[int] = Field(None, ge=0, le=120, description="Citizen age in years", examples=[62])
    annual_income: Optional[float] = Field(None, ge=0, description="Annual household income (INR)", examples=[45000.0])
    bpl_status: Optional[bool] = Field(False, examples=[True])
    gender: Optional[str] = Field("Male", examples=["Male", "Female", "Other"])
    caste_category: Optional[str] = Field("General", examples=["General", "OBC", "SC", "ST"])
    category: Optional[str] = Field(None, description="Alternative alias for caste category", examples=["SC", "OBC", "General"])
    state: Optional[str] = Field(None, examples=["Uttar Pradesh"])
    district: Optional[str] = Field(None, examples=["Varanasi"])
    occupation: Optional[str] = Field("Farmer", examples=["Farmer"])
    rural_or_urban: Optional[str] = Field("Rural", examples=["Rural", "Urban"])
    has_income_certificate: Optional[bool] = Field(None, description="Income Certificate availability")
    bank_account_aadhaar_linked: Optional[bool] = Field(None, description="Aadhaar DBT seeding status")
    has_caste_certificate: Optional[bool] = Field(None, description="Caste Certificate availability")
    has_bpl_ration_card: Optional[bool] = Field(None, description="BPL Ration Card availability")

class SchemeMatchResult(BaseModel):
    scheme_id: int
    scheme_code: str
    name: str
    category: str
    match_percentage: int
    is_eligible: bool
    benefits_summary: str
    matched_criteria: List[str]
    unmatched_criteria: List[str]
    required_documents: List[str]
    official_url: Optional[str] = None

class SchemeMatchResponse(BaseModel):
    citizen_id: Optional[int] = None
    total_eligible: int
    schemes: List[SchemeMatchResult]
