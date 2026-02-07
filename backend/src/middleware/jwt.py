"""
JWT Authentication Middleware for FastAPI - Simplified Working Version
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from src.config import settings
from src.dependencies import AuthenticatedUser


async def jwt_auth_middleware(request: Request, call_next) -> Response:
    """
    JWT authentication middleware - skips auth endpoints, validates JWT for others
    """
    # Skip JWT for public endpoints
    path = request.url.path

    # Normalize path: remove leading double slashes
    normalized_path = path[1:] if path.startswith("//") else path

    # Public paths that don't need authentication
    public_paths = ["/", "/health", "/docs", "/openapi.json", "/redoc"]

    # Skip if path starts with /api/auth/ (handle both /api/auth/ and //api/auth/)
    if normalized_path.startswith("/api/auth/") or normalized_path in public_paths:
        return await call_next(request)

    # Get Authorization header
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing Authorization header"}
        )

    # Check if it's a Bearer token
    if not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid authorization format. Use: Bearer <token>"}
        )

    token = auth_header[7:]  # Remove "Bearer " prefix

    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            settings.BETTER_AUTH_SECRET,
            algorithms=["HS256"]
        )

        # Get user_id from payload
        user_id = payload.get("user_id")

        if not user_id:
            return JSONResponse(
                status_code=401,
                content={"detail": "Invalid token: missing user_id"}
            )

        # Attach user to request state
        request.state.user = AuthenticatedUser(
            user_id=str(user_id),
            email=payload.get("email", "")
        )

    except JWTError as e:
        return JSONResponse(
            status_code=401,
            content={"detail": f"Invalid token: {str(e)}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=401,
            content={"detail": f"Authentication error: {str(e)}"}
        )

    return await call_next(request)
