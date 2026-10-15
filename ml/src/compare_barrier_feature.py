
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.metrics import accuracy_score, classification_report
from xgboost import XGBClassifier

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "raw" / "access_risk_dataset.csv"

df = pd.read_csv(DATA_PATH).drop_duplicates()
target = "access_risk"

target_mapping = {"Low": 0, "Medium": 1, "High": 2}
y = df[target].map(target_mapping)

def evaluate(features, label):
    categorical = features.select_dtypes(include=["object"]).columns.tolist()
    numerical = features.select_dtypes(exclude=["object"]).columns.tolist()

    X_train, X_test, y_train, y_test = train_test_split(
        features, y, test_size=0.2, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer([
        ("num", StandardScaler(), numerical),
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical)
    ])

    model = Pipeline([
        ("preprocessor", preprocessor),
        ("classifier", XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            random_state=42,
            eval_metric="mlogloss"
        ))
    ])

    model.fit(X_train, y_train)
    predictions = model.predict(X_test)

    print(f"\n{'=' * 55}\n{label}")
    print("Accuracy:", round(accuracy_score(y_test, predictions), 4))
    print(classification_report(
        y_test, predictions,
        labels=[0, 1, 2],
        target_names=["Low", "Medium", "High"],
        zero_division=0
    ))

features_with = df.drop(columns=[target])
features_without = features_with.drop(columns=["primary_barrier"])

evaluate(features_with, "WITH primary_barrier")
evaluate(features_without, "WITHOUT primary_barrier")
