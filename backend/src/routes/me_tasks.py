"""
/me routes for Backend Task Service.

API endpoints for task CRUD operations using JWT-authenticated user.
These routes use '/api/me/tasks' instead of '/api/{user_id}/tasks'.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, status
from sqlmodel import Session

from src.database import get_session
from src.dependencies.auth import AuthenticatedUserDep
from src.models.task import TaskCreate, TaskRead, TaskUpdate
from src.services.task import (
    create_task,
    delete_task,
    get_task_by_id_and_user,
    get_tasks_by_user,
    toggle_complete,
    update_task,
)

router = APIRouter(prefix="/api/me", tags=["me"])


@router.get("/tasks", response_model=List[TaskRead])
def list_my_tasks(
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> List[TaskRead]:
    """
    Retrieve all tasks for the authenticated user.

    Args:
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        List of tasks belonging to the authenticated user
    """
    return get_tasks_by_user(session, current_user.user_id)


@router.post("/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_my_task(
    task_create: TaskCreate,
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> TaskRead:
    """
    Create a new task for the authenticated user.

    Args:
        task_create: Task data from request body
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        Created task with generated ID and timestamps
    """
    return create_task(session, current_user.user_id, task_create)


@router.get("/tasks/{task_id}", response_model=TaskRead)
def get_my_task(
    task_id: UUID,
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> TaskRead:
    """
    Retrieve a single task by ID if it belongs to the authenticated user.

    Args:
        task_id: ID of the task to retrieve
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        The requested task

    Raises:
        HTTPException: 404 if task not found or belongs to different user
    """
    task = get_task_by_id_and_user(session, task_id, current_user.user_id)
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return task


@router.put("/tasks/{task_id}", response_model=TaskRead)
def update_my_task(
    task_id: UUID,
    task_update: TaskUpdate,
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> TaskRead:
    """
    Update an existing task's title and/or description.

    Args:
        task_id: ID of the task to update
        task_update: Updated task data (all fields optional)
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        Updated task

    Raises:
        HTTPException: 404 if task not found or belongs to different user
    """
    updated_task = update_task(session, task_id, current_user.user_id, task_update)
    if not updated_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return updated_task


@router.delete("/tasks/{task_id}")
def delete_my_task(
    task_id: UUID,
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> dict[str, str]:
    """
    Delete a task by ID.

    Args:
        task_id: ID of the task to delete
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        Success message

    Raises:
        HTTPException: 404 if task not found or belongs to different user
    """
    deleted = delete_task(session, task_id, current_user.user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return {"message": "Task deleted successfully"}


@router.patch("/tasks/{task_id}/complete", response_model=TaskRead)
def toggle_my_task_completion(
    task_id: UUID,
    current_user: AuthenticatedUserDep,
    session: Session = Depends(get_session),
) -> TaskRead:
    """
    Toggle a task's completion status between true and false.

    Args:
        task_id: ID of the task to toggle
        current_user: Authenticated user from JWT token
        session: Database session

    Returns:
        Task with toggled completion status

    Raises:
        HTTPException: 404 if task not found or belongs to different user
    """
    toggled_task = toggle_complete(session, task_id, current_user.user_id)
    if not toggled_task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )
    return toggled_task
