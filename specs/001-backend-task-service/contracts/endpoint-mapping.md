# Endpoint to Requirement Mapping

**Feature**: 001-backend-task-service
**Date**: 2026-02-02

## Overview

This document maps each API endpoint to the functional requirements and user stories it fulfills.

## Endpoint Mapping

### GET /api/{user_id}/tasks

| Aspect | Value |
|--------|-------|
| **User Story** | US1 - Create and View Tasks (P1) |
| **Functional Requirements** | FR-005 (return list of user's tasks) |
| **Success Criteria** | SC-002 (retrieve within 2 seconds), SC-004 (user isolation), SC-006 (404 for unauthorized) |
| **Description** | Retrieves all tasks belonging to the specified user |
| **Response** | 200: Array of TaskRead objects |
| **Security** | Filters by user_id in WHERE clause |

### POST /api/{user_id}/tasks

| Aspect | Value |
|--------|-------|
| **User Story** | US1 - Create and View Tasks (P1) |
| **Functional Requirements** | FR-001 (create with title/description), FR-002 (assign ID), FR-003 (timestamps), FR-004 (completion default), FR-011 (validate title), FR-012 (persist data) |
| **Success Criteria** | SC-001 (create within 1 second), SC-003 (data persistence), SC-005 (OpenAPI docs) |
| **Description** | Creates a new task for the specified user |
| **Request** | TaskCreate (title required, description optional) |
| **Response** | 201: TaskRead object with generated ID |
| **Validation** | Title must be non-empty and <= 500 chars |

### GET /api/{user_id}/tasks/{task_id}

| Aspect | Value |
|--------|-------|
| **User Story** | US1 - Create and View Tasks (P1) |
| **Functional Requirements** | FR-006 (return single task if owned by user), FR-010 (reject if not owned - returns 404) |
| **Success Criteria** | SC-004 (user isolation), SC-006 (404 for unauthorized) |
| **Description** | Retrieves a single task by ID if it belongs to the user |
| **Response** | 200: TaskRead object |
| **Error Response** | 404: "Task not found" (also returned if task belongs to different user) |
| **Security** | Filters by both task_id AND user_id |

### PUT /api/{user_id}/tasks/{task_id}

| Aspect | Value |
|--------|-------|
| **User Story** | US2 - Edit and Delete Tasks (P2) |
| **Functional Requirements** | FR-007 (update title and description), FR-010 (reject if not owned), FR-012 (persist changes) |
| **Success Criteria** | SC-003 (data persistence), SC-004 (user isolation), SC-006 (404 for unauthorized) |
| **Description** | Updates task title and/or description |
| **Request** | TaskUpdate (both fields optional, supports partial updates) |
| **Response** | 200: Updated TaskRead object |
| **Error Response** | 404: "Task not found" (also returned if task belongs to different user) |
| **Side Effect** | updated_at timestamp is auto-updated |

### DELETE /api/{user_id}/tasks/{task_id}

| Aspect | Value |
|--------|-------|
| **User Story** | US2 - Edit and Delete Tasks (P2) |
| **Functional Requirements** | FR-008 (delete task by ID), FR-010 (reject if not owned) |
| **Success Criteria** | SC-004 (user isolation), SC-006 (404 for unauthorized) |
| **Description** | Permanently deletes a task |
| **Response** | 200: {"message": "Task deleted successfully"} |
| **Error Response** | 404: "Task not found" (also returned if task belongs to different user) |
| **Security** | Filters by both task_id AND user_id before delete |

### PATCH /api/{user_id}/tasks/{task_id}/complete

| Aspect | Value |
|--------|-------|
| **User Story** | US3 - Mark Task Completion (P3) |
| **Functional Requirements** | FR-004 (track completion status), FR-009 (toggle completion), FR-010 (reject if not owned) |
| **Success Criteria** | SC-004 (user isolation), SC-006 (404 for unauthorized) |
| **Description** | Toggles the is_completed boolean field (true ↔ false) |
| **Response** | 200: Updated TaskRead object with new completion status |
| **Error Response** | 404: "Task not found" (also returned if task belongs to different user) |
| **Side Effect** | updated_at timestamp is auto-updated |

## User Story Coverage

| User Story | Priority | Endpoints | Status |
|------------|----------|-----------|--------|
| US1 - Create and View Tasks | P1 | GET /api/{user_id}/tasks, POST /api/{user_id}/tasks, GET /api/{user_id}/tasks/{task_id} | ✅ Fully Covered |
| US2 - Edit and Delete Tasks | P2 | PUT /api/{user_id}/tasks/{task_id}, DELETE /api/{user_id}/tasks/{task_id} | ✅ Fully Covered |
| US3 - Mark Task Completion | P3 | PATCH /api/{user_id}/tasks/{task_id}/complete | ✅ Fully Covered |

## Functional Requirement Coverage

| FR | Description | Endpoints | Coverage |
|----|-------------|-----------|----------|
| FR-001 | Create task with title/description | POST | ✅ |
| FR-002 | Assign unique ID | POST | ✅ |
| FR-003 | Record timestamps | All write operations | ✅ |
| FR-004 | Track completion status | All endpoints (read/write) | ✅ |
| FR-005 | Return user's task list | GET /api/{user_id}/tasks | ✅ |
| FR-006 | Return single task by ID | GET /api/{user_id}/tasks/{task_id} | ✅ |
| FR-007 | Update title/description | PUT /api/{user_id}/tasks/{task_id} | ✅ |
| FR-008 | Delete task | DELETE /api/{user_id}/tasks/{task_id} | ✅ |
| FR-009 | Toggle completion | PATCH /api/{user_id}/tasks/{task_id}/complete | ✅ |
| FR-010 | Reject cross-user access (404) | GET/PUT/DELETE/PATCH single task | ✅ |
| FR-011 | Validate title required | POST (Pydantic), PUT (optional) | ✅ |
| FR-012 | Persist to database | All write operations | ✅ |
| FR-013 | OpenAPI documentation | Auto-generated by FastAPI | ✅ |

## Security Considerations

### User Isolation Enforcement

All endpoints that operate on a single task MUST filter by both `task_id` AND `user_id`:

```python
# Security pattern applied in all single-task endpoints
statement = select(Task).where(
    Task.id == task_id
).where(
    Task.user_id == user_id
)
```

If the task doesn't exist OR belongs to a different user, return 404 "Task not found".

This approach:
- Prevents cross-user data leakage (Constitution: Security by Design)
- Doesn't reveal whether a task exists for a different user (security best practice)
- Returns consistent error responses

## Status Code Reference

| Code | Meaning | Used By |
|------|---------|---------|
| 200 | Success (GET, PUT, PATCH, DELETE) | GET /tasks, GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/complete |
| 201 | Created (POST) | POST /tasks |
| 404 | Not Found | GET /tasks/{id}, PUT /tasks/{id}, DELETE /tasks/{id}, PATCH /tasks/{id}/complete |
| 422 | Validation Error | POST /tasks, PUT /tasks/{id} (auto-generated by Pydantic) |
| 500 | Server Error | All endpoints (exception handler) |
