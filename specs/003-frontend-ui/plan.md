# Implementation Plan: Frontend Web Application — Authenticated Todo UI

**Branch**: `003-frontend-ui` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-frontend-ui/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive Next.js 16+ web interface with App Router that integrates Better Auth for user authentication and communicates with the FastAPI backend via JWT-secured REST API. The application will provide authenticated users with a task management dashboard supporting full CRUD operations (Create, Read, Update, Delete, Toggle Completion) with proper loading states, error handling, and responsive design for mobile and desktop.

**Technical Approach**: Client-side rendering with React Server Components for data fetching, centralized API client wrapper for JWT token management, route-based protection using middleware, and Tailwind CSS for responsive styling.

## Technical Context

**Language/Version**: TypeScript 5.8+, JavaScript ES2022
**Primary Dependencies**: Next.js 16+, Better Auth (latest), React 19+, Tailwind CSS 4+
**Storage**: No client-side storage (session via Better Auth cookies)
**Testing**: Vitest, React Testing Library, Playwright
**Target Platform**: Modern web browsers (Chrome 120+, Firefox 120+, Safari 17+, Edge 120+)
**Project Type**: Web application (frontend only - backend exists separately)
**Performance Goals**: <100ms Time to Interactive, <2s API response reflection, 95% first-attempt success rate
**Constraints**: JWT token from Better Auth session, must handle 401 by redirecting to signin, responsive from 320px+
**Scale/Scope**: 6 user stories (P1-P6), 24 functional requirements, 11 success criteria, single-page dashboard + auth flows

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Todo AI Chatbot Project - Required Gates:**

- [x] **Spec-First**: Feature specification approved before any implementation (spec.md created and validated)
- [x] **No Manual Coding**: All code generated via Claude Code from approved specs (plan enables Claude Code implementation)
- [x] **Separation of Concerns**: Backend (FastAPI), Auth (Better Auth), Frontend (Next.js) boundaries maintained (frontend consumes backend API only)
- [x] **Security by Design**: JWT verification on all protected endpoints; user isolation enforced (frontend extracts user_id from session, not URL)
- [x] **Contract-Driven**: REST endpoints follow defined request/response contracts; OpenAPI docs accurate (contracts defined in Phase 1)
- [x] **Environment Consistency**: BETTER_AUTH_SECRET shared across services; no hardcoded secrets (environment configuration documented)
- [x] **Stack Compliance**: Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL, Better Auth JWT mode (Next.js 16 with App Router confirmed)
- [x] **Stateless Auth**: JWT tokens only; no session-based authentication (Better Auth configured for JWT mode)

**Gate Status**: ✅ ALL GATES PASSED - No violations requiring justification

## Project Structure

### Documentation (this feature)

```text
specs/003-frontend-ui/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── api-client-contract.yaml
├── checklists/
│   └── requirements.md  # Requirements quality checklist
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/               # New directory for Next.js application
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── (auth)/     # Authentication route group
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   ├── dashboard/  # Protected dashboard route
│   │   ├── layout.tsx  # Root layout with providers
│   │   └── page.tsx    # Landing page
│   ├── components/     # React components
│   │   ├── ui/         # Reusable UI components
│   │   ├── tasks/      # Task-specific components
│   │   └── auth/       # Auth-related components
│   ├── lib/            # Utility libraries
│   │   ├── api-client.ts   # API client with JWT handling
│   │   ├── auth.ts         # Better Auth client
│   │   └── utils.ts        # General utilities
│   └── styles/         # Global styles
├── public/             # Static assets
├── tests/              # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.local          # Environment variables (gitignored)
├── .env.example        # Environment variable template
├── next.config.ts      # Next.js configuration
├── tailwind.config.ts  # Tailwind CSS configuration
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts

backend/                # Existing FastAPI backend (unchanged)
└── ...
```

**Structure Decision**: Web application structure selected. Frontend is a new `frontend/` directory at repository root, separate from existing `backend/`. This maintains clear separation of concerns per constitution while keeping both parts in the same repository for monorepo convenience.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | No violations | All gates passed |

---

# Phase 0: Research & Technology Decisions

## Research Questions

### RQ-1: Better Auth Integration with Next.js App Router

**Question**: How to integrate Better Auth for JWT-based authentication in a Next.js 16+ App Router application?

