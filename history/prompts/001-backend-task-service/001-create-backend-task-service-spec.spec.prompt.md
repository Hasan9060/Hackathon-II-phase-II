---
id: "001"
title: "Create backend task service spec"
stage: spec
date: 2026-02-02
surface: agent
model: glm-4.6
feature: 001-backend-task-service
branch: 001-backend-task-service
user: developer
command: /sp.specify
labels: ["specification", "backend", "api", "crud"]
links:
  spec: specs/001-backend-task-service/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-backend-task-service/spec.md
  - specs/001-backend-task-service/checklists/requirements.md
  - history/prompts/001-backend-task-service/001-create-backend-task-service-spec.spec.prompt.md
tests:
  - N/A (specification document)
---

## Prompt

- /sp.specify

Spec: Backend Task Service — REST API with Persistent Storage and User-Scoped Data

Objective:
Design a production-grade FastAPI backend that exposes RESTful endpoints for a Todo task system,
backed by Neon Serverless PostgreSQL using SQLModel. The API must support full CRUD operations,
toggle completion, and strict filtering of tasks by user_id.

This spec assumes user_id is provided in the URL path. Authentication and JWT verification
are NOT part of this spec and will be handled in a later specification.

Actors:
- Client application (future Next.js frontend)
- FastAPI backend service
- Neon PostgreSQL database

Data Model:

Task:
- id (UUID, primary key)
- user_id (string, indexed)
- title (string, required)
- description (string, optional)
- is_completed (boolean, default false)
- created_at (datetime)
- updated_at (datetime)

API Endpoints:

1. GET    /api/{user_id}/tasks
   - Returns list of all tasks for the user

2. POST   /api/{user_id}/tasks
   - Creates a new task for the user

3. GET    /api/{user_id}/tasks/{id}
   - Returns a single task if it belongs to the user

4. PUT    /api/{user_id}/tasks/{id}
   - Updates title/description

5. DELETE /api/{user_id}/tasks/{id}
   - Deletes the task

6. PATCH  /api/{user_id}/tasks/{id}/complete
   - Toggles completion status

Behavior Rules:
- All queries MUST filter by both id AND user_id
- If task does not belong to user -> return 404
- Proper HTTP status codes must be used
- Responses must be JSON
- OpenAPI schema must correctly document all endpoints

Database:
- SQLModel models mapped to Neon PostgreSQL
- Automatic table creation
- Environment variable for DATABASE_URL

Non-Goals:
- No authentication logic
- No JWT verification
- No frontend logic

Acceptance Criteria:
- All endpoints functional via Swagger UI
- Tasks persist in Neon database
- User-scoped filtering enforced in every query
- API contract clear and testable

## Response snapshot

Created feature specification for Backend Task Service (feature 001) with:

**3 Prioritized User Stories:**
- P1: Create and View Tasks (core CRUD foundation)
- P2: Edit and Delete Tasks (task management lifecycle)
- P3: Mark Task Completion (progress tracking)

**13 Functional Requirements (FR-001 to FR-013):**
- Task creation, retrieval, update, delete operations
- User-scoped filtering enforced in all queries
- Completion toggle endpoint
- Data persistence and validation

**6 Success Criteria (technology-agnostic):**
- Task creation within 1 second
- List retrieval within 2 seconds (up to 1,000 tasks)
- 100% data persistence across restarts
- 100% user isolation (no cross-user data leakage)
- Accurate API documentation
- Proper 404 handling for unauthorized access

**Validation**: ✅ PASSED all checklist items

## Outcome

- ✅ Impact: Complete specification ready for implementation planning
- 🧪 Tests: N/A (specification document)
- 📁 Files: Created spec.md (118 lines), requirements checklist
- 🔁 Next prompts: Run `/sp.plan` to generate implementation plan
- 🧠 Reflection: Spec successfully abstracts implementation details while maintaining clear, testable requirements. User ID in URL path is a deliberate simplification before JWT auth feature.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASSED all 16 validation items
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to `/sp.plan` to design architecture
