# Implementation Plan: JWT Authentication for Backend Task Service

**Branch**: `002-jwt-auth` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-jwt-auth/spec.md`

## Summary

Implement JWT authentication middleware for the FastAPI Backend Task Service to secure all API endpoints. The system will verify JWT tokens issued by Better Auth using a shared `BETTER_AUTH_SECRET`, extract user identity from validated tokens, and enforce strict user isolation by comparing the JWT user_id with the URL path user_id. This creates a cryptographically secure authentication bridge between the Next.js frontend (using Better Auth) and the FastAPI backend.

**Technical Approach**:
- FastAPI dependency injection for JWT verification
- python-jose for JWT decoding and signature verification
- Request state middleware to attach authenticated user context
- Route-level authorization to verify user_id matching (JWT vs URL)
- Comprehensive error handling (401 for auth failures, 403 for authorization mismatches)

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: FastAPI 0.104+, python-jose[cryptography], PyJWT alternatives considered
**Storage**: Neon PostgreSQL (existing, no schema changes)
**Testing**: pytest 7.4+, httpx 0.25+ (existing), JWT fixture additions needed
**Target Platform**: Linux server (FastAPI production deployment)
**Project Type**: web (backend API service)
**Performance Goals**: <50ms p95 latency for token validation (per SC-005)
**Constraints**: Must integrate with existing task routes without breaking changes
**Scale/Scope**: 6 existing endpoints to protect, support for multiple concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Todo AI Chatbot Project - Required Gates:**

- [x] **Spec-First**: Feature specification approved before any implementation ✅ (spec.md exists and validated)
- [x] **No Manual Coding**: All code generated via Claude Code from approved specs ✅ (using /sp.implement workflow)
- [x] **Separation of Concerns**: Backend (FastAPI), Auth (Better Auth), Frontend (Next.js) boundaries maintained ✅ (JWT bridge maintains separation)
- [x] **Security by Design**: JWT verification on all protected endpoints; user isolation enforced ✅ (core requirement of this feature)
- [x] **Contract-Driven**: REST endpoints follow defined request/response contracts; OpenAPI docs accurate ✅ (existing contracts maintained)
- [x] **Environment Consistency**: BETTER_AUTH_SECRET shared across services; no hardcoded secrets ✅ (added to .env)
- [x] **Stack Compliance**: Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT mode ✅ (python-jose for JWT handling)
- [x] **Stateless Auth**: JWT tokens only; no session-based authentication ✅ (Better Auth JWT mode)

**All gates passed. Proceeding to Phase 0 research.**

## Project Structure

### Documentation (this feature)

```text
specs/002-jwt-auth/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - JWT library research
├── data-model.md        # Phase 1 output - JWT payload structure
├── quickstart.md        # Phase 1 output - Developer setup guide
├── contracts/           # Phase 1 output - OpenAPI security schemes
│   └── openapi-security.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── middleware/              # NEW - JWT verification middleware
│   │   ├── __init__.py
│   │   └── jwt.py              # JWT extraction, verification, error handling
│   ├── dependencies/            # NEW - FastAPI dependencies
│   │   ├── __init__.py
│   │   └── auth.py             # get_current_user() dependency
│   ├── models/
│   │   └── task.py             # Existing - no changes
│   ├── routes/
│   │   └── tasks.py            # MODIFY - add auth dependencies
│   ├── services/
│   │   └── task.py             # Existing - no changes
│   ├── config.py               # MODIFY - add BETTER_AUTH_SECRET
│   └── main.py                 # MODIFY - add error handlers
├── tests/
│   ├── unit/
│   │   └── test_jwt_middleware.py    # NEW - unit tests for JWT logic
│   └── integration/
│       └── test_jwt_auth.py          # NEW - auth integration tests
└── requirements.txt            # MODIFY - add python-jose

