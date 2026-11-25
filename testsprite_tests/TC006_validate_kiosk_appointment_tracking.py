import uuid

import requests


BASE_URL = "http://localhost:8000"
TIMEOUT = 30


def test_validate_kiosk_appointment_tracking():
    reference_id = None

    try:
        booking_payload = {
            "kiosk_id": 1,
            "citizen_name": "Test Citizen",
            "phone": "9876543210",
            "mobile_number": "9876543210",
            "phone_number": "9876543210",
            "service_type": "Scheme Application",
        }

        booking_response = requests.post(
            f"{BASE_URL}/api/v1/kiosks/book-token",
            json=booking_payload,
            headers={"Accept": "application/json", "Content-Type": "application/json"},
            timeout=TIMEOUT,
        )
        assert booking_response.status_code == 200, (
            f"Booking failed with {booking_response.status_code}: "
            f"{booking_response.text}"
        )

        booking_data = booking_response.json()
        reference_keys = ("reference_id", "reference", "booking_reference", "token_id")

        def find_reference(data):
            if isinstance(data, dict):
                for key in reference_keys:
                    if data.get(key):
                        return str(data[key])
                for value in data.values():
                    result = find_reference(value)
                    if result:
                        return result
            elif isinstance(data, list):
                for value in data:
                    result = find_reference(value)
                    if result:
                        return result
            return None

        reference_id = find_reference(booking_data)
        assert reference_id, f"Booking response did not contain a reference: {booking_data}"

        tracking_response = requests.get(
            f"{BASE_URL}/api/v1/kiosks/track/{reference_id}",
            headers={"Accept": "application/json"},
            timeout=TIMEOUT,
        )
        assert tracking_response.status_code == 200, (
            f"Tracking failed with {tracking_response.status_code}: "
            f"{tracking_response.text}"
        )

        tracking_data = tracking_response.json()

        def contains_status(data):
            if isinstance(data, dict):
                if any(
                    data.get(key) is not None
                    for key in ("status", "token_status", "appointment_status")
                ):
                    return True
                return any(contains_status(value) for value in data.values())
            if isinstance(data, list):
                return any(contains_status(value) for value in data)
            return False

        assert contains_status(tracking_data), (
            f"Tracking response did not include a token or appointment status: "
            f"{tracking_data}"
        )

        unknown_reference = f"unknown-{uuid.uuid4().hex}"
        unknown_response = requests.get(
            f"{BASE_URL}/api/v1/kiosks/track/{unknown_reference}",
            headers={"Accept": "application/json"},
            timeout=TIMEOUT,
        )
        assert unknown_response.status_code == 404, (
            f"Expected 404 for an unknown reference, got "
            f"{unknown_response.status_code}: {unknown_response.text}"
        )

    finally:
        if reference_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/v1/kiosks/track/{reference_id}",
                    headers={"Accept": "application/json"},
                    timeout=TIMEOUT,
                )
            except requests.RequestException:
                pass


if __name__ == "__main__":
    test_validate_kiosk_appointment_tracking()