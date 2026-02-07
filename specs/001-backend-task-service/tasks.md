---

description: "Task list for Backend Task Service implementation"
---

# Tasks: Backend Task Service

**Input**: Design documents from `/specs/001-backend-task-service/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT included in this implementation. Manual testing via Swagger UI is specified in the feature acceptance criteria.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app backend**: `backend/src/`, `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure with src/models, src/schemas, src/services, src/routes, tests/unit, tests/integration subdirectories
- [X] T002 Create requirements.txt with fastapi, sqlmodel, psycopg2-binary, uvicorn, python-dotenv, pytest dependencies
- [X] T003 [P] Create .env.example file with DATABASE_URL template
- [X] T004 [P] Create backend/src/__init__.py empty file

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T005 Create backend/src/config.py with environment loading (DATABASE_URL from os.getenv)
- [X] T006 Create backend/src/database.py with engine creation, Session dependency, and init_db function
- [X] T007 Create backend/src/models/__init__.py empty file
- [X] T008 Create backend/src/schemas/__init__.py empty file
- [X] T009 Create backend/src/services/__init__.py empty file
- [X] T010 Create backend/src/routes/__init__.py empty file

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks and view their list of tasks through the API

**Independent Test**: Create tasks via POST /api/{user_id}/tasks, verify list retrieval via GET /api/{user_id}/tasks returns all created tasks, verify GET /api/{user_id}/tasks/{id} returns single task

### Implementation for User Story 1

- [X] T011 [P] [US1] Create TaskBase, Task, TaskCreate, TaskRead, TaskUpdate SQLModel/Pydantic schemas in backend/src/models/task.py
- [X] T012 [P] [US1] Create get_tasks_by_user function in backend/src/services/task.py (filters by user_id)
- [X] T013 [P] [US1] Create get_task_by_id_and_user function in backend/src/services/task.py (filters by both id AND user_id)
- [X] T014 [US1] Create create_task function in backend/src/services/task.py (accepts user_id, TaskCreate, returns Task with generated id and timestamps)
- [X] T015 [US1] Create GET /api/{user_id}/tasks route in backend/src/routes/tasks.py (calls get_tasks_by_user, returns list of TaskRead)
- [X] T016 [US1] Create POST /api/{user_id}/tasks route in backend/src/routes/tasks.py (calls create_task, returns 201 with TaskRead)
- [X] T017 [US1] Create GET /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py (calls get_task_by_id_and_user, returns 200 or 404)
- [X] T018 [US1] Create backend/src/main.py with FastAPI app, include routers, database init on startup, CORS middleware

**Checkpoint**: At this point, User Story 1 should be fully functional - test via Swagger UI at http://localhost:8000/docs

---

## Phase 4: User Story 2 - Edit and Delete Tasks (Priority: P2)

**Goal**: Users can modify task details (title, description) and remove tasks

**Independent Test**: Create a task, update its title/description via PUT /api/{user_id}/tasks/{id}, verify changes persisted, then delete via DELETE /api/{user_id}/tasks/{id} and confirm it no longer appears in list

### Implementation for User Story 2

- [X] T019 [P] [US2] Create update_task function in backend/src/services/task.py (filters by id AND user_id, updates title/description, auto-updates updated_at)
- [X] T020 [P] [US2] Create delete_task function in backend/src/services/task.py (filters by id AND user_id before delete, returns success message)
- [X] T021 [US2] Create PUT /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py (calls update_task, returns 200 with updated TaskRead or 404)
- [X] T022 [US2] Create DELETE /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py (calls delete_task, returns 200 with message or 404)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Mark Task Completion (Priority: P3)

**Goal**: Users can toggle task completion status between true and false

**Independent Test**: Create a task, toggle completion to true via PATCH /api/{user_id}/tasks/{id}/complete, verify status changed, then toggle back to false and confirm

### Implementation for User Story 3

- [X] T023 [P] [US3] Create toggle_complete function in backend/src/services/task.py (filters by id AND user_id, flips is_completed boolean, auto-updates updated_at)
- [X] T024 [US3] Create PATCH /api/{user_id}/tasks/{task_id}/complete route in backend/src/routes/tasks.py (calls toggle_complete, returns 200 with updated TaskRead or 404)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T025 [P] Create backend/tests/__init__.py empty file
- [X] T026 [P] Create backend/tests/conftest.py with pytest fixtures for test database and test client
- [X] T027 [P] Create backend/tests/integration/test_tasks_api.py with basic API smoke tests (verify endpoints respond)
- [X] T028 Create README.md in backend/ with setup and run instructions
- [X] T029 Verify OpenAPI documentation at /docs shows all 6 endpoints with correct schemas
- [X] T030 Manual test: Verify data persists across server restarts
- [X] T031 Manual test: Verify cross-user access returns 404 (user isolation)
- [X] T032 Manual test: Verify empty title validation returns 422 error

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends Task model/service with update/delete functions
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Extends Task model/service with toggle function

### Within Each User Story

- Models can be created in parallel ([P] tasks)
- Services depend on models (must wait for model task)
- Routes depend on services (must wait for service task)
- Main app depends on routes (must wait for route tasks in US1)

### Parallel Opportunities

- All Setup tasks marked [P] (T003, T004) can run in parallel
- All Foundational tasks marked [P] can run in parallel
- Within each user story, [P] marked model/service tasks can run in parallel
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)

---

## Parallel Example: User Story 1

```bash
# Launch model/schema creation for User Story 1:
Task: "Create TaskBase, Task, TaskCreate, TaskRead, TaskUpdate SQLModel/Pydantic schemas in backend/src/models/task.py"

# Then launch service functions (can run in parallel after model):
Task: "Create get_tasks_by_user function in backend/src/services/task.py"
Task: "Create get_task_by_id_and_user function in backend/src/services/task.py"

# After all services complete, create routes (can run in parallel):
Task: "Create GET /api/{user_id}/tasks route in backend/src/routes/tasks.py"
Task: "Create POST /api/{user_id}/tasks route in backend/src/routes/tasks.py"

# After all routes complete, create main app:
Task: "Create backend/src/main.py with FastAPI app, include routers, database init on startup"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010) - CRITICAL blocks all stories
3. Complete Phase 3: User Story 1 (T011-T018)
4. **STOP and VALIDATE**: Test User Story 1 independently via Swagger UI
5. Deploy/demo if ready - this is a working MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Create & View Tasks)
3. Add User Story 2 → Test independently → Deploy/Demo (Add: Edit & Delete)
4. Add User Story 3 → Test independently → Deploy/Demo (Add: Completion Toggle)
5. Add Polish → Final production-ready backend

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create & View)
   - Developer B: User Story 2 (Edit & Delete)
   - Developer C: User Story 3 (Completion Toggle)
3. Coordinate on main.py integration (each developer adds their routes)

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- User isolation is CRITICAL: all single-task queries MUST filter by both id AND user_id
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Tests are manual via Swagger UI per spec acceptance criteria
