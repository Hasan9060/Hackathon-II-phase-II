"""
Integration tests for JWT authentication.

Tests full request flow with JWT tokens, including authentication
and authorization scenarios.
"""
import pytest
from datetime import datetime, timedelta
from httpx import Client

from jose import jwt
from src.config import settings


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return Client(base_url="http://localhost:8000")


@pytest.fixture
def test_secret():
    """Use the actual BETTER_AUTH_SECRET from settings."""
    return settings.BETTER_AUTH_SECRET


@pytest.fixture
def valid_jwt_token(test_secret):
    """Generate a valid JWT token for testing."""
    payload = {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(days=7)).timestamp())
    }
    return jwt.encode(payload, test_secret, algorithm="HS256")


@pytest.fixture
def expired_jwt_token(test_secret):
    """Generate an expired JWT token for testing."""
    payload = {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "iat": int((datetime.now() - timedelta(days=8)).timestamp()),
        "exp": int((datetime.now() - timedelta(days=1)).timestamp())
    }
    return jwt.encode(payload, test_secret, algorithm="HS256")


@pytest.fixture
def different_user_jwt_token(test_secret):
    """Generate a JWT token for a different user."""
    payload = {
        "user_id": "different-user-456",
        "email": "different@example.com",
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(days=7)).timestamp())
    }
    return jwt.encode(payload, test_secret, algorithm="HS256")


class TestJWTAuthenticationIntegration:
    """Integration tests for JWT authentication."""

    def test_health_check_no_auth_required(self, client):
        """Test that health check endpoint works without authentication."""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

    def test_root_no_auth_required(self, client):
        """Test that root endpoint works without authentication."""
        response = client.get("/")
        assert response.status_code == 200
        assert "name" in response.json()

    def test_missing_token_returns_401(self, client):
        """Test that requests without Authorization header return 401."""
        response = client.get("/api/test-user-123/tasks")
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]

    def test_invalid_token_returns_401(self, client):
        """Test that requests with invalid token return 401."""
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": "Bearer invalid-token"}
        )
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]

    def test_expired_token_returns_401(self, client, expired_jwt_token):
        """Test that requests with expired token return 401."""
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": f"Bearer {expired_jwt_token}"}
        )
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["detail"]

    def test_valid_token_allows_access(self, client, valid_jwt_token):
        """Test that requests with valid JWT token are allowed."""
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": f"Bearer {valid_jwt_token}"}
        )
        # Should be 200 (success) or 404 (no tasks found), not 401
        assert response.status_code in [200, 404]

    def test_user_id_mismatch_returns_403(self, client, different_user_jwt_token):
        """Test that user_id mismatch between JWT and URL returns 403."""
        # Token is for different-user-456, but URL path is test-user-123
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": f"Bearer {different_user_jwt_token}"}
        )
        assert response.status_code == 403
        assert "user identity mismatch" in response.json()["detail"]

    def test_matching_user_ids_succeed(self, client, valid_jwt_token):
        """Test that matching user_ids in JWT and URL succeed."""
        # Token is for test-user-123, and URL path is also test-user-123
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": f"Bearer {valid_jwt_token}"}
        )
        # Should be 200 (success) or 404 (no tasks found), not 401 or 403
        assert response.status_code in [200, 404]

    def test_create_task_with_valid_token(self, client, valid_jwt_token):
        """Test creating a task with valid JWT token."""
        task_data = {
            "title": "Test Task",
            "description": "Testing JWT authentication"
        }
        response = client.post(
            "/api/test-user-123/tasks",
            json=task_data,
            headers={"Authorization": f"Bearer {valid_jwt_token}"}
        )
        # Should succeed (201) or fail validation
        assert response.status_code in [201, 422]

    def test_create_task_without_token_returns_401(self, client):
        """Test that creating a task without token returns 401."""
        task_data = {
            "title": "Test Task",
            "description": "Testing JWT authentication"
        }
        response = client.post(
            "/api/test-user-123/tasks",
            json=task_data
        )
        assert response.status_code == 401

    def test_all_endpoints_protected(self, client):
        """Test that all task endpoints require JWT authentication."""
        endpoints = [
            ("GET", "/api/test-user-123/tasks"),
            ("POST", "/api/test-user-123/tasks"),
            ("GET", "/api/test-user-123/tasks/00000000-0000-0000-0000-000000000001"),
            ("PUT", "/api/test-user-123/tasks/00000000-0000-0000-0000-000000000001"),
            ("DELETE", "/api/test-user-123/tasks/00000000-0000-0000-0000-000000000001"),
            ("PATCH", "/api/test-user-123/tasks/00000000-0000-0000-0000-000000000001/complete"),
        ]

        for method, path in endpoints:
            if method == "GET":
                response = client.get(path)
            elif method == "POST":
                response = client.post(path, json={"title": "Test"})
            elif method == "PUT":
                response = client.put(path, json={"title": "Updated"})
            elif method == "DELETE":
                response = client.delete(path)
            elif method == "PATCH":
                response = client.patch(path)

            # All should return 401 without token
            assert response.status_code == 401, f"{method} {path} should require authentication"

    def test_wrong_scheme_returns_401(self, client, valid_jwt_token):
        """Test that using wrong authentication scheme returns 401."""
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": f"Basic {valid_jwt_token}"}
        )
        assert response.status_code == 401

    def test_malformed_token_returns_401(self, client):
        """Test that malformed JWT returns 401."""
        response = client.get(
            "/api/test-user-123/tasks",
            headers={"Authorization": "Bearer not-a-valid-jwt"}
        )
        assert response.status_code == 401
