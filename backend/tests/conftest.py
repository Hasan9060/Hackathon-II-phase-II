"""
Pytest configuration and fixtures for Backend Task Service tests.
"""
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlmodel import Session, create_engine
from sqlmodel.pool import StaticPool

from src.main import app
from src.database import get_session


# Test database engine (in-memory SQLite for tests)
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture(name="session")
def session_fixture() -> Generator[Session, None, None]:
    """
    Fixture that provides a test database session.

    Creates all tables before each test and drops them after.
    """
    from src.models.task import Task  # noqa: F401 - Import to trigger table creation

    Task.metadata.create_all(test_engine)

    with Session(test_engine) as session:
        yield session

    # Cleanup: drop all tables after test
    Task.metadata.drop_all(test_engine)


@pytest.fixture(name="client")
def client_fixture(session: Session) -> TestClient:
    """
    Fixture that provides a test client with overridden database session.

    Uses the test session fixture to point to in-memory SQLite database.
    """

    def override_get_session():
        return session

    app.dependency_overrides[get_session] = override_get_session
    client = TestClient(app)

    yield client

    app.dependency_overrides.clear()
