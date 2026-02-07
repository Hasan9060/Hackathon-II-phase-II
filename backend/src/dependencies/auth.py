"""
FastAPI Authentication Dependencies.

This module provides FastAPI dependencies for authentication and authorization.
These dependencies work with the JWT middleware to extract authenticated users
from request.state and verify authorization (user_id matching).
"""

from typing import Annotated

from fastapi import Depends, HTTPException, Request, status

from src.dependencies import AuthenticatedUser


async def get_current_user(
    request: Request,
    user_id: str
) -> AuthenticatedUser:
    """
    FastAPI dependency to get and verify the current authenticated user.

    This dependency extracts the authenticated user from request.state (set by
    the JWT middleware) and verifies that the user_id in the JWT matches the
    user_id in the URL path. This prevents URL manipulation attacks where a
    user might try to access another user's data.

    Args:
        request: The FastAPI request object containing request.state.user
        user_id: The user_id from the URL path parameter

    Returns:
        AuthenticatedUser: The verified authenticated user

    Raises:
        HTTPException: 403 if user_id in JWT doesn't match user_id in URL
        HTTPException: 401 if no authenticated user in request.state

    Security:
        - Verifies user_id in JWT payload matches user_id in URL path
        - Returns 403 (Forbidden) for mismatches, not 401 (Unauthorized)
        - This differentiates authorization failures from authentication failures

    Usage Example:
        @router.get("/api/{user_id}/tasks")
        def list_tasks(
            user_id: str,
            current_user: AuthenticatedUser = Depends(get_current_user)
        ):
            # current_user.user_id == user_id is guaranteed
            # Use current_user.user_id for database queries
            pass
    """
    # Extract authenticated user from request.state (set by JWT middleware)
    authenticated_user: AuthenticatedUser = getattr(request.state, "user", None)

    if not authenticated_user:
        # This shouldn't happen if middleware is working correctly
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    # Verify user_id in JWT matches user_id in URL path
    # This prevents URL manipulation attacks
    if authenticated_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: user identity mismatch"
        )

    return authenticated_user


async def get_authenticated_user(
    request: Request,
) -> AuthenticatedUser:
    """
    FastAPI dependency to get the current authenticated user from JWT.

    This dependency extracts the authenticated user from request.state (set by
    the JWT middleware) without verifying a user_id parameter. Use this for
    routes like /api/me/* where the user_id comes from the JWT, not the URL.

    Args:
        request: The FastAPI request object containing request.state.user

    Returns:
        AuthenticatedUser: The verified authenticated user

    Raises:
        HTTPException: 401 if no authenticated user in request.state

    Usage Example:
        @router.get("/api/me/tasks")
        def list_my_tasks(
            current_user: AuthenticatedUser = Depends(get_authenticated_user)
        ):
            # Use current_user.user_id for database queries
            pass
    """
    # Extract authenticated user from request.state (set by JWT middleware)
    authenticated_user: AuthenticatedUser = getattr(request.state, "user", None)

    if not authenticated_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

    return authenticated_user


# Type aliases for cleaner dependency injection syntax
CurrentUserDep = Annotated[AuthenticatedUser, Depends(get_current_user)]
AuthenticatedUserDep = Annotated[AuthenticatedUser, Depends(get_authenticated_user)]
