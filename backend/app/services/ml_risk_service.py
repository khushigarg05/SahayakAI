import json
import logging
import warnings
from pathlib import Path
from typing import Dict, Any, Tuple
import joblib
import pandas as pd
from app.core.config import settings

logger = logging.getLogger(__name__)

ARTIFACTS_DIR = Path(__file__).resolve().parent.parent / "ml_artifacts"
ROOT_ML_DIR = Path(__file__).resolve().parent.parent.parent.parent / "ml"

# Preferred Team Model (V2 XGBoost Pipeline with V1 Fallback)
TEAM_MODEL_V2_PATH = ARTIFACTS_DIR / "access_risk_model_v2.pkl"
TEAM_PREPROCESSOR_V2_PATH = ARTIFACTS_DIR / "preprocessor_v2.pkl"
TEAM_METADATA_V2_PATH = ARTIFACTS_DIR / "model_metadata_v2.pkl"

TEAM_MODEL_PATH = ARTIFACTS_DIR / "access_risk_model.pkl"
TEAM_PREPROCESSOR_PATH = ARTIFACTS_DIR / "preprocessor.pkl"
TEAM_METADATA_PATH = ARTIFACTS_DIR / "model_metadata.pkl"

# Fallback Artifacts
FALLBACK_MODEL_PATH = ARTIFACTS_DIR / "xgboost_access_risk.joblib"
FALLBACK_FEATURE_NAMES_PATH = ARTIFACTS_DIR / "feature_names.json"

