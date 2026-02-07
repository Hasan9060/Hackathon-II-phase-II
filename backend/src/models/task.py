"""
Task model and schemas for Backend Task Service.

Defines the Task and User SQLModel entities and Pydantic schemas for API operations.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel
from pydantic import ConfigDict


class User(SQLModel, table=True):
    """
    User entity in the database.

    Attributes:
        id: Unique identifier for the user
        email: User's email address (unique)
        hashed_password: Hashed password
        name: Optional display name
        created_at: When the user was created
    """

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    hashed_password: str
    name: Optional[str] = Field(default=None, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    model_config = ConfigDict(from_attributes=True)


class TaskBase(SQLModel):
    """Base schema with common task fields."""

    title: str = Field(max_length=500, min_length=1)
    description: Optional[str] = Field(default=None, max_length=5000)


class Task(TaskBase, table=True):
    """
    Task entity in the database.

    Attributes:
        id: Unique identifier for the task
        user_id: ID of the user who owns this task
        title: Task title (required)
        description: Optional detailed description
        completed: Task completion status (aliased from is_completed)
        created_at: When the task was created
        updated_at: When the task was last modified
    """

    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Alias for frontend compatibility
    @property
    def completed(self) -> bool:
        return self.is_completed

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TaskCreate(TaskBase):
    """Schema for creating a new task (user_id comes from URL path)."""

    pass


class TaskRead(TaskBase):
    """Schema for reading a task (includes all database fields)."""

    id: UUID
    user_id: str
    completed: bool = Field(alias="is_completed")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional for partial updates)."""

    title: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
