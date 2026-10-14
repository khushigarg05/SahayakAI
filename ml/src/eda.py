import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load dataset
DATA_PATH = "data/raw/access_risk_dataset.csv"
OUTPUT_DIR = "evaluation/eda"

os.makedirs(OUTPUT_DIR, exist_ok=True)

df = pd.read_csv(DATA_PATH)

print("=" * 60)
print("SAHAYAKAI - DATA EXPLORATION")
print("=" * 60)

# Basic information
print("\nDataset Shape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nData Types:")
print(df.dtypes)

print("\nMissing Values:")
print(df.isnull().sum())

print("\nDuplicate Rows:")
print(df.duplicated().sum())

print("\nRisk Distribution:")
print(df["access_risk"].value_counts())

print("\nBarrier Distribution:")
print(df["primary_barrier"].value_counts())

print("\nNumerical Summary:")
print(df.describe())

# ---------------------------------------------------------
# 1. Access Risk Distribution
# ---------------------------------------------------------

plt.figure(figsize=(8, 5))
sns.countplot(data=df, x="access_risk")
plt.title("Access Risk Distribution")
plt.xlabel("Access Risk")
plt.ylabel("Number of Applicants")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/risk_distribution.png")
plt.close()

# ---------------------------------------------------------
# 2. Primary Barrier Distribution
# ---------------------------------------------------------

plt.figure(figsize=(10, 6))
sns.countplot(
    data=df,
    y="primary_barrier",
    order=df["primary_barrier"].value_counts().index
)
plt.title("Primary Barrier Distribution")
plt.xlabel("Number of Applicants")
plt.ylabel("Primary Barrier")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/barrier_distribution.png")
plt.close()

# ---------------------------------------------------------
# 3. Digital Literacy vs Risk
# ---------------------------------------------------------

plt.figure(figsize=(8, 5))
sns.countplot(
    data=df,
    x="digital_literacy",
    hue="access_risk"
)
plt.title("Digital Literacy vs Access Risk")
plt.xlabel("Digital Literacy Level")
plt.ylabel("Number of Applicants")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/digital_literacy_vs_risk.png")
plt.close()

# ---------------------------------------------------------
# 4. Documents vs Risk
# ---------------------------------------------------------

plt.figure(figsize=(8, 5))
sns.countplot(
    data=df,
    x="documents_complete",
    hue="access_risk"
)
plt.title("Document Completeness vs Access Risk")
plt.xlabel("Documents Complete")
plt.ylabel("Number of Applicants")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/documents_vs_risk.png")
plt.close()

# ---------------------------------------------------------
# 5. Internet Access vs Risk
# ---------------------------------------------------------

plt.figure(figsize=(8, 5))
sns.countplot(
    data=df,
    x="internet_access",
    hue="access_risk"
)
plt.title("Internet Access vs Access Risk")
plt.xlabel("Internet Access")
plt.ylabel("Number of Applicants")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/internet_vs_risk.png")
plt.close()

# ---------------------------------------------------------
# 6. Correlation Heatmap
# ---------------------------------------------------------

numeric_df = df.select_dtypes(include=["int64", "float64"])

plt.figure(figsize=(10, 7))
sns.heatmap(
    numeric_df.corr(),
    annot=True,
    cmap="coolwarm",
    fmt=".2f"
)
plt.title("Feature Correlation Heatmap")
plt.tight_layout()
plt.savefig(f"{OUTPUT_DIR}/correlation_heatmap.png")
plt.close()

print("\nEDA completed successfully!")
print(f"Charts saved in: {OUTPUT_DIR}")