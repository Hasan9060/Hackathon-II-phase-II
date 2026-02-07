"""
Integration tests for Backend Task Service API endpoints.

Basic smoke tests to verify endpoints respond correctly.
"""
from uuid import uuid4

from fastapi.testclient import TestClient


def test_read_root(client: TestClient) -> None:
    """Test root endpoint returns API information."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "name" in data
    assert data["name"] == "Backend Task Service"


def test_health_check(client: TestClient) -> None:
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_task(client: TestClient) -> None:
    """Test creating a new task via POST."""
    user_id = "test-user-123"
    task_data = {
        "title": "Test task",
        "description": "Test description",
    }

    response = client.post(f"/api/{user_id}/tasks", json=task_data)
    assert response.status_code == 201

    data = response.json()
    assert data["title"] == "Test task"
    assert data["description"] == "Test description"
    assert data["user_id"] == user_id
    assert data["is_completed"] is False
    assert "id" in data
    assert "created_at" in data
    assert "updated_at" in data


def test_list_tasks(client: TestClient) -> None:
    """Test listing all tasks for a user."""
    user_id = "test-user-list"

    # Create a task first
    task_data = {"title": "List test task"}
    client.post(f"/api/{user_id}/tasks", json=task_data)

    # List tasks
    response = client.get(f"/api/{user_id}/tasks")
    assert response.status_code == 200

    tasks = response.json()
    assert isinstance(tasks, list)
    assert len(tasks) >= 1
    assert tasks[0]["title"] == "List test task"


def test_get_single_task(client: TestClient) -> None:
    """Test retrieving a single task."""
    user_id = "test-user-single"

    # Create a task first
    task_data = {"title": "Single test task"}
    create_response = client.post(f"/api/{user_id}/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Get the task
    response = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert response.status_code == 200

    task = response.json()
    assert task["id"] == task_id
    assert task["title"] == "Single test task"


def test_update_task(client: TestClient) -> None:
    """Test updating a task."""
    user_id = "test-user-update"

    # Create a task first
    task_data = {"title": "Original title"}
    create_response = client.post(f"/api/{user_id}/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Update the task
    update_data = {"title": "Updated title"}
    response = client.put(f"/api/{user_id}/tasks/{task_id}", json=update_data)
    assert response.status_code == 200

    updated_task = response.json()
    assert updated_task["title"] == "Updated title"


def test_delete_task(client: TestClient) -> None:
    """Test deleting a task."""
    user_id = "test-user-delete"

    # Create a task first
    task_data = {"title": "Delete me"}
    create_response = client.post(f"/api/{user_id}/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(f"/api/{user_id}/tasks/{task_id}")
    assert response.status_code == 200
    assert response.json() == {"message": "Task deleted successfully"}

    # Verify it's gone
    get_response = client.get(f"/api/{user_id}/tasks/{task_id}")
    assert get_response.status_code == 404


def test_toggle_completion(client: TestClient) -> None:
    """Test toggling task completion status."""
    user_id = "test-user-toggle"

    # Create a task first
    task_data = {"title": "Toggle test"}
    create_response = client.post(f"/api/{user_id}/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Toggle to complete
    response = client.patch(f"/api/{user_id}/tasks/{task_id}/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] is True

    # Toggle back to incomplete
    response = client.patch(f"/api/{user_id}/tasks/{task_id}/complete")
    assert response.status_code == 200
    assert response.json()["is_completed"] is False


def test_cross_user_access_returns_404(client: TestClient) -> None:
    """Test that accessing another user's task returns 404."""
    user1_id = "user-1"
    user2_id = "user-2"

    # Create task for user1
    task_data = {"title": "Secret task"}
    create_response = client.post(f"/api/{user1_id}/tasks", json=task_data)
    task_id = create_response.json()["id"]

    # Try to access with user2's ID
    response = client.get(f"/api/{user2_id}/tasks/{task_id}")
    assert response.status_code == 404


def test_empty_title_validation(client: TestClient) -> None:
    """Test that creating a task with empty title returns validation error."""
    user_id = "test-validation"

    task_data = {"title": "", "description": "Should fail"}
    response = client.post(f"/api/{user_id}/tasks", json=task_data)

    # Should return 422 validation error
    assert response.status_code == 422
