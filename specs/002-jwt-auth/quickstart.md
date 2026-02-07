# Quickstart Guide: JWT Authentication for Backend Task Service

**Feature**: 002-jwt-auth
**Last Updated**: 2026-02-02

This guide helps you set up and test JWT authentication on the FastAPI Backend Task Service.

## Prerequisites

1. **Python 3.11+** installed
2. **Virtual environment** created (`.venv/` directory)
3. **Feature 001 complete** - Backend Task Service already running
4. **PostgreSQL client** (optional, for manual database verification)

## Step 1: Environment Configuration

### 1.1 Generate a Secure Secret

Generate a cryptographically secure random key for JWT signing:

```bash
# Option 1: Using OpenSSL (recommended)
openssl rand -base64 32

# Option 2: Using Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Option 3: Using /dev/urandom (Linux/Mac)
cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1
```

### 1.2 Configure Environment Variables

Edit `backend/.env` and add the `BETTER_AUTH_SECRET`:

```bash
# backend/.env

# Database Configuration (from feature 001)
DATABASE_URL=postgresql://neondb_owner:npg_LEi7MgSQF4kJ@ep-round-meadow-ahd4gnui-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Authentication (NEW for feature 002)
# IMPORTANT: Replace with your generated secure key
BETTER_AUTH_SECRET=your-generated-secret-key-here-32chars-min
```

**Security Note**: In production, use a different secret than development. Never commit `.env` to version control.

## Step 2: Install Dependencies

### 2.1 Add JWT Library to Requirements

Add `python-jose` to `backend/requirements.txt`:

```text
# FastAPI and Web Framework
fastapi>=0.104.0
uvicorn[standard]>=0.24.0

# Database
sqlmodel>=0.0.14
sqlalchemy>=2.0.0
psycopg2-binary>=2.9.9

# Environment Configuration
python-dotenv>=1.0.0

# JWT Authentication (NEW)
python-jose[cryptography]>=3.3.0

# Testing
pytest>=7.4.0
httpx>=0.25.0
```

### 2.2 Install Dependencies

```bash
# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate   # Windows

# Install dependencies
pip install -r backend/requirements.txt
```

## Step 3: Run the Backend Server

```bash
# From repository root
uvicorn src.main:app --reload --app-dir backend
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Note**: The JWT middleware will reject all requests without a valid token.

## Step 4: Test JWT Authentication

### 4.1 Generate a Test JWT Token

For testing, you can generate a JWT token using Python:

```bash
# Create a test token generation script
cat > generate_test_token.py << 'EOF'
from jose import jwt
from datetime import datetime, timedelta

# Your BETTER_AUTH_SECRET from .env
SECRET = "your-generated-secret-key-here-32chars-min"

# Token payload
payload = {
    "user_id": "test-user-123",
    "email": "test@example.com",
    "iat": int(datetime.now().timestamp()),
    "exp": int((datetime.now() + timedelta(days=7)).timestamp())
}

# Generate token
token = jwt.encode(payload, SECRET, algorithm="HS256")
print(token)
EOF

# Run the script (update SECRET first)
python3 generate_test_token.py
```

Copy the generated token for testing.

### 4.2 Test with Valid JWT (Should Return 200)

```bash
# Replace <your-token> with the actual JWT from step 4.1
curl -H "Authorization: Bearer <your-token>" \
  http://localhost:8000/api/test-user-123/tasks
```

**Expected Response**: Empty array `[]` (no tasks yet) or list of tasks

### 4.3 Test Authentication Failure (Should Return 401)

**Test 1: Missing Token**
```bash
curl http://localhost:8000/api/test-user-123/tasks
```
**Expected Response**: `{"detail":"Could not validate credentials"}` (Status: 401)

**Test 2: Invalid Token**
```bash
curl -H "Authorization: Bearer invalid-token" \
  http://localhost:8000/api/test-user-123/tasks
```
**Expected Response**: `{"detail":"Could not validate credentials"}` (Status: 401)

**Test 3: Wrong Scheme**
```bash
curl -H "Authorization: Basic <your-token>" \
  http://localhost:8000/api/test-user-123/tasks
