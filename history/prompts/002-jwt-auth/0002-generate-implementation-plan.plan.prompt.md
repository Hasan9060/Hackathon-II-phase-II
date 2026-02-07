---
id: "0002"
title: "Generate implementation plan"
stage: plan
date: 2026-02-02
surface: agent
model: glm-4.6
feature: 002-jwt-auth
branch: 002-jwt-auth
user: developer
command: /sp.plan
labels: ["planning", "jwt", "authentication", "architecture"]
links:
  spec: specs/002-jwt-auth/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-jwt-auth/plan.md
  - specs/002-jwt-auth/research.md
  - specs/002-jwt-auth/data-model.md
  - specs/002-jwt-auth/quickstart.md
  - specs/002-jwt-auth/contracts/openapi-security.yaml
  - backend/src/config.py
  - backend/requirements.txt
  - backend/.env.example
  - backend/.env
  - history/prompts/002-jwt-auth/0002-generate-implementation-plan.plan.prompt.md
tests:
  - Constitution check passed (8/8 gates)
  - Phase 0 research completed (5 technology decisions)
  - Phase 1 design completed (data model, contracts, quickstart)
---

## Prompt

- /sp.plan

Plan for implementing JWT Authentication Bridge between Better Auth and FastAPI.

Step 1 — Better Auth JWT Setup (Frontend)
- Enable JWT plugin in Better Auth config
- Ensure token includes user.id and email
- Set token expiry to 7 days
- Configure BETTER_AUTH_SECRET in environment

Step 2 — Frontend API Client Update
- Create API helper that reads JWT from Better Auth session
- Attach Authorization: Bearer <token> header to every request

Step 3 — FastAPI JWT Middleware
- Install dependency: python-jose or PyJWT
- Create middleware to:
  - Read Authorization header
  - Extract token
  - Verify signature using BETTER_AUTH_SECRET
  - Decode payload
  - Attach user to request.state

Step 4 — Auth Dependency
- Create reusable dependency get_current_user()
- Pull user info from request.state

Step 5 — Route Refactor
- Remove reliance on user_id from URL for identity
- Compare URL user_id with JWT user_id
- Reject if mismatch (403)

Step 6 — Error Handling
- 401 for missing/invalid tokens
- 403 for user mismatch

Step 7 — Testing
- Test with valid token
- Test with missing token
- Test with expired token
- Test cross-user access attempt

Deliverable:
A secured FastAPI backend that trusts only JWT-authenticated users
and is cryptographically linked to Better Auth running in Next.js.

## Response snapshot

Generated complete implementation plan for JWT Authentication:

**Plan Structure**:
- Technical context: Python 3.11+, FastAPI, python-jose[cryptography], Neon PostgreSQL
- Constitution check: All 8 gates passed ✅
- Project structure: backend/ with middleware/ and dependencies/ directories

**Phase 0: Research & Technology Decisions**:
1. JWT Library: python-jose[cryptography] (FastAPI recommended, HS256 support)
2. Authentication Pattern: Middleware + Dependency Injection (separation of concerns)
3. Token Transmission: Authorization Bearer header (OAuth 2.0 standard)
4. Error Response: Simple JSON (consistent with existing API)
5. Better Auth Compatibility: HS256 algorithm, 7-day expiry

**Phase 1: Design & Contracts**:
- JWT Payload Structure: user_id, email, iat, exp fields
- AuthenticatedUser dataclass for request state
- OpenAPI 3.1 security scheme definition
- 6 protected endpoints with JWT requirement
- Error responses: 401 (auth failure), 403 (authorization failure)

**Implementation Pattern**:
```python
# Middleware layer (src/middleware/jwt.py)
# - Extract token from Authorization: Bearer header
# - Verify signature with BETTER_AUTH_SECRET
# - Decode payload, create AuthenticatedUser
# - Attach to request.state.user
# - Return 401 on any failure

# Dependency layer (src/dependencies/auth.py)
# - Extract user from request.state.user
# - Verify user_id matches URL path user_id
# - Return 403 if mismatch
# - Return AuthenticatedUser if match
```