frontend/                       # Future - Better Auth JWT configuration
└── (out of scope for this feature)
```

**Structure Decision**: Web application structure with backend focus. This feature modifies only the FastAPI backend to add JWT verification. Frontend integration with Better Auth is deferred to a future feature. The middleware/ and dependencies/ directories follow FastAPI best practices for cross-cutting concerns.

## Complexity Tracking

> **No violations - all checkboxes passed**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

# Phase 0: Research & Technology Decisions

## Research Tasks

### 1. JWT Library Selection for FastAPI

**Question**: Which Python JWT library should we use for FastAPI integration?

**Options Considered**:
1. **python-jose[cryptography]** - Pure Python, extensive algorithm support
2. **PyJWT** - Lightweight, popular, maintained by PyCA
3. **authlib** - Comprehensive auth library (overkill for JWT-only)

**Decision**: **python-jose[cryptography]**

**Rationale**:
- FastAPI documentation recommends python-jose for JWT handling
- Supports all required algorithms (HS256 for Better Auth compatibility)
- Cryptography backend for secure signature verification
- Excellent FastAPI integration patterns available
- Type hints support for better IDE experience

**Alternatives Rejected**:
- PyJWT: Less intuitive API for FastAPI dependency injection
- authlib: Over-engineered for simple JWT verification use case

**References**:
- FastAPI Security docs: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- python-jose: https://python-jose.readthedocs.io/

### 2. FastAPI Authentication Pattern

**Question**: What's the best pattern for JWT authentication in FastAPI?

**Options Considered**:
1. **Middleware + Dependency Injection** - Middleware validates, dependency extracts user
2. **Dependency Injection Only** - Single dependency handles both
3. **Custom Decorator** - Route-level decorator (un-FastAPI-idiomatic)

**Decision**: **Middleware + Dependency Injection**

**Rationale**:
- **Middleware layer**: Handles JWT extraction, signature verification, error responses (401)
- **Dependency layer**: Extracts user from request.state, verifies user_id matching (403)
- Separation of concerns: Authentication (middleware) vs Authorization (dependency)
- Consistent with FastAPI best practices
- Easy to test in isolation
- Clear error path differentiation (401 vs 403)

**Implementation Pattern**:
```python
# Middleware: JWT verification
@app.middleware("http")
async def jwt_auth_middleware(request: Request, call_next):
    # Extract token from Authorization header
    # Verify signature with BETTER_AUTH_SECRET
    # Decode payload
    # Attach to request.state.user
    # Return 401 on failure
    pass

# Dependency: User extraction and authorization
async def get_current_user(request: Request) -> User:
    # Pull user from request.state
    # Verify user_id matches URL path
    # Return 403 on mismatch
    pass
```

**Alternatives Rejected**:
- Dependency only: Mixes authentication and authorization concerns
- Custom decorator: Not idiomatic FastAPI, harder to test

### 3. Token Storage and Transmission

**Question**: How should JWT tokens be transmitted from frontend to backend?

**Options Considered**:
1. **Authorization: Bearer header** - Standard OAuth2/JWT practice
2. **Cookie** - Automatic, vulnerable to CSRF
3. **Query parameter** - Insecure (logged in URLs)

**Decision**: **Authorization: Bearer header**

**Rationale**:
- OAuth 2.0 / JWT standard (RFC 6750, RFC 8725)
- Better Auth default for JWT mode
- Explicit, transparent for debugging
- No CSRF vulnerability
- Works with FastAPI's built-in security schemes

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Error Response Design

**Question**: What error response format for authentication/authorization failures?

**Options Considered**:
1. **RFC 7807 Problem Details** - Structured, verbose
2. **Simple JSON** - Minimal, flexible
3. **FastAPI default** - Inconsistent

**Decision**: **Simple JSON with clear messages**

**Rationale**:
- Consistent with existing task API error responses
- Clear messages without revealing sensitive details
- HTTP status codes provide primary categorization
- JSON format is frontend-friendly

**Response Formats**:
```json
// 401 Unauthorized - Missing/invalid token
{
  "detail": "Could not validate credentials"
}

// 403 Forbidden - User_id mismatch
{
  "detail": "Access denied: user identity mismatch"
}
```

### 5. Better Auth JWT Integration

**Question**: How to ensure Better Auth JWT compatibility?

**Research Findings**:
- Better Auth JWT plugin uses HS256 algorithm by default
- Token payload includes user.id and user.email by default
- Expiry configurable (7 days per spec assumption)
- Secret from BETTER_AUTH_SECRET environment variable

**Configuration Required** (Frontend - out of scope but documented):
```typescript
// Better Auth configuration (future)
export const auth = betterAuth({
  database: adapter,
  emailAndPassword: { enabled: true },
  jwt: {
    enabled: true,
    expiresIn: "7d",
    // BETTER_AUTH_SECRET must match backend
  }
})
```

---

# Phase 1: Design & Contracts

## Data Model

### JWT Payload Structure

**Entity**: JWT Token Payload (decoded)

```typescript
{
  "user_id": string,      // User's unique identifier
  "email": string,        // User's email address
  "iat": number,          // Issued at timestamp
  "exp": number           // Expiration timestamp
}
```

**Field Descriptions**:
- `user_id`: Primary identifier for user isolation, matched against URL path
- `email`: Secondary identifier, useful for debugging (not used for auth)
- `iat`: Issued at (Unix timestamp), validated by python-jose
- `exp`: Expiration (Unix timestamp), validated by python-jose

**Validation Rules**:
- Token must be signed with HS256 algorithm
- Signature must verify against BETTER_AUTH_SECRET
- Expiration must be in the future (exp > now)
- Issued at must be reasonable (iat <= now, with clock skew tolerance)

**State Transitions**:
- Valid → Invalid (expiration)
- Valid → Invalid (signature mismatch if secret rotated)
- No invalid → valid transition (tokens cannot be refreshed)

### User Context (Request State)

**Entity**: Authenticated User (attached to request.state)

```python
@dataclass
class AuthenticatedUser:
    user_id: str
    email: str
