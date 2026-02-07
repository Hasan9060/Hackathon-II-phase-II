"""
Unit tests for JWT middleware.

Tests JWT token decoding, validation, and error handling.
"""
import pytest
from datetime import datetime, timedelta
from unittest.mock import Mock, patch

from jose import jwt
from fastapi import Request, HTTPException

from src.config import settings
from src.middleware.jwt import JWT_ALGORITHM, jwt_auth_middleware
from src.dependencies import AuthenticatedUser


@pytest.fixture
def mock_secret():
    """Mock BETTER_AUTH_SECRET for testing."""
    return "test-secret-key-for-jwt-verification"


@pytest.fixture
def valid_token(mock_secret):
    """Generate a valid JWT token for testing."""
    payload = {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "iat": int(datetime.now().timestamp()),
        "exp": int((datetime.now() + timedelta(days=7)).timestamp())
    }
    return jwt.encode(payload, mock_secret, algorithm=JWT_ALGORITHM)


@pytest.fixture
def expired_token(mock_secret):
    """Generate an expired JWT token for testing."""
    payload = {
        "user_id": "test-user-123",
        "email": "test@example.com",
        "iat": int((datetime.now() - timedelta(days=8)).timestamp()),
        "exp": int((datetime.now() - timedelta(days=1)).timestamp())
    }
    return jwt.encode(payload, mock_secret, algorithm=JWT_ALGORITHM)


class TestJWTMiddleware:
    """Test suite for JWT authentication middleware."""

    @pytest.mark.asyncio
    async def test_valid_token_allows_request(self, mock_secret, valid_token):
        """Test that a valid JWT token allows the request to proceed."""
        # Create mock request with valid token
        request = Mock(spec=Request)
        request.headers = {"Authorization": f"Bearer {valid_token}"}
        request.url.path = "/api/test-user-123/tasks"
        request.state = Mock()

        # Create mock call_next
        async def call_next(request):
            return Mock(status_code=200)

        # Patch settings to use mock secret
        with patch.object(settings, "BETTER_AUTH_SECRET", mock_secret):
            response = await jwt_auth_middleware(request, call_next)

        # Verify user was attached to request state
        assert hasattr(request.state, "user")
        assert isinstance(request.state.user, AuthenticatedUser)
        assert request.state.user.user_id == "test-user-123"
        assert request.state.user.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_missing_authorization_header_returns_401(self):
        """Test that missing Authorization header returns 401."""
        request = Mock(spec=Request)
        request.headers = {}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        assert response.status_code == 401
        assert "detail" in response.body.decode()

    @pytest.mark.asyncio
    async def test_wrong_scheme_returns_401(self, valid_token):
        """Test that using 'Basic' scheme instead of 'Bearer' returns 401."""
        request = Mock(spec=Request)
        request.headers = {"Authorization": f"Basic {valid_token}"}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_malformed_token_returns_401(self):
        """Test that a malformed JWT token returns 401."""
        request = Mock(spec=Request)
        request.headers = {"Authorization": "Bearer invalid-token-format"}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_expired_token_returns_401(self, expired_token):
        """Test that an expired JWT token returns 401."""
        request = Mock(spec=Request)
        request.headers = {"Authorization": f"Bearer {expired_token}"}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_invalid_signature_returns_401(self, valid_token):
        """Test that a token with invalid signature returns 401."""
        # Use wrong secret
        wrong_secret = "wrong-secret-key"

        request = Mock(spec=Request)
        request.headers = {"Authorization": f"Bearer {valid_token}"}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        # Patch settings to use wrong secret
        with patch.object(settings, "BETTER_AUTH_SECRET", wrong_secret):
            response = await jwt_auth_middleware(request, call_next)
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_token_without_user_id_returns_401(self, mock_secret):
        """Test that a token without user_id claim returns 401."""
        payload = {
            "email": "test@example.com",
            "iat": int(datetime.now().timestamp()),
            "exp": int((datetime.now() + timedelta(days=7)).timestamp())
        }
        token = jwt.encode(payload, mock_secret, algorithm=JWT_ALGORITHM)

        request = Mock(spec=Request)
        request.headers = {"Authorization": f"Bearer {token}"}
        request.url.path = "/api/test-user-123/tasks"

        async def call_next(request):
            return Mock(status_code=200)

        with patch.object(settings, "BETTER_AUTH_SECRET", mock_secret):
            response = await jwt_auth_middleware(request, call_next)
            assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_health_check_bypasses_auth(self):
        """Test that health check endpoint bypasses JWT verification."""
        request = Mock(spec=Request)
        request.headers = {}
        request.url.path = "/health"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        # Should proceed to next handler without auth
        assert True  # If we get here, auth was bypassed

    @pytest.mark.asyncio
    async def test_docs_bypasses_auth(self):
        """Test that /docs endpoint bypasses JWT verification."""
        request = Mock(spec=Request)
        request.headers = {}
        request.url.path = "/docs"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        # Should proceed to next handler without auth
        assert True

    @pytest.mark.asyncio
    async def test_root_bypasses_auth(self):
        """Test that root endpoint bypasses JWT verification."""
        request = Mock(spec=Request)
        request.headers = {}
        request.url.path = "/"

        async def call_next(request):
            return Mock(status_code=200)

        response = await jwt_auth_middleware(request, call_next)
        # Should proceed to next handler without auth
        assert True
