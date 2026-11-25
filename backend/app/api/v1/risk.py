from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.scheme import Scheme
from app.models.citizen import Citizen
from app.schemas.risk import (
    AssessRiskRequest,
    AssessRiskResponse,
    SHAPBarrierItem,
    ActionStep
)
from app.services.rule_engine import rule_engine
from app.services.ml_risk_service import ml_risk_service
from app.services.shap_service import shap_service

router = APIRouter()

def generate_action_plan(barriers: List[dict], scheme: Scheme) -> List[ActionStep]:
    """
    Generates tailored, actionable steps based on identified SHAP barriers.
    """
    steps = []
    step_num = 1

    barrier_keys = [b["factor_key"] for b in barriers]

    # Step for Missing Income Certificate
    if "has_income_certificate" in barrier_keys:
        steps.append(ActionStep(
            step_number=step_num,
            title="Aamdani Praman Patra (Income Certificate) Banwayein",
            instruction="Apni Tehsil ya Block office jakar ya CSC center se aamdani praman patra renew karwayein.",
            action_type="document"
        ))
        step_num += 1

    # Step for Missing Caste Certificate
    if "has_caste_certificate" in barrier_keys:
        steps.append(ActionStep(
            step_number=step_num,
            title="Jaati Praman Patra (Caste Certificate) Banwayein",
            instruction="e-District portal ya Tehsil karyalaya se pramanit jaati praman patra prapt karein.",
            action_type="document"
        ))
        step_num += 1

    # Step for Missing Ration Card
    if "has_bpl_ration_card" in barrier_keys:
        steps.append(ActionStep(
            step_number=step_num,
            title="BPL / Rashan Card Aavedan Karein",
            instruction="Khadya evam Rasad vibhag portal ya CSC center jakar naya rashan card aavedan karein.",
            action_type="document"
        ))
        step_num += 1

    # Step for Unlinked Bank Account
    if "bank_account_aadhaar_linked" in barrier_keys:
        steps.append(ActionStep(
            step_number=step_num,
            title="Bank Account Aadhaar (DBT) Seeding Karwayein",
            instruction="Apni bank branch jakar Aadhaar Mandate form bharein taaki sarkari rashi bina ruke seedha account me aaye.",
            action_type="bank"
        ))
        step_num += 1

    # Step for Distance or Digital Literacy -> Kiosk Appointment
    if "distance_to_csc_km" in barrier_keys or "digital_literacy_score" in barrier_keys or "digital_literacy" in barrier_keys:
        steps.append(ActionStep(
            step_number=step_num,
            title="Nazdeeki CSC Kiosk par Appointment Book Karein",
            instruction=f"VLE Operator ki madad se {scheme.scheme_code} ka biometric form bharein taaki koi galti na ho.",
            action_type="kiosk"
        ))
        step_num += 1

    # Fallback / Final Confirmation Step
    steps.append(ActionStep(
        step_number=step_num,
        title="Dastavez Verification aur Submission",
        instruction="Sabhi original documents (Aadhaar, Bank Passbook, Ration Card) ke sath form antim roop se submit karein.",
        action_type="submission"
    ))

    return steps

@router.post(
    "/assess-risk",
    response_model=AssessRiskResponse,
    summary="Combined Risk & SHAP Assessment (The Power Endpoint ⭐)",
    description="Frontend Page 4 ke liye Single Clean API: Rule Engine + XGBoost ML Model + SHAP Barrier Explanations + Action Plan."
)
def assess_risk(request: AssessRiskRequest, db: Session = Depends(get_db)):
    # 1. Fetch Target Scheme
    scheme = db.query(Scheme).filter(Scheme.id == request.scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme ID {request.scheme_id} database me nahi mili."
        )

    # 2. Build Citizen Demographics & Ground Factors
    citizen_data = {}
    if request.citizen_id:
        citizen = db.query(Citizen).filter(Citizen.id == request.citizen_id).first()
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen ID {request.citizen_id} nahi mila."
            )
        citizen_data = {
            "age": request.age if request.age is not None else citizen.age,
            "annual_income": request.annual_income if request.annual_income is not None else citizen.annual_income,
            "bpl_status": request.bpl_status if request.bpl_status is not None else citizen.bpl_status,
            "gender": request.gender or citizen.gender,
            "caste_category": request.caste_category or citizen.caste_category,
            "state": request.state or citizen.state or "Uttar Pradesh",
            "district": request.district or citizen.district or "Varanasi",
            "occupation": request.occupation or getattr(citizen, "occupation", None) or "Farmer",
            "rural_or_urban": request.rural_or_urban or getattr(citizen, "rural_or_urban", None) or "Rural",
            "digital_literacy": request.digital_literacy or citizen.digital_literacy,
            "distance_to_csc_km": request.distance_to_csc_km,
            "has_income_certificate": request.has_income_certificate,
            "bank_account_aadhaar_linked": request.bank_account_aadhaar_linked,
            "has_caste_certificate": request.has_caste_certificate,
            "has_bpl_ration_card": request.has_bpl_ration_card,
            "prior_rejections_count": request.prior_rejections_count,
            "lang": request.lang or "en"
        }
    else:
        citizen_data = {
            "age": request.age or 35,
            "annual_income": request.annual_income or 60000.0,
            "bpl_status": request.bpl_status,
            "gender": request.gender or "Male",
            "caste_category": request.caste_category or "General",
            "state": request.state or "Uttar Pradesh",
            "district": request.district or "Varanasi",
            "occupation": request.occupation or "Farmer",
            "rural_or_urban": request.rural_or_urban or "Rural",
            "distance_to_csc_km": request.distance_to_csc_km,
            "digital_literacy": request.digital_literacy or "Low",
            "has_income_certificate": request.has_income_certificate,
            "bank_account_aadhaar_linked": request.bank_account_aadhaar_linked,
            "has_caste_certificate": request.has_caste_certificate,
            "has_bpl_ration_card": request.has_bpl_ration_card,
            "prior_rejections_count": request.prior_rejections_count,
            "lang": request.lang or "en"
        }

    # 3. Rule Engine: Deterministic Eligibility Check
    rule_result = rule_engine.evaluate_scheme(scheme, citizen_data)

    # 4. ML Model: Predict Access Risk Score (0.0 to 1.0)
    risk_score, risk_level = ml_risk_service.predict_risk(citizen_data)

    # 5. SHAP Service: Calculate Top Mathematical Barriers (Dynamic top 5)
    raw_barriers = shap_service.explain_barriers(citizen_data, top_k=5)
    top_barriers = [SHAPBarrierItem(**b) for b in raw_barriers]

    # 6. Action Plan Generator
    action_plan = generate_action_plan(raw_barriers, scheme)

    # 7. Extract required documents safely
    docs = scheme.required_documents if isinstance(scheme.required_documents, list) else []

    return AssessRiskResponse(
        citizen_id=request.citizen_id,
        scheme_id=scheme.id,
        scheme_name=scheme.name,
        scheme_code=scheme.scheme_code,
        eligibility_match=f"{rule_result.match_percentage}%",
        is_eligible=rule_result.is_eligible,
        risk_score=risk_score,
        risk_level=risk_level,
        top_barriers=top_barriers,
        action_plan=action_plan,
        required_documents=docs
    )