```

**Usage**:
- Attached to `request.state.user` by middleware
- Extracted by `get_current_user()` dependency
- Used for user_id matching against URL path

## API Contracts

### Security Scheme

**OpenAPI 3.1 Security Scheme**:

```yaml
securitySchemes:
  JWTAuth:
    type: http
    scheme: bearer
    bearerFormat: JWT
    description: JWT token issued by Better Auth
```

### Protected Endpoints

All existing task endpoints require JWT authentication:

| Method | Path | Security | Description |
|--------|------|----------|-------------|
| GET | `/api/{user_id}/tasks` | JWT | List user's tasks |
| POST | `/api/{user_id}/tasks` | JWT | Create task for user |
| GET | `/api/{user_id}/tasks/{task_id}` | JWT | Get specific task |
| PUT | `/api/{user_id}/tasks/{task_id}` | JWT | Update task |
| DELETE | `/api/{user_id}/tasks/{task_id}` | JWT | Delete task |
| PATCH | `/api/{user_id}/tasks/{task_id}/complete` | JWT | Toggle completion |

### Error Responses

**401 Unauthorized** - Authentication Failure

```json
{
  "detail": "Could not validate credentials"
}
```

Causes:
- Missing Authorization header
- Invalid token format (not JWT)
- Expired token
- Invalid signature
- Wrong scheme (e.g., "Basic" instead of "Bearer")

**403 Forbidden** - Authorization Failure

```json
{
  "detail": "Access denied: user identity mismatch"
}
```

Causes:
- user_id in JWT does not match user_id in URL path

### Contract Files

See `contracts/openapi-security.yaml` for complete OpenAPI specification with security schemes.

## Quickstart Guide

### Prerequisites

1. Python 3.11+ installed
2. Virtual environment created (`.venv`)
3. Dependencies installed (`pip install -r requirements.txt`)
4. Better Auth configured on frontend (future)

### Environment Setup

1. **Set BETTER_AUTH_SECRET** in `backend/.env`:

```bash
# Generate a secure random key (32+ characters recommended)
openssl rand -base64 32

# Add to .env
BETTER_AUTH_SECRET=<generated-secret>
```

2. **Verify DATABASE_URL** is configured (from feature 001):

```bash
# backend/.env
DATABASE_URL=postgresql://user:pass@host/database
BETTER_AUTH_SECRET=your-secret-key-here
```

### Installation

1. **Add JWT dependency** to `backend/requirements.txt`:

```text
python-jose[cryptography]>=3.3.0
```

2. **Install dependencies**:

```bash
cd backend
pip install -r requirements.txt
```

### Development

1. **Run backend with JWT verification**:

```bash
uvicorn src.main:app --reload --app-dir backend
```

2. **Test with valid JWT**:

```bash
# Get JWT token from Better Auth session (frontend)
# Then test API:
curl -H "Authorization: Bearer <jwt-token>" \
  http://localhost:8000/api/user-123/tasks
```

3. **Test authentication failure**:

```bash
# Missing token (should return 401)
curl http://localhost:8000/api/user-123/tasks

# Invalid token (should return 401)
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8000/api/user-123/tasks
```

4. **Test authorization failure**:

```bash
# Token for user-a, URL for user-b (should return 403)
curl -H "Authorization: Bearer <user-a-token>" \
  http://localhost:8000/api/user-b/tasks
```

### Testing

```bash
# Run all tests
pytest

# Run JWT-specific tests
pytest tests/unit/test_jwt_middleware.py
pytest tests/integration/test_jwt_auth.py

# Run with coverage
pytest --cov=src/middleware --cov=src/dependencies
```

## Architecture Decision Records

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

---

## Next Steps

After `/sp.plan` completes:

1. **Review this plan** - Verify technical decisions align with project needs
2. **Run `/sp.tasks`** - Generate testable task breakdown from this plan
3. **Run `/sp.implement`** - Execute tasks via Claude Code
4. **Test integration** - Verify JWT verification works with Better Auth tokens
5. **Update documentation** - Document frontend integration (future feature)

---

**Plan Status**: ✅ Complete (Phase 0 + Phase 1)
**Ready for**: `/sp.tasks` command
**Branch**: `002-jwt-auth`
**Created**: 2026-02-02
