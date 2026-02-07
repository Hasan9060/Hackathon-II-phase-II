# Tasks: JWT Authentication for Backend Task Service

**Feature**: 002-jwt-auth
**Branch**: `002-jwt-auth`
**Status**: Draft
**Total Tasks**: 28

## Task Breakdown by Phase

---

## Phase 1: Setup (4 tasks)

**Goal**: Initialize project structure and dependencies for JWT authentication.

- [X] T001 Verify BETTER_AUTH_SECRET added to backend/.env and backend/.env.example
- [X] T002 Verify python-jose[cryptography]>=3.3.0 added to backend/requirements.txt
- [X] T003 Install JWT dependency using pip install -r backend/requirements.txt
- [X] T004 Create middleware directory structure with __init__.py in backend/src/middleware/

---

## Phase 2: Foundational (6 tasks)

**Goal**: Build core JWT infrastructure that all user stories depend on.

- [X] T005 [P] Create AuthenticatedUser dataclass in backend/src/dependencies/__init__.py
- [X] T006 [P] Create JWT extraction and verification logic in backend/src/middleware/jwt.py
- [X] T007 Implement JWT signature verification with HS256 algorithm in backend/src/middleware/jwt.py
- [X] T008 Implement JWT error handling (401 responses) in backend/src/middleware/jwt.py
- [X] T009 Create get_current_user dependency in backend/src/dependencies/auth.py
- [X] T010 Implement user_id matching logic (403 on mismatch) in backend/src/dependencies/auth.py

---

## Phase 3: User Story 1 - Protected API Access (Priority: P1) (5 tasks)

**Goal**: A user with a valid JWT token can access their tasks through the API. The system validates the token and returns 401 for invalid/missing tokens.

**Independent Test**: Make API requests with valid JWT (should succeed) and without token/with invalid token (should return 401).

**Acceptance Scenarios**:
1. Given a user has a valid JWT token, when they request their task list, then the API returns their tasks successfully
2. Given a request is made without any Authorization header, when the request reaches any API endpoint, then the API returns 401 Unauthorized
3. Given a request has an expired JWT token, when the request reaches any API endpoint, then the API returns 401 Unauthorized

- [X] T011 [US1] Register JWT middleware with FastAPI app in backend/src/main.py
- [X] T012 [US1] Add OpenAPI security scheme (JWTAuth) to FastAPI app in backend/src/main.py
- [X] T013 [P] [US1] Add get_current_user dependency to GET /api/{user_id}/tasks route in backend/src/routes/tasks.py
- [X] T014 [P] [US1] Add get_current_user dependency to POST /api/{user_id}/tasks route in backend/src/routes/tasks.py
- [X] T015 [US1] Test JWT authentication with valid token and missing/invalid tokens

---

## Phase 4: User Story 2 - User Identity Verification (Priority: P2) (5 tasks)

**Goal**: The system verifies the user's identity both from the JWT token and from the URL path, ensuring they match. This prevents URL manipulation attacks.

**Independent Test**: Make a request with a valid JWT for user-a but modify the URL to user-b's path, confirming the request is rejected with 403.

**Acceptance Scenarios**:
1. Given a user has a JWT token containing user_id "user-a", when they request /api/user-a/tasks, then the API returns their tasks successfully
2. Given a user has a JWT token containing user_id "user-a", when they request /api/user-b/tasks (different user in URL), then the API returns 403 Forbidden
3. Given a user has a valid token but tries to access a non-existent task ID, when they make the request, then the API returns 404 Not Found (not 403)

- [X] T016 [US2] Verify get_current_user dependency returns 403 when user_id mismatch
- [X] T017 [P] [US2] Add get_current_user dependency to GET /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py
- [X] T018 [P] [US2] Add get_current_user dependency to PUT /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py
- [X] T019 [P] [US2] Add get_current_user dependency to DELETE /api/{user_id}/tasks/{task_id} route in backend/src/routes/tasks.py
- [X] T020 [US2] Test user identity verification with matching and mismatching user_ids