class MLRiskService:
    """
    High-Concurrency Machine Learning Risk Inference Service.
    Loads Team Member's 93.5% Accuracy XGBoost model and Preprocessing Pipeline
    into memory for 0ms latency inference.
    """
    def __init__(self):
        self.model = None
        self.preprocessor = None
        self.metadata = None
        self.is_team_pipeline = False
        self.feature_names = []
        self._load_model()

    def _load_model(self):
        # 1. Try loading Team Member's trained XGBoost model & Preprocessor (V2 then V1)
        try:
            model_file = TEAM_MODEL_V2_PATH if TEAM_MODEL_V2_PATH.exists() else (ROOT_ML_DIR / "models" / "access_risk_model_v2.pkl")
            preproc_file = TEAM_PREPROCESSOR_V2_PATH if TEAM_PREPROCESSOR_V2_PATH.exists() else (ROOT_ML_DIR / "models" / "preprocessor_v2.pkl")
            meta_file = TEAM_METADATA_V2_PATH if TEAM_METADATA_V2_PATH.exists() else (ROOT_ML_DIR / "models" / "model_metadata_v2.pkl")

            if not (model_file.exists() and preproc_file.exists()):
                model_file = TEAM_MODEL_PATH if TEAM_MODEL_PATH.exists() else (ROOT_ML_DIR / "models" / "access_risk_model.pkl")
                preproc_file = TEAM_PREPROCESSOR_PATH if TEAM_PREPROCESSOR_PATH.exists() else (ROOT_ML_DIR / "models" / "preprocessor.pkl")
                meta_file = TEAM_METADATA_PATH if TEAM_METADATA_PATH.exists() else (ROOT_ML_DIR / "models" / "model_metadata.pkl")

            if model_file.exists() and preproc_file.exists():
                with warnings.catch_warnings():
                    warnings.filterwarnings("ignore", category=UserWarning)
                    self.model = joblib.load(model_file)
                    self.preprocessor = joblib.load(preproc_file)
                    if meta_file.exists():
                        self.metadata = joblib.load(meta_file)
                self.is_team_pipeline = True
                if self.metadata and "features" in self.metadata:
                    self.feature_names = list(self.metadata["features"])
                elif hasattr(self.preprocessor, "get_feature_names_out"):
                    self.feature_names = list(self.preprocessor.get_feature_names_out())
                elif hasattr(self.model, "feature_names_in_"):
                    self.feature_names = list(self.model.feature_names_in_)
                logger.info(f"Team Member's XGBoost 93.5% Model & Preprocessor loaded successfully from {model_file.name} with {len(self.feature_names)} features.")
                return
        except Exception as e:
            logger.warning(f"Could not load team model pipeline ({e}), attempting fallback...")

        # 2. Fallback to base model if team model not available
        try:
            if FALLBACK_FEATURE_NAMES_PATH.exists():
                with open(FALLBACK_FEATURE_NAMES_PATH, "r", encoding="utf-8") as f:
                    self.feature_names = json.load(f)

            if FALLBACK_MODEL_PATH.exists() and FALLBACK_MODEL_PATH.stat().st_size > 0:
                self.model = joblib.load(FALLBACK_MODEL_PATH)
                self.is_team_pipeline = False
                logger.info("Base XGBoost Access Risk Model loaded into memory.")
            else:
                logger.warning("No ML model artifacts found.")
        except Exception as e:
            logger.error(f"Failed to load fallback ML model: {e}")

    def prepare_feature_vector(self, data: Dict[str, Any]):
        """
        Transforms citizen input into appropriate model feature representation.
        """
        # Convert digital literacy
        lit_val = data.get("digital_literacy") or data.get("digital_literacy_score")
        if isinstance(lit_val, str):
            lit_map = {"low": 2, "medium": 3, "high": 5}
            digital_literacy_num = lit_map.get(lit_val.lower(), 3)
            digital_literacy_score = 0.2 if lit_val.lower() == "low" else (0.55 if lit_val.lower() == "medium" else 0.95)
        elif isinstance(lit_val, (int, float)):
            digital_literacy_num = max(1, min(5, int(lit_val * 5))) if lit_val <= 1.0 else int(lit_val)
            digital_literacy_score = float(lit_val) if lit_val <= 1.0 else float(lit_val) / 5.0
        else:
            digital_literacy_num = 3
            digital_literacy_score = 0.4

        # If team preprocessor is active, prepare exact DataFrame expected by team pipeline
        if self.is_team_pipeline and self.preprocessor is not None:
            # Check documents completeness
            docs_ready = data.get("documents_complete")
            if docs_ready is None:
                score = float(data.get("documents_readiness_score") or 0.5)
                has_inc = bool(data.get("has_income_certificate", False))
                docs_ready = "Yes" if (score >= 0.6 or has_inc) else "No"

            # Check internet access
            has_net = data.get("internet_access")
            if has_net is None:
                has_net = "Yes" if (data.get("smartphone_access") or digital_literacy_score > 0.4) else "No"

            # Prior failures
            priors = int(data.get("prior_rejections_count") or 0)
            prior_fail = "Yes" if priors > 0 else "No"

            user_row = {
                "age": float(data.get("age") or 35),
                "annual_income": float(data.get("annual_income") or 60000.0),
                "occupation": data.get("occupation") or "Farmer",
                "state": data.get("state") or "Uttar Pradesh",
                "rural_or_urban": data.get("rural_or_urban") or "Rural",
                "digital_literacy": digital_literacy_num,
                "internet_access": has_net,
                "documents_complete": docs_ready,
                "scheme_awareness": int(data.get("scheme_awareness") or 3),
                "distance_to_service_center": float(data.get("distance_to_csc_km") or 12.0),
                "application_complexity": int(data.get("application_complexity") or 3),
                "previous_application_failure": prior_fail,
                "primary_barrier": data.get("primary_barrier") or "None"
            }
            df = pd.DataFrame([user_row])
            return self.preprocessor.transform(df)

        # Base 14-feature format
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
        ordered_row = {k: row.get(k, 0.0) for k in self.feature_names}
        return pd.DataFrame([ordered_row])

    def predict_risk(self, data: Dict[str, Any]) -> Tuple[float, str]:
        """
        Runs inference and returns:
        - risk_score: 0.0 to 1.0 (float)
        - risk_level: 'LOW', 'MEDIUM', 'HIGH'
        """
        if self.model is None:
            return 0.5, "MEDIUM"

        try:
            features = self.prepare_feature_vector(data)
            probs = self.model.predict_proba(features)[0]

            if self.is_team_pipeline:
                # Target mapping: Low: 0, Medium: 1, High: 2
                # Calculate weighted risk index from 0.0 to 1.0:
                p_low = float(probs[0])
                p_med = float(probs[1]) if len(probs) > 1 else 0.0
                p_high = float(probs[2]) if len(probs) > 2 else 0.0

                risk_score = round(0.06 * p_low + 0.45 * p_med + 0.90 * p_high, 2)
                pred_class = int(self.model.predict(features)[0])
                level_map = {0: "LOW", 1: "MEDIUM", 2: "HIGH"}
                risk_level = level_map.get(pred_class, "MEDIUM")
                return risk_score, risk_level
            else:
                risk_score = round(float(probs[1]), 2)
                if risk_score >= 0.70:
                    risk_level = "HIGH"
                elif risk_score >= 0.40:
                    risk_level = "MEDIUM"
                else:
                    risk_level = "LOW"
                return risk_score, risk_level
        except Exception as e:
            logger.error(f"Inference error: {e}")
            return 0.5, "MEDIUM"

ml_risk_service = MLRiskService()
