# Data Model: JWT Authentication for Backend Task Service

**Feature**: 002-jwt-auth
**Date**: 2026-02-02
**Status**: Complete

## Overview

This feature introduces JWT (JSON Web Token) authentication to secure the Backend Task Service API. No database schema changes are required—all authentication state is carried in the JWT token itself (stateless authentication).

## Entities

### 1. JWT Token Payload (Stateless)

**Type**: Decoded JWT Claims
**Storage**: Transmitted via Authorization header, not persisted
**Source**: Better Auth JWT plugin

```typescript
// JWT Token Structure (decoded)
interface JWTPayload {
  // Registered Claims
  iat: number;      // Issued At - Unix timestamp when token was created
  exp: number;      // Expiration - Unix timestamp when token expires

  // Custom Claims (Better Auth)
  user_id: string;  // User's unique identifier (UUID or string)
  email: string;    // User's email address
}
```

**Encoded Format**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci0xMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzcyNjYwMDAsImV4cCI6MTczNzg3MDgwMH0.signature
^ Header ^                                              ^ Payload                                                                  ^ Signature
```

**Field Descriptions**:

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `user_id` | string | Primary user identifier, used for data isolation | Better Auth user.id |
| `email` | string | User's email address, secondary identifier | Better Auth user.email |
| `iat` | number | Issued At timestamp (Unix epoch seconds) | Set by JWT library |
| `exp` | number | Expiration timestamp (Unix epoch seconds, ~7 days from iat) | Configured in Better Auth |

**Validation Rules**:

1. **Signature**: Must verify against `BETTER_AUTH_SECRET` using HS256 algorithm
2. **Expiration**: `exp > current_time` (token not expired)
3. **Algorithm**: Must be HS256 (reject "none" or other algorithms)
4. **Format**: Must be valid JWT structure (header.payload.signature)

**State Transitions**:

```
[Valid Token]
    ↓
[Token Expires (exp < now)]
    ↓
[Invalid Token]
    ↓
[Client must obtain new token from Better Auth]
```

**Important**: Tokens cannot transition from invalid back to valid. Token refresh is handled by Better Auth, not this backend feature.

---

### 2. Authenticated User (Request State)

**Type**: Python dataclass
**Storage**: `request.state.user` (FastAPI request state)
**Lifetime**: Single HTTP request

```python
from dataclasses import dataclass
from typing import Optional

@dataclass
class AuthenticatedUser:
    """Authenticated user extracted from verified JWT token."""
    user_id: str
    email: str
```

**Lifecycle**:

1. **Created**: JWT middleware decodes token, creates `AuthenticatedUser`, attaches to `request.state.user`
2. **Used**: Dependencies extract user from `request.state`, verify user_id matching
3. **Destroyed**: End of HTTP request (request state is transient)

**Usage Pattern**:

```python
# Middleware sets request.state.user
request.state.user = AuthenticatedUser(
    user_id=payload["user_id"],
    email=payload["email"]
)

# Dependency extracts and verifies
async def get_current_user(request: Request, user_id: str) -> AuthenticatedUser:
    authenticated_user = request.state.user
    if authenticated_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied: user identity mismatch")
    return authenticated_user
```

---

## Relationships

```
[JWT Token]
    ↓ (decoded by middleware)
[AuthenticatedUser in request.state]
    ↓ (extracted by dependency)
[Route Handler with verified user identity]
    ↓ (passed to service layer)
[Database Query filtered by user_id]
```

**Key Point**: The `user_id` from JWT payload is used for database queries, NOT the `user_id` from URL path. The URL `user_id` is only for authorization matching.

---

## Database Schema

### No Schema Changes Required

This feature does not modify the database schema. The existing `tasks` table from feature 001 remains unchanged:

```sql
-- Existing table (unchanged)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Existing index (unchanged)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
```

**Why no schema changes?**
- JWT tokens are stateless—no session table needed
- User authentication is handled by Better Auth (separate service)
- User identity is carried in the token, not stored in backend database

---

## Data Flow Diagram

```
┌─────────────┐
│   Client    │
│  (Next.js)  │
└──────┬──────┘
       │ 1. Request with JWT token
       │    Authorization: Bearer <token>
       ▼
