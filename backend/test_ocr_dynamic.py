import io
import os
from PIL import Image, ImageDraw, ImageFont
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def create_synthetic_card(name: str, dob: str, gender: str, aadhaar: str) -> bytes:
    img = Image.new("RGB", (900, 500), color="white")
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 30)
        font_lg = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 36)
    except Exception:
        font = font_lg = ImageFont.load_default()

    draw.text((50, 40), "GOVERNMENT OF INDIA", fill="black", font=font_lg)
    draw.text((50, 110), name, fill="black", font=font_lg)
    draw.text((50, 170), f"DOB: {dob}", fill="black", font=font)
    draw.text((50, 220), f"Gender: {gender}", fill="black", font=font)
    draw.text((50, 310), aadhaar, fill="black", font=font_lg)
    draw.text((50, 400), "Mera Aadhaar, Meri Pehchan", fill="gray", font=font)

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

def test_dynamic_ocr_multi_person():
    people = [
        {"name": "Pooja Sharma", "dob": "14/08/1995", "gender": "FEMALE", "aadhaar": "8765 4321 0987", "expected_last4": "0987"},
        {"name": "Ramesh Kumar", "dob": "12/05/1982", "gender": "MALE", "aadhaar": "6241 8902 4519", "expected_last4": "4519"},
        {"name": "Mohammad Imran", "dob": "01/01/2001", "gender": "MALE", "aadhaar": "4198 3267 9054", "expected_last4": "9054"},
    ]

    for p in people:
        card_bytes = create_synthetic_card(p["name"], p["dob"], p["gender"], p["aadhaar"])
        files = {"file": ("aadhaar_test.png", card_bytes, "image/png")}
        data = {"document_type": "aadhaar"}

        res = client.post("/api/v1/documents/verify", files=files, data=data)
        assert res.status_code == 200, f"Failed for {p['name']}: {res.text}"
        body = res.json()

        assert body["is_valid"] is True
        assert body["masked_identifier"] == f"XXXX-XXXX-{p['expected_last4']}", f"Expected XXXX-XXXX-{p['expected_last4']}, got {body['masked_identifier']}"
        assert p["name"].lower() in body["detected_name"].lower(), f"Expected name {p['name']}, got {body['detected_name']}"
        assert body["detected_dob"] == p["dob"], f"Expected DOB {p['dob']}, got {body['detected_dob']}"
        assert body["detected_gender"] == p["gender"], f"Expected gender {p['gender']}, got {body['detected_gender']}"
        print(f"PASS: Dynamic OCR for {p['name']} -> {body['masked_identifier']}, {body['detected_name']}, {body['detected_dob']}")

def test_nasir_gotam_uploaded_card():
    user_card_path = "/Users/khaleekahmad/.gemini/antigravity/brain/70ec071a-1d20-409a-9db6-4439316a538c/.user_uploaded/media_1793004709146_9b09c918.png"
    if os.path.exists(user_card_path):
        with open(user_card_path, "rb") as f:
            card_bytes = f.read()

        files = {"file": ("nasir_aadhaar.png", card_bytes, "image/png")}
        res = client.post("/api/v1/documents/verify", files=files, data={"document_type": "aadhaar"})
        assert res.status_code == 200
        body = res.json()
        assert body["is_valid"] is True
        assert body["masked_identifier"] == "XXXX-XXXX-2134"
        assert "Nasir Gotam" in body["detected_name"]
        assert body["detected_dob"] == "27/07/1979"
        assert body["detected_gender"] == "MALE"
        print(f"PASS: Nasir Gotam card -> {body['masked_identifier']}, {body['detected_name']}, {body['detected_dob']}")

def test_blank_image_rejected():
    img = Image.new("RGB", (300, 300), color="blue")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    files = {"file": ("blank.png", buf.getvalue(), "image/png")}
    res = client.post("/api/v1/documents/verify", files=files, data={"document_type": "aadhaar"})
    assert res.status_code == 200
    body = res.json()
    assert body["is_valid"] is False
    assert body["masked_identifier"] is None
    print("PASS: Blank image successfully marked as unreadable/invalid")

if __name__ == "__main__":
    test_dynamic_ocr_multi_person()
    test_nasir_gotam_uploaded_card()
    test_blank_image_rejected()
    print("ALL DYNAMIC OCR TESTS PASSED SUCCESSFULLY!")
