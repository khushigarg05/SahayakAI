import joblib
import pandas as pd
import numpy as np
import shap
import matplotlib.pyplot as plt
from pathlib import Path


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "access_risk_model.pkl"
DATA_PATH = BASE_DIR / "data" / "processed" / "X_test.csv"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.pkl"

OUTPUT_DIR = BASE_DIR / "evaluation" / "model_evaluation"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD MODEL AND DATA
# --------------------------------------------------

print("=" * 60)
print("SahayakAI SHAP MODEL EXPLAINABILITY")
print("=" * 60)

print("\nLoading model...")

model = joblib.load(MODEL_PATH)

print("Model loaded successfully!")

print("\nLoading test data...")

X_test = pd.read_csv(DATA_PATH)

print("Test data shape:", X_test.shape)


# --------------------------------------------------
# LOAD METADATA
# --------------------------------------------------

print("\nLoading model metadata...")

metadata = joblib.load(METADATA_PATH)

feature_names = metadata["features"]

print("Number of features:", len(feature_names))


# --------------------------------------------------
# RESTORE FEATURE NAMES
# --------------------------------------------------

if len(feature_names) != X_test.shape[1]:
    raise ValueError(
        f"Feature mismatch: metadata contains "
        f"{len(feature_names)} features but test data contains "
        f"{X_test.shape[1]} features."
    )

X_test.columns = feature_names

print("Feature names restored successfully!")


# --------------------------------------------------
# CREATE SHAP EXPLAINER
# --------------------------------------------------

print("\nCreating SHAP explainer...")

explainer = shap.TreeExplainer(model)

shap_values = explainer.shap_values(X_test)

print("SHAP values calculated successfully!")


# --------------------------------------------------
# INSPECT SHAP OUTPUT
# --------------------------------------------------

shap_array = np.asarray(shap_values)

print("SHAP values shape:", shap_array.shape)


# --------------------------------------------------
# CALCULATE SHAP FEATURE IMPORTANCE
# --------------------------------------------------

print("\nCalculating SHAP feature importance...")


if isinstance(shap_values, list):

    # Older SHAP versions:
    # list containing one array for each class

    mean_abs_shap = np.mean(
        [
            np.abs(values).mean(axis=0)
            for values in shap_values
        ],
        axis=0
    )


elif shap_array.ndim == 3:

    # Newer SHAP versions for multiclass models:
    #
    # samples × features × classes
    #
    # Example:
    # (200, 31, 3)

    mean_abs_shap = np.abs(shap_array).mean(
        axis=(0, 2)
    )


elif shap_array.ndim == 2:

    # Binary/single-output model:
    #
    # samples × features

    mean_abs_shap = np.abs(shap_array).mean(
        axis=0
    )


else:

    raise ValueError(
        f"Unexpected SHAP values shape: {shap_array.shape}"
    )


# --------------------------------------------------
# CREATE FEATURE IMPORTANCE DATAFRAME
# --------------------------------------------------

shap_importance = pd.DataFrame(
    {
        "feature": feature_names,
        "importance": mean_abs_shap
    }
)


shap_importance = shap_importance.sort_values(
    by="importance",
    ascending=False
)


# --------------------------------------------------
# DISPLAY TOP FEATURES
# --------------------------------------------------

print("\nTop 15 SHAP Features:")

print(
    shap_importance
    .head(15)
    .to_string(index=False)
)


# --------------------------------------------------
# SAVE SHAP FEATURE IMPORTANCE
# --------------------------------------------------

shap_importance_path = (
    OUTPUT_DIR / "shap_feature_importance.csv"
)

shap_importance.to_csv(
    shap_importance_path,
    index=False
)

print(
    "\nSaved:",
    shap_importance_path
)


# --------------------------------------------------
# CREATE SHAP SUMMARY DATA
# --------------------------------------------------

print("\nPreparing SHAP summary plot...")


if isinstance(shap_values, list):

    # Combine class-level SHAP values
    shap_for_plot = np.mean(
        np.abs(np.array(shap_values)),
        axis=0
    )


elif shap_array.ndim == 3:

    # Multiclass SHAP:
    #
    # samples × features × classes
    #
    # Average absolute contribution across classes

    shap_for_plot = np.abs(shap_array).mean(
        axis=2
    )


elif shap_array.ndim == 2:

    shap_for_plot = shap_array


else:

    raise ValueError(
        f"Unexpected SHAP values shape: {shap_array.shape}"
    )


# --------------------------------------------------
# CREATE SHAP SUMMARY PLOT
# --------------------------------------------------

print("\nCreating SHAP summary plot...")

plt.figure(figsize=(10, 8))

shap.summary_plot(
    shap_for_plot,
    X_test,
    feature_names=feature_names,
    show=False
)

plt.tight_layout()


shap_summary_path = (
    OUTPUT_DIR / "shap_summary.png"
)

plt.savefig(
    shap_summary_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


print(
    "Saved:",
    shap_summary_path
)


# --------------------------------------------------
# CREATE TOP 15 SHAP BAR PLOT
# --------------------------------------------------

print("\nCreating SHAP feature importance bar plot...")


top_features = shap_importance.head(15)

plt.figure(figsize=(10, 8))

plt.barh(
    top_features["feature"][::-1],
    top_features["importance"][::-1]
)

plt.xlabel("Mean Absolute SHAP Value")
plt.ylabel("Feature")

plt.title(
    "Top 15 Features - SHAP Importance"
)

plt.tight_layout()


shap_bar_path = (
    OUTPUT_DIR / "shap_feature_importance.png"
)

plt.savefig(
    shap_bar_path,
    dpi=300,
    bbox_inches="tight"
)

plt.close()


print(
    "Saved:",
    shap_bar_path
)


# --------------------------------------------------
# SAVE TEXT REPORT
# --------------------------------------------------

report_path = (
    OUTPUT_DIR / "shap_report.txt"
)


with open(report_path, "w", encoding="utf-8") as file:

    file.write(
        "SAHAYAKAI SHAP MODEL EXPLAINABILITY REPORT\n"
    )

    file.write("=" * 60 + "\n\n")

    file.write(
        f"Model: {metadata.get('model', 'Unknown')}\n"
    )

    file.write(
        f"Model Accuracy: "
        f"{metadata.get('accuracy', 'Unknown')}\n\n"
    )

    file.write(
        f"Test Samples: {len(X_test)}\n"
    )

    file.write(
        f"Features: {len(feature_names)}\n\n"
    )

    file.write(
        "Top 15 SHAP Features:\n"
    )

    file.write("-" * 60 + "\n")

    file.write(
        shap_importance
        .head(15)
        .to_string(index=False)
    )

    file.write("\n")


print(
    "Saved:",
    report_path
)


# --------------------------------------------------
# COMPLETED
# --------------------------------------------------

print("\n" + "=" * 60)
print("SHAP EXPLAINABILITY COMPLETED SUCCESSFULLY!")
print("=" * 60)

print("\nGenerated files:")

print(
    "1.",
    shap_importance_path
)

print(
    "2.",
    shap_summary_path
)

print(
    "3.",
    shap_bar_path
)

print(
    "4.",
    report_path
)