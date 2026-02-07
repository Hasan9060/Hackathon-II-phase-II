---
name: auth-skill
description: Handle secure user authentication flows including signup, signin, password hashing, JWT tokens, and Better Auth integration. Use for identity and access management features.
---

# AUTH Skill – Secure Authentication & Identity

## Instructions

1. **User Signup**
   - Validate input (email, password, optional profile fields)
   - Enforce strong password rules
   - Hash passwords before storage
   - Never store or log plaintext credentials

2. **User Signin**
   - Verify credentials using secure hash comparison
   - Prevent timing attacks
   - Return clear but non-revealing error messages
   - Support stateless authentication flows

3. **Password Hashing**
   - Use industry-standard hashing algorithms (e.g. bcrypt, argon2)
   - Include salting and appropriate cost factors
   - Ensure hash verification is constant-time
   - Never re-hash or downgrade existing hashes

4. **JWT Tokens**
   - Generate signed JWTs with a shared secret
   - Include minimal required claims (user_id, email, exp)
   - Enforce token expiration and validation
   - Reject expired, malformed, or unsigned tokens

5. **Better Auth Integration**
   - Use Better Auth on the frontend for session handling
   - Enable JWT plugin to issue tokens
   - Attach JWTs to API requests via `Authorization: Bearer`
   - Verify JWTs independently on the backend

## Security Rules

- Assume frontend input is untrusted
- Backend must always verify JWTs
- Secrets must come from environment variables
- Fail closed: unauthenticated requests return **401/403**
- Enforce user ownership on every protected operation

## Best Practices

- Use stateless authentication for scalability
- Keep JWT payloads small
- Rotate secrets periodically
- Apply auth middleware consistently
- Log auth events without sensitive data
- Test auth flows for edge cases and abuse scenarios

## Example Flow

```text
Signup → Hash Password → Store User
Signin → Verify Hash → Issue JWT
Request → Attach JWT → Backend Verifies → Authorize Action
