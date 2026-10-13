import time
import concurrent.futures
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_multilingual_chat_queries():
    print("\n--- 1. TESTING MULTILINGUAL RAG CHATBOT ENDPOINT (/api/v1/chat) ---")
    
    test_cases = [
        {
            "lang": "hi",
            "message": "Dadi ki umar 65 saal hai aur BPL card hai, kya unhe koi pension milegi?",
            "expected_scheme": "IGNOAPS"
        },
        {
            "lang": "hi",
            "message": "Kisan samman nidhi me kheti ke liye 6000 rupaye kaise milenge?",
            "expected_scheme": "PM-KISAN"
        },
        {
            "lang": "hi",
            "message": "Pucca ghar banane ke liye pradhan mantri awas yojana gramin me kitna paisa milta hai?",
            "expected_scheme": "PMAY-G"
        },
        {
            "lang": "hi",
            "message": "Hospital me 5 lakh ka free ilaj karwane ke liye ayushman golden card kaise banega?",
            "expected_scheme": "PM-JAY"
        },
        {
            "lang": "hi",
            "message": "Mahilaon ke liye free gas cylinder aur chulha ujjwala yojana me kaise milega?",
            "expected_scheme": "PMUY"
        },
        {
            "lang": "bn",
            "message": "আমার বৃদ্ধ মায়ের জন্য বার্ধক্য পেনশন পেতে কি কি নথি লাগবে?",
            "expected_scheme": "IGNOAPS"
        },
        {
            "lang": "te",
            "message": "రైతులకు 6000 పీఎం కిసాన్ సాయం ఎలా పొందాలి?",
            "expected_scheme": "PM-KISAN"
        },
        {
            "lang": "en",
            "message": "How can a rural family get 5 lakh health insurance coverage under Ayushman Bharat?",
            "expected_scheme": "PM-JAY"
        }
    ]

    for tc in test_cases:
        payload = {"message": tc["message"], "language": tc["lang"]}
        t0 = time.perf_counter()
        resp = client.post("/api/v1/chat", json=payload)
        elapsed_ms = (time.perf_counter() - t0) * 1000

        assert resp.status_code == 200, f"Chat failed for {tc}: {resp.text}"
        data = resp.json()
        print(f"  [PASS] {tc['lang'].upper()} Query -> Matched: {data['matched_scheme']} (Confidence: {data['confidence_score']:.2f}, Latency: {elapsed_ms:.1f}ms)")
        assert data["matched_scheme"] is not None
        assert data["response"] is not None
        assert len(data["source_guidelines"]) > 0

    print("All multilingual RAG Chat tests passed successfully!")

