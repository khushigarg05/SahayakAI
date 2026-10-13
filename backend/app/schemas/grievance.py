from typing import List, Optional
from pydantic import BaseModel, Field

class GrievanceActionStep(BaseModel):
    step_number: int = Field(..., description="Action step order")
    title: str = Field(..., description="Step title or milestone")
    description: str = Field(..., description="Actionable instruction for the citizen")
    document_required: Optional[str] = Field(None, description="Supporting document needed for this step")

class GrievanceAnalyzeRequest(BaseModel):
    grievance_text: str = Field(
        ..., 
        min_length=5, 
        description="Citizen's complaint in natural Hindi, English, or Hinglish",
        examples=["PM-Kisan 17th installment not credited due to Aadhaar bank linkage error"]
    )
    category: Optional[str] = Field(None, description="Optional scheme category (Agriculture, Housing, Pension, Health)")
    scheme_name: Optional[str] = Field(None, description="Optional scheme name (PM-KISAN, PMAY-G)")
    preferred_language: str = Field("hi", description="Response language: 'hi' or 'en'")

class GrievanceAnalyzeResponse(BaseModel):
    case_id: str = Field(..., description="Generated CPGRAMS-aligned grievance tracking reference")
    detected_ministry: str = Field(..., description="Concerned Central Ministry or State Department")
    scheme_matched: str = Field(..., description="Matched welfare program")
    problem_summary: str = Field(..., description="Concise diagnostic summary of the grievance")
    severity_level: str = Field("MEDIUM", description="Urgency: HIGH, MEDIUM, LOW")
    action_steps: List[GrievanceActionStep] = Field(..., description="Step-by-step administrative resolution protocol")
    authority_contact: str = Field(..., description="Designated Public Grievance Officer designation")
    official_helpline: str = Field("1800-11-5501", description="Statutory toll-free helpline number")
    recommended_csc_action: str = Field(..., description="Actionable remedy at nearest Jan Seva Kendra")
