---
id: "0003"
title: "generate frontend implementation plan"
stage: plan
date: 2026-02-02
surface: agent
model: glm-4.6
feature: 003-frontend-ui
branch: 003-frontend-ui
user: developer
command: /sp.plan
labels: ["planning", "frontend", "nextjs", "better-auth", "api-integration"]
links:
  spec: specs/003-frontend-ui/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-frontend-ui/plan.md
  - specs/003-frontend-ui/research.md
  - specs/003-frontend-ui/data-model.md
  - specs/003-frontend-ui/quickstart.md
  - specs/003-frontend-ui/contracts/api-client-contract.yaml
  - history/prompts/003-frontend-ui/0003-generate-frontend-implementation-plan.plan.prompt.md
tests:
  - Constitution check: All 8 gates passed
  - Phase 0 research: 8 research questions answered
  - Phase 1 design: Data model, API contracts, quickstart guide completed
---

## Prompt

- /sp.plan

Plan for implementing the Next.js frontend for the Todo application.

Step 1 — Next.js Project Setup
- Initialize Next.js 16+ with App Router
- Install Better Auth

Step 2 — Better Auth Configuration
- Configure authentication
- Enable JWT mode
- Set BETTER_AUTH_SECRET

Step 3 — Route Protection
- Create protected dashboard route
- Redirect unauthenticated users to signin

Step 4 — API Client Helper
- Create reusable fetch wrapper
- Attach JWT token from session
- Handle 401 errors globally

Step 5 — Dashboard UI
- Fetch tasks on load
- Display task list with completion state

Step 6 — Create Task Form
- Form submission to POST endpoint
- Refresh task list after creation

Step 7 — Update & Delete Actions
- Buttons for edit/delete
- Wire to PUT and DELETE endpoints

Step 8 — Toggle Completion
- Checkbox/button wired to PATCH endpoint

Step 9 — Loading and Error States
- Spinners during API calls
- Error messages on failure

Step 10 — Responsive Styling
- Ensure mobile and desktop compatibility

Deliverable:
A fully functional authenticated frontend that communicates securely
with the FastAPI backend and allows complete task management.

## Response snapshot

Created comprehensive implementation plan for Frontend Web Application with complete Phase 0 research and Phase 1 design:

**Phase 0: Research & Technology Decisions (8 Research Questions)**:
- RQ-1: Better Auth Integration - Official Next.js integration with App Router, server-side session management
- RQ-2: JWT Token Management - Centralized ApiClient class with fetch wrapper, automatic token attachment
- RQ-3: Route Protection - Next.js middleware for route-level protection with server-side session checks
- RQ-4: State Management - React Server Components for data fetching, client-side mutations with router refresh
- RQ-5: Responsive Design - Tailwind CSS 4+ with mobile-first breakpoints (320px+)
- RQ-6: Error Handling - React Suspense for loading, error boundaries for graceful error handling
- RQ-7: Form Validation - Controlled components with client-side validation
- RQ-8: Testing Strategy - Vitest (unit), React Testing Library (component), Playwright (e2e)

**Phase 1: Design & Contracts**:
- **Data Model**: TypeScript interfaces for Task, CreateTaskRequest, UpdateTaskRequest, AuthSession, API responses, UI state types
- **API Contracts**: OpenAPI 3.1 specification for all 6 endpoints (GET list, POST create, GET single, PUT update, DELETE, PATCH toggle)
- **Component Architecture**: Server Components for dashboard/data fetching, Client Components for forms/interactions
- **Project Structure**: New `frontend/` directory with App Router pages, components, lib (api-client, auth, utils)

**Constitution Check**: All 8 gates passed (Spec-First, No Manual Coding, Separation of Concerns, Security by Design, Contract-Driven, Environment Consistency, Stack Compliance, Stateless Auth)

**Architecture Decisions**:
- ADR-001: Server Components vs Client Components - Server for data fetching, client for interactivity
- ADR-002: API Client Pattern - Centralized ApiClient for consistent JWT handling
- ADR-003: Form Validation - Controlled components with real-time validation

**Dependencies**: Next.js 16+, React 19+, Better Auth, Tailwind CSS 4+, TypeScript 5.8+, Vitest, React Testing Library, Playwright

**Quickstart Guide**: Complete setup instructions with environment configuration, development workflow, troubleshooting

## Outcome

- ✅ Impact: Complete implementation plan for Next.js frontend with Better Auth JWT authentication, API client integration, and responsive task management UI
- 🧪 Tests: Constitution check passed (8/8 gates), research completed (8/8 questions), design artifacts created
- 📁 Files: 5 files created (plan.md, research.md, data-model.md, quickstart.md, contracts/api-client-contract.yaml), agent context updated
- 🔁 Next prompts: Run `/sp.tasks` to generate actionable implementation tasks for Claude Code execution
- 🧠 Reflection: Plan is complete with all technical decisions justified by research. All design artifacts align with constitution requirements. The plan enables deterministic code generation via Claude Code with clear file structure, type definitions, and API contracts. Ready for task breakdown and implementation.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASSED - All constitution gates verified, research questions answered with rationale, design artifacts complete
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Run `/sp.tasks` to generate implementation tasks organized by user story priority (P1-P6)
