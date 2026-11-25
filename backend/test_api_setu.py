import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Add backend directory to sys.path
BASE_DIR = Path(__file__).resolve().parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from app.main import app
from app.services.api_setu_service import ApiSetuService
from app.schemas.api_setu import DocVerificationRequest

def test_api_setu_samples_service():
    """Verify sample documents catalog contains valid items"""
    samples = ApiSetuService.get_sample_documents()
    assert len(samples.samples) >= 5
    assert samples.sandbox_mode is True

def test_api_setu_verify_valid_income():
    """Verify valid income certificate in sandbox"""
    req = DocVerificationRequest(
        doc_type="income",
        doc_number="UP/INC/2026/89412",
        state="Uttar Pradesh"
    )
    res = ApiSetuService.verify_document(req)
    assert res.status == "verified"
    assert res.is_valid is True
    assert res.is_expired is False
    assert res.holder_name == "Ramesh Kumar"
    assert res.metadata["annual_income"] == 65000

def test_api_setu_verify_expired_income():
    """Verify expired income certificate produces correct warning"""
    req = DocVerificationRequest(
        doc_type="income",
        doc_number="UP/INC/2021/11029",
        state="Uttar Pradesh"
    )
    res = ApiSetuService.verify_document(req)
    assert res.status == "expired"
    assert res.is_valid is False
    assert res.is_expired is True

def test_api_setu_verify_dbt():
    """Verify NPCI Aadhaar DBT simulation"""
    req = DocVerificationRequest(
        doc_type="dbt",
        doc_number="DBT-ACTIVE-9102"
    )
    res = ApiSetuService.verify_document(req)
    assert res.status == "verified"
    assert res.is_valid is True
    assert res.metadata["dbt_active"] is True

def test_api_setu_endpoints():
    """Verify FastAPI endpoints /api/v1/apisetu/samples and /api/v1/apisetu/verify"""
    client = TestClient(app)
    
    # Status endpoint
    status_res = client.get("/api/v1/apisetu/status")
    assert status_res.status_code == 200
    assert status_res.json()["status"] == "online"
    
    # Samples endpoint
    sample_res = client.get("/api/v1/apisetu/samples")
    assert sample_res.status_code == 200
    data = sample_res.json()
    assert len(data["samples"]) > 0

    # Verification endpoint
    verify_res = client.post("/api/v1/apisetu/verify", json={
        "doc_type": "income",
        "doc_number": "UP/INC/2026/89412",
        "state": "Uttar Pradesh"
    })
    assert verify_res.status_code == 200
    verify_data = verify_res.json()
    assert verify_data["status"] == "verified"
    assert verify_data["holder_name"] == "Ramesh Kumar"

if __name__ == "__main__":
    test_api_setu_samples_service()
    test_api_setu_verify_valid_income()
    test_api_setu_verify_expired_income()
    test_api_setu_verify_dbt()
    test_api_setu_endpoints()
    print("ALL API SETU BACKEND TESTS PASSED SUCCESSFULLY!")
