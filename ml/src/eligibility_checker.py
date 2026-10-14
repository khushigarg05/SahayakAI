import re
import pandas as pd
from pathlib import Path


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
# ELIGIBILITY CHECKER
# ============================================================

def extract_income_limit(text):
    """
    Extract possible annual income limits from eligibility text.
    """

    text = str(text).lower()

    patterns = [
        r'₹\s?([\d,]+)\s*(?:/-)?\s*(?:per annum|annually|per year)',
        r'rs\.?\s?([\d,]+)\s*(?:/-)?\s*(?:per annum|annually|per year)',
        r'income.*?([\d,]+)',
    ]

    values = []

    for pattern in patterns:

        matches = re.findall(pattern, text)

        for match in matches:

            try:
                value = int(
                    match.replace(",", "")
                )

                if value >= 10000:
                    values.append(value)

            except ValueError:
                pass

    if values:
        return min(values)

    return None


def extract_age_limits(text):
    """
    Extract possible minimum and maximum ages.
    """

    text = str(text).lower()

    min_age = None
    max_age = None

    # Example:
    # age should be 18 years or above
    match = re.search(
        r'age.*?(\d{1,3})\s*years?\s*(?:or above|and above|above)',
        text
    )

    if match:
        min_age = int(match.group(1))

    # Example:
    # age between 18 to 60
    match = re.search(
        r'age.*?between\s*(\d{1,3})\s*(?:to|-)\s*(\d{1,3})',
        text
    )

    if match:

        min_age = int(match.group(1))
        max_age = int(match.group(2))

    # Example:
    # age should not be more than 60
    match = re.search(
        r'age.*?(?:not be more than|below|less than)\s*(\d{1,3})',
        text
    )

    if match:
        max_age = int(match.group(1))

    return min_age, max_age


def check_state(eligibility_text, state):

    if not state:
        return "Unknown"

    text = str(eligibility_text).lower()
    state = str(state).lower()

    if state in text:
        return "Likely Eligible"

    # Central schemes can generally be considered
    # separately from state-specific schemes.
    return "Needs Verification"


def check_age(eligibility_text, age):

    if age is None:
        return "Unknown"

    min_age, max_age = extract_age_limits(
        eligibility_text
    )

    if min_age is not None and age < min_age:
        return "Likely Not Eligible"

    if max_age is not None and age > max_age:
        return "Likely Not Eligible"

    return "Likely Eligible"


def check_income(eligibility_text, income):

    if income is None:
        return "Unknown"

    income_limit = extract_income_limit(
        eligibility_text
    )

    if income_limit is None:
        return "Needs Verification"

    if income <= income_limit:
        return "Likely Eligible"

    return "Likely Not Eligible"


def check_occupation(
    eligibility_text,
    tags,
    category,
    occupation
):

    if not occupation:
        return "Unknown"

    combined_text = (
        str(eligibility_text)
        + " "
        + str(tags)
        + " "
        + str(category)
    ).lower()

    occupation = occupation.lower()

    occupation_groups = {

        "farmer": [
            "farmer",
            "farmers",
            "agriculture",
            "agricultural",
            "farming",
            "crop",
            "livestock",
            "cattle",
            "dairy"
        ],

        "student": [
            "student",
            "students",
            "education",
            "school",
            "college",
            "scholarship"
        ],

        "business": [
            "business",
            "entrepreneur",
            "entrepreneurship",
            "msme",
            "enterprise"
        ],

        "worker": [
            "worker",
            "workers",
            "labour",
            "labor",
            "construction"
        ]
    }

    keywords = occupation_groups.get(
        occupation,
        [occupation]
    )

    for keyword in keywords:

        if keyword in combined_text:
            return "Likely Eligible"

    return "Needs Verification"


def check_eligibility(
    scheme,
    age=None,
    income=None,
    occupation=None,
    state=None
):

    eligibility_text = scheme.get(
        "eligibility",
        ""
    )

    age_status = check_age(
        eligibility_text,
        age
    )

    income_status = check_income(
        eligibility_text,
        income
    )

    state_status = check_state(
        eligibility_text,
        state
    )

    occupation_status = check_occupation(
        eligibility_text,
        scheme.get("tags", ""),
        scheme.get("schemeCategory", ""),
        occupation
    )

    statuses = [
        age_status,
        income_status,
        state_status,
        occupation_status
    ]

    if "Likely Not Eligible" in statuses:

        overall_status = "Likely Not Eligible"

    elif all(
        status == "Likely Eligible"
        for status in statuses
        if status != "Unknown"
    ):

        overall_status = "Likely Eligible"

    else:

        overall_status = "Needs Verification"

    return {
        "overall_status": overall_status,
        "age": age_status,
        "income": income_status,
        "state": state_status,
        "occupation": occupation_status
    }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SahayakAI ELIGIBILITY CHECKER")
    print("=" * 60)

    print("\nLoading schemes...")

    df = pd.read_csv(DATA_PATH)

    print(
        "Schemes loaded:",
        len(df)
    )

    # --------------------------------------------------------
    # Test citizen
    # --------------------------------------------------------

    citizen = {

        "age": 32,

        "income": 150000,

        "occupation": "Farmer",

        "state": "Uttar Pradesh"
    }

    print("\nCitizen Profile:")
    print("-" * 40)

    for key, value in citizen.items():
        print(f"{key}: {value}")

    # --------------------------------------------------------
    # Test first 5 schemes
    # --------------------------------------------------------

    print("\n" + "=" * 60)
    print("ELIGIBILITY TEST")
    print("=" * 60)

    for _, scheme in df.head(5).iterrows():

        result = check_eligibility(
            scheme,
            age=citizen["age"],
            income=citizen["income"],
            occupation=citizen["occupation"],
            state=citizen["state"]
        )

        print(
            f"\nScheme: {scheme['scheme_name']}"
        )

        print(
            "Overall:",
            result["overall_status"]
        )

        print(
            "Age:",
            result["age"]
        )

        print(
            "Income:",
            result["income"]
        )

        print(
            "State:",
            result["state"]
        )

        print(
            "Occupation:",
            result["occupation"]
        )

    print("\n" + "=" * 60)
    print("ELIGIBILITY CHECK COMPLETED!")
    print("=" * 60)