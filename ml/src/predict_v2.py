
from pathlib import Path

import joblib
import pandas as pd


# --------------------------------------------------
# LOAD SAVED PREPROCESSOR AND MODEL
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_PATH = BASE_DIR / "data" / "raw" / "access_risk_dataset.csv"

preprocessor = joblib.load(MODEL_DIR / "preprocessor_v2.pkl")
model = joblib.load(MODEL_DIR / "access_risk_model_v2.pkl")

print("Preprocessor and model loaded successfully!")


# --------------------------------------------------
# SAMPLE PROFILE
# Use a row from the dataset so feature names and
# data types match the training pipeline.
# --------------------------------------------------

df = pd.read_csv(DATA_PATH)

TARGET = "access_risk"
X = df.drop(columns=[TARGET])

sample = X.iloc[[0]].copy()

print("\nSample profile:")
print(sample.to_string(index=False))


# --------------------------------------------------
# PREDICT ACCESS RISK
# --------------------------------------------------

sample_processed = preprocessor.transform(sample)

prediction = int(model.predict(sample_processed)[0])

label_mapping = {
    0: "Low",
    1: "Medium",
    2: "High"
}

predicted_risk = label_mapping[prediction]

print("\nPredicted access risk:", predicted_risk)


# --------------------------------------------------
# CLASS PROBABILITIES
# These are model scores, not guaranteed probabilities
# of real-world outcomes.
# --------------------------------------------------

probabilities = model.predict_proba(sample_processed)[0]

print("\nModel class scores:")
for class_id, score in zip(model.classes_, probabilities):
    label = label_mapping[int(class_id)]
    print(f"{label}: {score:.2%}")


# --------------------------------------------------
# COMPARE WITH THE SYNTHETIC DATASET LABEL
# --------------------------------------------------

actual_label = df.iloc[0][TARGET]

print("\nSynthetic dataset label:", actual_label)
print("Prediction script completed successfully!")