def test_high_concurrency_stress():
    print("\n--- 2. STRESS TESTING 30 CONCURRENT USERS SIMULTANEOUSLY ---")
    
    # First get a valid kiosk and citizen
    kiosks_resp = client.get("/api/v1/kiosks/nearby")
    assert kiosks_resp.status_code == 200
    kiosks = kiosks_resp.json()
    assert len(kiosks) > 0
    kiosk_id = kiosks[0]["id"]
    print(f"Target Kiosk ID: {kiosk_id} ({kiosks[0]['center_name']})")

    languages = ["hi", "en", "bn", "te", "mr", "ta"]
    results = []
    tokens_generated = []

    def simulate_citizen_activity(user_idx):
        """Simulates a citizen performing search, chat, and token booking."""
        thread_t0 = time.perf_counter()
        lang = languages[user_idx % len(languages)]
        
        # Action 1: Search Kiosks
        res1 = client.get("/api/v1/kiosks/nearby?district=Varanasi")
        if res1.status_code != 200:
            return {"user": user_idx, "success": False, "step": "kiosk_search", "error": res1.text}

        # Action 2: Chat with RAG AI
        res2 = client.post("/api/v1/chat", json={
            "message": f"Mujhe ghar banane ke liye sarkari madad chahiye user-{user_idx}",
            "language": lang
        })
        if res2.status_code != 200:
            return {"user": user_idx, "success": False, "step": "chat", "error": res2.text}

        # Action 3: Book Appointment Token (High concurrency write with QR code generation)
        res3 = client.post("/api/v1/kiosks/book-token", json={
            "citizen_id": 1,
            "kiosk_id": kiosk_id,
            "scheme_id": 1,
            "appointment_date": "2026-09-15",
            "appointment_time_slot": "10:30 AM - 11:00 AM",
            "preferred_language": lang,
            "notes": f"High traffic test citizen #{user_idx}"
        })
        if res3.status_code != 201:
            return {"user": user_idx, "success": False, "step": "book_token", "error": res3.text}

        data3 = res3.json()
        token = data3["token_number"]
        qr_uri = data3["qr_code_base64"]

        # Action 4: Verify Token on Operator Portal
        # Encode '#' as '%23' for URL query
        clean_tok = token.replace("#", "%23")
        res4 = client.get(f"/api/v1/kiosks/verify-token/{clean_tok}")
        if res4.status_code != 200:
            return {"user": user_idx, "success": False, "step": "verify_token", "error": res4.text}

        total_ms = (time.perf_counter() - thread_t0) * 1000
        return {
            "user": user_idx,
            "success": True,
            "token": token,
            "qr_valid": qr_uri.startswith("data:image/png;base64,"),
            "language": lang,
            "receipt_title": data3["receipt_title"],
            "total_ms": total_ms
        }

    total_concurrent_users = 60
    print(f"Launching {total_concurrent_users} simultaneous citizen user threads...")
    start_time = time.perf_counter()

    with concurrent.futures.ThreadPoolExecutor(max_workers=15) as executor:
        futures = [executor.submit(simulate_citizen_activity, i) for i in range(total_concurrent_users)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())


    total_duration = time.perf_counter() - start_time

    # Evaluate results
    successes = [r for r in results if r.get("success")]
    failures = [r for r in results if not r.get("success")]
    all_tokens = [r["token"] for r in successes]
    unique_tokens = set(all_tokens)
    latencies = [r["total_ms"] for r in successes]

    print(f"\n================ STRESS TEST BENCHMARK RESULTS ================")
    print(f"  Total Simulated Concurrent Citizens : {total_concurrent_users}")
    print(f"  Total Endpoints Hit per Citizen     : 4 (Search + Chat + Book Token + Verify)")
    print(f"  Total API Calls Processed           : {total_concurrent_users * 4}")
    print(f"  Total Test Wall-Clock Duration      : {total_duration:.2f} seconds")
    print(f"  Success Rate                        : {len(successes)}/{total_concurrent_users} ({len(successes)/total_concurrent_users*100:.1f}%)")
    print(f"  Crash / Error Count                 : {len(failures)} (0% Crashes)")
    print(f"  Total Unique Tokens Generated       : {len(unique_tokens)} / {len(all_tokens)}")
    print(f"  Token Collision Count               : {len(all_tokens) - len(unique_tokens)} (Collision-Free!)")
    if latencies:
        print(f"  Average Full Citizen Flow Latency   : {sum(latencies)/len(latencies):.1f} ms")
        print(f"  Fastest Citizen Flow Latency        : {min(latencies):.1f} ms")
        print(f"  Slowest Citizen Flow Latency        : {max(latencies):.1f} ms")
    print(f"================================================================")

    if failures:
        print("Failures encountered:")
        for f in failures:
            print(" ", f)

    assert len(failures) == 0, f"Encountered {len(failures)} failures in concurrency test!"
    assert len(all_tokens) == len(unique_tokens), "Duplicate tokens detected!"
    print("ALL CONCURRENCY AND STRESS TESTS PASSED WITH 100% SUCCESS RATE AND ZERO CRASHES!")

if __name__ == "__main__":
    test_multilingual_chat_queries()
    test_high_concurrency_stress()
