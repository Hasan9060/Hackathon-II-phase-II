# Research: JWT Authentication for Backend Task Service

**Feature**: 002-jwt-auth
**Date**: 2026-02-02
**Status**: Complete

## Technology Decisions

### 1. JWT Library: python-jose[cryptography]

**Decision**: Use python-jose[cryptography] for JWT handling in FastAPI

**Rationale**:
- Official FastAPI documentation recommends python-jose for JWT operations
- Supports HS256 algorithm (required for Better Auth compatibility)
- Cryptography backend provides secure signature verification
- Excellent FastAPI integration patterns with dependency injection
- Full type hints support for better IDE experience and mypy compatibility

**Alternatives Considered**:

| Library | Pros | Cons | Verdict |
|---------|------|------|---------|
| python-jose | FastAPI recommended, type-safe, extensive algorithm support | Slightly larger package size | ✅ Chosen |
| PyJWT | Lightweight, popular, PyCA maintained | Less intuitive API for FastAPI dependencies | ❌ Rejected |
| authlib | Comprehensive auth features | Overkill for JWT-only use case | ❌ Rejected |

**References**:
- FastAPI Security: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
- python-jose docs: https://python-jose.readthedocs.io/

---

### 2. Authentication Pattern: Middleware + Dependency Injection

**Decision**: Use middleware for authentication (JWT verification) and dependency injection for authorization (user_id matching)

**Rationale**:
- **Separation of concerns**: Middleware handles token verification (401 errors), dependencies handle user matching (403 errors)
- **Testability**: Each layer can be tested independently
- **FastAPI idiomatic**: Aligns with FastAPI's recommended patterns
- **Clear error differentiation**: 401 vs 403 provides better debugging without information leakage

**Implementation Pattern**:

```python
# Middleware layer (src/middleware/jwt.py)
@app.middleware("http")
async def jwt_auth_middleware(request: Request, call_next):
    # Extract token from Authorization: Bearer header
    # Verify signature with BETTER_AUTH_SECRET
    # Decode payload, extract user_id and email
    # Attach to request.state.user
    # Return 401 on any failure
    response = await call_next(request)
    return response

# Dependency layer (src/dependencies/auth.py)
async def get_current_user(
    request: Request,
    user_id: str  # From URL path
) -> AuthenticatedUser:
    # Pull user from request.state.user (set by middleware)
    # Verify user_id matches URL path user_id
    # Return 403 if mismatch
    # Return AuthenticatedUser if match
    pass

# Route usage
@router.get("/api/{user_id}/tasks")
def list_tasks(
    user_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    session: Session = Depends(get_session)
) -> List[TaskRead]:
    # current_user.user_id == user_id guaranteed by dependency
    return get_tasks_by_user(session, user_id)
```

**Alternatives Considered**:

| Pattern | Pros | Cons | Verdict |
|---------|------|------|---------|
| Middleware + Dependency | Separation of concerns, testable | More complex coordination | ✅ Chosen |
| Single Dependency | Simpler, single location | Mixes auth/authz concerns | ❌ Rejected |
| Custom Decorator | Familiar to some | Non-idiomatic FastAPI, harder to test | ❌ Rejected |

---

### 3. Token Transmission: Authorization Bearer Header

**Decision**: Use standard `Authorization: Bearer <token>` header for JWT transmission

**Rationale**:
- OAuth 2.0 / JWT standard (RFC 6750, RFC 8725)
- Default behavior for Better Auth JWT mode
- Explicit and transparent for debugging
- No CSRF vulnerability (vs cookies)
- Native support in FastAPI security schemes
- Works with all HTTP clients (curl, fetch, axios, etc.)

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlci0xMjMiLCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJpYXQiOjE3MzcyNjYwMDAsImV4cCI6MTczNzg3MDgwMH0.signature
```

**Alternatives Considered**:

| Method | Pros | Cons | Verdict |
|--------|------|------|---------|
| Bearer Header | Standard, secure, explicit | Manual header attachment required | ✅ Chosen |
| Cookie | Automatic transmission | CSRF vulnerability, stateful | ❌ Rejected |
| Query Param | Simple implementation | Logged in URLs, insecure | ❌ Rejected |

---

### 4. Error Response Format: Simple JSON

**Decision**: Use simple JSON error responses consistent with existing task API

**Rationale**:
- Consistent with existing FastAPI error responses (feature 001)
- Clear messages without revealing sensitive token details
- HTTP status codes provide primary categorization
- Frontend-friendly (easy to parse)
- Follows FastAPI default error response format

**Response Formats**:

```json
// 401 Unauthorized - Authentication failure
{
  "detail": "Could not validate credentials"
}

