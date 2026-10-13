from typing import Optional
from pydantic import BaseModel, Field

class CitizenProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, description="Full Name of Citizen", examples=["Ramesh Kumar"])
    age: Optional[int] = Field(None, ge=18, le=120, description="Age in years", examples=[45])
    gender: Optional[str] = Field(None, description="Male, Female, or Other", examples=["Male"])
    state: Optional[str] = Field(None, description="State of residence", examples=["Uttar Pradesh"])
    district: Optional[str] = Field(None, description="District of residence", examples=["Varanasi"])
    annual_income: Optional[float] = Field(None, ge=0, description="Annual Family Income in INR", examples=[60000.0])
    bpl_status: Optional[bool] = Field(None, description="BPL Ration Card status", examples=[True])
    caste_category: Optional[str] = Field(None, description="General, OBC, SC, ST", examples=["OBC"])
    digital_literacy: Optional[str] = Field(None, description="Low, Medium, High", examples=["Low"])

class CitizenProfileResponse(BaseModel):
    id: int
    user_id: int
    mobile: str
    name: str
    age: Optional[int] = None
    gender: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    annual_income: Optional[float] = None
    bpl_status: bool = False
    caste_category: Optional[str] = None
    digital_literacy: Optional[str] = "Low"

    class Config:
        from_attributes = True
