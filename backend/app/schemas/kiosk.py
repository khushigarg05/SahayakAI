from typing import Optional, List
from pydantic import BaseModel, Field

class KioskBase(BaseModel):
    center_name: str = Field(..., examples=["Rampur CSC Jan Seva Kendra"])
    vle_operator_name: str = Field(..., examples=["Suresh Kumar"])
    phone: str = Field(..., examples=["+91 98765 43210"])
    email: Optional[str] = None
    address: str = Field(..., examples=["Near Panchayat Bhawan, Village Rampur"])
    district: str = Field(..., examples=["Varanasi"])
    state: str = Field(..., examples=["Uttar Pradesh"])
    pincode: str = Field(..., examples=["221001"])
    operating_hours: str = "09:00 AM - 06:00 PM"
    supported_services: str = "Aadhaar, DBT, Schemes, Certificates"

class KioskResponse(KioskBase):
    id: int
    is_active: bool
    distance_km: Optional[float] = 2.5

    class Config:
        from_attributes = True

class BookTokenRequest(BaseModel):
    """
    Request to book a physical CSC Kiosk Appointment Token.
    """
    kiosk_id: int = Field(..., description="Target CSC Center ID", examples=[1])
    citizen_id: Optional[int] = Field(None, description="Registered User/Citizen ID (optional)", examples=[1])
    citizen_name: Optional[str] = Field(None, description="Citizen Name", examples=["Test Citizen"])
    mobile_number: Optional[str] = Field(None, description="Citizen Mobile Number", examples=["9876543210"])
    scheme_id: Optional[int] = Field(None, description="Optional target welfare scheme ID", examples=[1])
    appointment_date: Optional[str] = Field(None, description="Date (YYYY-MM-DD)", examples=["2026-09-10"])
    appointment_time_slot: str = Field("10:30 AM - 11:00 AM", description="Time slot", examples=["10:30 AM - 11:00 AM"])
    preferred_language: str = Field("hi", description="Preferred Language: hi, en, bn, te, mr, ta", examples=["hi"])
    district: Optional[str] = None
    notes: Optional[str] = None

class BookTokenResponse(BaseModel):
    """
    Multilingual Appointment Token & Digital QR Code Receipt.
    """
    token_number: str = Field(..., examples=["#SAH-8921"])
    reference_id: Optional[str] = None
    booking_reference: Optional[str] = None
    appointment_id: int
    status: str = "BOOKED"
    appointment_date: str
    appointment_time_slot: str
    
    # Center Details
    kiosk_name: str
    operator_name: str
    operator_phone: str
    kiosk_address: str
    
    # Digital Asset (Base64 PNG Image)
    qr_code: Optional[str] = None
    qr_code_base64: str

    # Multilingual Localized Receipt
    preferred_language: str
    receipt_title: str
    status_message: str
    localized_instructions: List[str]

class TrackingStepSchema(BaseModel):
    name: str
    name_hi: Optional[str] = None
    date: str
    date_hi: Optional[str] = None
    completed: bool
    current: bool = False
    error: Optional[str] = None
    error_hi: Optional[str] = None

class TrackingDetailResponse(BaseModel):
    id: str
    scheme_name: str
    scheme_name_hi: str
    type: str
    type_hi: str
    status: str
    status_hi: str
    kiosk_name: str
    date: str
    date_hi: str
    progress: int
    qr_code_base64: Optional[str] = None
    operator_phone: Optional[str] = None
    steps: List[TrackingStepSchema]
