from typing import Dict, Any, List, Tuple
from app.models.scheme import Scheme
from app.schemas.scheme import SchemeMatchResult

class RuleEngine:
    """
    High-Performance Deterministic Eligibility Matching Engine.
    Pure in-memory, thread-safe, and zero database lock.
    """

    @staticmethod
    def evaluate_scheme(scheme: Scheme, citizen_data: Dict[str, Any]) -> SchemeMatchResult:
        """
        Evaluates a single scheme against citizen demographics.
        Returns match percentage, eligibility boolean, and detailed criteria breakdown.
        """
        age = citizen_data.get("age")
        income = citizen_data.get("annual_income")
        bpl = citizen_data.get("bpl_status", False)
        gender = citizen_data.get("gender")
        caste = citizen_data.get("caste_category")

        total_rules = 0
        passed_rules = 0
        matched_criteria: List[str] = []
        unmatched_criteria: List[str] = []
        is_strictly_eligible = True

        # 1. Age Verification
        if scheme.min_age is not None or scheme.max_age is not None:
            total_rules += 1
            age_passed = True
            if age is None:
                is_strictly_eligible = False
                unmatched_criteria.append(f"Umar ki jankari nahi mili (Required: {scheme.min_age or 0} - {scheme.max_age or 120} varsh)")
                age_passed = False
            else:
                if scheme.min_age is not None and age < scheme.min_age:
                    age_passed = False
                    is_strictly_eligible = False
                    unmatched_criteria.append(f"Kam umar: Kam se kam {scheme.min_age} saal honi chahiye (Aapki umar: {age})")
                elif scheme.max_age is not None and age > scheme.max_age:
                    age_passed = False
                    is_strictly_eligible = False
                    unmatched_criteria.append(f"Umar sima paar: Maximum {scheme.max_age} saal (Aapki umar: {age})")
            
            if age_passed:
                passed_rules += 1
                matched_criteria.append(f"Umar patrata pass ({age} varsh)")

        # 2. Income Verification
        if scheme.max_annual_income is not None:
            total_rules += 1
            if income is not None and income <= scheme.max_annual_income:
                passed_rules += 1
                matched_criteria.append(f"Aamdani sima ke andar (Rs. {income:,.0f} <= Rs. {scheme.max_annual_income:,.0f})")
            else:
                is_strictly_eligible = False
                if income is None:
                    unmatched_criteria.append("Aamdani praman patra ki jankari uplabdh nahi hai")
                else:
                    unmatched_criteria.append(f"Aamdani sima se zyada (Aapki aamdani: Rs. {income:,.0f} > Sima: Rs. {scheme.max_annual_income:,.0f})")

        # 3. BPL (Below Poverty Line) Status
        if scheme.requires_bpl:
            total_rules += 1
            if bpl:
                passed_rules += 1
                matched_criteria.append("BPL (Garibi Rekha ke Neeche) card dharak hain")
            else:
                is_strictly_eligible = False
                unmatched_criteria.append("BPL card dharak hona anivarya hai")

        # 4. Gender Targeting
        if scheme.target_gender and scheme.target_gender.lower() not in ["all", "any"]:
            total_rules += 1
            if gender and gender.lower() == scheme.target_gender.lower():
                passed_rules += 1
                matched_criteria.append(f"Lakshit labharthi: {scheme.target_gender}")
            else:
                is_strictly_eligible = False
                unmatched_criteria.append(f"Sirf {scheme.target_gender} labharthiyo ke liye")

        # 5. Caste Category Targeting
        if scheme.target_caste and scheme.target_caste.lower() not in ["all", "any"]:
            total_rules += 1
            if caste and caste.lower() == scheme.target_caste.lower():
                passed_rules += 1
                matched_criteria.append(f"Varg patrata: {scheme.target_caste}")
            else:
                is_strictly_eligible = False
                unmatched_criteria.append(f"Sirf {scheme.target_caste} varg ke liye")

        # 6. Occupation Targeting (Crucial for PM-KISAN & Farmer Welfare)
        if scheme.category.lower() in ["agriculture", "farming"] or scheme.scheme_code == "PM-KISAN":
            total_rules += 1
            occupation = citizen_data.get("occupation", "Farmer")
            if occupation and occupation.lower() == "farmer":
                passed_rules += 1
                matched_criteria.append("Kisan / Krishi Karya (Farmer Profession)")
            else:
                is_strictly_eligible = False
                unmatched_criteria.append(f"Sirf Kisanon ke liye (Aapka pesha: {occupation or 'Non-Farmer'})")

        # 7. Rural / Urban Location Targeting (PMAY-G Gramin Housing)
        if scheme.scheme_code == "PMAY-G":
            total_rules += 1
            area = citizen_data.get("rural_or_urban", "Rural")
            if area and area.lower() == "rural":
                passed_rules += 1
                matched_criteria.append("Gramin kshetra ke niwasi (Rural Resident)")
            else:
                is_strictly_eligible = False
                unmatched_criteria.append(f"Sirf Gramin (Rural) labharthiyo ke liye (Aapka kshetra: {area})")

        # 8. Mandatory Income Certificate Proof
        if scheme.max_annual_income is not None or scheme.requires_bpl:
            if "has_income_certificate" in citizen_data and citizen_data.get("has_income_certificate") is not None:
                total_rules += 1
                if citizen_data.get("has_income_certificate"):
                    passed_rules += 1
                    matched_criteria.append("Aamdani praman patra (Income Certificate) uplabdh")
                else:
                    is_strictly_eligible = False
                    unmatched_criteria.append("Aamdani praman patra (Income Certificate) missing - Navinikaran anivarya")

        # 9. DBT Bank Account Seeding Proof (PFMS requirement for direct transfers)
        if scheme.scheme_code in ["PM-KISAN", "IGNOAPS"] or scheme.category.lower() in ["agriculture", "social security"]:
            if "bank_account_aadhaar_linked" in citizen_data and citizen_data.get("bank_account_aadhaar_linked") is not None:
                total_rules += 1
                if citizen_data.get("bank_account_aadhaar_linked"):
                    passed_rules += 1
                    matched_criteria.append("Bank account Aadhaar (DBT) linked hai")
                else:
                    is_strictly_eligible = False
                    unmatched_criteria.append("Bank account Aadhaar (DBT) se linked nahi hai")

        # 10. Caste Certificate Verification
        if scheme.target_caste and scheme.target_caste.lower() not in ["all", "any", "general"]:
            if "has_caste_certificate" in citizen_data and citizen_data.get("has_caste_certificate") is not None:
                total_rules += 1
                if citizen_data.get("has_caste_certificate"):
                    passed_rules += 1
                    matched_criteria.append("Jaati praman patra (Caste Certificate) uplabdh")
                else:
                    is_strictly_eligible = False
                    unmatched_criteria.append("Jaati praman patra (Caste Certificate) missing")

        # Calculate Match Percentage
        if total_rules == 0:
            match_percentage = 100
        else:
            base_score = int((passed_rules / total_rules) * 100)
            # Agar strictly eligible hai toh 90-100% ke beech boost, warna partial score capped at 70%
            match_percentage = max(90, base_score) if is_strictly_eligible else min(base_score, 70)

        # Extract required documents safely from JSON field
        docs = scheme.required_documents if isinstance(scheme.required_documents, list) else []

        return SchemeMatchResult(
            scheme_id=scheme.id,
            scheme_code=scheme.scheme_code,
            name=scheme.name,
            category=scheme.category,
            match_percentage=match_percentage,
            is_eligible=is_strictly_eligible,
            benefits_summary=scheme.benefits_summary,
            matched_criteria=matched_criteria,
            unmatched_criteria=unmatched_criteria,
            required_documents=docs,
            official_url=scheme.official_url
        )

    @classmethod
    def match_all(cls, schemes: List[Scheme], citizen_data: Dict[str, Any]) -> List[SchemeMatchResult]:
        """
        Matches citizen data across all schemes and sorts by highest match score.
        """
        results = [cls.evaluate_scheme(scheme, citizen_data) for scheme in schemes]
        # Sort: Highest match percentage first
        results.sort(key=lambda r: (r.is_eligible, r.match_percentage), reverse=True)
        return results

rule_engine = RuleEngine()
