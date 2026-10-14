import joblib
import pandas as pd
from pathlib import Path


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "access_risk_model.pkl"
PREPROCESSOR_PATH = BASE_DIR / "models" / "preprocessor.pkl"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.pkl"


# --------------------------------------------------
# LOAD ML ARTIFACTS
# --------------------------------------------------

print("Loading ML model...")

model = joblib.load(MODEL_PATH)
preprocessor = joblib.load(PREPROCESSOR_PATH)
metadata = joblib.load(METADATA_PATH)

print("ML model loaded successfully!")

TARGET_MAPPING = metadata["target_mapping"]

# Reverse mapping:
# 0 -> Low
# 1 -> Medium
# 2 -> High

REVERSE_TARGET_MAPPING = {
    value: key
    for key, value in TARGET_MAPPING.items()
}


# --------------------------------------------------
# PREDICTION FUNCTION
# --------------------------------------------------

def predict_access_risk(user_data: dict):

    """
    Predict access risk for a user.

    Parameters
    ----------
    user_data : dict
        Raw user information.

    Returns
    -------
    dict
        Risk prediction, confidence and probabilities.
    """

    # Convert dictionary to DataFrame
    input_df = pd.DataFrame([user_data])

    # Apply SAME preprocessing used during training
    processed_data = preprocessor.transform(input_df)

    # Predict class
    prediction = model.predict(processed_data)[0]

    # Predict probabilities
    probabilities = model.predict_proba(processed_data)[0]

    # Convert numeric prediction to label
    predicted_risk = REVERSE_TARGET_MAPPING[int(prediction)]

    # Get confidence
    confidence = float(
        probabilities[int(prediction)]
    )

    # Create probability dictionary
    risk_probabilities = {}

    for class_index, probability in enumerate(probabilities):

        risk_label = REVERSE_TARGET_MAPPING[
            int(class_index)
        ]

        risk_probabilities[risk_label] = round(
            float(probability) * 100,
            2
        )

    return {
        "access_risk": predicted_risk,
        "confidence": round(confidence * 100, 2),
        "risk_probabilities": risk_probabilities
    }


# --------------------------------------------------
# TEST FUNCTION
# --------------------------------------------------

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("SahayakAI ML PREDICTION SERVICE TEST")
    print("=" * 60)

    sample_user = {
        "age": 45,
        "annual_income": 120000,
        "occupation": "Farmer",
        "state": "Uttar Pradesh",
        "rural_or_urban": "Rural",
        "digital_literacy": 3,
        "internet_access": "No",
        "documents_complete": "No",
        "scheme_awareness": 2,
        "distance_to_service_center": 25,
        "application_complexity": 4,
        "previous_application_failure": "Yes",
        "primary_barrier": "Documentation"
    }

    result = predict_access_risk(sample_user)

    print("\nPrediction Result:")
    print("-" * 40)

    print(
        "Access Risk:",
        result["access_risk"]
    )

    print(
        "Confidence:",
        f'{result["confidence"]}%'
    )

    print("\nRisk Probabilities:")

    for risk, probability in result[
        "risk_probabilities"
    ].items():

        print(
            f"{risk}: {probability}%"
        )

    print("\n" + "=" * 60)
    print("ML PREDICTION SERVICE WORKING!")
    print("=" * 60)