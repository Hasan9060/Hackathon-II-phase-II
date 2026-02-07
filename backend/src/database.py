"""
Database configuration and session management for Backend Task Service.

Provides engine creation, session management, and database initialization.
"""
from typing import Generator

from fastapi import Depends
from sqlmodel import SQLModel, Session, create_engine
from src.config import settings

# Create database engine
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for SQL query logging during development
    pool_pre_ping=True,  # Verify connections before using
)


def init_db() -> None:
    """
    Initialize database by creating all tables.

    This function should be called on application startup.
    It creates all tables defined in SQLModel metadata.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a database session.

    Yields:
        Session: A SQLModel database session

    Example:
        @app.get("/tasks")
        def read_tasks(session: Session = Depends(get_session)):
            return session.exec(select(Task)).all()
    """
    with Session(engine) as session:
        yield session