**Research Findings**:
- **Decision**: Use Better Auth's official Next.js integration with App Router
- **Rationale**: Better Auth provides first-class support for Next.js App Router with server-side session management and client-side utilities
- **Implementation Pattern**:
  - Install `better-auth` package
  - Configure auth server instance in `lib/auth.ts`
  - Wrap application with auth providers in root layout
  - Use middleware for route protection
  - Access session via `authClient.getSession()` on server and `useSession()` hook on client
- **Alternatives Considered**:
  - NextAuth.js: Rejected due to requirement for Better Auth specifically
  - Custom auth implementation: Rejected due to constitution requirement for Better Auth

### RQ-2: JWT Token Management for API Requests

**Question**: How to extract and attach JWT tokens from Better Auth session to outbound API requests?

**Research Findings**:
- **Decision**: Create centralized API client that extracts JWT from Better Auth session and attaches to Authorization header
- **Rationale**: Centralized client ensures consistent token handling, automatic 401 redirect, and DRY error handling
- **Implementation Pattern**:
  - Create `lib/api-client.ts` with fetch wrapper
  - On server: Get session via `await authClient.getSession()` to extract token
  - On client: Use cookies to access session token (Better Auth sets httpOnly cookie)
  - Attach `Authorization: Bearer <token>` to all requests
  - Handle 401 by redirecting to signin page
- **Alternatives Considered**:
  - Per-request token extraction: Rejected due to code duplication
  - Axios interceptors: Rejected to minimize dependencies (fetch is sufficient)

### RQ-3: Route Protection Strategy

**Question**: How to protect dashboard routes and redirect unauthenticated users to signin?

**Research Findings**:
- **Decision**: Use Next.js middleware for route-level protection combined with server-side session checks
- **Rationale**: Middleware runs before route handlers, enabling early redirects and preventing unauthorized page rendering
- **Implementation Pattern**:
  - Create `middleware.ts` at project root
  - Define protected routes pattern (e.g., `/dashboard/*`)
  - Check session via `authClient.getSession()` in middleware
  - Redirect to signin if no valid session
  - Use App Router's route groups `(auth)` for public auth pages
- **Alternatives Considered**:
  - Client-side only protection: Rejected due to flicker and security concerns
  - HOC pattern: Rejected due to App Router conventions (middleware is preferred)

### RQ-4: State Management for Task List

**Question**: How to manage task list state and keep UI in sync with API?

**Research Findings**:
- **Decision**: Use React Server Components for initial data fetch with client-side mutations and optimistic updates
- **Rationale**: Server Components provide better performance (no client JS for initial render), client-side mutations enable instant UI feedback
- **Implementation Pattern**:
  - Dashboard page is Server Component that fetches tasks on server
  - Pass tasks as props to client components for interactions
  - Mutations (create, update, delete, toggle) use client-side API calls
  - Use `useRouter.refresh()` to revalidate Server Component data after mutations
  - Loading states handled via React Suspense
- **Alternatives Considered**:
  - Full client-side fetching with SWR/React Query: Rejected as overkill for simple CRUD
  - Full server-side only: Rejected due to poor interactivity (full page reloads)

### RQ-5: Responsive Design Approach

**Question**: How to implement responsive design for mobile (320px+) and desktop?

**Research Findings**:
- **Decision**: Use Tailwind CSS 4+ with mobile-first responsive breakpoints
- **Rationale**: Tailwind provides utility-first approach, excellent mobile support, and zero runtime CSS-in-JS overhead
- **Implementation Pattern**:
  - Use `sm:` breakpoint for mobile (640px+)
  - Use `md:` and `lg:` breakpoints for tablet/desktop
  - Default styles target mobile (320px+)
  - Task cards use single column on mobile, multi-column on desktop
  - Forms stack vertically on mobile, horizontal on desktop
- **Alternatives Considered**:
  - CSS Modules: Rejected due to more verbose class names
  - Styled Components: Rejected due to runtime overhead

### RQ-6: Error Handling and Loading States

**Question**: How to display loading indicators and error messages for API operations?

**Research Findings**:
- **Decision**: Use React Suspense for loading states and error boundaries for error handling
- **Rationale**: Suspense provides built-in loading state management, error boundaries catch component errors gracefully
- **Implementation Pattern**:
  - Wrap Server Components with `<Suspense fallback={<LoadingSkeleton />}>`
  - Create `<LoadingSkeleton />` components for each page
  - Use error boundaries to catch and display error messages
  - Client-side mutations use boolean loading states
  - Display toast notifications for operation success/failure
