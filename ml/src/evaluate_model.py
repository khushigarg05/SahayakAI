import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt

from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    ConfusionMatrixDisplay
)


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"
EVALUATION_DIR = BASE_DIR / "evaluation" / "model_evaluation"

EVALUATION_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("=" * 60)
print("SahayakAI MODEL EVALUATION")
print("=" * 60)

print("\nLoading test data...")

X_test = pd.read_csv(PROCESSED_DIR / "X_test.csv")

y_test = pd.read_csv(
    PROCESSED_DIR / "y_test.csv"
).squeeze()


# --------------------------------------------------
# TARGET ENCODING
# --------------------------------------------------

target_mapping = {
    "Low": 0,
    "Medium": 1,
    "High": 2
}

y_test = y_test.map(target_mapping)

print("Test samples:", len(X_test))
print("Features:", X_test.shape[1])


# --------------------------------------------------
# LOAD TRAINED MODEL
# --------------------------------------------------

print("\nLoading trained model...")

model = joblib.load(
    MODEL_DIR / "access_risk_model.pkl"
)

print("Model loaded successfully!")


# --------------------------------------------------
# PREDICTIONS
# --------------------------------------------------

print("\nGenerating predictions...")

predictions = model.predict(X_test)


# --------------------------------------------------
# ACCURACY
# --------------------------------------------------

accuracy = accuracy_score(
    y_test,
    predictions
)

print("\n" + "=" * 60)
print("MODEL PERFORMANCE")
print("=" * 60)

print(f"\nAccuracy: {accuracy:.4f}")
print(f"Accuracy: {accuracy * 100:.2f}%")


# --------------------------------------------------
# CLASSIFICATION REPORT
# --------------------------------------------------

report = classification_report(
    y_test,
    predictions,
    target_names=[
        "Low",
        "Medium",
        "High"
    ]
)

print("\nClassification Report:")
print(report)


# --------------------------------------------------
# CONFUSION MATRIX
# --------------------------------------------------

cm = confusion_matrix(
    y_test,
    predictions
)

print("\nConfusion Matrix:")
print(cm)


# --------------------------------------------------
# SAVE CONFUSION MATRIX IMAGE
# --------------------------------------------------

print("\nCreating confusion matrix...")

fig, ax = plt.subplots(figsize=(7, 6))

display = ConfusionMatrixDisplay(
    confusion_matrix=cm,
    display_labels=[
        "Low",
        "Medium",
        "High"
    ]
)

display.plot(
    ax=ax,
    values_format="d"
)

ax.set_title(
    "SahayakAI - Access Risk Confusion Matrix"
)

plt.tight_layout()

confusion_path = (
    EVALUATION_DIR /
    "confusion_matrix.png"
)

plt.savefig(
    confusion_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()

print(
    "Saved:",
    confusion_path
)


# --------------------------------------------------
# FEATURE IMPORTANCE
# --------------------------------------------------

print("\nCalculating feature importance...")

if hasattr(model, "feature_importances_"):

    feature_importance = pd.DataFrame({
        "feature": X_test.columns,
        "importance": model.feature_importances_
    })

    feature_importance = (
        feature_importance
        .sort_values(
            "importance",
            ascending=False
        )
    )

    print("\nTop 15 Important Features:")

    print(
        feature_importance.head(15).to_string(
            index=False
        )
    )


    # --------------------------------------------------
    # FEATURE IMPORTANCE PLOT
    # --------------------------------------------------

    top_features = (
        feature_importance
        .head(15)
        .sort_values("importance")
    )

    plt.figure(figsize=(10, 7))

    plt.barh(
        top_features["feature"],
        top_features["importance"]
    )

    plt.xlabel("Importance")
    plt.ylabel("Feature")
    plt.title(
        "SahayakAI - XGBoost Feature Importance"
    )

    plt.tight_layout()

    feature_path = (
        EVALUATION_DIR /
        "feature_importance.png"
    )

    plt.savefig(
        feature_path,
        dpi=300,
        bbox_inches="tight"
    )

    plt.close()

    print(
        "Saved:",
        feature_path
    )


# --------------------------------------------------
# SAVE TEXT REPORT
# --------------------------------------------------

report_path = (
    EVALUATION_DIR /
    "evaluation_report.txt"
)

with open(
    report_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "SahayakAI MODEL EVALUATION REPORT\n"
    )

    file.write(
        "=" * 50 + "\n\n"
    )

    file.write(
        f"Model: XGBoost\n"
    )

    file.write(
        f"Test Samples: {len(X_test)}\n"
    )

    file.write(
        f"Features: {X_test.shape[1]}\n"
    )

    file.write(
        f"Accuracy: {accuracy:.4f}\n"
    )

    file.write(
        f"Accuracy Percentage: "
        f"{accuracy * 100:.2f}%\n\n"
    )

    file.write(
        "Classification Report\n"
    )

    file.write(
        "-" * 50 + "\n"
    )

    file.write(report)

    file.write(
        "\n\nConfusion Matrix\n"
    )

    file.write(
        "-" * 50 + "\n"
    )

    file.write(
        str(cm)
    )

print(
    "\nSaved:",
    report_path
)


# --------------------------------------------------
# COMPLETE
# --------------------------------------------------

print("\n" + "=" * 60)
print("MODEL EVALUATION COMPLETED SUCCESSFULLY!")
print("=" * 60)