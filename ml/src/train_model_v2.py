
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    recall_score,
    f1_score
)

from xgboost import XGBClassifier


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load V2 datasets only
X_train = pd.read_csv(PROCESSED_DIR / "X_train_v2.csv")
X_val = pd.read_csv(PROCESSED_DIR / "X_val.csv")
X_test = pd.read_csv(PROCESSED_DIR / "X_test_v2.csv")

y_train = pd.read_csv(PROCESSED_DIR / "y_train_v2.csv").squeeze()
y_val = pd.read_csv(PROCESSED_DIR / "y_val.csv").squeeze()
y_test = pd.read_csv(PROCESSED_DIR / "y_test_v2.csv").squeeze()

target_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}

y_train = y_train.map(target_mapping)
y_val = y_val.map(target_mapping)
y_test = y_test.map(target_mapping)

if any(series.isnull().any() for series in [y_train, y_val, y_test]):
    raise ValueError("Unknown target labels found.")

print("Training shape:", X_train.shape)
print("Validation shape:", X_val.shape)
print("Test shape:", X_test.shape)


# --------------------------------------------------
# DEFINE MODELS
# --------------------------------------------------

models = {
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        max_depth=12,
        min_samples_split=5,
        random_state=42,
        class_weight="balanced"
    ),

    "XGBoost": XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="mlogloss"
    )
}


# --------------------------------------------------
# TRAIN AND SELECT USING VALIDATION ONLY
# --------------------------------------------------

results = {}
trained_models = {}

for name, model in models.items():
    print("\n" + "=" * 55)
    print("Training:", name)
    print("=" * 55)

    model.fit(X_train, y_train)

    val_predictions = model.predict(X_val)

    val_accuracy = accuracy_score(y_val, val_predictions)
    high_recall = recall_score(
        y_val,
        val_predictions,
        labels=[2],
        average=None,
        zero_division=0
    )[0]

    val_macro_f1 = f1_score(
        y_val,
        val_predictions,
        average="macro",
        zero_division=0
    )

    results[name] = {
        "accuracy": val_accuracy,
        "high_risk_recall": high_recall,
        "macro_f1": val_macro_f1
    }

    trained_models[name] = model

    print("Validation accuracy:", round(val_accuracy, 4))
    print("Validation High-risk recall:", round(high_recall, 4))
    print("Validation macro F1:", round(val_macro_f1, 4))


# Select using validation macro F1
best_name = max(
    results,
    key=lambda name: results[name]["macro_f1"]
)

best_model = trained_models[best_name]

print("\n" + "=" * 55)
print("SELECTED MODEL:", best_name)
print("Selection criterion: validation macro F1")
print("=" * 55)


# --------------------------------------------------
# FINAL TEST EVALUATION — AFTER MODEL SELECTION
# --------------------------------------------------

test_predictions = best_model.predict(X_test)

test_accuracy = accuracy_score(y_test, test_predictions)
test_macro_f1 = f1_score(
    y_test,
    test_predictions,
    average="macro",
    zero_division=0
)

test_high_recall = recall_score(
    y_test,
    test_predictions,
    labels=[2],
    average=None,
    zero_division=0
)[0]

print("\nFINAL TEST RESULTS")
print("Test accuracy:", round(test_accuracy, 4))
print("Test macro F1:", round(test_macro_f1, 4))
print("Test High-risk recall:", round(test_high_recall, 4))

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        test_predictions,
        labels=[0, 1, 2],
        target_names=["Low", "Medium", "High"],
        zero_division=0
    )
)

print("Confusion Matrix:")
print(confusion_matrix(y_test, test_predictions, labels=[0, 1, 2]))


# --------------------------------------------------
# SAVE V2 MODEL AND METADATA SEPARATELY
# --------------------------------------------------

model_path = MODEL_DIR / "access_risk_model_v2.pkl"
metadata_path = MODEL_DIR / "model_metadata_v2.pkl"

joblib.dump(best_model, model_path)

metadata = {
    "model": best_name,
    "selection_metric": "validation_macro_f1",
    "validation_results": results,
    "test_accuracy": float(test_accuracy),
    "test_macro_f1": float(test_macro_f1),
    "test_high_risk_recall": float(test_high_recall),
    "target_mapping": target_mapping,
    "features": list(X_train.columns),
    "dataset_type": "synthetic",
    "status": "experimental_prototype"
}

joblib.dump(metadata, metadata_path)

print("\nV2 model saved:", model_path)
print("V2 metadata saved:", metadata_path)
print("\nTraining and evaluation completed!")
