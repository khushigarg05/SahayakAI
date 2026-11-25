import requests

BASE_URL = "http://localhost:8000"
RISK_URL = f"{BASE_URL}/api/v1/risk/assess-risk"
HEADERS = {"Accept": "application/json", "Content-Type": "application/json"}


def test_validate_risk_assessment_and_explanations():
    profile = {
        "scheme_id": 1,
        "age": 35,
        "gender": "Male",
        "income": 120000,
        "annual_income": 120000,
        "education": "Secondary",
        "education_level": "Secondary",
        "employment": "Self-employed",
        "employment_status": "Self-employed",
        "caste": "OBC",
        "caste_category": "OBC",
        "rural": True,
        "is_rural": True,
        "land_ownership": False,
        "disability": False,
        "aadhaar_linked": True,
        "bank_account": True,
        "mobile_access": True,
        "digital_literacy": "Low",
        "documents_ready": True,
    }

    def request_json(payload):
        try:
            return requests.post(
                RISK_URL,
                json=payload,
                headers=HEADERS,
                timeout=30,
            )
        except requests.RequestException as exc:
            raise AssertionError(f"Risk assessment request failed: {exc}") from exc

    def flatten_json(value):
        flattened = {}
        if isinstance(value, dict):
            for key, item in value.items():
                flattened[str(key).lower()] = item
                flattened.update(flatten_json(item))
        elif isinstance(value, list):
            for item in value:
                flattened.update(flatten_json(item))
        return flattened

    response = request_json(profile)
    assert response.status_code == 200, (
        f"Expected 200 for a complete profile; received {response.status_code}: "
        f"{response.text}"
    )
    try:
        result = response.json()
    except ValueError as exc:
        raise AssertionError("Successful risk response was not valid JSON") from exc

    flattened = flatten_json(result)
    score_keys = {
        "risk_score",
        "risk_probability",
        "probability",
        "score",
        "rejection_risk",
    }
    band_keys = {"risk_band", "risk_level", "band"}
    explanation_keys = {
        "barrier_contributions",
        "top_barriers",
        "barriers",
        "shap_values",
        "explanation",
        "explanations",
        "top_factors",
        "feature_contributions",
    }

    score = next(
        (flattened[key] for key in score_keys if key in flattened),
        None,
    )
    assert isinstance(score, (int, float)) and not isinstance(score, bool), (
        f"Response should contain a numeric risk score: {result}"
    )
    assert 0 <= score <= 100, f"Risk score is outside the expected range: {score}"

    band = next(
        (flattened[key] for key in band_keys if key in flattened),
        None,
    )
    assert isinstance(band, str) and band.strip(), (
        f"Response should contain a risk band: {result}"
    )
    assert band.strip().lower() in {"low", "medium", "high"}, (
        f"Unexpected risk band: {band}"
    )

    explanations = [
        flattened[key]
        for key in explanation_keys
        if key in flattened and flattened[key] is not None
    ]
    assert explanations, f"Response should contain barrier explanations: {result}"
    assert any(
        (isinstance(item, (dict, list)) and len(item) > 0)
        or (isinstance(item, str) and item.strip())
        for item in explanations
    ), f"Barrier explanations should not be empty: {result}"

    invalid_payloads = [
        ({}, "missing features"),
        ({**profile, "age": "not-a-number"}, "malformed feature"),
        ({**profile, "age": 200}, "out-of-range numeric value"),
        ({**profile, "income": -1, "annual_income": -1}, "negative income"),
    ]

    for payload, case_name in invalid_payloads:
        error_response = request_json(payload)
        assert error_response.status_code in (400, 422), (
            f"Expected 400 or 422 for {case_name}; received "
            f"{error_response.status_code}: {error_response.text}"
        )
        try:
            error_body = error_response.json()
        except ValueError as exc:
            raise AssertionError(
                f"Validation response for {case_name} was not valid JSON"
            ) from exc

        assert isinstance(error_body, (dict, list)) and error_body, (
            f"Expected validation details for {case_name}: {error_body}"
        )
        error_fields = flatten_json(error_body)
        assert not any(
            key in error_fields
            for key in ("risk_score", "risk_probability", "probability", "risk_band")
        ), f"Validation response unexpectedly included a prediction: {error_body}"


if __name__ == "__main__":
    test_validate_risk_assessment_and_explanations()