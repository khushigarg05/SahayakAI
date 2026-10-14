import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

from xgboost import XGBClassifier


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD PROCESSED DATA
# --------------------------------------------------

print("Loading processed data...")

X_train = pd.read_csv(PROCESSED_DIR / "X_train.csv")
X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")

y_train = pd.read_csv(PROCESSED_DIR / "y_train.csv").squeeze()
y_test = pd.read_csv(PROCESSED_DIR / "y_test.csv").squeeze()

print("Training shape:", X_train.shape)
print("Testing shape:", X_test.shape)


# --------------------------------------------------
# ENCODE TARGET
# --------------------------------------------------

target_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}

y_train = y_train.map(target_mapping)
y_test = y_test.map(target_mapping)

print("\nTarget distribution:")
print(y_train.value_counts())


# --------------------------------------------------
# RANDOM FOREST
# --------------------------------------------------

print("\n" + "=" * 50)
print("Training Random Forest...")
print("=" * 50)

rf_model = RandomForestClassifier(
    n_estimators=200,
    max_depth=12,
    min_samples_split=5,
    random_state=42,
    class_weight="balanced"
)

rf_model.fit(X_train, y_train)

rf_predictions = rf_model.predict(X_test)

rf_accuracy = accuracy_score(y_test, rf_predictions)

print("\nRandom Forest Accuracy:", round(rf_accuracy, 4))

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        rf_predictions,
        target_names=["Low", "Medium", "High"]
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, rf_predictions))


# --------------------------------------------------
# XGBOOST
# --------------------------------------------------

print("\n" + "=" * 50)
print("Training XGBoost...")
print("=" * 50)

xgb_model = XGBClassifier(
    n_estimators=200,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42,
    eval_metric="mlogloss"
)

xgb_model.fit(X_train, y_train)

xgb_predictions = xgb_model.predict(X_test)

xgb_accuracy = accuracy_score(y_test, xgb_predictions)

print("\nXGBoost Accuracy:", round(xgb_accuracy, 4))

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        xgb_predictions,
        target_names=["Low", "Medium", "High"]
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, xgb_predictions))


# --------------------------------------------------
# SELECT BEST MODEL
# --------------------------------------------------

print("\n" + "=" * 50)
print("MODEL COMPARISON")
print("=" * 50)

print("Random Forest:", round(rf_accuracy, 4))
print("XGBoost:", round(xgb_accuracy, 4))


if xgb_accuracy >= rf_accuracy:
    best_model = xgb_model
    best_model_name = "XGBoost"
    best_accuracy = xgb_accuracy
else:
    best_model = rf_model
    best_model_name = "Random Forest"
    best_accuracy = rf_accuracy


print("\nBest Model:", best_model_name)
print("Best Accuracy:", round(best_accuracy, 4))


# --------------------------------------------------
# SAVE MODEL
# --------------------------------------------------

model_path = MODEL_DIR / "access_risk_model.pkl"

joblib.dump(best_model, model_path)

print("\nModel saved successfully!")
print("Location:", model_path)


# --------------------------------------------------
# SAVE METADATA
# --------------------------------------------------

metadata = {
    "model": best_model_name,
    "accuracy": float(best_accuracy),
    "target_mapping": target_mapping,
    "features": list(X_train.columns)
}

joblib.dump(
    metadata,
    MODEL_DIR / "model_metadata.pkl"
)

print("Metadata saved successfully!")

print("\nTraining completed successfully!")