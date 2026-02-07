<!--
  Sync Impact Report
  ==================
  Version change: (none) → 1.0.0
  Modified principles: N/A (initial constitution)
  Added sections:
    - Core Principles (6 principles)
    - Technology Stack Constraints
    - Development Standards
    - Governance
  Removed sections: N/A (initial constitution)
  Templates requiring updates:
    ✅ plan-template.md - Constitution Check section aligns with principles
    ✅ spec-template.md - Requirements section supports spec-first development
    ✅ tasks-template.md - Task organization supports no-manual-coding principle
    ⚠ CLAUDE.md - Contains project-specific agent guidance (complements this constitution)
  Follow-up TODOs: None
-->

# Todo AI Chatbot Constitution

## Core Principles

### I. Spec-First Development (NON-NEGOTIABLE)

No implementation shall begin before specification approval. All features MUST be specified, reviewed, and approved via `/sp.specify` before any code generation.

**Rationale**: Ensures all stakeholders align on requirements before investing implementation effort. Prevents rework and maintains traceability from business need to code.

### II. Deterministic Generation via Claude Code

All code MUST be generated via Claude Code using the Spec-Kit Plus workflow. No manual coding is permitted. The entire project MUST be reproducible from specifications and prompts alone.

**Workflow**: `sp.constitution → sp.specify → sp.plan → sp.tasks → Claude Code implementation`

**Rationale**: Ensures consistency, enables reproducibility, and allows reviewers to trace every implementation decision back to the spec.

### III. Separation of Concerns

Architecture MUST maintain clear boundaries between:
- **Backend** (FastAPI): REST API, JWT verification, business logic
- **Authentication Bridge** (Better Auth): JWT token issuance, session management
- **Frontend** (Next.js): UI, API consumption, user interaction

**Rationale**: Clean architecture enables independent testing, deployment, and maintenance of each layer.

### IV. Security by Design

JWT verification MUST be enforced on every API request after authentication. Strict user isolation MUST be enforced for all data operations. Every database query MUST filter by authenticated user ID.

**Rationale**: Prevents unauthorized data access. Users must only ever see their own data. Security is not an afterthought.

### V. Contract-Driven API Development

REST endpoints MUST strictly follow defined request/response contracts. OpenAPI documentation MUST correctly reflect implemented endpoints. Frontend MUST reflect API behavior exactly—no hidden logic in the frontend.

**Rationale**: Ensures frontend-backend alignment. Enables automated API documentation generation and validation.

### VI. Environment Consistency

Environment variables and secrets MUST be consistently defined across services. The JWT secret (`BETTER_AUTH_SECRET`) MUST be shared between Better Auth and FastAPI via environment configuration.

**Rationale**: Enables local development parity with production. Prevents secret leakage into code.

## Technology Stack Constraints

The following technologies are MANDATORY. Deviations require explicit constitution amendment:

| Component | Technology | Version Requirement |
|-----------|------------|---------------------|
| Frontend | Next.js | 16+ (App Router only) |
| Backend | FastAPI | Python 3.11+ |
| ORM | SQLModel | Latest stable |
| Database | Neon Serverless PostgreSQL | Persistent, cloud-hosted |
| Authentication | Better Auth | JWT mode (no sessions) |

### Database Constraints

- Database MUST be persistent and cloud-hosted (Neon)
- No local/in-memory databases for production
- All endpoints MUST be user-scoped
- System MUST support multiple concurrent users

### Authentication Constraints

- Stateless JWT tokens only—no session-based auth
- JWT secret shared via `BETTER_AUTH_SECRET` environment variable
- Better Auth issues tokens; FastAPI verifies them
- Unauthorized requests MUST return 401 consistently

## Development Standards

### Code Organization

Clean architecture MUST be maintained:

```
backend/
├── src/
│   ├── models/       # SQLModel entities
│   ├── routes/       # FastAPI route handlers
│   ├── middleware/   # JWT verification, error handling
│   └── services/     # Business logic
```

### API Contract Requirements

- Every endpoint MUST have defined request/response schemas
- OpenAPI documentation MUST auto-generate from code
- All endpoints MUST accept JWT in `Authorization: Bearer <token>` header
- All data operations MUST filter by `user_id` from decoded JWT

### Frontend Requirements

- All API calls MUST include JWT token in Authorization header
- UI MUST reflect API behavior exactly
- No business logic in frontend—state lives in database
- Responsive design for mobile and desktop

### Testing Requirements

- All features MUST map to defined API contracts or UI behaviors in spec
- User isolation MUST be tested (each user sees only their data)
- JWT verification MUST be tested (401 on missing/invalid tokens)
- CRUD operations MUST be tested per user scope

## Governance

### Amendment Process

1. Propose amendment with rationale
2. Update constitution version following semantic versioning
3. Propagate changes to all dependent templates
4. Document migration plan for existing code
5. Obtain approval before implementing

### Versioning Policy

- **MAJOR**: Backward-incompatible changes (e.g., removing principles, changing stack)
- **MINOR**: New principle added or materially expanded guidance
- **PATCH**: Clarifications, wording fixes, non-semantic refinements

### Compliance Review

All pull requests MUST verify:
- ✅ Code generated from approved spec only
- ✅ No manual coding violations
- ✅ JWT verification on all protected endpoints
- ✅ User isolation enforced on all data operations
- ✅ OpenAPI docs match implemented contracts
- ✅ Environment variables properly configured

### Runtime Guidance

Use `CLAUDE.md` for project-specific agent guidance and `history/adr/` for architectural decision records.

**Version**: 1.0.0 | **Ratified**: 2026-02-02 | **Last Amended**: 2026-02-02