- **Alternatives Considered**:
  - Manual loading flags: Rejected due to boilerplate
  - Global loading store: Rejected as unnecessary complexity

### RQ-7: Form Validation Strategy

**Question**: How to validate task creation/edit forms with immediate feedback?

**Research Findings**:
- **Decision**: Use controlled form components with client-side validation + API validation
- **Rationale**: Controlled components provide real-time validation, API validation ensures backend constraints enforced
- **Implementation Pattern**:
  - Forms use React state for field values
  - Validate on change (real-time feedback)
  - Show error messages inline below fields
  - Disable submit button while validation fails
  - API validates on submission and returns 422 for validation errors
- **Alternatives Considered**:
  - React Hook Form: Rejected as overkill for simple 2-field forms
  - Zod schema validation: Rejected as unnecessary complexity for client-side only

### RQ-8: Testing Strategy

**Question**: How to test the frontend application effectively?

**Research Findings**:
- **Decision**: Multi-layer testing with Vitest (unit), React Testing Library (component), and Playwright (e2e)
- **Rationale**: Unit tests for utilities, component tests for UI logic, e2e tests for critical user journeys
- **Implementation Pattern**:
  - Unit tests for `api-client.ts` and utility functions
  - Component tests for task components using React Testing Library
  - Integration tests for API client + auth session interaction
  - E2e tests for critical paths: signin, view tasks, create task, delete task
- **Alternatives Considered**:
  - Jest: Rejected in favor of Vitest (faster, native ESM)
  - Cypress: Rejected in favor of Playwright (better multi-browser support)

---

# Phase 1: Design & Contracts

## Data Model

### Frontend Data Types

Based on the backend API contract from JWT auth specification, the frontend will use the following TypeScript types:

```typescript
// Task entity (matches backend TaskRead schema)
interface Task {
  id: string;              // UUID
  title: string;           // Required, max length enforced by backend
  description: string;     // Optional
  completed: boolean;      // Completion status
  created_at: string;      // ISO datetime
  updated_at: string;      // ISO datetime
}

// Create task request (matches backend TaskCreate schema)
interface CreateTaskRequest {
  title: string;
  description?: string;
}

// Update task request (matches backend TaskUpdate schema)
interface UpdateTaskRequest {
  title?: string;
  description?: string;
}

// API response wrapper
interface ApiResponse<T> {
  data: T;
  error?: string;
}

// Auth session (from Better Auth)
interface AuthSession {
  user: {
    id: string;            // User ID for API calls
    email: string;
  };
  token: string;           // JWT token for API authorization
}
```

### State Transitions

**Task Completion State**:
```
[PENDING] --toggle--> [COMPLETED]
    ^                    |
    |                    |
    +----toggle----------+
```

**Form States**:
```
[IDLE] --submit--> [SUBMITTING] --success--> [SUCCESS] --> [IDLE]
                      |                                |
                      |                                |
                      +---error----> [ERROR] --------->+
```

**API Call States**:
```
[IDLE] --initiate--> [LOADING] --success--> [SUCCESS] --> [IDLE]
                        |                              |
                        +----error-----> [ERROR] ------>+
```

## API Contracts

### Backend API Endpoints

The frontend will consume these existing FastAPI endpoints (defined in JWT auth specification):

#### GET /api/{user_id}/tasks
**Description**: Fetch all tasks for authenticated user
**Authentication**: Required (JWT in Authorization header)
**Response**: `Array<Task>`

#### POST /api/{user_id}/tasks
**Description**: Create a new task
**Authentication**: Required (JWT in Authorization header)
**Request Body**: `CreateTaskRequest`
**Response**: `Task` (201 Created)

#### GET /api/{user_id}/tasks/{task_id}
**Description**: Fetch a single task
**Authentication**: Required (JWT in Authorization header)
**Response**: `Task` (200 OK) or 404 Not Found

#### PUT /api/{user_id}/tasks/{task_id}
**Description**: Update a task
**Authentication**: Required (JWT in Authorization header)
**Request Body**: `UpdateTaskRequest`
**Response**: `Task` (200 OK) or 404 Not Found

