from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class AssessRiskRequest(BaseModel):
    """
    Combined Risk & Feasibility Assessment Request.
    Provide scheme_id and either citizen_id OR dynamic profile parameters.
    """
    scheme_id: int = Field(..., description="Target Scheme ID", examples=[1])
    citizen_id: Optional[int] = Field(None, description="Registered Citizen ID (optional)")

    # Dynamic citizen demographic overrides
    age: Optional[int] = Field(None, examples=[62])
    annual_income: Optional[float] = Field(None, examples=[45000.0])
    bpl_status: Optional[bool] = Field(False, examples=[True])
    gender: Optional[str] = Field("Male", examples=["Male", "Female"])
    caste_category: Optional[str] = Field("OBC", examples=["General", "OBC", "SC", "ST"])

    # Operational & Ground Barriers
    distance_to_csc_km: Optional[float] = Field(12.0, description="Gaon se CSC ya Tehsil ki doori (km me)", examples=[18.5])
    digital_literacy: Optional[str] = Field("Low", description="Low, Medium, ya High", examples=["Low"])
    has_income_certificate: Optional[bool] = Field(False, description="Kya aamdani praman patra uplabdh hai?", examples=[False])
    bank_account_aadhaar_linked: Optional[bool] = Field(False, description="Kya Bank account Aadhaar linked (DBT) hai?", examples=[False])
    has_caste_certificate: Optional[bool] = Field(True, examples=[True])
    prior_rejections_count: Optional[int] = Field(0, examples=[1])

class SHAPBarrierItem(BaseModel):
    factor_key: str
    factor: str
    impact_percentage: str
    description: str
    remedy: str

class ActionStep(BaseModel):
    step_number: int
    title: str
    instruction: str
    action_type: str  # e.g., 'document', 'bank', 'kiosk', 'online'

class AssessRiskResponse(BaseModel):
    """
    The Single Power Response for Frontend Page 4:
    Combines Deterministic Eligibility + ML Risk Score + SHAP Barriers + Action Plan.
    """
    citizen_id: Optional[int] = None
    scheme_id: int
    scheme_name: str
    scheme_code: str
    eligibility_match: str
    is_eligible: bool
    risk_score: float
    risk_level: str  # HIGH, MEDIUM, LOW
    top_barriers: List[SHAPBarrierItem]
    action_plan: List[ActionStep]
    required_documents: List[str]
