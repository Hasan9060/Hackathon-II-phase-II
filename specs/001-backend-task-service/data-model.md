# Data Model: Backend Task Service

**Feature**: 001-backend-task-service
**Date**: 2026-02-02
**Status**: Final

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                          Task                                │
├─────────────────────────────────────────────────────────────┤
│  id:              UUID (PK)                                  │
│  user_id:         String (Indexed, FK→User)                  │
│  title:           String (500 max, required)                 │
│  description:     String (5000 max, optional)                │
│  is_completed:    Boolean (default: false)                   │
│  created_at:      Timestamp (auto-generated)                 │
│  updated_at:      Timestamp (auto-updated)                   │
└─────────────────────────────────────────────────────────────┘
```

## Entities

### Task

Represents a single to-do item owned by a specific user.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary Key, Auto-generated | Globally unique identifier |
| `user_id` | String | Indexed, Not Null | Owner of the task (foreign key reference) |
| `title` | String | Max 500 chars, Not Null | Task title/name |
| `description` | String | Max 5000 chars, Optional | Detailed task notes |
| `is_completed` | Boolean | Default: False | Task completion status |
| `created_at` | Timestamp | Auto-generated | ISO 8601 creation timestamp |
| `updated_at` | Timestamp | Auto-updated | ISO 8601 last modification timestamp |

#### SQLModel Definition

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

class TaskBase(SQLModel):
    title: str = Field(max_length=500, min_length=1)
    description: Optional[str] = Field(default=None, max_length=5000)

class Task(TaskBase, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True)
    is_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TaskCreate(TaskBase):
    """Schema for creating a task (user_id comes from URL)"""
    pass

class TaskRead(TaskBase):
    """Schema for reading a task (includes all fields)"""
    id: UUID
    user_id: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

class TaskUpdate(SQLModel):
    """Schema for updating a task (all fields optional)"""
    title: Optional[str] = Field(default=None, max_length=500)
    description: Optional[str] = Field(default=None, max_length=5000)
```

### User

**Note**: User entity is referenced but NOT implemented in this feature. User management is out of scope (see spec "Out of Scope"). User ID is provided as a string parameter in the URL path.

## Relationships

### Task → User

- **Type**: Many-to-One
- **Description**: Each Task belongs to exactly one User
- **Implementation**: `task.user_id` stores the owner identifier
- **Cascade**: Not applicable (User entity not in this feature)

## Validation Rules

### Task Validation

| Rule | Field | Enforcement |
|------|-------|-------------|
| Required | title | Pydantic min_length=1 |
| Max length | title | Pydantic max_length=500 |
| Max length | description | Pydantic max_length=5000 |
| Default value | is_completed | Field(default=False) |
| Auto-generated | id | Field(default_factory=uuid4) |
| Auto-generated | created_at | Field(default_factory=datetime.utcnow) |
| Auto-updated | updated_at | Application logic (on save) |

## Indexes

| Index | Fields | Purpose |
|-------|--------|---------|
| `PRIMARY` | `id` | Unique task lookup |
| `idx_task_user_id` | `user_id` | User-scoped queries (required for performance) |

## Database Migration

### Initial Table Creation

```sql
CREATE TABLE task (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description VARCHAR(5000),
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_task_user_id ON task(user_id);
```

### Migration Strategy

**Phase 1 (This Feature)**: Auto-create tables on startup using SQLModel's `create_engine`

```python
from sqlmodel import SQLModel, create_engine, Session

engine = create_engine(DATABASE_URL)

def init_db():
    SQLModel.metadata.create_all(engine)
```

**Phase 2+ (Future)**: Alembic migrations for production schema changes

## State Transitions

### Task Completion State

```
┌──────────────┐   toggle_complete()   ┌──────────────┐
│   Incomplete │ ─────────────────────> │   Completed  │
│  (false)     │ <───────────────────── │   (true)     │
└──────────────┘   toggle_complete()   └──────────────┘
```

- **Trigger**: PATCH /api/{user_id}/tasks/{id}/complete
- **Implementation**: `is_completed = not is_completed`
- **Side Effect**: `updated_at` timestamp updates

## Query Patterns

### User-Scoped Filtering

**CRITICAL**: All queries MUST include `user_id` filter (Constitution: Security by Design)

```python
# CORRECT: Always filter by user_id
def get_task(task_id: UUID, user_id: str) -> Optional[Task]:
    return session.exec(
        select(Task).where(Task.id == task_id).where(Task.user_id == user_id)
    ).first()

# WRONG: Missing user_id filter (security vulnerability)
def get_task_insecure(task_id: UUID) -> Optional[Task]:
    return session.exec(select(Task).where(Task.id == task_id)).first()
```

## Data Retention

**Policy**: No automatic deletion or archiving in this feature.

**Rationale**: Data retention policy is a business decision not specified in requirements. Tasks persist indefinitely until explicitly deleted by user.

## Future Extensions (Out of Scope)

- Task categories/tags
- Due dates and reminders
- Task priority levels
- Task sharing between users
- Task history/audit log
- Soft delete (trash/restore)