---

## Phase 5: User Story 3 - Token Lifecycle Management (Priority: P3) (5 tasks)

**Goal**: The system properly handles JWT token lifecycle including expired tokens, malformed tokens, and missing tokens. All security responses are consistent.

**Independent Test**: Send requests with various invalid token states (expired, malformed, invalid signature) and verify appropriate 401 responses.

**Acceptance Scenarios**:
1. Given a user's JWT token has expired, when they make an API request, then the API returns 401 Unauthorized with a clear error message
2. Given a request contains a malformed JWT token, when the request reaches the API, then the API returns 401 Unauthorized without revealing specific token details
3. Given a request has a token with invalid signature, when the request reaches the API, then the API returns 401 Unauthorized

- [X] T021 [US3] Add JWT expiry validation (exp > now check) in backend/src/middleware/jwt.py
- [X] T022 [US3] Add malformed token handling (try/except JWT decode) in backend/src/middleware/jwt.py
- [X] T023 [US3] Add invalid signature handling in backend/src/middleware/jwt.py
- [X] T024 [P] [US3] Add get_current_user dependency to PATCH /api/{user_id}/tasks/{task_id}/complete route in backend/src/routes/tasks.py
- [X] T025 [US3] Test token lifecycle with expired, malformed, and invalid signature tokens

---

## Phase 6: Polish (3 tasks)

**Goal**: Comprehensive testing, documentation, and validation.

- [X] T026 Create unit tests for JWT middleware in backend/tests/unit/test_jwt_middleware.py
- [X] T027 Create integration tests for JWT authentication in backend/tests/integration/test_jwt_auth.py
- [X] T028 Verify OpenAPI documentation shows JWT security scheme at /docs endpoint

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational)
    ↓
Phase 3 (US1 - Protected API Access) [P1]
    ↓
Phase 4 (US2 - User Identity Verification) [P2]
    ↓
Phase 5 (US3 - Token Lifecycle Management) [P3]
    ↓
Phase 6 (Polish)
```

### Parallel Execution Opportunities

**Phase 2 - Foundational**:
- T005, T006 can run in parallel (different files)
- T007, T008 must follow T006 (same file)
- T009, T010 can run in parallel with T007-T008 (different file)

**Phase 3 - User Story 1**:
- T013, T014 can run in parallel (different routes in same file)
- T015 must follow T011-T014 (testing)

**Phase 4 - User Story 2**:
- T017, T018, T019 can run in parallel (different routes in same file)
- T020 must follow T016-T019 (testing)

**Phase 5 - User Story 3**:
- T021, T022, T023 can run in parallel (same file but independent functions)
- T024 can run in parallel with T021-T023 (different file)
- T025 must follow T021-T024 (testing)

---

## Parallel Execution Examples

### Example 1: Phase 2 Foundational (Parallel)

```bash
# Terminal 1: Create AuthenticatedUser dataclass
- T005 [P] Create AuthenticatedUser dataclass

# Terminal 2: Create JWT extraction/verification logic
- T006 [P] Create JWT extraction and verification logic

# After T005, T006 complete:
- T007 Implement JWT signature verification
- T008 Implement JWT error handling
- T009, T010: Create get_current_user dependency
```

### Example 2: Phase 3 User Story 1 (Parallel)

```bash
# After T011, T012 complete, run in parallel:
- T013 [P] Add dependency to GET /api/{user_id}/tasks
- T014 [P] Add dependency to POST /api/{user_id}/tasks

# After both complete:
- T015 Test JWT authentication
```

### Example 3: Phase 4 User Story 2 (Parallel)

```bash
# After T016 complete, run in parallel:
- T017 [P] Add dependency to GET /api/{user_id}/tasks/{task_id}
- T018 [P] Add dependency to PUT /api/{user_id}/tasks/{task_id}
- T019 [P] Add dependency to DELETE /api/{user_id}/tasks/{task_id}

