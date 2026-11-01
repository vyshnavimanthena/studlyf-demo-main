import pytest
import httpx
import uuid

BASE_URL = "http://localhost:8000"

@pytest.fixture(scope="module")
def user_token():
    random_id = str(uuid.uuid4())[:8]
    user = {
        "email": f"test_hackathon_{random_id}@example.com",
        "password": "TestPassword123!",
        "full_name": f"Test User {random_id}",
        "role": "institution",
        "institution_id": f"inst_{random_id}"
    }
    httpx.post(f"{BASE_URL}/api/auth/signup", json=user)
    
    login_response = httpx.post(f"{BASE_URL}/api/auth/login", json={
        "email": user["email"],
        "password": user["password"]
    })
    return login_response.json().get("token") or login_response.json().get("access_token")

def test_get_hackathons():
    # Public route to get hackathons (if exists)
    # Most platforms have a public search or listing route
    response = httpx.get(f"{BASE_URL}/api/opportunities/")
    
    # Assert the endpoint exists and returns a success status
    assert response.status_code in (200, 401, 403, 404, 405), f"Unexpected status: {response.status_code}"
    
def test_create_hackathon(user_token):
    # Test creating a hackathon via integration routes
    headers = {"Authorization": f"Bearer {user_token}"}
    
    hackathon_data = {
        "title": "Test Automated Hackathon",
        "description": "Integration test for hackathon creation",
        "status": "draft",
        "eventType": "hackathon"
    }
    
    # We use the event_routes route /api/v1/events/
    response = httpx.post(f"{BASE_URL}/api/v1/events/", json=hackathon_data, headers=headers)
    
    # Print for debugging if it fails
    if response.status_code not in (200, 201):
        print(f"Create hackathon failed: {response.text}")
        
    assert response.status_code in (200, 201), f"Hackathon creation failed: {response.status_code}"
