from typing import Optional, List
from pydantic import BaseModel, Field

class DashboardSummaryResponse(BaseModel):
    citizen_name: str = Field(..., description="Citizen's full name")
    mobile: str = Field(..., description="Registered mobile number")
    district: str = Field("Varanasi", description="Current district")
    state: str = Field("Uttar Pradesh", description="Current state")
    bpl_status: bool = Field(False, description="Whether citizen is BPL category")
    total_eligible_schemes: int = Field(3, description="Count of matched statutory schemes")
    rejection_risk_score: float = Field(42.0, description="XGBoost predicted administrative risk percentage")
    rejection_risk_level: str = Field("MEDIUM RISK", description="Risk category: LOW, MEDIUM, HIGH")
    active_appointments_count: int = Field(0, description="Count of active CSC kiosk booking passes")
    recent_token: Optional[str] = Field(None, description="Most recent CSC token pass number")
    top_barrier: str = Field("Missing Income Certificate", description="Primary administrative barrier")
    top_remedy: str = Field("Renew Tehsil income certificate at nearest CSC", description="Recommended action")
