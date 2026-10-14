import pandas as pd
import joblib
from pathlib import Path


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "access_risk_model.pkl"


# --------------------------------------------------
# LOAD MODEL
# --------------------------------------------------

model = joblib.load(MODEL_PATH)


# --------------------------------------------------
# SAMPLE USER
# --------------------------------------------------

sample_user = pd.DataFrame([{
    "age": 55,
    "annual_income": 80000,
    "occupation": "Farmer",
    "state": "Uttar Pradesh",
    "rural_or_urban": "Rural",
    "digital_literacy": 2,
    "internet_access": "No",
    "documents_complete": "No",
    "scheme_awareness": 3,
    "distance_to_service_center": 25,
    "application_complexity": 4,
    "previous_application_failure": "Yes",
    "primary_barrier": "Digital Access"
}])


# --------------------------------------------------
# IMPORTANT:
# The model was trained on PREPROCESSED data.
# We need to apply the same preprocessing before
# prediction.
# --------------------------------------------------

PREPROCESSOR_PATH = BASE_DIR / "models" / "preprocessor.pkl"

preprocessor = joblib.load(PREPROCESSOR_PATH)

sample_processed = preprocessor.transform(sample_user)


# --------------------------------------------------
# PREDICTION
# --------------------------------------------------

prediction = model.predict(sample_processed)[0]

probabilities = model.predict_proba(sample_processed)[0]


# --------------------------------------------------
# MAP RESULT
# --------------------------------------------------

risk_mapping = {
    0: "Low",
    1: "Medium",
    2: "High"
}

risk = risk_mapping[prediction]

confidence = max(probabilities) * 100


# --------------------------------------------------
# OUTPUT
# --------------------------------------------------

print("=" * 50)
print("SahayakAI Access Risk Prediction")
print("=" * 50)

print("\nPredicted Access Risk:", risk)

print(f"Confidence: {confidence:.2f}%")

print("\nRisk Probabilities:")

print(f"Low: {probabilities[0] * 100:.2f}%")
print(f"Medium: {probabilities[1] * 100:.2f}%")
print(f"High: {probabilities[2] * 100:.2f}%")

print("\nPrediction completed successfully!")