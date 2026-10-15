from pathlib import Path
import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"
DATA_PATH = BASE_DIR / "data" / "raw" / "access_risk_dataset.csv"

preprocessor = joblib.load(MODEL_DIR / "preprocessor_v2.pkl")
model = joblib.load(MODEL_DIR / "access_risk_model_v2.pkl")

df = pd.read_csv(DATA_PATH)
TARGET = "access_risk"

# Select one example from each risk category
samples = pd.concat([
    df[df[TARGET] == "Low"].head(1),
    df[df[TARGET] == "Medium"].head(1),
    df[df[TARGET] == "High"].head(1)
])

X_samples = samples.drop(columns=[TARGET])
X_processed = preprocessor.transform(X_samples)

predictions = model.predict(X_processed)
label_mapping = {0: "Low", 1: "Medium", 2: "High"}
predicted_labels = [label_mapping[int(p)] for p in predictions]

print("\n--- SAMPLE PREDICTION TEST ---")
for i, (_, row) in enumerate(samples.iterrows()):
    actual = row[TARGET]
    predicted = predicted_labels[i]
    status = "PASS" if actual == predicted else "CHECK"
    print(
        f"{status} | Actual: {actual:<6} | "
        f"Predicted: {predicted}"
    )

# Evaluate on the complete dataset as a diagnostic only
# This is NOT an independent test-set evaluation.
X_all = df.drop(columns=[TARGET])
X_all_processed = preprocessor.transform(X_all)
all_predictions = model.predict(X_all_processed)
all_labels = [label_mapping[int(p)] for p in all_predictions]

print("\n--- FULL DATASET DIAGNOSTIC ---")
print("Accuracy:", f"{accuracy_score(df[TARGET], all_labels):.2%}")
print("\nClassification report:")
print(classification_report(
    df[TARGET],
    all_labels,
    labels=["Low", "Medium", "High"],
    zero_division=0
))
