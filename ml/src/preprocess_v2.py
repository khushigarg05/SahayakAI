
from pathlib import Path

import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_DATA = BASE_DIR / "data" / "raw" / "access_risk_dataset.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR.mkdir(parents=True, exist_ok=True)


# --------------------------------------------------
# LOAD AND CLEAN DATA
# --------------------------------------------------

print("Loading dataset...")

df = pd.read_csv(RAW_DATA)
df = df.drop_duplicates()

print("Dataset shape:", df.shape)

TARGET = "access_risk"

X = df.drop(columns=[TARGET])
y = df[TARGET]

if X.isnull().any().any() or y.isnull().any():
    raise ValueError(
        "Missing values found. Handle them before preprocessing."
    )


# --------------------------------------------------
# SPLIT: 60% TRAIN, 20% VALIDATION, 20% TEST
# --------------------------------------------------

X_train, X_temp, y_train, y_temp = train_test_split(
    X,
    y,
    test_size=0.40,
    random_state=42,
    stratify=y
)

X_val, X_test, y_val, y_test = train_test_split(
    X_temp,
    y_temp,
    test_size=0.50,
    random_state=42,
    stratify=y_temp
)

print("\nSplit sizes:")
print("Training:", len(X_train))
print("Validation:", len(X_val))
print("Testing:", len(X_test))


# --------------------------------------------------
# PREPROCESSING
# --------------------------------------------------

categorical_features = X.select_dtypes(
    include=["object", "str", "category"]
).columns.tolist()

numerical_features = X.select_dtypes(
    include=["number"]
).columns.tolist()

preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            Pipeline([
                ("scaler", StandardScaler())
            ]),
            numerical_features
        ),
        (
            "cat",
            Pipeline([
                (
                    "encoder",
                    OneHotEncoder(
                        handle_unknown="ignore",
                        sparse_output=False
                    )
                )
            ]),
            categorical_features
        )
    ]
)


# Fit ONLY on training data
X_train_processed = preprocessor.fit_transform(X_train)

# Validation and test only get transformed
X_val_processed = preprocessor.transform(X_val)
X_test_processed = preprocessor.transform(X_test)

feature_names = preprocessor.get_feature_names_out()


# --------------------------------------------------
# SAVE DATA WITHOUT OVERWRITING OLD FILES
# --------------------------------------------------

def save_features(data, filename):
    result = pd.DataFrame(data, columns=feature_names)
    result.to_csv(PROCESSED_DIR / filename, index=False)


save_features(X_train_processed, "X_train_v2.csv")
save_features(X_val_processed, "X_val.csv")
save_features(X_test_processed, "X_test_v2.csv")

y_train.to_csv(PROCESSED_DIR / "y_train_v2.csv", index=False)
y_val.to_csv(PROCESSED_DIR / "y_val.csv", index=False)
y_test.to_csv(PROCESSED_DIR / "y_test_v2.csv", index=False)

joblib.dump(
    preprocessor,
    MODEL_DIR / "preprocessor_v2.pkl"
)


# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print("\nSaved new files successfully.")
print("Training features:", X_train_processed.shape)
print("Validation features:", X_val_processed.shape)
print("Test features:", X_test_processed.shape)

print("\nTarget distribution:")
print("Train:\n", y_train.value_counts(normalize=True).round(3))
print("Validation:\n", y_val.value_counts(normalize=True).round(3))
print("Test:\n", y_test.value_counts(normalize=True).round(3))

print("\nPreprocessing V2 completed successfully!")
