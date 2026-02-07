"""
FastAPI dependencies package.

This package contains reusable FastAPI dependencies for authentication,
authorization, database sessions, and other common request handling.
"""

from dataclasses import dataclass

__all__ = ["AuthenticatedUser"]


@dataclass
class AuthenticatedUser:
    """Authenticated user extracted from verified JWT token.

    This dataclass represents a user whose identity has been verified
    through JWT authentication. It is attached to request.state by the
    JWT middleware and extracted by the get_current_user dependency.

    Attributes:
        user_id: The user's unique identifier from the JWT payload.
            This is used for all database queries to ensure user isolation.
        email: The user's email address from the JWT payload.
            Used for debugging and logging purposes.
    """

    user_id: str
    email: str
