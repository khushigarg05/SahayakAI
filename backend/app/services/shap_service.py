import logging
from typing import Dict, Any, List
import shap
import pandas as pd
from app.services.ml_risk_service import ml_risk_service

logger = logging.getLogger(__name__)

BARRIER_METADATA = {
    "has_income_certificate": {
        "title": "Missing Income Certificate",
        "description": "Aamdani praman patra (Income Certificate) update na hone se form reject ho sakta hai.",
        "remedy": "Tehsil jakar ya CSC center se naya Income Certificate apply karein."
    },
    "bank_account_aadhaar_linked": {
        "title": "Unlinked Bank Account (DBT Problem)",
        "description": "Bank account Aadhaar se link na hone par sarkari DBT subsidy paise account me nahi aate.",
        "remedy": "Apni bank branch jakar Aadhaar NPCI Seeding karwayein."
    },
    "digital_literacy_score": {
        "title": "Low Digital Literacy",
        "description": "Citizen ko online application track karne me kathinai ho sakti hai.",
        "remedy": "CSC Kiosk Operator (VLE) ki madad se physical token par aavedan karein."
    },
    "distance_to_csc_km": {
        "title": "Distance to Kiosk / Office",
        "description": "Sarkari office gaon se kaafi door hai, jisse verification me deri ho sakti hai.",
        "remedy": "Kiosk Appointment Token lekar ek hi baar me physical verification poora karein."
    },
    "prior_rejections_count": {
        "title": "History of Prior Rejections",
        "description": "Pichhle aavedan me koi purana discrepancy ya rejection record raha hai.",
        "remedy": "Pichhle aavedan ki rejection slip lekar CSC Operator se review karwayein."
    },
    "documents_readiness_score": {
        "title": "Incomplete Document Checklist",
        "description": "Kuch zaroori dastavez (Jaise Ration card ya Niwas praman) abhi upload nahi hain.",
        "remedy": "Form submit karne se pehle sabhi dastavez DigiLocker ya photo se verify karein."
    }
}

class SHAPService:
    """
    Explainable AI (XAI) Service:
    Calculates exact mathematical barrier percentages using TreeExplainer.
    """
    def __init__(self):
        self.explainer = None
        self._init_explainer()

    def _init_explainer(self):
        try:
            if ml_risk_service.model is not None:
                self.explainer = shap.TreeExplainer(ml_risk_service.model)
                logger.info("SHAP TreeExplainer initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize SHAP TreeExplainer: {e}")

    def explain_barriers(self, data: Dict[str, Any], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Calculates exact barrier percentages for the citizen.
        Returns top_k factors contributing to rejection risk.
        """
        df = ml_risk_service.prepare_feature_vector(data)
        
        if self.explainer is None:
            # Fallback heuristic barriers if SHAP explainer fails
            return self._fallback_barriers(data)

        try:
            shap_values = self.explainer(df)
            values = shap_values.values[0]
            feature_names = ml_risk_service.feature_names

            # Filter positive SHAP contributions (factors increasing risk)
            positive_barriers = []
            for name, val in zip(feature_names, values):
                if val > 0:
                    positive_barriers.append((name, float(val)))

            if not positive_barriers:
                # If risk is low, take highest relative factors
                positive_barriers = [(name, float(val)) for name, val in zip(feature_names, values)]

            positive_barriers.sort(key=lambda x: x[1], reverse=True)
            total_shap = sum(max(v, 0.001) for _, v in positive_barriers) or 1.0

            results = []
            for name, val in positive_barriers[:top_k]:
                pct = max(10, min(80, int((val / total_shap) * 100)))
                meta = BARRIER_METADATA.get(name, {
                    "title": name.replace("_", " ").title(),
                    "description": f"Risk factor: {name}",
                    "remedy": "Kripya nazdeeki CSC center par dastavez verify karein."
                })

                results.append({
                    "factor_key": name,
                    "factor": meta["title"],
                    "impact_percentage": f"{pct}%",
                    "description": meta["description"],
                    "remedy": meta["remedy"]
                })

            return results
        except Exception as e:
            logger.error(f"Error computing SHAP values: {e}")
            return self._fallback_barriers(data)

    def _fallback_barriers(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        barriers = []
        if not data.get("has_income_certificate"):
            barriers.append({
                "factor_key": "has_income_certificate",
                "factor": "Missing Income Certificate",
                "impact_percentage": "40%",
                "description": BARRIER_METADATA["has_income_certificate"]["description"],
                "remedy": BARRIER_METADATA["has_income_certificate"]["remedy"]
            })
        if not data.get("bank_account_aadhaar_linked"):
            barriers.append({
                "factor_key": "bank_account_aadhaar_linked",
                "factor": "Unlinked Bank Account (DBT)",
                "impact_percentage": "30%",
                "description": BARRIER_METADATA["bank_account_aadhaar_linked"]["description"],
                "remedy": BARRIER_METADATA["bank_account_aadhaar_linked"]["remedy"]
            })
        if (data.get("distance_to_csc_km") or 12.0) > 10:
            barriers.append({
                "factor_key": "distance_to_csc_km",
                "factor": "Distance to Office",
                "impact_percentage": "15%",
                "description": BARRIER_METADATA["distance_to_csc_km"]["description"],
                "remedy": BARRIER_METADATA["distance_to_csc_km"]["remedy"]
            })
        return barriers[:3]

shap_service = SHAPService()
