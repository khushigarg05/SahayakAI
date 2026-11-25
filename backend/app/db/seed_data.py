import logging
from sqlalchemy.orm import Session
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.scheme import Scheme
from app.models.kiosk import Kiosk

logger = logging.getLogger(__name__)

INITIAL_SCHEMES = [
    {
        "scheme_code": "PMAY-G",
        "name": "Pradhan Mantri Awas Yojana - Gramin",
        "ministry": "Ministry of Rural Development",
        "category": "Housing",
        "description": "Financial assistance to BPL rural families for constructing safe, permanent pucca houses.",
        "benefits_summary": "Rs. 1,20,000 in plain areas / Rs. 1,30,000 in hilly areas + 90 days MGNREGA unskilled labour wages.",
        "min_age": 18,
        "max_age": None,
        "max_annual_income": 150000.0,
        "requires_bpl": True,
        "target_gender": "All",
        "target_caste": "All",
        "required_documents": ["Aadhaar Card", "Bank Account Passbook (Aadhaar linked)", "BPL Ration Card", "Land Possession Proof"],
        "official_url": "https://pmayg.nic.in",
        "data_source": "Ministry of Rural Development (Statutory Baseline)",
        "is_verified_rule": True,
        "rule_complexity": "standard_statutory",
        "last_verified_at": "2026-11-24",
        "rule_disclaimer": "Verified against PMAY-G operational guidelines. Beneficiary selection relies on Awaas+ SECC 2011 priority ranking."
    },
    {
        "scheme_code": "PM-KISAN",
        "name": "Pradhan Mantri Kisan Samman Nidhi",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "category": "Agriculture",
        "description": "Direct income support to landholding farmer families across India.",
        "benefits_summary": "Rs. 6,000 per year deposited directly into bank accounts in 3 equal installments of Rs. 2,000.",
        "min_age": 18,
        "max_age": None,
        "max_annual_income": 250000.0,
        "requires_bpl": False,
        "target_gender": "All",
        "target_caste": "All",
        "required_documents": ["Aadhaar Card", "Land Ownership Record (Khatauni)", "Bank Passbook with DBT active"],
        "official_url": "https://pmkisan.gov.in",
        "data_source": "Ministry of Agriculture & Farmers Welfare (Statutory Baseline)",
        "is_verified_rule": False,
        "rule_complexity": "simplified_model",
        "last_verified_at": "2026-11-24",
        "rule_disclaimer": "Simplified Rule: Operational guidelines exclude institutional landholders and income tax payees rather than a flat Rs. 2,50,000 threshold."
    },
    {
        "scheme_code": "IGNOAPS",
        "name": "Indira Gandhi National Old Age Pension Scheme",
        "ministry": "Ministry of Rural Development",
        "category": "Social Security",
        "description": "Monthly social security pension for senior citizens living below the poverty line.",
        "benefits_summary": "Monthly pension of Rs. 1,000 to Rs. 2,500 directly in bank accounts.",
        "min_age": 60,
        "max_age": None,
        "max_annual_income": 60000.0,
        "requires_bpl": True,
        "target_gender": "All",
        "target_caste": "All",
        "required_documents": ["Aadhaar Card", "Age Proof Certificate (Voter ID/Birth Cert)", "BPL Ration Card", "Bank Passbook"],
        "official_url": "https://nsap.nic.in",
        "data_source": "National Social Assistance Programme (NSAP Guidelines)",
        "is_verified_rule": True,
        "rule_complexity": "standard_statutory",
        "last_verified_at": "2026-11-24",
        "rule_disclaimer": "Central contribution is Rs. 200/mo (age 60-79) or Rs. 500/mo (age 80+); state governments add supplemental pensions to reach Rs. 1,000-2,500/mo."
    },
    {
        "scheme_code": "PM-JAY",
        "name": "Ayushman Bharat - PM Jan Arogya Yojana",
        "ministry": "Ministry of Health and Family Welfare",
        "category": "Healthcare",
        "description": "World's largest government-funded healthcare assurance scheme.",
        "benefits_summary": "Cashless health cover up to Rs. 5,00,000 per family per year for secondary and tertiary hospitalisation.",
        "min_age": 0,
        "max_age": None,
        "max_annual_income": 120000.0,
        "requires_bpl": True,
        "target_gender": "All",
        "target_caste": "All",
        "required_documents": ["Aadhaar Card", "Ration Card (SECC 2011 Listing)", "Registered Mobile Number"],
        "official_url": "https://pmjay.gov.in",
        "data_source": "National Health Authority (AB PM-JAY Guidelines)",
        "is_verified_rule": True,
        "rule_complexity": "standard_statutory",
        "last_verified_at": "2026-11-24",
        "rule_disclaimer": "Eligibility based on SECC 2011 deprivation criteria (D1-D7) or active RSBY ration card."
    },
    {
        "scheme_code": "PMUY",
        "name": "Pradhan Mantri Ujjwala Yojana (Ujjwala 2.0)",
        "ministry": "Ministry of Petroleum and Natural Gas",
        "category": "Energy & Cooking",
        "description": "Clean cooking fuel (LPG) connections to adult women from poor households.",
        "benefits_summary": "Free LPG connection with zero deposit + Free first LPG refill cylinder and gas stove.",
        "min_age": 18,
        "max_age": None,
        "max_annual_income": 100000.0,
        "requires_bpl": True,
        "target_gender": "Female",
        "target_caste": "All",
        "required_documents": ["Aadhaar Card of Woman Beneficiary", "BPL Ration Card", "Bank Passbook with Aadhaar Seeding"],
        "official_url": "https://pmuy.gov.in",
        "data_source": "Ministry of Petroleum & Natural Gas (Ujjwala 2.0 Guidelines)",
        "is_verified_rule": True,
        "rule_complexity": "standard_statutory",
        "last_verified_at": "2026-11-24",
        "rule_disclaimer": "Connection is released strictly in the name of an adult woman member of poor/BPL household with 14-point declaration."
    }
]

