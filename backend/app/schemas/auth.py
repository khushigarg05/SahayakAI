import re
from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator

class UserRegisterRequest(BaseModel):
    """
    User Registration Request Schema
    Supports manual strong password with confirmation OR auto-generation.
    """
    mobile: str = Field(..., description="10-digit Indian Mobile Number", examples=["9876543210"])
    full_name: Optional[str] = Field(None, description="Citizen's full name", examples=["Ramesh Kumar"])
    email: Optional[str] = Field(None, description="Optional Email Address", examples=["citizen@example.com"])
    password: Optional[str] = Field(None, description="Strong password (8-72 chars). Khali chhodne par auto-generate hoga.")
    confirm_password: Optional[str] = Field(None, description="Password re-confirmation. Password ke barabar hona zaroori hai.")
    auto_generate_password: bool = Field(False, description="Agar true ho, toh server khud strong password generate karega.")
    role: str = Field("citizen", description="User role in SahayakAI portal (citizen, operator, admin)")

    @model_validator(mode="after")
    def validate_password_and_confirmation(self):
        # Case 1: Agar user ne auto-generate choose kiya ya password khali chhora
        if self.auto_generate_password or not self.password:
            self.auto_generate_password = True
            return self

        # Case 2: Agar user ne khud password dala hai
        pwd = self.password

        # Rule 1: Length (8 to 72 chars)
        if len(pwd) < 8:
            raise ValueError("Password kamzor hai: Kam se kam 8 characters hone chahiye.")
        if len(pwd) > 72:
            raise ValueError("Password bohot lamba hai: Maximum 72 characters allowed hain.")

        # Rule 2: At least 1 Uppercase
        if not re.search(r"[A-Z]", pwd):
            raise ValueError("Password kamzor hai: Kam se kam 1 Bada Letter (A-Z) hona chahiye.")

        # Rule 3: At least 1 Lowercase
        if not re.search(r"[a-z]", pwd):
            raise ValueError("Password kamzor hai: Kam se kam 1 Chhota Letter (a-z) hona chahiye.")

        # Rule 4: At least 1 Number
        if not re.search(r"[0-9]", pwd):
            raise ValueError("Password kamzor hai: Kam se kam 1 Number (0-9) hona chahiye.")

        # Rule 5: At least 1 Special Symbol
        if not re.search(r"[@$!%*?&#]", pwd):
            raise ValueError("Password kamzor hai: Kam se kam 1 Special Symbol (@, $, !, %, *, ?, &, #) hona chahiye.")

        # Rule 6: Re-confirm Password match hona chahiye
        if not self.confirm_password:
            raise ValueError("Confirm Password zaroori hai: Kripya 'confirm_password' field bharein.")
        if self.password != self.confirm_password:
            raise ValueError("Password match nahi hua: 'password' aur 'confirm_password' bilkul same hone chahiye.")

        return self

class UserRegisterResponse(BaseModel):
    """
    Response sent back upon successful registration.
    """
    id: int
    mobile: str
    email: Optional[str] = None
    role: str
    message: str
    generated_password: Optional[str] = Field(None, description="Agar password auto-generate hua tha, toh yahan dikhega.")

class UserLoginRequest(BaseModel):
    """
    User Login Request Schema
    """
    mobile: str = Field(..., description="Registered 10-digit Mobile Number", examples=["9876543210"])
    password: str = Field(..., description="User's Password", examples=["Secret@12345"])

class TokenResponse(BaseModel):
    """
    JWT Access Token Response
    """
    access_token: str
    token_type: str = "bearer"
    user_id: int
    mobile: str
    role: str
    expires_in_minutes: int

class PasswordGenerateResponse(BaseModel):
    """
    Suggested strong password response
    """
    suggested_password: str
    strength: str = "Strong"
    message: str

# --- REAL OTP AUTHENTICATION SCHEMAS ---

class OTPSendRequest(BaseModel):
    """
    Schema for requesting a 6-digit OTP to a mobile number
    """
    mobile: str = Field(..., description="10-digit Indian Mobile Number", examples=["9876543210"])

class OTPSendResponse(BaseModel):
    """
    Response returned when OTP is generated and dispatched
    """
    mobile: str
    message: str
    expires_in_seconds: int
    resend_available_in_seconds: int
    demo_otp: Optional[str] = Field(None, description="Demo OTP returned for sandbox presentation testing")

class OTPVerifyRequest(BaseModel):
    """
    Schema for verifying the 6-digit OTP
    """
    mobile: str = Field(..., description="10-digit Indian Mobile Number", examples=["9876543210"])
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit numeric OTP code", examples=["123456"])
    full_name: Optional[str] = Field(None, description="Optional full name if user is signing up for the first time")

class OTPVerifyResponse(BaseModel):
    """
    Response returned upon successful OTP verification with JWT session token
    """
    access_token: str
    token_type: str = "bearer"
    user_id: int
    mobile: str
    role: str
    is_new_user: bool = False
    message: str

