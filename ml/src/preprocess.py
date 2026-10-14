import joblib
import pandas as pd
import os


from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

RAW_DATA = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "access_risk_dataset.csv"
)

PROCESSED_DIR = os.path.join(
    BASE_DIR,
    "data",
    "processed"
)

os.makedirs(PROCESSED_DIR, exist_ok=True)
MODEL_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODEL_DIR, exist_ok=True)


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("Loading dataset...")

df = pd.read_csv(RAW_DATA)

print(f"Dataset shape: {df.shape}")


# --------------------------------------------------
# BASIC CLEANING
# --------------------------------------------------

print("\nChecking missing values:")

print(df.isnull().sum())


# Remove duplicate rows
df = df.drop_duplicates()

print(f"\nShape after removing duplicates: {df.shape}")


# --------------------------------------------------
# TARGET
# --------------------------------------------------

TARGET = "access_risk"

X = df.drop(columns=[TARGET])

y = df[TARGET]


# --------------------------------------------------
# IDENTIFY FEATURES
# --------------------------------------------------

categorical_features = X.select_dtypes(
    include=["object"]
).columns.tolist()

numerical_features = X.select_dtypes(
    exclude=["object"]
).columns.tolist()


print("\nCategorical features:")
print(categorical_features)

print("\nNumerical features:")
print(numerical_features)


# --------------------------------------------------
# TRAIN TEST SPLIT
# --------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


print("\nTrain samples:", len(X_train))
print("Test samples:", len(X_test))


# --------------------------------------------------
# PREPROCESSING
# --------------------------------------------------

numeric_transformer = Pipeline(
    steps=[
        ("scaler", StandardScaler())
    ]
)


categorical_transformer = Pipeline(
    steps=[
        (
            "encoder",
            OneHotEncoder(
                handle_unknown="ignore",
                sparse_output=False
            )
        )
    ]
)


preprocessor = ColumnTransformer(
    transformers=[
        (
            "num",
            numeric_transformer,
            numerical_features
        ),
        (
            "cat",
            categorical_transformer,
            categorical_features
        )
    ]
)


# --------------------------------------------------
# FIT TRANSFORMER
# --------------------------------------------------

X_train_processed = preprocessor.fit_transform(X_train)

X_test_processed = preprocessor.transform(X_test)
# Save preprocessing pipeline
joblib.dump(
    preprocessor,
    os.path.join(
        BASE_DIR,
        "models",
        "preprocessor.pkl"
    )
)

print("\nPreprocessor saved successfully!")


print("\nProcessed training shape:")
print(X_train_processed.shape)

print("\nProcessed testing shape:")
print(X_test_processed.shape)


# --------------------------------------------------
# SAVE PROCESSED DATA
# --------------------------------------------------

# --------------------------------------------------
# SAVE PROCESSED DATA WITH FEATURE NAMES
# --------------------------------------------------

feature_names = preprocessor.get_feature_names_out()

print("\nProcessed feature names:")
print(feature_names)

X_train_df = pd.DataFrame(
    X_train_processed,
    columns=feature_names
)

X_test_df = pd.DataFrame(
    X_test_processed,
    columns=feature_names
)

X_train_df.to_csv(
    os.path.join(
        PROCESSED_DIR,
        "X_train.csv"
    ),
    index=False
)

X_test_df.to_csv(
    os.path.join(
        PROCESSED_DIR,
        "X_test.csv"
    ),
    index=False
)

y_train.to_csv(
    os.path.join(
        PROCESSED_DIR,
        "y_train.csv"
    ),
    index=False
)

y_test.to_csv(
    os.path.join(
        PROCESSED_DIR,
        "y_test.csv"
    ),
    index=False
)


print("\nPreprocessing completed successfully!")

print(
    f"Processed files saved to: {PROCESSED_DIR}"
)