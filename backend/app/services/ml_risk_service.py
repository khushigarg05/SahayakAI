import json
import logging
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import pandas as pd
from app.core.config import settings

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "ml_artifacts"
MODEL_PATH = ARTIFACTS_DIR / "xgboost_access_risk.joblib"
FEATURE_NAMES_PATH = ARTIFACTS_DIR / "feature_names.json"

class MLRiskService:
    """
    High-Concurrency Machine Learning Risk Inference Service.
    Loads XGBoost model once at initialization into memory for 0ms latency.
    """
    def __init__(self):
        self.model = None
        self.feature_names = []
        self._load_model()

    def _load_model(self):
        try:
            if FEATURE_NAMES_PATH.exists():
                with open(FEATURE_NAMES_PATH, "r", encoding="utf-8") as f:
                    self.feature_names = json.load(f)

            if MODEL_PATH.exists() and MODEL_PATH.stat().st_size > 0:
                self.model = joblib.load(MODEL_PATH)
                logger.info("XGBoost Access Risk Model loaded successfully into memory.")
            else:
                logger.warning("XGBoost model file not found or empty.")
        except Exception as e:
            logger.error(f"Failed to load XGBoost model: {e}")

    def prepare_feature_vector(self, data: Dict[str, Any]) -> pd.DataFrame:
        """
        Converts citizen demographic & operational parameters into 14-feature vector.
        Safe fallback defaults ensure no crashes on missing fields.
        """
        # Digital literacy mapping
        lit_val = data.get("digital_literacy") or data.get("digital_literacy_score")
        if isinstance(lit_val, str):
            lit_map = {"low": 0.15, "medium": 0.55, "high": 0.95}
            digital_literacy_score = lit_map.get(lit_val.lower(), 0.2)
        elif isinstance(lit_val, (int, float)):
            digital_literacy_score = float(lit_val)
        else:
            digital_literacy_score = 0.2

        row = {
            "age": float(data.get("age") or 35),
            "annual_income": float(data.get("annual_income") or 60000.0),
            "distance_to_csc_km": float(data.get("distance_to_csc_km") or 12.0),
            "digital_literacy_score": digital_literacy_score,
            "smartphone_access": 1 if data.get("smartphone_access") else (1 if digital_literacy_score > 0.4 else 0),
            "bank_account_aadhaar_linked": 1 if data.get("bank_account_aadhaar_linked", False) else 0,
            "has_income_certificate": 1 if data.get("has_income_certificate", False) else 0,
            "has_caste_certificate": 1 if data.get("has_caste_certificate", True) else 0,
            "has_bpl_ration_card": 1 if data.get("bpl_status", False) or data.get("has_bpl_ration_card", False) else 0,
            "documents_readiness_score": float(data.get("documents_readiness_score") or 0.4),
            "prior_rejections_count": int(data.get("prior_rejections_count") or 0),
            "education_level_years": int(data.get("education_level_years") or 5),
            "electricity_access": 1 if data.get("electricity_access", True) else 0,
            "family_dependents_count": int(data.get("family_dependents_count") or 3)
        }

        # Select only expected 14 features in exact order
        ordered_row = {k: row.get(k, 0.0) for k in self.feature_names}
        return pd.DataFrame([ordered_row])

    def predict_risk(self, data: Dict[str, Any]) -> Tuple[float, str]:
        """
        Runs inference and returns:
        - risk_score: 0.0 to 1.0 (float)
        - risk_level: 'LOW', 'MEDIUM', 'HIGH'
        """
        if self.model is None:
            # Fallback heuristic calculation if model file not available
            score = 0.5
            return score, "MEDIUM"

        df = self.prepare_feature_vector(data)
        probs = self.model.predict_proba(df)[0]
        # Probability of class 1 (High Risk of Rejection/Bottleneck)
        risk_score = round(float(probs[1]), 2)

        if risk_score >= 0.70:
            risk_level = "HIGH"
        elif risk_score >= 0.40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return risk_score, risk_level

ml_risk_service = MLRiskService()