#### DELETE /api/{user_id}/tasks/{task_id}
**Description**: Delete a task
**Authentication**: Required (JWT in Authorization header)
**Response**: 204 No Content or 404 Not Found

#### PATCH /api/{user_id}/tasks/{task_id}/complete
**Description**: Toggle task completion status
**Authentication**: Required (JWT in Authorization header)
**Response**: `Task` (200 OK) or 404 Not Found

### Frontend API Client Contract

```typescript
// lib/api-client.ts

interface ApiClientConfig {
  baseUrl: string;        // API base URL (from env var)
  getToken: () => Promise<string | null>;  // JWT token getter
  onUnauthorized: () => void;  // 401 handler
}

interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown;
  queryParams?: Record<string, string>;
}

class ApiClient {
  constructor(private config: ApiClientConfig) {}

  async request<T>(options: ApiRequestOptions): Promise<T> {
    // 1. Get JWT token
    // 2. Attach Authorization header
    // 3. Make fetch request
    // 4. Handle 401 -> call onUnauthorized()
    // 5. Return parsed JSON or throw error
  }

  // Convenience methods
  get<T>(path: string): Promise<T> { /* ... */ }
  post<T>(path: string, body: unknown): Promise<T> { /* ... */ }
  put<T>(path: string, body: unknown): Promise<T> { /* ... */ }
  delete(path: string): Promise<void> { /* ... */ }
  patch<T>(path: string, body?: unknown): Promise<T> { /* ... */ }
}
```

### Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000  # FastAPI backend URL
BETTER_AUTH_SECRET=dev-secret-key-change-in-production-32chars  # Shared JWT secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Frontend URL for auth callbacks
```

## UI Component Architecture

### Page Structure

```
app/
├── (auth)/
│   ├── signin/
│   │   └── page.tsx      # Better Auth signin page
│   └── signup/
│       └── page.tsx      # Better Auth signup page
├── dashboard/
│   ├── layout.tsx        # Dashboard layout (nav, header)
│   └── page.tsx          # Task list (Server Component)
├── layout.tsx            # Root layout with providers
├── page.tsx              # Landing page (redirects to signin or dashboard)
└── middleware.ts         # Route protection
```

### Component Hierarchy

```
<DashboardPage> (Server Component)
  ├── <DashboardLayout>
  │   ├── <Header> (user info, sign out)
  │   └── <Navigation>
  ├── <TaskList> (Server Component, Suspense boundary)
  │   ├── <TaskCard> (Client Component)
  │   │   ├── <TaskTitle>
  │   │   ├── <TaskDescription>
  │   │   ├── <ToggleButton>
  │   │   ├── <EditButton>
  │   │   └── <DeleteButton>
  │   └── <EmptyState>
  └── <CreateTaskForm> (Client Component)
      ├── <TitleInput>
      ├── <DescriptionInput>
      └── <SubmitButton>
```

### Loading States

- **Page Level**: React Suspense with skeleton loaders
- **Button Level**: Disabled state + loading spinner
- **Form Level**: Submit button disabled during submission

### Error Handling

- **Page Level**: Error boundary with retry button
- **Form Level**: Inline validation errors
- **API Level**: Toast notifications for success/failure

## Quickstart Guide

### Prerequisites

- Node.js 20+ installed
- FastAPI backend running on port 8000
- Better Auth configured and accessible

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure environment variables
# Edit .env.local and set:
# - NEXT_PUBLIC_API_BASE_URL
# - BETTER_AUTH_SECRET
# - NEXT_PUBLIC_APP_URL
```

### Development

```bash
# Start development server
npm run dev

# Application available at http://localhost:3000
```

### Testing

```bash
# Run unit tests
npm run test

# Run component tests
npm run test:component

# Run e2e tests
npm run test:e2e

# Run all tests
npm run test:all
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start
```

### Environment Configuration

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| NEXT_PUBLIC_API_BASE_URL | FastAPI backend URL | http://localhost:8000 | Yes |
| BETTER_AUTH_SECRET | JWT secret (must match backend) | dev-secret-key... | Yes |
| NEXT_PUBLIC_APP_URL | Frontend URL for callbacks | http://localhost:3000 | Yes |

### First-Time Setup

