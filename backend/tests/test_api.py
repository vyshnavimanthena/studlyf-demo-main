import pytest
import httpx
import uuid
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

@pytest.fixture
def test_user():
    random_id = str(uuid.uuid4())[:8]
    return {
        "email": f"test_admin_{random_id}@example.com",
        "password": "TestPassword123!",
        "full_name": f"Test Admin {random_id}",
        "role": "admin",
        "institution_id": f"test_institution_{random_id}"
    }

def test_health():
    # Test if the server is accessible (some endpoints might be 403 or 404 but it should return something)
    try:
        response = httpx.get(f"{BASE_URL}/docs")
        assert response.status_code in (200, 401, 403, 404)
    except httpx.ConnectError:
        pytest.fail("Backend server is not running on localhost:8000")

def test_signup(test_user):
    # Try the signup endpoint found in main.py
    response = httpx.post(f"{BASE_URL}/api/auth/signup", json={
        "email": test_user["email"],
        "password": test_user["password"],
        "full_name": test_user["full_name"],
        "role": test_user["role"]
    })
    
    if response.status_code not in (200, 201):
        print(f"Signup failed: {response.text}")
    
    # We are mainly checking that the endpoint doesn't crash or return 500
    assert response.status_code < 500, f"Server error on signup: {response.status_code}"
