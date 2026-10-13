from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.models.citizen import Citizen
from app.schemas.profile import CitizenProfileUpdate, CitizenProfileResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get(
    "/me",
    response_model=CitizenProfileResponse,
    summary="Currently Logged-in Citizen ka Socioeconomic Profile payein"
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the authenticated citizen's demographic & socioeconomic profile from DB.
    """
    citizen = db.query(Citizen).filter(Citizen.user_id == current_user.id).first()
    if not citizen:
        # Auto-create empty profile if not found
        citizen = Citizen(user_id=current_user.id, name=f"Citizen {current_user.mobile[-4:]}")
        db.add(citizen)
        db.commit()
        db.refresh(citizen)

    return CitizenProfileResponse(
        id=citizen.id,
        user_id=current_user.id,
        mobile=current_user.mobile,
        name=citizen.name,
        age=citizen.age,
        gender=citizen.gender,
        state=citizen.state,
        district=citizen.district,
        annual_income=citizen.annual_income,
        bpl_status=citizen.bpl_status,
        caste_category=citizen.caste_category,
        digital_literacy=citizen.digital_literacy or "Low"
    )

@router.put(
    "/me",
    response_model=CitizenProfileResponse,
    summary="Citizen Profile ke Socioeconomic Attributes update karein"
)
def update_my_profile(
    profile_in: CitizenProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates the authenticated citizen's profile attributes.
    """
    citizen = db.query(Citizen).filter(Citizen.user_id == current_user.id).first()
    if not citizen:
        citizen = Citizen(user_id=current_user.id, name=profile_in.name or f"Citizen {current_user.mobile[-4:]}")
        db.add(citizen)

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        if hasattr(citizen, field):
            setattr(citizen, field, val)

    db.commit()
    db.refresh(citizen)

    return CitizenProfileResponse(
        id=citizen.id,
        user_id=current_user.id,
        mobile=current_user.mobile,
        name=citizen.name,
        age=citizen.age,
        gender=citizen.gender,
        state=citizen.state,
        district=citizen.district,
        annual_income=citizen.annual_income,
        bpl_status=citizen.bpl_status,
        caste_category=citizen.caste_category,
        digital_literacy=citizen.digital_literacy or "Low"
    )
