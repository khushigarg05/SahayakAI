import joblib
import pandas as pd
from pathlib import Path


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "access_risk_model.pkl"
METADATA_PATH = BASE_DIR / "models" / "model_metadata.pkl"
PREPROCESSOR_PATH = BASE_DIR / "models" / "preprocessor.pkl"


# ============================================================
# BARRIER DETECTOR
# ============================================================

class BarrierDetector:

    def __init__(self):

        print("Loading ML components...")

        self.model = joblib.load(MODEL_PATH)
        self.metadata = joblib.load(METADATA_PATH)
        self.preprocessor = joblib.load(PREPROCESSOR_PATH)

        print("ML components loaded successfully!")


    # ========================================================
    # DETECT BARRIERS
    # ========================================================

    def detect(self, citizen):

        barriers = {}

        # ----------------------------------------------------
        # 1. DIGITAL ACCESS
        # ----------------------------------------------------

        digital_score = 0

        if citizen.get("internet_access") == "No":
            digital_score += 2

        digital_literacy = citizen.get(
            "digital_literacy",
            5
        )

        if digital_literacy <= 3:
            digital_score += 2

        elif digital_literacy <= 5:
            digital_score += 1

        barriers["Digital Access"] = digital_score


        # ----------------------------------------------------
        # 2. DOCUMENTATION
        # ----------------------------------------------------

        documentation_score = 0

        if citizen.get("documents_complete") == "No":
            documentation_score += 3

        barriers["Documentation"] = documentation_score


        # ----------------------------------------------------
        # 3. APPLICATION COMPLEXITY
        # ----------------------------------------------------

        complexity_score = 0

        complexity = citizen.get(
            "application_complexity",
            1
        )

        if complexity >= 4:
            complexity_score = 3

        elif complexity >= 3:
            complexity_score = 2

        elif complexity >= 2:
            complexity_score = 1

        barriers["Application Complexity"] = complexity_score


        # ----------------------------------------------------
        # 4. AWARENESS
        # ----------------------------------------------------

        awareness_score = 0

        awareness = citizen.get(
            "scheme_awareness",
            5
        )

        if awareness <= 2:
            awareness_score = 3

        elif awareness <= 4:
            awareness_score = 2

        elif awareness <= 6:
            awareness_score = 1

        barriers["Awareness"] = awareness_score


        # ----------------------------------------------------
        # 5. DISTANCE
        # ----------------------------------------------------

        distance_score = 0

        distance = citizen.get(
            "distance_to_service_center",
            0
        )

        if distance >= 20:
            distance_score = 3

        elif distance >= 10:
            distance_score = 2

        elif distance >= 5:
            distance_score = 1

        barriers["Distance"] = distance_score


        return self._format_barriers(barriers)


    # ========================================================
    # FORMAT RESULTS
    # ========================================================

    def _format_barriers(self, barriers):

        results = []

        for barrier, score in barriers.items():

            if score >= 3:
                severity = "High"

            elif score == 2:
                severity = "Medium"

            elif score == 1:
                severity = "Low"

            else:
                severity = "None"

            results.append({
                "barrier": barrier,
                "score": score,
                "severity": severity
            })


        results.sort(
            key=lambda x: x["score"],
            reverse=True
        )

        return results


    # ========================================================
    # RECOMMENDED ACTIONS
    # ========================================================

    def get_actions(self, barriers):

        actions = {

            "Digital Access":
                "Provide assisted digital application and voice-based guidance.",

            "Documentation":
                "Show missing documents and provide document preparation guidance.",

            "Application Complexity":
                "Break the application into simple step-by-step instructions.",

            "Awareness":
                "Provide personalized information about relevant government schemes.",

            "Distance":
                "Identify nearby service centres and available local assistance."
        }

        recommendations = []

        for item in barriers:

            if item["score"] > 0:

                recommendations.append({
                    "barrier": item["barrier"],
                    "severity": item["severity"],
                    "action": actions[item["barrier"]]
                })

        return recommendations


    # ========================================================
    # FULL ANALYSIS
    # ========================================================

    def analyze(self, citizen):

        barriers = self.detect(citizen)

        actions = self.get_actions(barriers)

        return {
            "barriers": barriers,
            "recommended_actions": actions
        }


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("SAHAYAKAI BARRIER DETECTION ENGINE")
    print("=" * 60)


    detector = BarrierDetector()


    # --------------------------------------------------------
    # Test citizen
    # --------------------------------------------------------

    citizen = {

        "age": 32,

        "annual_income": 150000,

        "occupation": "Farmer",

        "state": "Uttar Pradesh",

        "rural_or_urban": "Rural",

        "digital_literacy": 2,

        "internet_access": "No",

        "documents_complete": "No",

        "scheme_awareness": 2,

        "distance_to_service_center": 25,

        "application_complexity": 4,

        "previous_application_failure": "Yes"
    }


    print("\nCitizen Profile")
    print("-" * 40)

    for key, value in citizen.items():

        print(
            f"{key}: {value}"
        )


    # --------------------------------------------------------
    # ANALYZE
    # --------------------------------------------------------

    result = detector.analyze(citizen)


    print("\n" + "=" * 60)
    print("DETECTED BARRIERS")
    print("=" * 60)


    for barrier in result["barriers"]:

        print(
            f"\n{barrier['barrier']}"
        )

        print(
            f"Score: {barrier['score']}"
        )

        print(
            f"Severity: {barrier['severity']}"
        )


    print("\n" + "=" * 60)
    print("RECOMMENDED ACTIONS")
    print("=" * 60)


    for action in result["recommended_actions"]:

        print(
            f"\n{action['barrier']}"
        )

        print(
            f"Severity: {action['severity']}"
        )

        print(
            f"Action: {action['action']}"
        )


    print("\n" + "=" * 60)
    print("BARRIER DETECTION COMPLETED!")
    print("=" * 60)