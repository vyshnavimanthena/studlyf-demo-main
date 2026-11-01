import pytest
import httpx
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="module")
def admin_user():
    # Setup a unique admin user for the module
    random_id = str(uuid.uuid4())[:8]
    user = {
        "email": f"test_admin_opp_{random_id}@example.com",
        "password": "TestPassword123!",
        "full_name": f"Test Admin Opp {random_id}",
        "role": "admin",
        "institution_id": f"test_institution_{random_id}"
    }
    
    # 1. Register
    reg_response = httpx.post(f"{BASE_URL}/api/auth/signup", json=user)
    assert reg_response.status_code in (200, 201), f"Signup failed: {reg_response.text}"
    
    # 2. Login
    login_response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": user["email"],
        "password": user["password"]
    })
    
    assert login_response.status_code == 200, f"Login failed: {login_response.text}"
    token = login_response.json().get("token") or login_response.json().get("access_token")
    user["token"] = token
    return user

def test_create_opportunity_bypasses_limits(admin_user):
    # This tests the specific fix we implemented for the 7-day registration window.
    # We will create an opportunity with a registration window of 30 days.
    # Since the user is an admin, it should bypass the 7-day limit of the basic plan.
    
    now = datetime.utcnow()
    start_date = now + timedelta(days=1)
    deadline = now + timedelta(days=31) # 30 day window
    
    headers = {"Authorization": f"Bearer {admin_user['token']}"}
    
    opp_data = {
        "title": "Admin Bypass Test Opportunity",
        "type": "Hackathon",
        "description": "This is a test opportunity to verify admin limits bypass.",
        "startDate": start_date.isoformat() + "Z",
        "deadline": deadline.isoformat() + "Z",
        "status": "live",
        "category": "Testing"
    }
    
    response = httpx.post(f"{BASE_URL}/api/opportunities/", json=opp_data, headers=headers)
    
    # It should succeed without the "Your Basic Plan supports a maximum 7-day registration window" error.
    assert response.status_code in (200, 201), f"Failed to create opportunity: {response.text}"
    
    opp_id = response.json().get("data", {}).get("_id") or response.json().get("_id")
    
    if opp_id:
        print(f"Successfully created opportunity {opp_id} bypassing limits!")

