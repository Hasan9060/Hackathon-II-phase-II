"""
Task service functions for Backend Task Service.

Business logic layer for task CRUD operations.
All queries enforce user isolation via user_id filtering.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import Session, select

from src.models.task import Task, TaskCreate, TaskRead, TaskUpdate


def get_tasks_by_user(session: Session, user_id: str) -> List[TaskRead]:
    """
    Retrieve all tasks belonging to a specific user.

    Args:
        session: Database session
        user_id: ID of the user whose tasks to retrieve

    Returns:
        List of TaskRead objects for the user
    """
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return [TaskRead.model_validate(task) for task in tasks]


def get_task_by_id_and_user(session: Session, task_id: UUID, user_id: str) -> Optional[TaskRead]:
    """
    Retrieve a single task by ID if it belongs to the specified user.

    CRITICAL: Filters by BOTH task_id AND user_id for security.
    Returns None if task doesn't exist OR belongs to different user.

    Args:
        session: Database session
        task_id: ID of the task to retrieve
        user_id: ID of the user requesting the task

    Returns:
        TaskRead object if found and owned by user, None otherwise
    """
    statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    task = session.exec(statement).first()
    return TaskRead.model_validate(task) if task else None


def create_task(session: Session, user_id: str, task_create: TaskCreate) -> TaskRead:
    """
    Create a new task for a specific user.

    Args:
        session: Database session
        user_id: ID of the user who will own the task
        task_create: Task data from API request

    Returns:
        TaskRead object with generated ID and timestamps
    """
    task = Task(
        user_id=user_id,
        title=task_create.title,
        description=task_create.description,
        is_completed=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskRead.model_validate(task)


def update_task(
    session: Session, task_id: UUID, user_id: str, task_update: TaskUpdate
) -> Optional[TaskRead]:
    """
    Update an existing task's title and/or description.

    CRITICAL: Filters by BOTH task_id AND user_id for security.
    Auto-updates the updated_at timestamp.

    Args:
        session: Database session
        task_id: ID of the task to update
        user_id: ID of the user who owns the task
        task_update: Updated task data (all fields optional)

    Returns:
        Updated TaskRead object if found and owned by user, None otherwise
    """
    statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        return None

    # Update only provided fields (partial update support)
    if task_update.title is not None:
        task.title = task_update.title
    if task_update.description is not None:
        task.description = task_update.description

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskRead.model_validate(task)


def delete_task(session: Session, task_id: UUID, user_id: str) -> bool:
    """
    Delete a task by ID if it belongs to the specified user.

    CRITICAL: Filters by BOTH task_id AND user_id before deletion.

    Args:
        session: Database session
        task_id: ID of the task to delete
        user_id: ID of the user who owns the task

    Returns:
        True if task was deleted, False if not found or owned by different user
    """
    statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        return False

    session.delete(task)
    session.commit()
    return True


def toggle_complete(session: Session, task_id: UUID, user_id: str) -> Optional[TaskRead]:
    """
    Toggle a task's completion status between true and false.

    CRITICAL: Filters by BOTH task_id AND user_id for security.
    Auto-updates the updated_at timestamp.

    Args:
        session: Database session
        task_id: ID of the task to toggle
        user_id: ID of the user who owns the task

    Returns:
        Updated TaskRead object with flipped completion status, None if not found
    """
    statement = select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    task = session.exec(statement).first()

    if not task:
        return None

    # Toggle completion status
    task.is_completed = not task.is_completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)
    return TaskRead.model_validate(task)
