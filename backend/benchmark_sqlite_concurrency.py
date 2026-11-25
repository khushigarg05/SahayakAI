import time
import statistics
import concurrent.futures
from fastapi.testclient import TestClient
from app.main import app

def run_concurrency_load_test(total_requests: int = 300, max_workers: int = 15):
    client = TestClient(app)
    
    # Pre-fetch a valid kiosk
    kiosk_res = client.get("/api/v1/kiosks/nearby?district=Varanasi")
    assert kiosk_res.status_code == 200, "Cannot fetch kiosks"
    kiosks = kiosk_res.json()
    assert len(kiosks) > 0, "No kiosks found"
    kiosk_id = kiosks[0]["id"]
    
    # 50% reads (schemes/match & kiosks/nearby) and 50% writes (book-token)
    results = []
    
    def execute_request(req_id: int):
        t0 = time.perf_counter()
        op_type = "read"
        try:
            if req_id % 2 == 0:
                # Concurrent Write: Book Appointment Token (touches SQLite write lock in WAL mode)
                op_type = "write"
                resp = client.post("/api/v1/kiosks/book-token", json={
                    "citizen_id": 1,
                    "kiosk_id": kiosk_id,
                    "scheme_id": 1,
                    "appointment_date": "2026-12-01",
                    "appointment_time_slot": "11:00 AM - 11:30 AM",
                    "preferred_language": "hi",
                    "notes": f"Load test appointment #{req_id}"
                })
                success = resp.status_code in (200, 201)
                err_text = "" if success else resp.text
            elif req_id % 4 == 1:
                # Concurrent Read: Scheme matching calculation
                op_type = "read_match"
                resp = client.post("/api/v1/schemes/match", json={
                    "age": 45,
                    "annual_income": 80000,
                    "category": "obc",
                    "bpl_status": True,
                    "land_acres": 1.5,
                    "gender": "male"
                })
                success = resp.status_code == 200
                err_text = "" if success else resp.text
            else:
                # Concurrent Read: Kiosk geo search
                op_type = "read_kiosks"
                resp = client.get("/api/v1/kiosks/nearby?district=Varanasi")
                success = resp.status_code == 200
                err_text = "" if success else resp.text
                
            elapsed_ms = (time.perf_counter() - t0) * 1000
            return {
                "id": req_id,
                "op": op_type,
                "success": success,
                "latency_ms": elapsed_ms,
                "error": err_text
            }
        except Exception as e:
            elapsed_ms = (time.perf_counter() - t0) * 1000
            return {
                "id": req_id,
                "op": op_type,
                "success": False,
                "latency_ms": elapsed_ms,
                "error": str(e)
            }

    print(f"Executing Genuine Concurrency Benchmark: {total_requests} requests with {max_workers} concurrent workers...")
    bench_start = time.perf_counter()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = [executor.submit(execute_request, i) for i in range(total_requests)]
        for f in concurrent.futures.as_completed(futures):
            results.append(f.result())
            
    total_duration = time.perf_counter() - bench_start
    
    successes = [r for r in results if r["success"]]
    failures = [r for r in results if not r["success"]]
    latencies = sorted([r["latency_ms"] for r in results])
    write_results = [r for r in results if r["op"] == "write"]
    write_successes = [r for r in write_results if r["success"]]
    write_failures = [r for r in write_results if not r["success"]]
    
    p50 = statistics.median(latencies)
    p90 = latencies[int(len(latencies) * 0.90)]
    p95 = latencies[int(len(latencies) * 0.95)]
    p99 = latencies[int(len(latencies) * 0.99)]
    throughput = total_requests / total_duration
    
    print("\n" + "="*60)
    print("GENUINE CONCURRENT LOAD TEST REPORT (SQLite WAL)")
    print("="*60)
    print(f"Total Requests Processed : {total_requests}")
    print(f"Concurrent Workers       : {max_workers}")
    print(f"Total Test Duration      : {total_duration:.2f} seconds")
    print(f"Throughput (RPS)         : {throughput:.2f} req/sec")
    print(f"Success Count            : {len(successes)} / {total_requests} ({len(successes)/total_requests*100:.1f}%)")
    print(f"Error / Failure Count    : {len(failures)} ({len(failures)/total_requests*100:.2f}%)")
    print(f"Write Operations Count   : {len(write_results)} (Success: {len(write_successes)}, Failures: {len(write_failures)})")
    print(f"Write Contention Errors  : {len([r for r in write_results if 'locked' in r.get('error', '').lower()])}")
    print(f"Latency Min              : {min(latencies):.2f} ms")
    print(f"Latency Mean             : {statistics.mean(latencies):.2f} ms")
    print(f"Latency Median (p50)     : {p50:.2f} ms")
    print(f"Latency p90              : {p90:.2f} ms")
    print(f"Latency p95              : {p95:.2f} ms")
    print(f"Latency p99              : {p99:.2f} ms")
    print(f"Latency Max              : {max(latencies):.2f} ms")
    print("="*60)
    
    if failures:
        print("Sample Failure Details:")
        for f in failures[:5]:
            print(f"  Req {f['id']} ({f['op']}): {f['error']}")

if __name__ == "__main__":
    run_concurrency_load_test(total_requests=300, max_workers=15)
