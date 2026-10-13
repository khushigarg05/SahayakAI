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

    class Config:
        from_attributes = True

class BookTokenRequest(BaseModel):
    """
    Request to book a physical CSC Kiosk Appointment Token.
    """
    citizen_id: int = Field(..., description="Registered User/Citizen ID", examples=[1])
    kiosk_id: int = Field(..., description="Target CSC Center ID", examples=[1])
    scheme_id: Optional[int] = Field(None, description="Optional target welfare scheme ID", examples=[1])
    appointment_date: str = Field(..., description="Date (YYYY-MM-DD)", examples=["2026-09-10"])
    appointment_time_slot: str = Field("10:30 AM - 11:00 AM", description="Time slot", examples=["10:30 AM - 11:00 AM"])
    preferred_language: str = Field("hi", description="Preferred Language: hi, en, bn, te, mr, ta", examples=["hi"])
    notes: Optional[str] = None

class BookTokenResponse(BaseModel):
    """
    Multilingual Appointment Token & Digital QR Code Receipt.
    """
    token_number: str = Field(..., examples=["#SAH-8921"])
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
    qr_code_base64: str

    # Multilingual Localized Receipt
    preferred_language: str
    receipt_title: str
    status_message: str
    localized_instructions: List[str]
