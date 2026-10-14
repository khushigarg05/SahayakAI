import pandas as pd
from pathlib import Path


# --------------------------------------------------
# PATHS
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

RAW_PATH = BASE_DIR / "data" / "raw" / "government_schemes.csv"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT_PATH = PROCESSED_DIR / "government_schemes_clean.csv"


# --------------------------------------------------
# LOAD DATA
# --------------------------------------------------

print("=" * 60)
print("SahayakAI GOVERNMENT SCHEME DATA PREPARATION")
print("=" * 60)

print("\nLoading dataset...")

df = pd.read_csv(RAW_PATH)

print("Original shape:", df.shape)


# --------------------------------------------------
# REMOVE EMPTY COLUMN
# --------------------------------------------------

if "Unnamed: 9" in df.columns:
    df = df.drop(columns=["Unnamed: 9"])
    print("\nRemoved empty column: Unnamed: 9")


# --------------------------------------------------
# HANDLE MISSING VALUES
# --------------------------------------------------

text_columns = [
    "scheme_name",
    "slug",
    "details",
    "benefits",
    "eligibility",
    "application",
    "documents",
    "level",
    "schemeCategory",
    "tags"
]

for column in text_columns:
    if column in df.columns:
        df[column] = df[column].fillna("")


# --------------------------------------------------
# REMOVE DUPLICATES
# --------------------------------------------------

before = len(df)

df = df.drop_duplicates(
    subset=["scheme_name"]
)

after = len(df)

print("\nDuplicate schemes removed:", before - after)


# --------------------------------------------------
# CLEAN TEXT
# --------------------------------------------------

for column in text_columns:
    if column in df.columns:
        df[column] = (
            df[column]
            .astype(str)
            .str.strip()
        )


# --------------------------------------------------
# CREATE SEARCH TEXT
# --------------------------------------------------

df["search_text"] = (
    df["scheme_name"] + " "
    + df["details"] + " "
    + df["benefits"] + " "
    + df["eligibility"] + " "
    + df["documents"] + " "
    + df["schemeCategory"] + " "
    + df["tags"]
)


# --------------------------------------------------
# RESET INDEX
# --------------------------------------------------

df = df.reset_index(drop=True)


# --------------------------------------------------
# SAVE
# --------------------------------------------------

df.to_csv(
    OUTPUT_PATH,
    index=False
)


# --------------------------------------------------
# SUMMARY
# --------------------------------------------------

print("\nFinal dataset shape:", df.shape)

print("\nColumns:")
print(df.columns.tolist())

print("\nScheme levels:")
print(df["level"].value_counts())

print("\nTop categories:")
print(
    df["schemeCategory"]
    .value_counts()
    .head(10)
)

print("\nSaved to:")
print(OUTPUT_PATH)

print("\n" + "=" * 60)
print("SCHEME DATA PREPARATION COMPLETED!")
print("=" * 60)