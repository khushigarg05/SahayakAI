from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from app.db.session import get_db

from app.models.kiosk import Kiosk
from app.models.appointment import Appointment
from app.models.user import User
from app.schemas.kiosk import (
    KioskResponse,
    BookTokenRequest,
    BookTokenResponse
)
from app.services.token_service import token_service

router = APIRouter()


@router.get(
    "/nearby",
    response_model=List[KioskResponse],
    summary="Nazdeeki CSC Centers / Kiosks Dhoondein",
    description="Pincode, District, ya State ke basis par nazdeeki CSC Centers khojein."
)
def get_nearby_kiosks(
    pincode: Optional[str] = Query(None, description="6-digit Area Pincode"),
    district: Optional[str] = Query(None, description="District name (e.g. Varanasi, Patna)"),
    state: Optional[str] = Query(None, description="State name (e.g. Uttar Pradesh, Bihar)"),
    search: Optional[str] = Query(None, description="Center or operator name search"),
    limit: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db)
):
    query = db.query(Kiosk).filter(Kiosk.is_active == True)

    if pincode:
        query = query.filter(Kiosk.pincode == pincode.strip())
    elif district:
        query = query.filter(Kiosk.district.ilike(f"%{district.strip()}%"))
    elif state:
        query = query.filter(Kiosk.state.ilike(f"%{state.strip()}%"))

    if search:
        search_fmt = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Kiosk.center_name.ilike(search_fmt),
                Kiosk.vle_operator_name.ilike(search_fmt),
                Kiosk.address.ilike(search_fmt)
            )
        )

    kiosks = query.limit(limit).all()
    return kiosks

@router.get(
    "/verify-token/{token_number}",
    summary="Operator Portal: Token aur QR Code Verify Karein"
)
def verify_token(token_number: str, db: Session = Depends(get_db)):
    clean_token = token_number.strip().upper()
    if not clean_token.startswith("#"):
        clean_token = f"#{clean_token}"

    appt = db.query(Appointment).filter(Appointment.token_number == clean_token).first()
    if not appt:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Token {token_number} galat hai ya exist nahi karta."
        )

    citizen_name = "Citizen"
    if appt.citizen and appt.citizen.citizen_profile:
        citizen_name = appt.citizen.citizen_profile.name

    return {
        "valid": True,
        "token_number": appt.token_number,
        "status": appt.status,
        "citizen_name": citizen_name,
        "citizen_mobile": appt.citizen.mobile if appt.citizen else None,
        "kiosk_name": appt.kiosk.center_name if appt.kiosk else None,
        "appointment_date": appt.appointment_date,
        "appointment_time_slot": appt.appointment_time_slot,
        "scheme_name": appt.scheme.name if appt.scheme else "General Consultation"
    }

@router.get(
    "/{kiosk_id}",
    response_model=KioskResponse,
    summary="Specific Kiosk ki Details"
)
def get_kiosk(kiosk_id: int, db: Session = Depends(get_db)):
    kiosk = db.query(Kiosk).filter(Kiosk.id == kiosk_id, Kiosk.is_active == True).first()
    if not kiosk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kiosk ID {kiosk_id} nahi mila."
        )
    return kiosk

@router.post(
    "/book-token",
    response_model=BookTokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="CSC Kiosk Appointment Token & QR Code Book Karein (Multilingual)",
    description="Unique #SAH-XXXX Token aur Scannable QR Code generate karein (Hindi, English, Bengali, Telugu, Marathi, Tamil me)."
)
def book_token(request: BookTokenRequest, db: Session = Depends(get_db)):
    # 1. Verify Kiosk
    kiosk = db.query(Kiosk).filter(Kiosk.id == request.kiosk_id, Kiosk.is_active == True).first()
    if not kiosk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Kiosk ID {request.kiosk_id} database me nahi mila."
        )

    # 2. Verify User / Citizen
    user = db.query(User).filter(User.id == request.citizen_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User ID {request.citizen_id} nahi mila."
        )

    # 3. Collision-Proof Token Generation & DB Commit (Race-Condition Protected)
    max_retries = 5
    appointment = None
    token_num = None
    qr_base64 = None

    for attempt in range(max_retries):
        candidate_token = token_service.generate_token_number()
        # Fast memory check against DB
        if db.query(Appointment.id).filter(Appointment.token_number == candidate_token).first():
            continue

        token_num = candidate_token
        # 4. Generate Scannable QR Code payload
        qr_payload = {
            "token": token_num,
            "citizen_mobile": user.mobile,
            "kiosk_id": kiosk.id,
            "kiosk_name": kiosk.center_name,
            "date": request.appointment_date,
            "slot": request.appointment_time_slot
        }
        qr_base64 = token_service.generate_qr_code_base64(qr_payload)

        # 5. Save Appointment Record
        candidate_appt = Appointment(
            token_number=token_num,
            citizen_id=user.id,
            kiosk_id=kiosk.id,
            scheme_id=request.scheme_id,
            appointment_date=request.appointment_date,
            appointment_time_slot=request.appointment_time_slot,
            status="BOOKED",
            preferred_language=request.preferred_language,
            qr_code_base64=qr_base64,
            notes=request.notes
        )
        try:
            db.add(candidate_appt)
            db.commit()
            db.refresh(candidate_appt)
            appointment = candidate_appt
            break
        except IntegrityError:
            db.rollback()
            if attempt == max_retries - 1:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Server is handling very high booking traffic. Please try booking again in a few seconds."
                )

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token could not be allocated due to high concurrency. Please retry."
        )

    # 6. Retrieve Multilingual Localized Pack
    lang_pack = token_service.get_localized_pack(request.preferred_language)


    return BookTokenResponse(
        token_number=token_num,
        appointment_id=appointment.id,
        status=appointment.status,
        appointment_date=appointment.appointment_date,
        appointment_time_slot=appointment.appointment_time_slot,
        kiosk_name=kiosk.center_name,
        operator_name=kiosk.vle_operator_name,
        operator_phone=kiosk.phone,
        kiosk_address=f"{kiosk.address}, {kiosk.district}, {kiosk.state} - {kiosk.pincode}",
        qr_code_base64=qr_base64,
        preferred_language=request.preferred_language,
        receipt_title=lang_pack["title"],
        status_message=lang_pack["status_confirmed"],
        localized_instructions=lang_pack["instructions"]
    )
