# Implementation Plan: Backend Task Service

**Branch**: `001-backend-task-service` | **Date**: 2026-02-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-backend-task-service/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Production-grade FastAPI backend exposing RESTful endpoints for Todo task management, backed by Neon Serverless PostgreSQL using SQLModel. The API provides full CRUD operations, completion toggle, and strict user-scoped data filtering. User ID is provided via URL path (JWT verification deferred to separate feature).

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI, SQLModel, psycopg2-binary, uvicorn, python-dotenv
**Storage**: Neon Serverless PostgreSQL (persistent, cloud-hosted)
**Testing**: pytest (for unit and integration tests)
**Target Platform**: Linux server (container-ready)
**Project Type**: web (backend API only - frontend and auth are separate features)
**Performance Goals**:
- Task creation: <1 second (SC-001)
- List retrieval (up to 1,000 tasks): <2 seconds (SC-002)
- Support multiple concurrent users
**Constraints**:
- 100% data persistence across restarts (SC-003)
- 100% user isolation - no cross-user data leakage (SC-004)
- Task title max 500 characters, description max 5,000 characters
**Scale/Scope**:
- 6 REST endpoints
- 1 entity (Task)
- User-scoped filtering on all queries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Todo AI Chatbot Project - Required Gates:**

- [x] **Spec-First**: Feature specification approved before any implementation
- [x] **No Manual Coding**: All code generated via Claude Code from approved specs
- [x] **Separation of Concerns**: Backend (FastAPI) only - Auth and Frontend are separate features
- [ ] **Security by Design**: JWT verification on all protected endpoints - **DEFERRED** (user_id in URL path for this feature, JWT in separate spec)
- [x] **Contract-Driven**: REST endpoints follow defined request/response contracts; OpenAPI docs accurate
- [x] **Environment Consistency**: DATABASE_URL via environment variable; no hardcoded secrets
- [x] **Stack Compliance**: FastAPI, SQLModel, Neon PostgreSQL
- [ ] **Stateless Auth**: JWT tokens only - **DEFERRED** (user_id in URL path for this feature, JWT in separate spec)

**Constitution Check Status**: ✅ PASSED with noted deferrals

**Justification for Deferred Gates**:
- JWT verification is explicitly out of scope for this feature (see spec "Out of Scope")
- User ID is provided via URL path as a deliberate simplification
- Separate feature will handle JWT authentication and token verification
- User isolation is still enforced via user_id filtering in all queries

## Project Structure

### Documentation (this feature)

```text
specs/001-backend-task-service/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   ├── openapi.yaml     # OpenAPI 3.1 specification
│   └── endpoint-mapping.md  # Endpoint to requirement mapping
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── __init__.py
│   ├── main.py          # FastAPI application entry point
│   ├── models/
│   │   ├── __init__.py
│   │   └── task.py      # SQLModel Task entity
│   ├── schemas/
│   │   ├── __init__.py
│   │   └── task.py      # Pydantic schemas (TaskCreate, TaskRead, TaskUpdate)
│   ├── services/
│   │   ├── __init__.py
│   │   └── task.py      # CRUD business logic
│   ├── routes/
│   │   ├── __init__.py
│   │   └── tasks.py     # FastAPI route handlers
│   ├── database.py      # Database engine and session configuration
│   └── config.py        # Environment configuration
├── tests/
│   ├── __init__.py
│   ├── conftest.py      # Pytest fixtures
│   ├── unit/
│   │   └── test_task_service.py
│   └── integration/
│       └── test_tasks_api.py
├── pyproject.toml       # Poetry dependencies
├── requirements.txt     # Pip dependencies
├── .env.example         # Environment template
└── Dockerfile           # Container image (optional)
```

**Structure Decision**: Web application backend structure selected. The backend/ directory contains only the FastAPI service with clear separation of models (SQLModel), schemas (Pydantic), services (business logic), and routes (API handlers). Frontend (Next.js) will be in a separate directory in a future feature. Authentication (Better Auth) will also be a separate feature.

## Complexity Tracking

> No constitution violations requiring justification. All deferrals are explicitly documented in spec "Out of Scope" section.

---

## Phase 1 Design Complete

**Post-Design Constitution Check**: ✅ RE-VERIFIED - All gates passed or appropriately deferred

### Phase 0 Deliverables (research.md)

- Technology decisions documented (Python 3.11+, FastAPI, SQLModel, Neon)
- Architecture patterns defined (models/schemas/services/routes separation)
- Database schema designed with user_id indexing
- Security patterns documented (user isolation via WHERE clause filtering)

### Phase 1 Deliverables

**data-model.md**:
- Task entity fully defined with all fields and validation rules
- Pydantic schema models specified (TaskCreate, TaskRead, TaskUpdate)
- Index strategy documented (user_id for query performance)
- State transition diagram for completion toggle

**contracts/openapi.yaml**:
- Complete OpenAPI 3.1 specification for all 6 endpoints
- Request/response schemas defined
- Error responses documented (404, 422, 500)
- Swagger UI will auto-generate from this spec

**contracts/endpoint-mapping.md**:
- Each endpoint mapped to functional requirements
- User story coverage verified (all 3 stories fully covered)
- All 13 functional requirements traced to endpoints

**quickstart.md**:
- Complete local development setup guide
- Step-by-step instructions for running the API
- Troubleshooting section for common issues

### Ready for Phase 2

Run `/sp.tasks` to generate the task breakdown for implementation.
