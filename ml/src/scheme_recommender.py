import pandas as pd
import re
from pathlib import Path

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "government_schemes_clean.csv"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 60)
print("SahayakAI ELIGIBILITY-AWARE SCHEME RECOMMENDER")
print("=" * 60)

print("\nLoading government schemes...")

df = pd.read_csv(DATA_PATH)

print("Schemes loaded:", len(df))


# ============================================================
# CLEAN DATA
# ============================================================

TEXT_COLUMNS = [
    "scheme_name",
    "details",
    "benefits",
    "eligibility",
    "application",
    "documents",
    "level",
    "schemeCategory",
    "tags",
    "search_text"
]

for column in TEXT_COLUMNS:
    if column in df.columns:
        df[column] = df[column].fillna("").astype(str)


# ============================================================
# TF-IDF
# ============================================================

print("\nBuilding TF-IDF index...")

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=15000,
    ngram_range=(1, 2)
)

scheme_vectors = vectorizer.fit_transform(
    df["search_text"]
)

print("TF-IDF matrix shape:", scheme_vectors.shape)


# ============================================================
# KEYWORD GROUPS
# ============================================================

OCCUPATION_KEYWORDS = {

    "farmer": [
        "farmer",
        "farmers",
        "agriculture",
        "agricultural",
        "cultivation",
        "crop",
        "crops",
        "cattle",
        "livestock",
        "fisherman",
        "fishermen",
        "dairy"
    ],

    "student": [
        "student",
        "students",
        "scholarship",
        "education",
        "school",
        "college",
        "university"
    ],

    "business": [
        "business",
        "entrepreneur",
        "entrepreneurship",
        "enterprise",
        "msme",
        "startup",
        "self employed"
    ],

    "worker": [
        "worker",
        "workers",
        "labour",
        "labor",
        "construction worker",
        "daily wage"
    ],

    "women": [
        "women",
        "woman",
        "girl",
        "girls",
        "widow",
        "female"
    ]
}


CATEGORY_KEYWORDS = {

    "agriculture": [
        "agriculture",
        "agricultural",
        "farmer",
        "farmers",
        "farming",
        "crop",
        "livestock",
        "fisheries",
        "rural"
    ],

    "education": [
        "education",
        "learning",
        "school",
        "college",
        "student",
        "scholarship"
    ],

    "health": [
        "health",
        "medical",
        "hospital",
        "disease",
        "insurance",
        "wellness"
    ],

    "business": [
        "business",
        "entrepreneur",
        "entrepreneurship",
        "msme",
        "enterprise",
        "startup"
    ],

    "employment": [
        "employment",
        "employment",
        "skill",
        "training",
        "job",
        "worker",
        "labour",
        "labor"
    ],

    "housing": [
        "housing",
        "house",
        "home",
        "shelter"
    ],

    "social welfare": [
        "social welfare",
        "pension",
        "financial assistance",
        "welfare",
        "relief"
    ]
}


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def normalize(text):
    """Convert text to lowercase and remove extra spaces."""

    text = str(text).lower()

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.strip()


def keyword_score(text, keywords):
    """
    Calculate keyword relevance.

    Returns value between 0 and 1.
    """

    text = normalize(text)

    if not text:
        return 0.0

    matches = 0

    for keyword in keywords:

        if keyword in text:
            matches += 1

    if matches == 0:
        return 0.0

    return min(
        matches / max(len(keywords) * 0.25, 1),
        1.0
    )


def detect_occupation_keywords(occupation):

    occupation = normalize(occupation)

    detected = []

    for group, keywords in OCCUPATION_KEYWORDS.items():

        for keyword in keywords:

            if keyword in occupation:
                detected.append(group)
                break

    return list(set(detected))


def detect_category_keywords(category):

    category = normalize(category)

    detected = []

    for group, keywords in CATEGORY_KEYWORDS.items():

        for keyword in keywords:

            if keyword in category:

                detected.append(group)

                break

    return list(set(detected))


# ============================================================
# SCHEME RECOMMENDER
# ============================================================