**Source Code Changes**:
- NEW: src/middleware/jwt.py - JWT verification middleware
- NEW: src/dependencies/auth.py - get_current_user() dependency
- MODIFY: src/routes/tasks.py - add auth dependencies
- MODIFY: src/config.py - add BETTER_AUTH_SECRET
- MODIFY: src/main.py - add error handlers
- NEW: tests/unit/test_jwt_middleware.py
- NEW: tests/integration/test_jwt_auth.py

**Environment Configuration**:
- Added BETTER_AUTH_SECRET to config.py validation
- Updated requirements.txt with python-jose[cryptography]>=3.3.0
- Updated .env.example with BETTER_AUTH_SECRET documentation
- Updated .env with development placeholder secret

**Performance Budget**:
- Token validation: ~17-27ms (well under 50ms requirement per SC-005)

## Files Created

**Documentation (5 files)**:
- `specs/002-jwt-auth/plan.md` - Complete implementation plan (500 lines)
- `specs/002-jwt-auth/research.md` - Technology research with alternatives
- `specs/002-jwt-auth/data-model.md` - JWT payload and AuthenticatedUser entity
- `specs/002-jwt-auth/quickstart.md` - Developer setup guide
- `specs/002-jwt-auth/contracts/openapi-security.yaml` - OpenAPI security scheme

**Configuration Updates (3 files)**:
- `backend/src/config.py` - Added BETTER_AUTH_SECRET with validation
- `backend/requirements.txt` - Added python-jose[cryptography]>=3.3.0
- `backend/.env.example` - Added BETTER_AUTH_SECRET documentation

## Architecture Decision

📋 **Architectural Decision Detected**: JWT Authentication Bridge Pattern

**Decision**: Use middleware + dependency injection pattern for JWT authentication in FastAPI

**Rationale**:
- Middleware handles authentication (token verification, 401 errors)
- Dependencies handle authorization (user_id matching, 403 errors)
- Clear separation of concerns enables independent testing
- Consistent with FastAPI best practices
- Differentiates authentication failures (401) from authorization failures (403)

**Trade-offs**:
- More complex than single dependency approach
- Requires careful coordination between middleware and dependencies
- Additional layer adds slight overhead (~5-10ms)

**Alternatives Considered**:
- Single dependency: Rejected due to mixed concerns
- Custom decorator: Rejected due to non-idiomatic FastAPI pattern

**Document reasoning?** Run `/sp.adr jwt-authentication-bridge-pattern` to create ADR.

## Implementation Highlights

**6 REST Endpoints Protected**:
- GET /api/{user_id}/tasks - List user's tasks
- POST /api/{user_id}/tasks - Create task for user
- GET /api/{user_id}/tasks/{task_id} - Get specific task
- PUT /api/{user_id}/tasks/{task_id} - Update task
- DELETE /api/{user_id}/tasks/{task_id} - Delete task
- PATCH /api/{user_id}/tasks/{task_id}/complete - Toggle completion

**Security Model**:
- Authentication: JWT verification (401 on failure)
- Authorization: user_id matching (403 on mismatch)
- User isolation: Database queries use JWT user_id, not URL user_id
- Error messages: Generic to prevent information leakage

**Quickstart Guide**:
- Generate secure secret with `openssl rand -base64 32`
- Configure BETTER_AUTH_SECRET in .env
- Install python-jose[cryptography]
- Test with curl and generated JWT token
- Verify with Swagger UI (/docs)

## Outcome

- ✅ Impact: Complete implementation plan for JWT authentication ready for task breakdown
- 🧪 Validation: Constitution check passed (8/8 gates), research completed, design finalized
- 📁 Files: 5 documentation files created, 3 config files updated
- 🔁 Next steps: Run `/sp.tasks` to generate testable task breakdown
- 🧠 Reflection: Plan is comprehensive and well-structured. Technology decisions are justified with clear trade-off analysis. The middleware + dependency injection pattern provides clean separation between authentication (401) and authorization (403) concerns. Performance budget of <50ms is achievable with python-jose[cryptography]. Ready for task breakdown phase.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASSED - All constitution gates verified, research completed, design finalized
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `/sp.tasks` to generate actionable, dependency-ordered tasks for implementing JWT authentication middleware, dependencies, route updates, and tests
