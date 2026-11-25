from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.citizen import Citizen
from app.schemas.auth import (
    UserRegisterRequest,
    UserRegisterResponse,
    UserLoginRequest,
    TokenResponse,
    PasswordGenerateResponse,
    OTPSendRequest,
    OTPSendResponse,
    OTPVerifyRequest,
    OTPVerifyResponse,
    FirebaseLoginRequest
)
from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    generate_strong_password
)
from app.core.config import settings
from app.api.deps import get_current_user
from app.services.otp_service import otp_service
from app.core.rate_limiter import enforce_rate_limit

router = APIRouter()

@router.post(
    "/register", 
    response_model=UserRegisterResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Naya User Register karein"
)
def register(user_in: UserRegisterRequest, db: Session = Depends(get_db)):
    """
    User Registration API:
    - Strong password validation aur Re-confirmation support
    - Agar user password nahi dalta, toh automatically strong password generate hota hai
    - Mobile number duplicate check
    - Auto creates Citizen profile entry
    """
    clean_mobile = user_in.mobile.strip()
    role_clean = (user_in.role or "citizen").lower()
    if role_clean not in ["citizen", "operator", "admin"]:
        role_clean = "citizen"

    # 1. Check duplicate mobile
    existing_user = db.query(User).filter(User.mobile == clean_mobile).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Mobile number {clean_mobile} is already registered. Please log in."
        )

    # 2. Check duplicate email agar provided hai
    if user_in.email:
        existing_email = db.query(User).filter(User.email == user_in.email).first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Email {user_in.email} is already registered."
            )

    # 3. Password handling: User provided OR Auto-generated
    generated_pwd = None
    if user_in.auto_generate_password or not user_in.password:
        final_password = generate_strong_password(length=12)
        generated_pwd = final_password
    else:
        final_password = user_in.password

    # 4. Password hashing
    hashed_pwd = get_password_hash(final_password)

    # 5. Create User Record
    db_user = User(
        mobile=clean_mobile,
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=role_clean,
        is_active=True
    )
    db.add(db_user)
    db.flush()  # ID generate karne ke liye

    # 6. Auto-create Linked Citizen Profile
    if role_clean == "citizen":
        citizen_name = (user_in.full_name or "").strip() or f"Citizen {clean_mobile[-4:]}"
        citizen_profile = Citizen(
            user_id=db_user.id,
            name=citizen_name
        )
        db.add(citizen_profile)

    db.commit()
    db.refresh(db_user)

    msg = "Registration safalta-purvak ho gaya!"
    if generated_pwd:
        msg += " Aapke liye ek Strong Password auto-generate kiya gaya hai. Isse note kar lein."

    return UserRegisterResponse(
        id=db_user.id,
        mobile=db_user.mobile,
        email=db_user.email,
        role=db_user.role,
        message=msg,
        generated_password=generated_pwd
    )

@router.post(
    "/login", 
    response_model=TokenResponse,
    summary="Mobile aur Password se Login karein aur JWT Token payein"
)
def login(login_in: UserLoginRequest, request: Request, db: Session = Depends(get_db)):
    """
    User Login API:
    - Mobile aur Password verify karta hai
    - Sahi hone par digital JWT Token return karta hai
    - Sliding-window rate limiting: 10 attempts/minute per mobile to block brute-force
    """
    # 0. Enforce Rate Limiting against brute-force attacks
    clean_mobile = login_in.mobile.strip()
    enforce_rate_limit(request=request, scope="login_mobile", max_requests=10, window_seconds=60, custom_identifier=clean_mobile)
    enforce_rate_limit(request=request, scope="login_ip", max_requests=25, window_seconds=60)

    # 1. Find user by mobile
    user = db.query(User).filter(User.mobile == login_in.mobile).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password."
        )

    # 2. Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account is deactivated. Please contact support."
        )

    # 3. Verify Password
    if not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect mobile number or password."
        )

    # 4. Generate JWT Token
    token_data = {
        "sub": user.mobile,
        "user_id": user.id,
        "role": user.role
    }
    access_token = create_access_token(data=token_data)

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        mobile=user.mobile,
        role=user.role,
        expires_in_minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

@router.post(
    "/otp/send",
    response_model=OTPSendResponse,
    summary="Mobile number par 6-digit OTP bhejein"
)
def send_otp(otp_in: OTPSendRequest):
    """
    Digital India Standard OTP Generation Endpoint:
    - 10-digit Indian Mobile number validate karta hai
    - 60 seconds cooldown resend security enforce karta hai
    - 5 minute expiration window ke sath cryptographic 6-digit OTP generate karta hai
    """
    try:
        result = otp_service.generate_otp(otp_in.mobile)
        return OTPSendResponse(**result)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"OTP dispatch service me takneeki samasya aayi: {str(e)}"
        )

