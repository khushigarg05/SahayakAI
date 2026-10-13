from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.db.session import get_db
from app.models.scheme import Scheme
from app.models.citizen import Citizen
from app.schemas.scheme import (
    SchemeResponse,
    SchemeMatchRequest,
    SchemeMatchResponse,
    SchemeMatchResult
)
from app.services.rule_engine import rule_engine

router = APIRouter()

@router.get(
    "",
    response_model=List[SchemeResponse],
    summary="Available Welfare Schemes ki List dekhein",
    description="High-concurrency indexed search with pagination and category filtering."
)
def list_schemes(
    category: Optional[str] = Query(None, description="Filter by Category (Housing, Agriculture, etc.)"),
    search: Optional[str] = Query(None, description="Search by scheme name or code"),
    bpl_only: Optional[bool] = Query(None, description="Filter BPL-only schemes"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=100, description="Max records per page (capped at 100 for high traffic)"),
    db: Session = Depends(get_db)
):
    query = db.query(Scheme).filter(Scheme.is_active == True)

    if category:
        query = query.filter(Scheme.category.ilike(f"%{category}%"))
    if bpl_only is not None:
        query = query.filter(Scheme.requires_bpl == bpl_only)
    if search:
        search_fmt = f"%{search}%"
        query = query.filter(
            or_(
                Scheme.name.ilike(search_fmt),
                Scheme.scheme_code.ilike(search_fmt),
                Scheme.ministry.ilike(search_fmt)
            )
        )

    schemes = query.offset(skip).limit(limit).all()
    return schemes

@router.get(
    "/{scheme_id}",
    response_model=SchemeResponse,
    summary="Specific Scheme ki Detail dekhein"
)
def get_scheme(scheme_id: int, db: Session = Depends(get_db)):
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id, Scheme.is_active == True).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Scheme ID {scheme_id} nahi mili."
        )
    return scheme

@router.post(
    "/match",
    response_model=SchemeMatchResponse,
    summary="Citizen ke liye Matching Schemes nikaalein (Rule Engine)",
    description="Citizen ID ya demographic data bhejkar sabhi yojnaon ke sath deterministic eligibility score check karein."
)
def match_schemes(request: SchemeMatchRequest, db: Session = Depends(get_db)):
    # 1. Gather citizen demographic data
    citizen_data = {}

    if request.citizen_id:
        citizen = db.query(Citizen).filter(Citizen.id == request.citizen_id).first()
        if not citizen:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Citizen ID {request.citizen_id} nahi mila."
            )
        citizen_data = {
            "age": citizen.age,
            "annual_income": citizen.annual_income,
            "bpl_status": citizen.bpl_status,
            "gender": citizen.gender,
            "caste_category": citizen.caste_category,
            "state": citizen.state,
            "district": citizen.district
        }
    else:
        # Use directly provided parameters in the request
        citizen_data = {
            "age": request.age,
            "annual_income": request.annual_income,
            "bpl_status": request.bpl_status,
            "gender": request.gender,
            "caste_category": request.caste_category,
            "state": request.state,
            "district": request.district
        }

    # 2. Fetch all active schemes
    active_schemes = db.query(Scheme).filter(Scheme.is_active == True).all()
    if not active_schemes:
        return SchemeMatchResponse(citizen_id=request.citizen_id, total_eligible=0, schemes=[])

    # 3. In-memory Rule Engine Evaluation (Zero DB lock, instant response)
    results = rule_engine.match_all(active_schemes, citizen_data)
    eligible_count = sum(1 for r in results if r.is_eligible)

    return SchemeMatchResponse(
        citizen_id=request.citizen_id,
        total_eligible=eligible_count,
        schemes=results
    )