# After all complete:
- T020 Test user identity verification
```

---

## Implementation Strategy

### MVP Scope (User Story 1 Only)

For minimum viable product, implement only:
- Phase 1: Setup (T001-T004)
- Phase 2: Foundational (T005-T010)
- Phase 3: User Story 1 (T011-T015)

**MVP Deliverable**: API requires valid JWT token, returns 401 for missing/invalid tokens. User identity verification (US2) and token lifecycle handling (US3) deferred.

### Incremental Delivery

**Sprint 1**: MVP (US1) - Basic JWT authentication
**Sprint 2**: US2 - User identity verification (prevent URL manipulation)
**Sprint 3**: US3 - Token lifecycle management (edge case handling)
**Sprint 4**: Polish - Tests and documentation

---

## File Map

| Task | File | Description |
|------|------|-------------|
| T001 | backend/.env, backend/.env.example | Verify BETTER_AUTH_SECRET configured |
| T002 | backend/requirements.txt | Verify python-jose dependency |
| T003 | (shell) | Install dependencies |
| T004 | backend/src/middleware/__init__.py | Create middleware directory |
| T005 | backend/src/dependencies/__init__.py | Create AuthenticatedUser dataclass |
| T006-T008 | backend/src/middleware/jwt.py | JWT middleware (extraction, verification, errors) |
| T009-T010 | backend/src/dependencies/auth.py | Auth dependency (user extraction, matching) |
| T011-T012 | backend/src/main.py | Register middleware and OpenAPI security |
| T013-T015, T017-T019, T024 | backend/src/routes/tasks.py | Add auth dependencies to routes |
| T016, T020, T025 | (testing) | User story tests |
| T021-T023 | backend/src/middleware/jwt.py | Token lifecycle handling |
| T026 | backend/tests/unit/test_jwt_middleware.py | Unit tests |
| T027 | backend/tests/integration/test_jwt_auth.py | Integration tests |
| T028 | (validation) | Verify OpenAPI docs |

---

## Test Coverage

### Unit Tests (T026)
- JWT decode with valid token
- JWT decode with expired token
- JWT decode with invalid signature
- JWT decode with malformed format
- user_id matching logic (success case)
- user_id matching logic (mismatch case)

### Integration Tests (T027)
- Valid JWT token allows access (200)
- Missing token returns 401
- Invalid token returns 401
- Expired token returns 401
- User_id mismatch returns 403
- All 6 endpoints protected

---

## Success Criteria Validation

| Success Criterion | Verification Task |
|-------------------|-------------------|
| SC-001: 100% of API requests without valid JWT return 401 | T015, T025, T027 |
| SC-002: 100% of API requests with expired JWT return 401 | T021, T025, T027 |
| SC-003: 100% of attempts to access another user's data return 403 | T016, T020, T027 |
| SC-004: Valid JWT tokens allow successful API operations | T015, T020, T027 |
| SC-005: Token validation adds less than 50ms average latency | T027 (performance test) |
| SC-006: Error responses do not reveal sensitive information | T015, T025, T027 |

---

## Format Validation

**All tasks follow checklist format**: ✅
- Checkbox: `- [ ]`
- Task ID: T001-T028 (sequential)
- Parallel marker: `[P]` where applicable (T005, T006, T013-T014, T017-T019, T021-T024)
- Story labels: `[US1]`, `[US2]`, `[US3]` for user story phases
- File paths: Included in all implementation tasks

---

**Tasks Status**: ✅ Complete
**Total Tasks**: 28
**Setup**: 4 tasks
**Foundational**: 6 tasks
**User Story 1 (P1)**: 5 tasks
**User Story 2 (P2)**: 5 tasks
**User Story 3 (P3)**: 5 tasks
**Polish**: 3 tasks
**Parallel Opportunities**: 5 sets of parallelizable tasks
**Ready for Implementation**: Yes