┌─────────────────────────────────────────┐
│         FastAPI Middleware              │
│  (src/middleware/jwt.py)                │
│                                         │
│  2. Extract token from header           │
│  3. Verify signature (BETTER_AUTH_SECRET)│
│  4. Decode payload                      │
│  5. Create AuthenticatedUser            │
│  6. Attach to request.state.user        │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│      FastAPI Dependency                 │
│   (src/dependencies/auth.py)            │
│                                         │
│  7. Extract user from request.state     │
│  8. Compare JWT user_id vs URL user_id  │
│  9. Return 403 if mismatch              │
│ 10. Return AuthenticatedUser if match   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│       Route Handler                     │
│  (src/routes/tasks.py)                  │
│                                         │
│ 11. Receive authenticated user          │
│ 12. Use user_id for database queries    │
│ 13. Return filtered results             │
└─────────────────────────────────────────┘
```

---

## Security Model

### Authentication vs Authorization

**Authentication** (Middleware):
- Verifies token is valid (signature, expiration, format)
- Returns 401 if authentication fails
- Sets `request.state.user` on success

**Authorization** (Dependency):
- Verifies user_id in JWT matches user_id in URL
- Returns 403 if authorization fails
- Provides `AuthenticatedUser` to route handler

### User Isolation

All database queries use `user_id` from the JWT payload, NOT the URL:

```python
# ✅ CORRECT - Use user_id from JWT
@router.get("/api/{user_id}/tasks")
def list_tasks(
    user_id: str,  # From URL - for authorization only
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Use current_user.user_id for database query
    return get_tasks_by_user(session, current_user.user_id)

# ❌ WRONG - Never use URL user_id for queries
def list_tasks_wrong(user_id: str, session: Session):
    return get_tasks_by_user(session, user_id)  # Security vulnerability!
```

---

## Error States

| Error | Cause | Response | User Message |
|-------|-------|----------|--------------|
| Missing token | No Authorization header | 401 | "Could not validate credentials" |
| Invalid format | Not a valid JWT | 401 | "Could not validate credentials" |
| Expired token | exp < now | 401 | "Could not validate credentials" |
| Bad signature | Secret mismatch | 401 | "Could not validate credentials" |
| User mismatch | JWT user_id ≠ URL user_id | 403 | "Access denied: user identity mismatch" |

**Important**: All 401 errors return the same generic message to prevent information leakage about token structure.

---

## Performance Considerations

### Token Validation Cost

- **Decode**: ~5ms (JWT parsing)
- **Signature verify**: ~10-20ms (HS256 with cryptography backend)
- **User extraction**: ~1ms (dataclass creation)
- **User matching**: ~1ms (string comparison)
- **Total**: ~17-27ms per request (well under 50ms budget per SC-005)

### Optimization

- No database queries for authentication (stateless)
- Decoded user cached in `request.state` (single decode per request)
- Fast path after middleware sets request state

---

## Testing Data Model

### Unit Tests

- Test JWT decode with valid token
- Test JWT decode with expired token
- Test JWT decode with invalid signature
- Test JWT decode with malformed format
- Test user_id matching logic

### Integration Tests

- Test full request flow with valid token
- Test authentication failure (401)
- Test authorization failure (403)
- Test concurrent requests with same token

---

## Migration Notes

### From Feature 001 (No Auth) to Feature 002 (JWT Auth)

**Breaking Changes**: None for authenticated clients

**Route Changes**:
- Routes remain same structure: `/api/{user_id}/tasks`
- Routes now require Authorization header
- Routes now verify user_id matching

**Client Migration**:
1. Obtain JWT token from Better Auth
2. Add `Authorization: Bearer <token>` to all requests
3. Handle 401 responses (re-authenticate)
4. Handle 403 responses (authorization error)

**Backward Compatibility**: None—this is a security feature. All clients must authenticate.

---

## OpenAPI Documentation

The JWT security scheme will be documented in OpenAPI:

```yaml
components:
  securitySchemes:
    JWTAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: JWT token issued by Better Auth

security:
  - JWTAuth: []
```

---

**Data Model Status**: ✅ Complete
**Schema Changes Required**: None
**Migration Required**: Client-side auth integration only
