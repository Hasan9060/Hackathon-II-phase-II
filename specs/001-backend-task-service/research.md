# Research: Backend Task Service

**Feature**: 001-backend-task-service
**Date**: 2026-02-02
**Status**: Complete

## Overview

This document captures research findings for the Backend Task Service implementation. All technical decisions have been researched and documented to resolve any ambiguity in the implementation plan.

## Technology Decisions

### Python Version

**Decision**: Python 3.11+

**Rationale**:
- FastAPI and SQLModel support Python 3.11+ with full type hint support
- Performance improvements in 3.11 (faster execution)
- Match pattern matching and other modern Python features
- Long-term support through 2027

**Alternatives Considered**:
- Python 3.12: Newer but less library compatibility testing
- Python 3.10: Stable but missing performance improvements

### FastAPI Framework

**Decision**: FastAPI 0.104+ (latest stable)

**Rationale**:
- Native OpenAPI 3.1 support for auto-generated documentation
- Built-in Pydantic v2 integration for request/response validation
- Async support for high concurrency
- Automatic Swagger UI at /docs
- Constitution-mandated technology stack

**Alternatives Considered**:
- Flask: Would require additional libraries for OpenAPI and async
- Django REST Framework: Heavier weight, more boilerplate

### SQLModel ORM

**Decision**: SQLModel 0.0.14+ (latest stable)

**Rationale**:
- Built on Pydantic v2 for schema validation
- SQLAlchemy core for database operations
- Single model definition serves as both database table and Pydantic schema
- Constitution-mandated technology stack

**Alternatives Considered**:
- SQLAlchemy 2.0: More verbose, requires separate Pydantic models
- Tortoise ORM: Async-only, less mature ecosystem

### Database: Neon Serverless PostgreSQL

**Decision**: Neon PostgreSQL 15+

**Rationale**:
- Serverless scaling (pay only for usage)
- Cloud-hosted (constitution requirement)
- Branching for development/testing
- HTTP API support (optional for serverless functions)
- Standard PostgreSQL protocol (full ecosystem compatibility)
- Constitution-mandatory technology

**Alternatives Considered**:
- Supabase: Adds auth layer (out of scope, creates confusion)
- Railway: Less focused on PostgreSQL branching
- AWS RDS: Higher cost for always-on instances

### ASGI Server

**Decision**: Uvicorn 0.24+

**Rationale**:
- FastAPI-recommended ASGI server
- Native async support
- Low resource footprint
- Hot reload in development

**Alternatives Considered**:
- Gunicorn + Uvicorn workers: Better for production, can add later
- Hypercorn: Less mainstream, fewer examples

## Architecture Patterns

### Directory Structure

**Decision**: Separated models/schemas/services/routes

**Rationale**:
- **Models/**: SQLModel entities (database tables)
- **Schemas/**: Pydantic models (request/response validation)
- **Services/**: Business logic layer (reusable, testable)
- **Routes/**: FastAPI route handlers (thin, delegate to services)

**Alternatives Considered**:
- Single file: Doesn't scale, harder to test
- MVC pattern: Less common in FastAPI world

### User ID in URL Path

**Decision**: /api/{user_id}/tasks/* (as specified)

**Rationale**:
- Simplified testing for this feature (no JWT needed)
- Explicit ownership in URL structure
- Easy to migrate to JWT header later (extract user_id from token)

**Security Note**: In production with JWT, user_id will be extracted from token and used for filtering. URL user_id will be ignored or validated against token.

### Error Handling Strategy

**Decision**: HTTPException with appropriate status codes

**Rationale**:
- FastAPI standard practice
- Clear error responses in OpenAPI docs
- Consistent with REST conventions

**Status Codes**:
- 200: Successful GET/PUT/PATCH
- 201: Successful POST (created)
- 404: Task not found OR task belongs to different user (security)
- 422: Validation error (Pydantic auto-generates)
- 500: Server error

## Database Schema Design

### Task Table

```sql
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_user_id ON task(user_id);
```

**Rationale**:
- UUID: Globally unique, no collision risk
- user_id indexed: Required for user-scoped queries
- Title max 500 chars: Per spec assumptions
- Description TEXT: No practical limit (spec says 5000)
- Timestamps with timezone: ISO 8601 compliance

## API Contract Design

### Endpoint Summary

| Method | Path | Purpose | Request Body | Response |
|--------|------|---------|--------------|----------|
| GET | /api/{user_id}/tasks | List all user tasks | - | 200: TaskRead[] |
| POST | /api/{user_id}/tasks | Create task | TaskCreate | 201: TaskRead |
| GET | /api/{user_id}/tasks/{id} | Get single task | - | 200: TaskRead |
| PUT | /api/{user_id}/tasks/{id} | Update task | TaskUpdate | 200: TaskRead |
| DELETE | /api/{user_id}/tasks/{id} | Delete task | - | 200: {message} |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion | - | 200: TaskRead |

### Pydantic Schemas

**TaskCreate** (POST request body):
```python
title: str (min_length=1, max_length=500)
description: Optional[str] = None
```

**TaskRead** (GET/POST response):
```python
id: UUID
user_id: str
title: str
description: Optional[str]
is_completed: bool
created_at: datetime
updated_at: datetime
```

**TaskUpdate** (PUT request body):
```python
title: Optional[str] = None
description: Optional[str] = None
```

All optional fields allow partial updates.

## Performance Considerations

### Query Optimization

**Decision**: Use indexed user_id for all queries

**Rationale**:
- Every query filters by user_id (constitution requirement)
- Index ensures O(log n) lookup instead of O(n)
- Supports up to 1,000 tasks per user efficiently

**Future Optimizations** (not in this feature):
- Pagination for large lists
- Caching with Redis
- Read replicas

### Connection Pooling

**Decision**: SQLAlchemy engine with default pool

**Rationale**:
- SQLModel creates engine with sensible defaults
- Pool size 5 (appropriate for Neon serverless)
- Automatically handles connection lifecycle

## Testing Strategy

**Decision**: pytest with test database

**Rationale**:
- Standard Python testing framework
- Fixtures for database setup/teardown
- Can run unit and integration tests

**Test Coverage**:
- Unit tests: CRUD functions in services/
- Integration tests: API endpoints with test database
- User isolation: Verify cross-user returns 404

## Security Considerations

### User Isolation

**Decision**: Filter by user_id in ALL queries

**Implementation**:
```python
# WRONG: Allows cross-user access
SELECT * FROM task WHERE id = {task_id}

# CORRECT: Enforces user isolation
SELECT * FROM task WHERE id = {task_id} AND user_id = {user_id}
```

**Rationale**:
- Constitution requirement (Security by Design)
- Prevents data leakage between users
- Defense in depth even with JWT later

### SQL Injection Prevention

**Decision**: Use SQLModel/SQLAlchemy parameterized queries

**Rationale**:
- ORM automatically escapes values
- Never concatenate user input into SQL

## Environment Configuration

### Required Environment Variables

```bash
DATABASE_URL=postgresql://user:pass@host/dbname
```

**Decision**: python-dotenv for .env file loading

**Rationale**:
- Standard Python practice
- Keeps secrets out of code
- Supports local development

## Unresolved Questions

**None** - All technical decisions documented.

## Next Steps

Proceed to Phase 1: Generate data-model.md, contracts/, and quickstart.md