// 403 Forbidden - Authorization failure (user_id mismatch)
{
  "detail": "Access denied: user identity mismatch"
}
```

**Design Principles**:
- Generic error messages prevent information leakage
- Status codes differentiate error types (401 vs 403)
- Simple structure is easy to parse in any language
- Consistent with FastAPI's HTTPException behavior

**Alternatives Considered**:

| Format | Pros | Cons | Verdict |
|--------|------|------|---------|
| Simple JSON | Simple, consistent, frontend-friendly | Less structured | ✅ Chosen |
| RFC 7807 Problem Details | Standardized, verbose | More complex parsing | ❌ Rejected |
| FastAPI Default | Built-in | Inconsistent across endpoints | ❌ Rejected |

---

### 5. Better Auth JWT Compatibility

**Research Findings**:

Better Auth JWT plugin configuration:

```typescript
export const auth = betterAuth({
  database: adapter,
  emailAndPassword: { enabled: true },
  jwt: {
    enabled: true,
    expiresIn: "7d",  // Configurable expiry
  }
})
```

**JWT Payload Structure** (from Better Auth):
```json
{
  "user_id": "uuid-or-string",
  "email": "user@example.com",
  "iat": 1737266000,
  "exp": 1737870800
}
```

**Algorithm**: HS256 (HMAC-SHA256) by default

**Secret Configuration**:
- Both frontend and backend must share the same `BETTER_AUTH_SECRET`
- Environment variable: `BETTER_AUTH_SECRET`
- Recommended: 32+ characters, cryptographically random

---

## Performance Considerations

### Token Validation Latency Budget

**Requirement**: <50ms p95 latency for token validation (SC-005)

**Breakdown**:
- Token extraction from header: ~1ms
- JWT decode: ~5ms
- Signature verification (HS256): ~10-20ms
- Payload extraction: ~1ms
- User_id matching: ~1ms
- **Total estimated**: ~18-24ms (well under 50ms budget)

**Optimization Strategies**:
- Use python-jose with cryptography backend (fastest option)
- Cache decoded payload in request.state (no redundant decoding)
- Avoid expensive operations in middleware path

---

## Security Considerations

### Token Validation

1. **Algorithm Verification**: Only accept HS256 (reject "none" algorithm)
2. **Signature Verification**: Verify against BETTER_AUTH_SECRET
3. **Expiration Check**: Reject tokens where exp < now
4. **Issuer Validation**: Optionally verify issuer claim (if added)

### Error Messages

- Generic "Could not validate credentials" for 401 (prevents information leakage)
- No details about which validation step failed
- No token structure details in error responses

### Secret Management

- BETTER_AUTH_SECRET in environment variables only
- Never logged or exposed in error messages
- Minimum 32 characters recommended
- Use cryptographically secure random generation

---

## Integration Points

### Backend (This Feature)

- FastAPI application with JWT middleware
- Token verification using python-jose
- User isolation via user_id matching

### Frontend (Future Feature)

- Better Auth JWT plugin configuration
- Token extraction from session
- Authorization header attachment to API requests

---

## Open Questions

### Resolved

- ✅ Which JWT library? → python-jose[cryptography]
- ✅ Authentication pattern? → Middleware + Dependency
- ✅ Token transmission? → Authorization Bearer header
- ✅ Error format? → Simple JSON
- ✅ Better Auth compatibility? → Documented, HS256 algorithm

### Deferred to Future Features

- Token refresh mechanism (handled by Better Auth)
- Token revocation before expiry (handled by Better Auth)
- Frontend Better Auth configuration (separate feature)

---

## References

1. FastAPI Security Tutorial: https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/
2. python-jose Documentation: https://python-jose.readthedocs.io/
3. RFC 6750 - OAuth 2.0 Bearer Token Usage: https://datatracker.ietf.org/doc/html/rfc6750
4. RFC 8725 - JWT Best Practices: https://datatracker.ietf.org/doc/html/rfc8725
5. Better Auth Documentation: https://www.better-auth.com/docs
6. OWASP JWT Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html

---

**Research Status**: ✅ Complete
**All unknowns resolved**: Yes
**Ready for Phase 1 Design**: Yes
