"""
Full Application API Audit Script
Tests every critical endpoint and prints a detailed pass/fail report.
Run: python full_audit.py
"""
import httpx
import json
import asyncio
from datetime import datetime

BASE_URL = "http://localhost:8000"
RESULTS = []

ADMIN_EMAIL    = "admin@studlyf.com"
ADMIN_PASSWORD = "admin123"

def log(name, status, detail=""):
    icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    msg = f"{icon} [{status}] {name}"
    if detail:
        msg += f"\n       → {detail}"
    print(msg)
    RESULTS.append((status, name, detail))

async def try_get(client, url, name, expected_status=200, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = await client.get(url, headers=headers, follow_redirects=True)
        if r.status_code == expected_status:
            log(name, "PASS", f"HTTP {r.status_code}")
        else:
            try:
                detail = r.json().get("detail", r.text[:200])
            except Exception:
                detail = r.text[:200]
            log(name, "FAIL", f"HTTP {r.status_code} — {detail}")
        return r
    except Exception as e:
        log(name, "FAIL", f"Exception: {e}")
        return None

async def try_post(client, url, name, data, expected_status=200, token=None):
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    try:
        r = await client.post(url, json=data, headers=headers, follow_redirects=True)
        if r.status_code == expected_status:
            log(name, "PASS", f"HTTP {r.status_code}")
        else:
            try:
                detail = r.json().get("detail", r.text[:200])
            except Exception:
                detail = r.text[:200]
            log(name, "FAIL", f"HTTP {r.status_code} — {detail}")
        return r
    except Exception as e:
        log(name, "FAIL", f"Exception: {e}")
        return None

async def main():
    print("\n" + "="*65)
    print("  STUDLYF FULL APPLICATION API AUDIT")
    print(f"  {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*65 + "\n")

    async with httpx.AsyncClient(timeout=15.0) as client:

        print("\n[1] HEALTH & CONNECTIVITY")
        await try_get(client, f"{BASE_URL}/", "Backend Root Reachable", expected_status=200)

        print("\n[2] AUTHENTICATION")
        r = await try_post(client, f"{BASE_URL}/api/auth/login", 
            "Login with bad creds -> 401", 
            {"email": "bad@test.com", "password": "wrong"}, 
            expected_status=401)

        r = await try_post(client, f"{BASE_URL}/api/auth/login",
            "Login with missing email -> 400",
            {"email": "", "password": "something"},
            expected_status=400)

        admin_token = None
        r = await try_post(client, f"{BASE_URL}/api/auth/login",
            "Admin Login",
            {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            expected_status=200)
        if r and r.status_code == 200:
            try:
                admin_token = r.json().get("access_token")
                cookie_set = "token" in r.cookies
                log("Login sets HTTP-only cookie", "PASS" if cookie_set else "FAIL",
                    f"Cookie 'token' present: {cookie_set}")
            except Exception:
                pass

        if admin_token:
            await try_get(client, f"{BASE_URL}/api/auth/me", "GET /api/auth/me (valid token)", 200, admin_token)
        
        await try_get(client, f"{BASE_URL}/api/auth/me", "GET /api/auth/me (no token) -> 401 or 403", 401)

        print("\n[3] OPPORTUNITIES")
        r = await try_get(client, f"{BASE_URL}/api/opportunities/", "List Opportunities (public)")
        opp_id = None
        if r and r.status_code == 200:
            try:
                opps = r.json()
                if isinstance(opps, list) and len(opps) > 0:
                    opp_id = str(opps[0].get("_id") or opps[0].get("id", ""))
                    log("Opportunities list has data", "PASS", f"{len(opps)} found")
                else:
                    log("Opportunities list has data", "WARN", "List is empty (no opportunities posted yet)")
            except Exception:
                pass

        if opp_id:
            await try_get(client, f"{BASE_URL}/api/opportunities/{opp_id}", "Get single Opportunity by ID")

        r = await try_post(client, f"{BASE_URL}/api/opportunities/",
            "Post opportunity without auth -> 401",
            {"title": "Test Hack"},
            expected_status=401)

        print("\n[4] EVENTS & HACKATHONS")
        r = await try_get(client, f"{BASE_URL}/api/v1/events/", "List Events (public)")
        event_id = None
        if r and r.status_code == 200:
            try:
                events = r.json()
                data = events.get("events") or (events if isinstance(events, list) else [])
                if data and len(data) > 0:
                    event_id = str(data[0].get("_id") or data[0].get("event_id", ""))
                    log("Events list has data", "PASS", f"{len(data)} events found")
                else:
                    log("Events list has data", "WARN", "No events (none posted yet)")
            except Exception as e:
                log("Events list parse", "WARN", str(e))

        if event_id:
            await try_get(client, f"{BASE_URL}/api/v1/events/{event_id}", "Get Event by ID")

        print("\n[5] INSTITUTION DASHBOARD APIs")
        if admin_token:
            await try_get(client, f"{BASE_URL}/api/v1/institution/events/", 
                "List Institution Events (admin token)", 200, admin_token)

        await try_get(client, f"{BASE_URL}/api/v1/institution/events/",
            "List Institution Events (no auth) -> 401", 401)

        print("\n[6] SUBSCRIPTION PLAN LIMITS (code check)")
        try:
            import sys
            sys.path.insert(0, ".")
            from services.subscription_service import PLAN_RULES
            basic = PLAN_RULES.get("basic", {})
            reg_days = basic.get("max_registration_days")
            log("Basic plan 7-day limit removed (None = no limit)", 
                "PASS" if reg_days is None else "FAIL",
                f"max_registration_days = {reg_days}")
        except Exception as e:
            log("Plan Rules import", "WARN", str(e))

        print("\n[7] CORS HEADERS")
        try:
            r = await client.options(f"{BASE_URL}/api/auth/login",
                headers={"Origin": "http://localhost:3000",
                         "Access-Control-Request-Method": "POST"})
            cors_ok = "access-control-allow-origin" in r.headers
            log("CORS headers on OPTIONS request", "PASS" if cors_ok else "WARN",
                f"ACAO: {r.headers.get('access-control-allow-origin', 'MISSING')}")
        except Exception as e:
            log("CORS check", "WARN", str(e))

        print("\n[8] FRONTEND")
        try:
            r = await client.get("http://localhost:3000/", follow_redirects=True)
            log("Frontend (localhost:3000) reachable", 
                "PASS" if r.status_code == 200 else "FAIL",
                f"HTTP {r.status_code}")
        except Exception as e:
            log("Frontend reachable", "FAIL", str(e))

        print("\n[9] CERTIFICATE VERIFICATION")
        await try_get(client, f"{BASE_URL}/verify/FAKE-CERT-999", 
            "Certificate verify (invalid ID) -> 404", 404)

    print("\n" + "="*65)
    print("  AUDIT SUMMARY")
    print("="*65)
    passed = sum(1 for r in RESULTS if r[0] == "PASS")
    failed = sum(1 for r in RESULTS if r[0] == "FAIL")
    warned = sum(1 for r in RESULTS if r[0] == "WARN")
    total  = len(RESULTS)
    print(f"\n  Total Tests : {total}")
    print(f"  PASSED      : {passed}")
    print(f"  FAILED      : {failed}")
    print(f"  WARNINGS    : {warned}")
    if failed > 0:
        print("\n  FAILED TESTS (action required):")
        for status, name, detail in RESULTS:
            if status == "FAIL":
                print(f"    * {name}")
                if detail:
                    print(f"      -> {detail}")
    print("\n" + "="*65 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