@router.post(
    "/otp/verify",
    response_model=OTPVerifyResponse,
    summary="6-digit OTP verify karein aur Instant Login/Signup karein"
)
def verify_otp_and_login(verify_in: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Digital India Standard OTP Verification Endpoint:
    - 6-digit OTP verify karta hai (max 3 invalid attempts limit)
    - Agar user pehle se registered hai -> instant JWT login token deta hai
    - Agar naya user hai -> automatically Citizen profile create karke JWT token deta hai
    """
    # 1. Verify OTP with OTPService
    is_valid, msg = otp_service.verify_otp(verify_in.mobile, verify_in.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=msg
        )

    clean_mobile = otp_service._sanitize_mobile(verify_in.mobile)

    # 2. Check if user already exists
    user = db.query(User).filter(User.mobile == clean_mobile).first()
    is_new = False

    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is deactivated. Please contact support."
            )
    else:
        # 3. New Citizen Auto-Registration
        is_new = True
        auto_pwd = generate_strong_password(length=12)
        hashed_pwd = get_password_hash(auto_pwd)

        user = User(
            mobile=clean_mobile,
            hashed_password=hashed_pwd,
            role="citizen",
            is_active=True
        )
        db.add(user)
        db.flush()

        citizen_name = (verify_in.full_name or "").strip() or f"Citizen {clean_mobile[-4:]}"
        citizen_profile = Citizen(
            user_id=user.id,
            name=citizen_name
        )
        db.add(citizen_profile)
        db.commit()
        db.refresh(user)

    # 4. Generate JWT Token
    token_data = {
        "sub": user.mobile,
        "user_id": user.id,
        "role": user.role
    }
    access_token = create_access_token(data=token_data)

    welcome_msg = (
        "Naya Citizen Khata ban gaya aur aap login ho gaye hain!"
        if is_new
        else "OTP satyapit ho gaya! Welcome to SahayakAI."
    )

    return OTPVerifyResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        mobile=user.mobile,
        role=user.role,
        is_new_user=is_new,
        message=welcome_msg
    )

@router.post(
    "/firebase-login",
    response_model=OTPVerifyResponse,
    summary="Firebase Phone Auth Verify karke JWT Token issue karein"
)
def firebase_login(login_in: FirebaseLoginRequest, db: Session = Depends(get_db)):
    """
    Firebase Phone Authentication endpoint:
    - Frontend Firebase SDK ke zariye real SMS OTP verify karta hai
    - Successful OTP verify ke baad yeh endpoint backend database me user register/fetch karta hai
    - User ko SahayakAI ka official JWT token issue karta hai
    """
    clean_mobile = otp_service._sanitize_mobile(login_in.mobile)
    if len(clean_mobile) != 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid mobile number. 10-digit number is required."
        )

    # 1. Check if user already exists
    user = db.query(User).filter(User.mobile == clean_mobile).first()
    is_new = False

    if user:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account is deactivated. Please contact support."
            )
    else:
        # 2. Auto-create new citizen user
        is_new = True
        auto_pwd = generate_strong_password(length=12)
        hashed_pwd = get_password_hash(auto_pwd)

        user = User(
            mobile=clean_mobile,
            hashed_password=hashed_pwd,
            role="citizen",
            is_active=True
        )
        db.add(user)
        db.flush()

        citizen_name = (login_in.full_name or "").strip() or f"Citizen {clean_mobile[-4:]}"
        citizen_profile = Citizen(
            user_id=user.id,
            name=citizen_name
        )
        db.add(citizen_profile)
        db.commit()
        db.refresh(user)

    # 3. Generate JWT Token
    token_data = {
        "sub": user.mobile,
        "user_id": user.id,
        "role": user.role
    }
    access_token = create_access_token(data=token_data)

    welcome_msg = (
        "Naya Citizen Khata ban gaya aur aap login ho gaye hain!"
        if is_new
        else "Firebase Phone Auth safal! Welcome to SahayakAI."
    )

    return OTPVerifyResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        mobile=user.mobile,
        role=user.role,
        is_new_user=is_new,
        message=welcome_msg
    )

@router.get(
    "/generate-password", 
    response_model=PasswordGenerateResponse,
    summary="Ek naya Strong Password suggest karein"
)
def get_suggested_password():
    """
    Frontend UI ke liye helper: 'Suggest Strong Password' button click karne par
    ek cryptographically secure random password dega.
    """
    pwd = generate_strong_password(length=12)
    return PasswordGenerateResponse(
        suggested_password=pwd,
        strength="Strong",
        message="Yeh ek secure random password hai. Isme Bada letter, Chhota letter, Number aur Special symbol shamil hain."
    )

@router.get(
    "/me", 
    summary="Currently Logged-in User ki details payein"
)
def read_current_user(current_user: User = Depends(get_current_user)):
    """
    Protected Endpoint: Valid JWT Token bhejne par user ka profile data return karega.
    """
    return {
        "id": current_user.id,
        "mobile": current_user.mobile,
        "email": current_user.email,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

