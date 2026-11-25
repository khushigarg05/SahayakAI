import requests


def test_validate_deterministic_scheme_matching():
    base_url = "http://localhost:8000"
    url = f"{base_url}/api/v1/schemes/match"
    headers = {"Accept": "application/json", "Content-Type": "application/json"}
    timeout = 30

    valid_profile = {
        "name": "Test Citizen",
        "full_name": "Test Citizen",
        "age": 35,
        "gender": "female",
        "state": "Uttar Pradesh",
        "district": "Lucknow",
        "category": "GENERAL",
        "annual_income": 90000,
        "occupation": "farmer",
        "family_size": 4,
        "land_ownership": True,
        "land_acres": 1.0,
        "is_bpl": True,
        "is_disabled": False,
        "is_widow": False,
        "is_senior_citizen": False,
        "has_aadhaar": True,
        "has_bank_account": True,
        "has_ration_card": True,
        "has_mobile": True,
        "has_income_certificate": True,
        "digital_literacy": "basic",
        "education": "secondary",
    }

    try:
        success_response = requests.post(
            url, json=valid_profile, headers=headers, timeout=timeout
        )
    except requests.RequestException as exc:
        raise AssertionError(f"Scheme matching request failed: {exc}") from exc

    assert success_response.status_code == 200, (
        f"Expected 200 for a complete valid profile; got "
        f"{success_response.status_code}: {success_response.text}"
    )

    try:
        success_data = success_response.json()
    except ValueError as exc:
        raise AssertionError("Successful scheme response was not valid JSON") from exc

    assert isinstance(success_data, dict), "Expected a JSON object in the response"
    response_data = success_data.get("data", success_data)
    assert isinstance(response_data, dict), "Expected scheme results in a JSON object"

    schemes = None
    for key in ("eligible_schemes", "matched_schemes", "matches", "schemes", "recommendations"):
        if isinstance(response_data.get(key), list):
            schemes = response_data[key]
            break

    assert schemes, f"Expected at least one eligible scheme in response: {success_data}"

    for scheme in schemes:
        assert isinstance(scheme, dict), f"Expected each scheme result to be an object: {scheme}"

        match_percentage = next(
            (
                scheme[key]
                for key in (
                    "match_percentage",
                    "match_percent",
                    "eligibility_percentage",
                    "eligibility_percent",
                    "percentage",
                )
                if key in scheme
            ),
            None,
        )
        assert isinstance(match_percentage, (int, float)), (
            f"Expected a numeric match percentage for scheme: {scheme}"
        )
        assert 0 <= match_percentage <= 100, (
            f"Match percentage must be between 0 and 100: {scheme}"
        )

        benefits = next(
            (
                scheme[key]
                for key in ("benefits", "benefit", "benefit_details", "benefits_summary")
                if key in scheme
            ),
            None,
        )
        assert benefits not in (None, "", [], {}), f"Expected benefits for scheme: {scheme}"

        required_documents = next(
            (
                scheme[key]
                for key in (
                    "required_documents",
                    "documents_required",
                    "documents",
                    "document_checklist",
                )
                if key in scheme
            ),
            None,
        )
        assert required_documents not in (None, "", [], {}), (
            f"Expected required documents for scheme: {scheme}"
        )

    invalid_profiles = [
        {},
        {
            **valid_profile,
            "category": "INVALID_CATEGORY",
            "age": 16,
            "is_senior_citizen": True,
        },
    ]

    for invalid_profile in invalid_profiles:
        try:
            error_response = requests.post(
                url, json=invalid_profile, headers=headers, timeout=timeout
            )
        except requests.RequestException as exc:
            raise AssertionError(f"Invalid-profile request failed: {exc}") from exc

        assert error_response.status_code == 400, (
            f"Expected 400 for an incomplete or conflicting profile; got "
            f"{error_response.status_code}: {error_response.text}"
        )

        try:
            error_data = error_response.json()
        except ValueError as exc:
            raise AssertionError("Validation error response was not valid JSON") from exc

        assert isinstance(error_data, dict), "Expected validation errors in a JSON object"
        assert any(
            key in error_data for key in ("detail", "errors", "validation_errors", "message")
        ), f"Expected validation error details: {error_data}"

        error_payload = error_data.get("data", error_data)
        if isinstance(error_payload, dict):
            for key in ("eligible_schemes", "matched_schemes", "matches", "schemes", "recommendations"):
                assert not error_payload.get(key), (
                    f"Invalid profile must not produce scheme recommendations: {error_data}"
                )


if __name__ == "__main__":
    test_validate_deterministic_scheme_matching()