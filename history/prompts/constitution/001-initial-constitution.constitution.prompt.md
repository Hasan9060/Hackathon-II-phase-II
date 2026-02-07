---
id: "001"
title: "Initial constitution - Todo AI Chatbot"
stage: constitution
date: 2026-02-02
surface: agent
model: glm-4.6
feature: none
branch: master
user: developer
command: /sp.constitution
labels: ["constitution", "governance", "spec-driven-development"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - history/prompts/constitution/001-initial-constitution.constitution.prompt.md
tests:
  - N/A (governance document)
---

## Prompt

- /sp.constitution

Project:  Full-Stack Todo Web Application

Core principles:
- Spec-first development (no implementation before specification approval)
- Deterministic generation via Claude Code using Spec-Kit Plus workflow
- Separation of concerns across backend, authentication bridge, and frontend
- Security by design (JWT verification and strict user isolation)
- Reproducibility (anyone can regenerate the project from specs and prompts alone)

Key standards:
- No manual coding — all code must be generated from specs via Claude Code
- Every feature must map to a defined API contract or UI behavior in the spec
- REST endpoints must strictly follow defined request/response contracts
- All data operations must enforce user ownership via authenticated user ID
- JWT verification must be enforced on every API request after authentication phase
- Environment variables and secrets must be consistently defined across services
- Clean architecture: models, routes, middleware, and services clearly separated
- OpenAPI documentation must correctly reflect implemented endpoints
- Responsive UI must reflect API behavior exactly (no hidden logic in frontend)

Constraints:
- Technology stack must be strictly followed:
  - Frontend: Next.js 16+ (App Router)
  - Backend: FastAPI (Python)
  - ORM: SQLModel
  - Database: Neon Serverless PostgreSQL
  - Authentication: Better Auth (JWT mode)
- Database must be persistent and cloud-hosted (Neon)
- All endpoints must be RESTful and user-scoped
- JWT secret must be shared via environment variable BETTER_AUTH_SECRET
- No session-based auth, only stateless JWT
- The system must work for multiple users concurrently
- Application must be fully runnable from environment setup + generated code only

Success criteria:
- Backend correctly performs CRUD operations with user isolation
- JWT tokens issued by Better Auth are successfully verified by FastAPI
- Unauthorized requests return 401 consistently
- Each user can only access and modify their own tasks
- Frontend successfully performs authenticated API calls
- Entire project can be regenerated using only:
  sp.constitution → sp.specify → plan → Claude Code
- Reviewers can trace every implementation decision back to the spec

## Response snapshot

Created initial constitution (v1.0.0) for Todo AI Chatbot project with:

**6 Core Principles:**
1. Spec-First Development (NON-NEGOTIABLE) - No implementation before spec approval
2. Deterministic Generation via Claude Code - No manual coding
3. Separation of Concerns - Backend, Auth Bridge, Frontend boundaries
4. Security by Design - JWT verification + user isolation enforced
5. Contract-Driven API Development - REST contracts + OpenAPI docs
6. Environment Consistency - BETTER_AUTH_SECRET shared across services

**Technology Stack Constraints:** Mandatory stack with version requirements (Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT mode)

**Development Standards:** Code organization, API contracts, frontend requirements, testing requirements

**Governance:** Amendment process, versioning policy (semantic), compliance review checklist

## Outcome

- ✅ Impact: Foundation for spec-driven development established
- 🧪 Tests: N/A (governance document)
- 📁 Files: Created .specify/memory/constitution.md (158 lines)
- 🔁 Next prompts: Run `/sp.specify` to create first feature specification
- 🧠 Reflection: Constitution enforces reproducible, spec-first workflow with security-first architecture

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin feature specification with `/sp.specify <feature-description>`