1. **Start Backend**: Ensure FastAPI backend is running on port 8000
2. **Install Dependencies**: Run `npm install` in `frontend/` directory
3. **Configure Environment**: Copy `.env.example` to `.env.local` and fill in values
4. **Start Dev Server**: Run `npm run dev`
5. **Access Application**: Navigate to http://localhost:3000
6. **Create Account**: Click signup and create a new account
7. **Access Dashboard**: Signin and view the task dashboard

### Troubleshooting

**Issue**: 401 errors on API calls
- **Solution**: Verify BETTER_AUTH_SECRET matches backend value
- **Solution**: Check that backend is running and accessible

**Issue**: CORS errors
- **Solution**: Ensure backend CORS allows frontend origin
- **Solution**: Check NEXT_PUBLIC_API_BASE_URL is correct

**Issue**: Route protection not working
- **Solution**: Verify middleware.ts is correctly configured
- **Solution**: Check Better Auth session is being retrieved

---

# Architecture Decision Records

## ADR-001: Server Components vs Client Components

**Status**: Accepted
**Context**: Need to decide which parts of the UI use React Server Components vs Client Components

**Decision**:
- **Server Components**: Dashboard page (data fetching), task list rendering
- **Client Components**: Forms (create, edit), interactive elements (buttons, toggles), modals

**Rationale**:
- Server Components reduce client JavaScript bundle size
- Initial page load faster with server-rendered HTML
- Client Components needed for interactivity (state, event handlers)

**Consequences**:
- Positive: Better performance, simpler data fetching
- Negative: Must pass data across server/client boundary (props)

## ADR-002: API Client Pattern

**Status**: Accepted
**Context**: Need consistent way to make API requests with JWT tokens

**Decision**: Centralized ApiClient class with fetch wrapper

**Rationale**:
- Single source of truth for API calls
- Consistent error handling (401 redirects)
- Automatic token attachment

**Consequences**:
- Positive: DRY code, easier testing, consistent behavior
- Negative: Additional abstraction layer

## ADR-003: Form Validation Approach

**Status**: Accepted
**Context**: Need to validate forms with immediate feedback

**Decision**: Controlled components with client-side validation

**Rationale**:
- Real-time feedback as user types
- No additional library dependencies
- Simple for 2-field forms

**Consequences**:
- Positive: Simple, fast, good UX
- Negative: More boilerplate than form libraries

---

# Dependencies

## External Dependencies (from package.json)

```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@playwright/test": "^1.49.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0"
  }
}
```

## Internal Dependencies

- **Backend API**: FastAPI service running on port 8000
- **Better Auth**: Authentication service (may be embedded or external)

## Integration Points

1. **Better Auth Session**: `lib/auth.ts` exports `authClient` instance
2. **API Client**: `lib/api-client.ts` uses `authClient.getSession()` for tokens
3. **Middleware**: `middleware.ts` uses `authClient.getSession()` for route protection
4. **Server Components**: Import `authClient` to get session server-side

---

# Post-Design Constitution Re-Check

**Gate Status After Phase 1 Design**: ✅ ALL GATES STILL PASSED

**Verification**:
- [x] **Spec-First**: All design decisions trace back to spec requirements
- [x] **No Manual Coding**: Plan enables Claude Code generation
- [x] **Separation of Concerns**: Frontend consumes backend via API only
- [x] **Security by Design**: JWT from session, user_id from auth (not URL), 401 handling
- [x] **Contract-Driven**: API contracts documented, frontend matches backend
- [x] **Environment Consistency**: BETTER_AUTH_SECRET documented in quickstart
- [x] **Stack Compliance**: Next.js 16, App Router, TypeScript confirmed
- [x] **Stateless Auth**: JWT tokens from Better Auth, no session storage

**No violations introduced during design phase.**

---

# Implementation Readiness

## Ready for Task Generation

This plan is complete and ready for `/sp.tasks` to generate actionable implementation tasks.

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/auth.ts` | Better Auth client configuration |
| `lib/api-client.ts` | API client with JWT handling |
| `middleware.ts` | Route protection |
| `app/dashboard/page.tsx` | Task list (Server Component) |
| `components/tasks/CreateTaskForm.tsx` | Create task form (Client Component) |
| `components/tasks/TaskCard.tsx` | Task display with actions (Client Component) |
| `.env.local` | Environment configuration |

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Run `/sp.implement` to execute tasks via Claude Code
3. Verify all tests pass
4. Deploy to staging for user acceptance testing