def recommend_schemes(
    age=None,
    income=None,
    occupation=None,
    state=None,
    rural_or_urban=None,
    need=None,
    top_k=5
):

    """
    Recommend government schemes using:

    1. Semantic similarity
    2. Occupation relevance
    3. Category relevance
    4. State relevance
    5. Rural/urban relevance
    6. Eligibility relevance
    """

    # --------------------------------------------------------
    # Build citizen query
    # --------------------------------------------------------

    query_parts = []

    if occupation:
        query_parts.append(str(occupation))

    if state:
        query_parts.append(str(state))

    if rural_or_urban:
        query_parts.append(str(rural_or_urban))

    if need:
        query_parts.append(str(need))

    if age is not None:
        query_parts.append(f"age {age}")

    if income is not None:
        query_parts.append(
            f"annual income {income}"
        )

    query = " ".join(query_parts)

    if not query.strip():

        return pd.DataFrame()

    # --------------------------------------------------------
    # Semantic similarity
    # --------------------------------------------------------

    query_vector = vectorizer.transform([query])

    similarities = cosine_similarity(
        query_vector,
        scheme_vectors
    )[0]

    results = df.copy()

    results["semantic_score"] = similarities

    # --------------------------------------------------------
    # Occupation score
    # --------------------------------------------------------

    if occupation:

        occupation_groups = (
            detect_occupation_keywords(
                occupation
            )
        )

        def occupation_match(row):

            text = normalize(
                row["eligibility"]
                + " "
                + row["tags"]
                + " "
                + row["schemeCategory"]
                + " "
                + row["details"]
            )

            if not occupation_groups:
                return 0.0

            scores = []

            for group in occupation_groups:

                scores.append(
                    keyword_score(
                        text,
                        OCCUPATION_KEYWORDS[group]
                    )
                )

            return max(scores)

        results["occupation_score"] = results.apply(
            occupation_match,
            axis=1
        )

    else:

        results["occupation_score"] = 0.0

    # --------------------------------------------------------
    # Need / category score
    # --------------------------------------------------------

    if need:

        category_groups = (
            detect_category_keywords(
                need
            )
        )

        def category_match(row):

            text = normalize(
                row["schemeCategory"]
                + " "
                + row["tags"]
                + " "
                + row["benefits"]
                + " "
                + row["details"]
            )

            if not category_groups:
                return keyword_score(
                    text,
                    normalize(need).split()
                )

            scores = []

            for group in category_groups:

                scores.append(
                    keyword_score(
                        text,
                        CATEGORY_KEYWORDS[group]
                    )
                )

            return max(scores)

        results["category_score"] = results.apply(
            category_match,
            axis=1
        )

    else:

        results["category_score"] = 0.0

    # --------------------------------------------------------
    # State score
    # --------------------------------------------------------

    if state:

        state = normalize(state)

        def state_match(row):

            if normalize(row["level"]) == "central":

                return 0.5

            text = normalize(
                row["eligibility"]
                + " "
                + row["details"]
                + " "
                + row["tags"]
            )

            if state in text:

                return 1.0

            return 0.0

        results["state_score"] = results.apply(
            state_match,
            axis=1
        )

    else:

        results["state_score"] = 0.0

    # --------------------------------------------------------
    # Rural / Urban score
    # --------------------------------------------------------

    if rural_or_urban:

        location = normalize(
            rural_or_urban
        )

        def location_match(row):

            text = normalize(
                row["eligibility"]
                + " "
                + row["details"]
                + " "
                + row["tags"]
            )

            if location in text:

                return 1.0

            return 0.0

        results["location_score"] = results.apply(
            location_match,
            axis=1
        )

    else:

        results["location_score"] = 0.0

    # --------------------------------------------------------
    # Final weighted score
    # --------------------------------------------------------

    results["final_score"] = (

        0.40 * results["semantic_score"]

        + 0.20 * results["occupation_score"]

        + 0.15 * results["category_score"]

        + 0.15 * results["state_score"]

        + 0.10 * results["location_score"]
    )

    # --------------------------------------------------------
    # Sort
    # --------------------------------------------------------

    results = results.sort_values(
        by="final_score",
        ascending=False
    )

    # --------------------------------------------------------
    # Return useful columns
    # --------------------------------------------------------

    return results[
        [
            "scheme_name",
            "benefits",
            "eligibility",
            "documents",
            "application",
            "level",
            "schemeCategory",
            "tags",
            "semantic_score",
            "occupation_score",
            "category_score",
            "state_score",
            "location_score",
            "final_score"
        ]
    ].head(top_k)


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("\n" + "=" * 60)
    print("TESTING ELIGIBILITY-AWARE RECOMMENDER")
    print("=" * 60)

    citizen = {

        "age": 32,

        "income": 150000,

        "occupation": "Farmer",

        "state": "Uttar Pradesh",

        "rural_or_urban": "Rural",

        "need": (
            "Agriculture financial assistance "
            "crop farming government support"
        )
    }

    print("\nCitizen Profile:")
    print("-" * 40)

    for key, value in citizen.items():

        print(
            f"{key}: {value}"
        )

    recommendations = recommend_schemes(
        age=citizen["age"],
        income=citizen["income"],
        occupation=citizen["occupation"],
        state=citizen["state"],
        rural_or_urban=citizen["rural_or_urban"],
        need=citizen["need"],
        top_k=5
    )

    print("\n" + "=" * 60)
    print("TOP RECOMMENDED SCHEMES")
    print("=" * 60)

    if recommendations.empty:

        print("\nNo schemes found.")

    else:

        for rank, (_, row) in enumerate(
            recommendations.iterrows(),
            start=1
        ):

            print(
                f"\n{rank}. {row['scheme_name']}"
            )

            print(
                f"Final Match Score: "
                f"{row['final_score']:.2%}"
            )

            print(
                f"Semantic Score: "
                f"{row['semantic_score']:.2%}"
            )

            print(
                f"Occupation Match: "
                f"{row['occupation_score']:.2%}"
            )

            print(
                f"Category Match: "
                f"{row['category_score']:.2%}"
            )

            print(
                f"State Match: "
                f"{row['state_score']:.2%}"
            )

            print(
                f"Location Match: "
                f"{row['location_score']:.2%}"
            )

            print(
                f"Level: {row['level']}"
            )

            print(
                f"Category: "
                f"{row['schemeCategory']}"
            )

            print(
                f"Benefits: "
                f"{str(row['benefits'])[:300]}"
            )

            print(
                f"Eligibility: "
                f"{str(row['eligibility'])[:350]}"
            )

            print(
                f"Documents: "
                f"{str(row['documents'])[:250]}"
            )

    print("\n" + "=" * 60)
    print("RECOMMENDATION TEST COMPLETED!")
    print("=" * 60)