```
**Expected Response**: `{"detail":"Could not validate credentials"}` (Status: 401)

### 4.4 Test Authorization Failure (Should Return 403)

Generate a token for a different user:

```bash
# Create token for user-a
python3 -c "
from jose import jwt
from datetime import datetime, timedelta
payload = {
    'user_id': 'user-a',
    'email': 'usera@example.com',
    'iat': int(datetime.now().timestamp()),
    'exp': int((datetime.now() + timedelta(days=7)).timestamp())
}
print(jwt.encode(payload, 'your-secret', algorithm='HS256'))
"
```

Now try to access user-b's tasks with user-a's token:

```bash
# Token for user-a, URL for user-b (should return 403)
curl -H "Authorization: Bearer <user-a-token>" \
  http://localhost:8000/api/user-b/tasks
```

**Expected Response**: `{"detail":"Access denied: user identity mismatch"}` (Status: 403)

## Step 5: Run Tests

### 5.1 Run All Tests

```bash
# From repository root
pytest
```

### 5.2 Run JWT-Specific Tests

```bash
# Unit tests for JWT middleware
pytest tests/unit/test_jwt_middleware.py -v

# Integration tests for JWT authentication
pytest tests/integration/test_jwt_auth.py -v
```

### 5.3 Run with Coverage

```bash
pytest --cov=src/middleware --cov=src/dependencies --cov-report=html
```

Open `htmlcov/index.html` in a browser to view coverage report.

## Step 6: Verify OpenAPI Documentation

Visit the Swagger UI in your browser:

```
http://localhost:8000/docs
```

**What to Check**:
- All endpoints show a "lock" icon (secured)
- "Authorize" button is available at the top
- Click "Authorize" and enter `Bearer <your-token>` to test interactively
- All requests include the JWT token automatically after authorization

## Step 7: Integration with Frontend (Future)

When you implement the Next.js frontend with Better Auth:

### 7.1 Configure Better Auth

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth"
import { postgresAdapter } from "better-auth/adapters/postgres"

export const auth = betterAuth({
  database: postgresAdapter(db),
  emailAndPassword: { enabled: true },
  jwt: {
    enabled: true,
    expiresIn: "7d",
  },
})
```

### 7.2 Create API Client Helper

```typescript
// lib/api.ts
import { auth } from "./auth"

async function apiRequest(url: string, options: RequestInit = {}) {
  const session = await auth.api.getSession()
  const token = session?.token

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// Usage
const tasks = await apiRequest("/api/user-123/tasks")
```

## Troubleshooting

### Issue: "Could not validate credentials" (401)

**Possible Causes**:
1. Missing Authorization header
2. Token format incorrect (not JWT)
3. Token expired
4. BETTER_AUTH_SECRET mismatch between token generation and verification

**Solutions**:
1. Add `Authorization: Bearer <token>` header
2. Verify token is valid JWT format (three parts separated by dots)
3. Generate a fresh token (check `exp` claim)
4. Ensure `BETTER_AUTH_SECRET` is identical in both places

### Issue: "Access denied: user identity mismatch" (403)

**Cause**: user_id in JWT does not match user_id in URL

**Solution**: Ensure URL path user_id matches the authenticated user's ID

### Issue: Import errors for `jose`

**Cause**: `python-jose` not installed

**Solution**:
```bash
pip install python-jose[cryptography]
```

### Issue: Token validation is slow

**Cause**: Using pure Python backend instead of cryptography

**Solution**:
```bash
pip install python-jose[cryptography]  # Note the [cryptography] extra
```

## Production Checklist

Before deploying to production:

- [ ] Generate a production `BETTER_AUTH_SECRET` (32+ characters, cryptographically random)
- [ ] Set `BETTER_AUTH_SECRET` in production environment variables
- [ ] Verify frontend and backend use the same secret
- [ ] Enable HTTPS (JWT tokens should only be transmitted over TLS)
- [ ] Set appropriate token expiry (7 days default)
- [ ] Configure CORS to restrict origins
- [ ] Test token refresh flow with Better Auth
- [ ] Set up monitoring for authentication failures (401/403 rates)
- [ ] Document token expiry handling for frontend developers

## Next Steps

After completing this quickstart:

1. ✅ Backend JWT authentication is working
2. ✅ You can test all endpoints with valid tokens
3. ✅ Authentication and authorization errors are handled correctly
4. 👉 **Next**: Implement frontend with Better Auth integration
5. 👉 **Next**: Add token refresh handling
6. 👉 **Next**: Deploy to production with HTTPS

---

**Quickstart Status**: ✅ Complete
**Ready for Development**: Yes
**Ready for Production**: After production checklist completed
