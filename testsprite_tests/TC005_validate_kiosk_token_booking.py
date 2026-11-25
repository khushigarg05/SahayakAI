import requests
from urllib.parse import urljoin


BASE_URL = "http://localhost:8000/"
TIMEOUT = 30


def test_validate_kiosk_token_booking():
    session = requests.Session()
    session.headers.update({"Accept": "application/json", "Content-Type": "application/json"})
    booking_reference = None

    try:
        openapi_response = session.get(urljoin(BASE_URL, "openapi.json"), timeout=TIMEOUT)
        openapi_response.raise_for_status()
        openapi = openapi_response.json()

        booking_schema = {}
        request_body = (
            openapi.get("paths", {})
            .get("/api/v1/kiosks/book-token", {})
            .get("post", {})
            .get("requestBody", {})
        )
        content = request_body.get("content", {})
        media_schema = content.get("application/json", {}).get("schema", {})

        if "$ref" in media_schema:
            schema_name = media_schema["$ref"].rsplit("/", 1)[-1]
            booking_schema = openapi.get("components", {}).get("schemas", {}).get(schema_name, {})
        else:
            booking_schema = media_schema

        kiosk_id = 1
        try:
            nearby_response = session.get(
                urljoin(BASE_URL, "api/v1/kiosks/nearby"),
                params={"district": "Delhi"},
                timeout=TIMEOUT,
            )
            if nearby_response.ok:
                nearby_data = nearby_response.json()

                def find_kiosk_id(value):
                    if isinstance(value, dict):
                        for key in ("kiosk_id", "id"):
                            if value.get(key) is not None:
                                return value[key]
                        for child in value.values():
                            result = find_kiosk_id(child)
                            if result is not None:
                                return result
                    elif isinstance(value, list):
                        for child in value:
                            result = find_kiosk_id(child)
                            if result is not None:
                                return result
                    return None

                discovered_id = find_kiosk_id(nearby_data)
                if discovered_id is not None:
                    kiosk_id = discovered_id
        except requests.RequestException:
            pass

        properties = booking_schema.get("properties", {})
        required_fields = booking_schema.get("required", [])
        booking_payload = {}

        for field in required_fields:
            field_schema = properties.get(field, {})
            field_type = field_schema.get("type")
            normalized = field.lower()

            if any(word in normalized for word in ("kiosk", "center", "centre")) and (
                "id" in normalized or field_type in ("integer", "number")
            ):
                value = kiosk_id
            elif any(word in normalized for word in ("name",)):
                value = "Aarav Sharma"
            elif any(word in normalized for word in ("phone", "mobile", "contact")):
                value = "9876543210"
            elif "email" in normalized:
                value = "aarav.sharma@example.com"
            elif "date" in normalized or "time" in normalized:
                value = "2026-12-15"
            elif any(word in normalized for word in ("scheme", "service", "purpose")):
                value = "Welfare scheme assistance"
            elif "age" in normalized:
                value = 35
            elif field_type == "integer":
                value = 1
            elif field_type == "number":
                value = 1
            elif field_type == "boolean":
                value = True
            elif field_type == "array":
                value = []
            elif field_type == "object":
                value = {}
            elif field_schema.get("enum"):
                value = field_schema["enum"][0]
            else:
                value = "Test booking"

            booking_payload[field] = value

        for field, field_schema in properties.items():
            normalized = field.lower()
            if field in booking_payload:
                continue
            if any(word in normalized for word in ("kiosk_id", "center_id", "centre_id")):
                booking_payload[field] = kiosk_id

        response = session.post(
            urljoin(BASE_URL, "api/v1/kiosks/book-token"),
            json=booking_payload,
            timeout=TIMEOUT,
        )
        assert response.status_code == 200, (
            f"Expected successful booking (200), got {response.status_code}: {response.text}"
        )

        booking_data = response.json()
        assert isinstance(booking_data, dict), "Booking response should be a JSON object"

        def collect_keys(value):
            keys = set()
            if isinstance(value, dict):
                for key, child in value.items():
                    keys.add(key.lower())
                    keys.update(collect_keys(child))
            elif isinstance(value, list):
                for child in value:
                    keys.update(collect_keys(child))
            return keys

        response_keys = collect_keys(booking_data)
        token_keys = {"token", "appointment_token", "token_number", "reference_id", "booking_reference"}
        qr_keys = {"qr", "qr_code", "qr_pass", "qr_data", "qr_payload"}
        assert response_keys.intersection(token_keys), (
            f"Booking response does not contain an appointment token or reference: {booking_data}"
        )
        assert response_keys.intersection(qr_keys), (
            f"Booking response does not contain QR pass details: {booking_data}"
        )

        for key in ("reference_id", "booking_reference", "appointment_id", "id"):
            if booking_data.get(key) is not None:
                booking_reference = booking_data[key]
                break
        if booking_reference is None:
            for key in ("appointment_token", "token_number", "token"):
                if booking_data.get(key) is not None:
                    booking_reference = booking_data[key]
                    break

        incomplete_response = session.post(
            urljoin(BASE_URL, "api/v1/kiosks/book-token"),
            json={},
            timeout=TIMEOUT,
        )
        assert incomplete_response.status_code == 422, (
            f"Expected incomplete booking to return 422, got "
            f"{incomplete_response.status_code}: {incomplete_response.text}"
        )
        validation_data = incomplete_response.json()
        assert "detail" in validation_data or "errors" in validation_data, (
            f"Expected validation errors in 422 response: {validation_data}"
        )
    except requests.RequestException as exc:
        raise AssertionError(f"HTTP request failed: {exc}") from exc
    finally:
        if booking_reference is not None:
            try:
                session.delete(
                    urljoin(
                        BASE_URL,
                        f"api/v1/kiosks/book-token/{booking_reference}",
                    ),
                    timeout=TIMEOUT,
                )
            except requests.RequestException:
                pass
        session.close()


if __name__ == "__main__":
    test_validate_kiosk_token_booking()