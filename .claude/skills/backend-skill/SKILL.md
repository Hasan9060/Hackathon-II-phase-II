---
name: backend-skill
description: Generate backend routes, handle HTTP requests and responses, and connect to databases. Use for API and server-side feature development.
---

# Backend Skill – API & Data Layer

## Instructions

1. **Route Generation**
   - Define clear, RESTful API endpoints
   - Use consistent URL structures and HTTP methods
   - Group routes by feature or resource
   - Apply versioning when required

2. **Request Handling**
   - Validate incoming request data
   - Parse path, query, and body parameters correctly
   - Handle authentication and authorization at the middleware level
   - Return appropriate HTTP status codes

3. **Response Handling**
   - Use structured, predictable JSON responses
   - Separate success and error response formats
   - Avoid leaking internal errors or sensitive data
   - Include pagination and metadata where applicable

4. **Database Connectivity**
   - Establish secure database connections
   - Use an ORM or query layer for all DB operations
   - Handle transactions and rollbacks safely
   - Ensure connections are properly managed and closed

## Best Practices

- Keep routes thin; move logic to service layers
- Validate all external input
- Use environment variables for configuration
- Apply consistent error handling patterns
- Log server events without sensitive data
- Write idempotent and stateless APIs where possible

## Example Route Structure

```text
GET    /api/resources        → List resources
POST   /api/resources        → Create resource
GET    /api/resources/{id}   → Get resource
PUT    /api/resources/{id}   → Update resource
DELETE /api/resources/{id}   → Delete resource
