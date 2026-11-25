import requests


def test_validate_nearby_kiosk_search():
    base_url = "http://localhost:8000".rstrip("/")
    url = f"{base_url}/api/v1/kiosks/nearby"
    headers = {"Accept": "application/json"}
    timeout = 30

    def extract_kiosks(payload):
        if isinstance(payload, list):
            return payload
        if not isinstance(payload, dict):
            return []

        for key in ("kiosks", "results", "items", "data"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
            if isinstance(value, dict):
                for nested_key in ("kiosks", "results", "items"):
                    nested_value = value.get(nested_key)
                    if isinstance(nested_value, list):
                        return nested_value
        return []

    def assert_filter_error(response):
        assert response.status_code == 400, (
            f"Expected HTTP 400 for invalid location filters, got "
            f"{response.status_code}: {response.text}"
        )
        error_text = response.text.lower()
        assert error_text.strip(), "Expected a filter validation error response"
        assert any(
            term in error_text
            for term in ("filter", "location", "district", "pincode", "invalid", "required", "validation")
        ), f"Response does not describe a location filter validation error: {response.text}"

    try:
        candidate_filters = [
            {"district": "Patna"},
            {"district": "Delhi"},
            {"district": "Mumbai"},
            {"district": "Bengaluru"},
            {"district": "Chennai"},
            {"pincode": "800001"},
            {"pincode": "110001"},
            {"pincode": "400001"},
            {"pincode": "560001"},
            {"pincode": "600001"},
        ]

        successful_response = None
        kiosks = []

        for filters in candidate_filters:
            response = requests.get(
                url,
                params=filters,
                headers=headers,
                timeout=timeout,
            )
            if response.status_code != 200:
                continue

            try:
                payload = response.json()
            except ValueError:
                continue

            matching_kiosks = extract_kiosks(payload)
            if matching_kiosks:
                successful_response = response
                kiosks = matching_kiosks
                break

        assert successful_response is not None, (
            "No candidate district or pincode returned a non-empty kiosk list"
        )
        assert successful_response.status_code == 200
        assert isinstance(kiosks, list) and kiosks

        contact_keys = (
            "contact",
            "contact_details",
            "phone",
            "phone_number",
            "contact_number",
            "mobile",
            "mobile_number",
        )
        distance_keys = ("distance", "distance_km", "distance_m", "distance_miles")

        for kiosk in kiosks:
            assert isinstance(kiosk, dict), f"Expected kiosk object, got: {kiosk!r}"
            assert any(
                key in kiosk and kiosk[key] not in (None, "", {})
                for key in contact_keys
            ), f"Kiosk is missing contact details: {kiosk}"
            assert any(
                key in kiosk and kiosk[key] not in (None, "")
                for key in distance_keys
            ), f"Kiosk is missing distance information: {kiosk}"

        missing_filter_response = requests.get(
            url,
            headers=headers,
            timeout=timeout,
        )
        assert_filter_error(missing_filter_response)

        invalid_filter_response = requests.get(
            url,
            params={"pincode": "not-a-valid-pincode"},
            headers=headers,
            timeout=timeout,
        )
        assert_filter_error(invalid_filter_response)

    except requests.RequestException as exc:
        raise AssertionError(f"HTTP request to the kiosk API failed: {exc}") from exc


if __name__ == "__main__":
    test_validate_nearby_kiosk_search()