INITIAL_KIOSKS = [
    {
        "center_name": "Rampur CSC Jan Seva Kendra",
        "vle_operator_name": "Suresh Kumar",
        "phone": "+91 98765 43210",
        "email": "suresh.csc@sahayak.in",
        "address": "Near Panchayat Bhawan, Village Rampur",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "pincode": "221001",
        "latitude": 25.3176,
        "longitude": 82.9739,
        "operating_hours": "09:00 AM - 06:00 PM",
        "supported_services": "Aadhaar, DBT Seeding, PMAY-G, PM-Kisan, Ayushman Card",
        "is_active": True
    },
    {
        "center_name": "Danapur CSC Digital Seva Kendra",
        "vle_operator_name": "Rajesh Sharma",
        "phone": "+91 98111 22334",
        "email": "rajesh.patna@sahayak.in",
        "address": "Main Bazar, Near Bus Stand, Danapur Cantt",
        "district": "Patna",
        "state": "Bihar",
        "pincode": "801503",
        "latitude": 25.6333,
        "longitude": 85.0500,
        "operating_hours": "08:30 AM - 06:30 PM",
        "supported_services": "Aadhaar Seeding, Ration Card, All Welfare Schemes",
        "is_active": True
    },
    {
        "center_name": "Aliganj Jan Seva Kendra",
        "vle_operator_name": "Anjali Verma",
        "phone": "+91 94500 11223",
        "email": "anjali.lucknow@sahayak.in",
        "address": "Sector B, Near Kapoor Lampur Chauraha, Aliganj",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "pincode": "226024",
        "latitude": 26.8867,
        "longitude": 80.9462,
        "operating_hours": "09:30 AM - 06:00 PM",
        "supported_services": "Scholarships, Pensions, DBT Link, Income Certificate",
        "is_active": True
    },
    {
        "center_name": "Whitefield Grama One & CSC Center",
        "vle_operator_name": "Manjunath Gowda",
        "phone": "+91 99000 88776",
        "email": "manju.blr@sahayak.in",
        "address": "Near Post Office, Inner Circle, Whitefield",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "pincode": "560066",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "operating_hours": "09:00 AM - 07:00 PM",
        "supported_services": "All Central & State Karnataka Welfare Schemes, Aadhaar",
        "is_active": True
    },
    {
        "center_name": "Connaught Place CSC Jan Seva Kendra",
        "vle_operator_name": "Amitabh Sen",
        "phone": "+91 98101 23456",
        "email": "delhi.csc@sahayak.in",
        "address": "Block B, Inner Circle, Connaught Place",
        "district": "Delhi",
        "state": "Delhi",
        "pincode": "110001",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "operating_hours": "09:00 AM - 06:00 PM",
        "supported_services": "All Central & State Delhi Welfare Schemes, Aadhaar, DBT",
        "is_active": True
    }
]

def seed_database(db: Session):
    # 1. Seed Schemes
    scheme_count = 0
    for data in INITIAL_SCHEMES:
        existing = db.query(Scheme).filter(Scheme.scheme_code == data["scheme_code"]).first()
        if not existing:
            scheme = Scheme(**data)
            db.add(scheme)
            scheme_count += 1
        else:
            # Update provenance & verification metadata
            existing.data_source = data.get("data_source")
            existing.is_verified_rule = data.get("is_verified_rule", False)
            existing.rule_complexity = data.get("rule_complexity")
            existing.last_verified_at = data.get("last_verified_at")
            existing.rule_disclaimer = data.get("rule_disclaimer")

    # 2. Seed Kiosks
    kiosk_count = 0
    for data in INITIAL_KIOSKS:
        existing = db.query(Kiosk).filter(Kiosk.center_name == data["center_name"]).first()
        if not existing:
            kiosk = Kiosk(**data)
            db.add(kiosk)
            kiosk_count += 1

    if scheme_count > 0 or kiosk_count > 0:
        db.commit()
        logger.info(f"Seeded {scheme_count} schemes and {kiosk_count} CSC kiosks.")
    return scheme_count, kiosk_count

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        s_cnt, k_cnt = seed_database(db)
        print(f"Seed complete: {s_cnt} schemes, {k_cnt} kiosks inserted.")
    finally:
        db.close()
