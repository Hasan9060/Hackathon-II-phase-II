"""
Authentication routes for Backend Task Service.

API endpoints for user signup and signin with JWT token generation.
Uses simple in-memory user storage for demo purposes.
In production, this should use a proper database with password hashing.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr
from sqlmodel import Session, select

from src.database import get_session
from src.models.task import User
from src.config import settings

router = APIRouter(prefix="/api/auth", tags=["auth"])


# Request/Response Models
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class SignInRequest(BaseModel):
    username: EmailStr  # FastAPI OAuth2PasswordRequestForm uses 'username'
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: dict


def create_jwt_token(user_id: str, email: str, name: Optional[str] = None) -> str:
    """
    Create a proper JWT token using python-jose.
    """
    from datetime import timedelta
    from jose import jwt

    # Set expiration to 7 days from now
    expire = datetime.utcnow() + timedelta(days=7)

    payload = {
        "user_id": user_id,  # middleware expects "user_id"
        "email": email,
        "name": name,
        "exp": expire,
        "iat": datetime.utcnow(),
    }

    # Create proper JWT token
    token = jwt.encode(
        payload,
        settings.BETTER_AUTH_SECRET,
        algorithm="HS256"
    )

    return token


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against a hash.
    In production, use bcrypt or argon2.
    """
    # For demo: simple comparison (NOT SECURE for production)
    return plain_password == hashed_password


def get_password_hash(password: str) -> str:
    """
    Hash a password.
    In production, use bcrypt or argon2.
    """
    # For demo: return as-is (NOT SECURE for production)
    return password


@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    data: SignUpRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    """
    Sign up a new user.

    Args:
        data: User signup data (email, password, optional name)
        session: Database session

    Returns:
        JWT token and user info

    Raises:
        HTTPException: 400 if user already exists
    """
    # Check if user already exists
    existing_user = session.exec(
        select(User).where(User.email == data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    # Create new user
    new_user = User(
        email=data.email,
        hashed_password=get_password_hash(data.password),
        name=data.name,
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    # Generate JWT token
    token = create_jwt_token(
        user_id=str(new_user.id),
        email=new_user.email,
        name=new_user.name,
    )

    return AuthResponse(
        access_token=token,
        user={
            "id": str(new_user.id),
            "email": new_user.email,
            "name": new_user.name,
        }
    )


@router.post("/signin", response_model=AuthResponse)
async def signin(
    data: SignInRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    """
    Sign in an existing user.

    Args:
        data: User signin data (username=email, password)
        session: Database session

    Returns:
        JWT token and user info

    Raises:
        HTTPException: 401 if credentials are invalid
    """
    # Find user by email
    user = session.exec(
        select(User).where(User.email == data.username)
    ).first()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    # Generate JWT token
    token = create_jwt_token(
        user_id=str(user.id),
        email=user.email,
        name=user.name,
    )

    return AuthResponse(
        access_token=token,
        user={
            "id": str(user.id),
            "email": user.email,
            "name": user.name,
        }
    )
