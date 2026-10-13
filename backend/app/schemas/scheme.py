from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class SchemeBase(BaseModel):
    scheme_code: str = Field(..., examples=["PMAY-G"])
    name: str = Field(..., examples=["Pradhan Mantri Awas Yojana - Gramin"])
    ministry: str = Field(..., examples=["Ministry of Rural Development"])
    category: str = Field(..., examples=["Housing"])
    description: str
    benefits_summary: str
    min_age: Optional[int] = None
    max_age: Optional[int] = None
    max_annual_income: Optional[float] = None
    requires_bpl: bool = False
    target_gender: Optional[str] = "All"
    target_caste: Optional[str] = "All"
    required_documents: List[str] = []
    official_url: Optional[str] = None
    is_active: bool = True

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
    age: Optional[int] = Field(None, examples=[62])
    annual_income: Optional[float] = Field(None, examples=[45000.0])
    bpl_status: Optional[bool] = Field(False, examples=[True])
    gender: Optional[str] = Field("Male", examples=["Male", "Female", "Other"])
    caste_category: Optional[str] = Field("General", examples=["General", "OBC", "SC", "ST"])
    state: Optional[str] = Field(None, examples=["Uttar Pradesh"])
    district: Optional[str] = Field(None, examples=["Varanasi"])

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
