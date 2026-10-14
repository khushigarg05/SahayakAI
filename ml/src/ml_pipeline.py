import sys
from pathlib import Path

# ============================================================
# PATH SETUP
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
SRC_DIR = BASE_DIR / "src"

if str(SRC_DIR) not in sys.path:
    sys.path.insert(0, str(SRC_DIR))


# ============================================================
# IMPORT EXISTING ML COMPONENTS
# ============================================================

from predict_service import predict_access_risk
from barrier_detector import BarrierDetector
from scheme_recommender import recommend_schemes
from eligibility_checker import check_eligibility


# ============================================================
# SAHAYAKAI ML PIPELINE
# ============================================================

class SahayakAIMLPipeline:

    def __init__(self):

        print("=" * 60)
        print("INITIALIZING SAHAYAKAI ML PIPELINE")
        print("=" * 60)

        print("\nLoading Barrier Detection Engine...")

        self.barrier_detector = BarrierDetector()

        print("\nAll ML components ready!")


    # ========================================================
    # COMPLETE CITIZEN ANALYSIS
    # ========================================================

    def analyze(self, citizen):

        print("\n" + "=" * 60)
        print("SAHAYAKAI COMPLETE ML ANALYSIS")
        print("=" * 60)


        # ====================================================
        # 1. ACCESS RISK PREDICTION
        # ====================================================

        print("\n[1/4] ACCESS RISK PREDICTION")
        print("-" * 50)

        risk_result = predict_access_risk(
            citizen
        )

        print(
            "Access Risk:",
            risk_result["access_risk"]
        )

        print(
            "Confidence:",
            f'{risk_result["confidence"]}%'
        )


        # ====================================================
        # 2. BARRIER DETECTION
        # ====================================================

        print("\n[2/4] BARRIER DETECTION")
        print("-" * 50)

        barrier_result = (
            self.barrier_detector.analyze(
                citizen
            )
        )

        print(
            "Barriers detected:",
            len(barrier_result["barriers"])
        )


        # ====================================================
        # 3. SCHEME RECOMMENDATION
        # ====================================================

        print("\n[3/4] SCHEME RECOMMENDATION")
        print("-" * 50)

        recommendations = recommend_schemes(

            age=citizen.get("age"),

            income=citizen.get(
                "annual_income"
            ),

            occupation=citizen.get(
                "occupation"
            ),

            state=citizen.get(
                "state"
            ),

            rural_or_urban=citizen.get(
                "rural_or_urban"
            ),

            need=citizen.get(
                "need"
            ),

            top_k=5
        )


        print(
            "Schemes recommended:",
            len(recommendations)
        )


        # ====================================================
        # 4. ELIGIBILITY CHECK
        # ====================================================

        print("\n[4/4] ELIGIBILITY CHECK")
        print("-" * 50)

        eligibility_results = []


        if not recommendations.empty:

            for _, scheme in recommendations.iterrows():

                result = check_eligibility(

                    scheme,

                    age=citizen.get(
                        "age"
                    ),

                    income=citizen.get(
                        "annual_income"
                    ),

                    occupation=citizen.get(
                        "occupation"
                    ),

                    state=citizen.get(
                        "state"
                    )
                )


                eligibility_results.append({

                    "scheme_name":
                        scheme["scheme_name"],

                    "final_score":
                        round(
                            float(
                                scheme["final_score"]
                            ) * 100,
                            2
                        ),

                    "level":
                        scheme["level"],

                    "category":
                        scheme["schemeCategory"],

                    "benefits":
                        scheme["benefits"],

                    "eligibility_text":
                        scheme["eligibility"],

                    "documents":
                        scheme["documents"],

                    "application":
                        scheme["application"],

                    "eligibility":
                        result
                })


        # ====================================================
        # FINAL RESULT
        # ====================================================

        final_result = {

            "citizen": citizen,

            "access_risk": risk_result,

            "barrier_analysis":
                barrier_result,

            "scheme_recommendations":
                eligibility_results
        }


        print("\n" + "=" * 60)
        print("ML ANALYSIS COMPLETED")
        print("=" * 60)


        return final_result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print("\n")
    print("=" * 60)
    print("SAHAYAKAI ML PIPELINE TEST")
    print("=" * 60)


    # --------------------------------------------------------
    # SAMPLE CITIZEN
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

        "previous_application_failure": "Yes",

        "primary_barrier": "Documentation",

        "need":
            "Agriculture financial assistance "
            "crop farming government support"
    }


    # --------------------------------------------------------
    # DISPLAY CITIZEN
    # --------------------------------------------------------

    print("\nCitizen Profile")
    print("-" * 40)

    for key, value in citizen.items():

        print(
            f"{key}: {value}"
        )


    # --------------------------------------------------------
    # CREATE PIPELINE
    # --------------------------------------------------------

    pipeline = SahayakAIMLPipeline()


    # --------------------------------------------------------
    # RUN ANALYSIS
    # --------------------------------------------------------

    result = pipeline.analyze(
        citizen
    )


    # ========================================================
    # DISPLAY FINAL RESULT
    # ========================================================

    print("\n" + "=" * 60)
    print("FINAL SAHAYAKAI ML RESULT")
    print("=" * 60)


    # --------------------------------------------------------
    # ACCESS RISK
    # --------------------------------------------------------

    risk = result["access_risk"]

    print("\nACCESS RISK")
    print("-" * 40)

    print(
        "Risk:",
        risk["access_risk"]
    )

    print(
        "Confidence:",
        f'{risk["confidence"]}%'
    )

    print(
        "Probabilities:",
        risk["risk_probabilities"]
    )


    # --------------------------------------------------------
    # BARRIERS
    # --------------------------------------------------------

    print("\nBARRIERS")
    print("-" * 40)

    for barrier in result[
        "barrier_analysis"
    ]["barriers"]:

        if barrier["score"] > 0:

            print(
                f'{barrier["barrier"]}: '
                f'{barrier["severity"]}'
            )


    # --------------------------------------------------------
    # ACTIONS
    # --------------------------------------------------------

    print("\nRECOMMENDED ACTIONS")
    print("-" * 40)

    for action in result[
        "barrier_analysis"
    ]["recommended_actions"]:

        print(
            f'{action["barrier"]}: '
            f'{action["action"]}'
        )


    # --------------------------------------------------------
    # SCHEMES
    # --------------------------------------------------------

    print("\nRECOMMENDED GOVERNMENT SCHEMES")
    print("-" * 40)

    for index, scheme in enumerate(
        result["scheme_recommendations"],
        start=1
    ):

        print(
            f"\n{index}. "
            f'{scheme["scheme_name"]}'
        )

        print(
            f'Match Score: '
            f'{scheme["final_score"]}%'
        )

        print(
            f'Eligibility: '
            f'{scheme["eligibility"]["overall_status"]}'
        )


    print("\n" + "=" * 60)
    print("SAHAYAKAI ML PIPELINE WORKING!")
    print("=" * 60)