# Tasks: Frontend Web Application — Authenticated Todo UI

**Feature**: 003-frontend-ui
**Branch**: `003-frontend-ui`
**Status**: Completed
**Total Tasks**: 51

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `frontend/src/` for all source files
- **Tests**: `frontend/tests/` for test files
- All paths below are relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Goal**: Initialize Next.js project structure and install dependencies

- [X] T001 Create frontend directory structure per implementation plan (frontend/src/app, frontend/src/components, frontend/src/lib, frontend/src/styles)
- [X] T002 Initialize Next.js 16+ project with App Router in frontend/ (create next-app@latest, select TypeScript, Tailwind CSS, App Router)
- [X] T003 Install Better Auth package in frontend/ (npm install better-auth)
- [X] T004 [P] Install testing dependencies in frontend/ (npm install -D vitest @testing-library/react @playwright/test)
- [X] T005 [P] Configure TypeScript in frontend/tsconfig.json (strict mode, path aliases)
- [X] T006 [P] Configure Tailwind CSS 4+ in frontend/tailwind.config.ts (content paths, theme, plugins)
- [X] T007 [P] Create Next.js configuration in frontend/next.config.ts (experimental appDir)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Goal**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T008 [P] Create TypeScript types in frontend/src/lib/types.ts (Task, CreateTaskRequest, UpdateTaskRequest, ApiResponse, AuthSession)
- [X] T009 [P] Create utility functions in frontend/src/lib/utils.ts (validateEnv, type guards)
- [X] T010 Configure Better Auth client in frontend/src/lib/auth.ts (authClient instance with baseURL and secret)
- [X] T011 Create API client with JWT handling in frontend/src/lib/api-client.ts (ApiClient class with fetch wrapper, token attachment, 401 redirect)
- [X] T012 Create environment variables template in frontend/.env.example (NEXT_PUBLIC_API_BASE_URL, BETTER_AUTH_SECRET, NEXT_PUBLIC_APP_URL)
- [X] T013 [P] Create root layout with auth providers in frontend/src/app/layout.tsx (AuthProvider, ToastProvider)
- [X] T014 Create landing page with auth redirect in frontend/src/app/page.tsx (check session, redirect to dashboard or signin)
- [X] T015 Create middleware for route protection in frontend/middleware.ts (check session, protect /dashboard/*, redirect to signin)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Authentication (Priority: P1) 🎯 MVP

**Goal**: Users can signup, signin, and access the protected dashboard. Unauthenticated users are redirected to signin.

**Independent Test**: Navigate to application, attempt to access /dashboard (should redirect to /signin), complete signup flow, verify redirect to dashboard after signin.

### Implementation for User Story 1

- [X] T016 [P] [US1] Create signin page in frontend/src/app/(auth)/signin/page.tsx (Better Auth signin form, redirect to dashboard on success)
- [X] T017 [P] [US1] Create signup page in frontend/src/app/(auth)/signup/page.tsx (Better Auth signup form, redirect to dashboard on success)
- [X] T018 [US1] Create dashboard layout in frontend/src/app/dashboard/layout.tsx (Header with user info and sign-out button, Navigation)
- [X] T019 [US1] Create sign-out button component in frontend/src/components/auth/SignOutButton.tsx (call authClient.signOut, redirect to signin)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can signup/signin and access the protected dashboard

---

## Phase 4: User Story 2 - View and Manage Tasks (Priority: P2)

**Goal**: Authenticated users can view their tasks in a responsive dashboard with loading and error states.

**Independent Test**: Signin, navigate to /dashboard, verify tasks are displayed (or empty state shown), verify loading spinner during API call, verify responsive layout on mobile and desktop.

### Implementation for User Story 2

- [X] T020 [P] [US2] Create loading skeleton component in frontend/src/components/ui/LoadingSkeleton.tsx (task list placeholder with shimmer effect)
- [X] T021 [P] [US2] Create empty state component in frontend/src/components/ui/EmptyState.tsx (message with CTA to create first task)
- [X] T022 [P] [US2] Create error display component in frontend/src/components/ui/ErrorState.tsx (error message with retry button)
- [X] T023 [US2] Create TaskCard component in frontend/src/components/tasks/TaskCard.tsx (Client Component, display title/description/completed status)
- [X] T024 [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx (Server Component, fetch tasks via api-client, Suspense boundary, map to TaskCard)
- [X] T025 [US2] Create dashboard page in frontend/src/app/dashboard/page.tsx (Server Component, fetch tasks, pass to TaskList, wrap with Suspense)
- [X] T026 [US2] Add responsive styles to TaskCard in frontend/src/components/tasks/TaskCard.tsx (mobile: single column, desktop: grid layout via Tailwind classes)

**Checkpoint**: At this point, User Story 2 should be fully functional - authenticated users can view their tasks in a responsive dashboard

---

## Phase 5: User Story 3 - Create New Tasks (Priority: P3)

**Goal**: Authenticated users can create new tasks with title and description. Form shows loading state during submission and validation errors.

**Independent Test**: Signin, navigate to /dashboard, click "Create Task", fill in title and description, submit. Verify task appears in list immediately, form shows loading during submission, validation errors show inline.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create form input components in frontend/src/components/ui/Input.tsx and frontend/src/components/ui/Textarea.tsx (controlled inputs with error display support)
- [X] T028 [P] [US3] Create button component in frontend/src/components/ui/Button.tsx (variants: primary/secondary, disabled state, loading spinner)
- [X] T029 [US3] Create CreateTaskForm component in frontend/src/components/tasks/CreateTaskForm.tsx (Client Component, controlled form, title validation, loading state, call api-client.post)
- [X] T030 [US3] Add CreateTaskForm to dashboard layout in frontend/src/app/dashboard/layout.tsx (render form above task list)
- [X] T031 [US3] Implement form validation in frontend/src/components/tasks/CreateTaskForm.tsx (real-time title validation, inline error messages, disable submit until valid)
- [X] T032 [US3] Add router refresh after task creation in frontend/src/components/tasks/CreateTaskForm.tsx (call router.refresh() to revalidate Server Component)

**Checkpoint**: At this point, User Story 3 should be fully functional - users can create new tasks from the dashboard

---

## Phase 6: User Story 4 - Edit Existing Tasks (Priority: P4)

**Goal**: Authenticated users can edit task title and description. Changes save immediately with loading state. Cancel preserves original values.

**Independent Test**: Signin, navigate to /dashboard, click "Edit" on a task, modify title/description, save. Verify task updates in list. Test cancel preserves values. Test error handling preserves changes.

### Implementation for User Story 4

- [X] T033 [P] [US4] Create EditTaskForm component in frontend/src/components/tasks/EditTaskForm.tsx (Client Component, controlled form pre-populated with task data, save/cancel buttons)
- [X] T034 [US4] Add edit button to TaskCard in frontend/src/components/tasks/TaskCard.tsx (open EditTaskForm modal/inline form)
- [X] T035 [US4] Implement save handler in frontend/src/components/tasks/EditTaskForm.tsx (call api-client.put, show loading state, preserve form on error)
- [X] T036 [US4] Implement cancel handler in frontend/src/components/tasks/EditTaskForm.tsx (close form, discard unsaved changes, restore original task values)
- [X] T037 [US4] Add router refresh after task update in frontend/src/components/tasks/EditTaskForm.tsx (call router.refresh() to revalidate Server Component)

**Checkpoint**: At this point, User Story 4 should be fully functional - users can edit existing tasks

---

## Phase 7: User Story 5 - Delete Tasks (Priority: P5)

**Goal**: Authenticated users can delete tasks with confirmation. Delete shows loading state. Cancel prevents deletion.

**Independent Test**: Signin, navigate to /dashboard, click "Delete" on a task, confirm. Verify task removed from list. Test cancel preserves task. Test error handling keeps task in list.

### Implementation for User Story 5

- [X] T038 [P] [US5] Create confirmation dialog component in frontend/src/components/ui/ConfirmDialog.tsx (Client Component, title, message, confirm/cancel buttons)
- [X] T039 [US5] Add delete button to TaskCard in frontend/src/components/tasks/TaskCard.tsx (open ConfirmDialog)
- [X] T040 [US5] Implement delete handler in frontend/src/components/tasks/TaskCard.tsx (call api-client.delete, show loading state on button, remove task from list on success, handle errors)
- [X] T041 [US5] Add router refresh after task deletion in frontend/src/components/tasks/TaskCard.tsx (call router.refresh() to revalidate Server Component)

**Checkpoint**: At this point, User Story 5 should be fully functional - users can delete tasks

---

## Phase 8: User Story 6 - Toggle Task Completion (Priority: P6)

**Goal**: Authenticated users can toggle task completion via checkbox/button. Toggle shows loading state. Errors revert checkbox state.

**Independent Test**: Signin, navigate to /dashboard, click completion checkbox on incomplete task. Verify task marked complete. Click again to mark incomplete. Test loading state during API call. Test error reverts checkbox.

### Implementation for User Story 6

- [X] T042 [P] [US6] Add completion toggle to TaskCard in frontend/src/components/tasks/TaskCard.tsx (checkbox/button component, call api-client.patch)
- [X] T043 [US6] Implement toggle handler in frontend/src/components/tasks/TaskCard.tsx (call api-client.patch to /complete endpoint, show loading state, update task.completed on success, revert on error)
- [X] T044 [US6] Add visual indication of completed state in frontend/src/components/tasks/TaskCard.tsx (strikethrough title, dimmed styling for completed tasks via Tailwind classes)

**Checkpoint**: At this point, User Story 6 should be fully functional - users can toggle task completion

---

## Phase 9: Polish & Cross-Cutting Concerns

**Goal**: Improvements that affect multiple user stories

- [X] T045 [P] Add global styles in frontend/src/styles/globals.css (Tailwind directives, custom animations, base styles)
- [X] T046 [P] Add ESLint configuration in frontend/.eslintrc.json (Next.js config, TypeScript rules)
- [X] T047 [P] Add test scripts to frontend/package.json (dev, build, test, test:component, test:e2e)
- [X] T048 Create Playwright e2e test configuration in frontend/playwright.config.ts (baseURL, use_websocket, timeout)
- [X] T049 [P] Create e2e test for signin flow in frontend/tests/e2e/auth.spec.ts (navigate to /, redirected to /signin, complete signin, redirected to /dashboard)
- [X] T050 [P] Create e2e test for task CRUD in frontend/tests/e2e/tasks.spec.ts (signin, create task, view task, edit task, delete task, toggle completion)
- [X] T051 Update quickstart validation with setup instructions in frontend/README.md (clone of specs/003-frontend-ui/quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Uses TaskCard component which is enhanced in later stories
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Integrates with TaskList from US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Enhances TaskCard from US2
- **User Story 5 (P5)**: Can start after Foundational (Phase 2) - Enhances TaskCard from US2/US4
- **User Story 6 (P6)**: Can start after Foundational (Phase 2) - Enhances TaskCard from US2

### Within Each User Story

- UI components before page integration
- Core implementation before handlers
- Form/components before wiring to API client
- Story complete before moving to next priority

### Parallel Opportunities

**Phase 1 - Setup**:
- T003, T004, T005, T006, T007 can run in parallel (different files, no dependencies)

**Phase 2 - Foundational**:
- T008, T009 can run in parallel (different files)
- T012, T013 can run in parallel (different files)

**Phase 3 - User Story 1**:
- T016, T017 can run in parallel (different route files)

**Phase 4 - User Story 2**:
- T020, T021, T022, T023 can run in parallel (different UI components)

**Phase 5 - User Story 3**:
- T027, T028 can run in parallel (different UI components)

**Phase 6 - User Story 4**:
- T033 can run independently (EditTaskForm is new component)

**Phase 7 - User Story 5**:
- T038 can run independently (ConfirmDialog is new component)

**Phase 8 - User Story 6**:
- All tasks depend on TaskCard from US2 (sequential)

**Phase 9 - Polish**:
- T045, T046, T047, T048 can run in parallel
- T049, T050 can run in parallel

**Cross-Story Parallelization** (after Foundational phase completes):
- US1 (Phase 3): T016, T017
- US2 (Phase 4): T020, T021, T022, T023
- US3 (Phase 5): T027, T028
- US4 (Phase 6): T033
- US5 (Phase 7): T038

---

## Parallel Examples

### Example 1: Setup Phase (Parallel)

```bash
# Terminal 1: Initialize Next.js project
- T002 Initialize Next.js 16+ project

# Terminal 2: Install dependencies
- T003 Install Better Auth package
- T004 Install testing dependencies

# Terminal 3: Configure tools
- T005 Configure TypeScript
- T006 Configure Tailwind CSS
- T007 Create Next.js configuration
```

### Example 2: Foundational Phase (Parallel)

```bash
# Terminal 1: Type definitions
- T008 Create TypeScript types
- T009 Create utility functions

# Terminal 2: Configuration
- T010 Configure Better Auth client
- T012 Create environment variables template
```

### Example 3: User Story 2 - View Tasks (Parallel)

```bash
# Terminal 1: UI Components
- T020 Create loading skeleton component
- T021 Create empty state component
- T022 Create error display component
- T023 Create TaskCard component

# Terminal 2: Page Integration
- T024 Create TaskList component
- T025 Create dashboard page
- T026 Add responsive styles to TaskCard
```

---

## Implementation Strategy

### MVP First (User Stories 1-2 Only)

For minimum viable product, implement only:
- Phase 1: Setup (T001-T007)
- Phase 2: Foundational (T008-T015)
- Phase 3: User Story 1 (T016-T019) - Authentication
- Phase 4: User Story 2 (T020-T026) - View Tasks

**MVP Deliverable**: Users can signup/signin and view their tasks in a responsive dashboard.

### Incremental Delivery

**Sprint 1**: MVP (US1 + US2) - Authentication and view tasks
**Sprint 2**: US3 - Create tasks
**Sprint 3**: US4 - Edit tasks
**Sprint 4**: US5 - Delete tasks
**Sprint 5**: US6 - Toggle completion
**Sprint 6**: Polish - Testing, documentation, final touches

Each sprint delivers a functional increment that builds on previous sprints without breaking them.

---

## File Map

| Task | File | Description |
|------|------|-------------|
| T001 | frontend/src/ | Create directory structure |
| T002 | frontend/ | Initialize Next.js project |
| T003 | frontend/package.json | Install Better Auth |
| T004 | frontend/package.json | Install testing dependencies |
| T005 | frontend/tsconfig.json | Configure TypeScript |
| T006 | frontend/tailwind.config.ts | Configure Tailwind CSS |
| T007 | frontend/next.config.ts | Create Next.js configuration |
| T008 | frontend/src/lib/types.ts | Create TypeScript types |
| T009 | frontend/src/lib/utils.ts | Create utility functions |
| T010 | frontend/src/lib/auth.ts | Configure Better Auth client |
| T011 | frontend/src/lib/api-client.ts | Create API client |
| T012 | frontend/.env.example | Create environment template |
| T013 | frontend/src/app/layout.tsx | Create root layout |
| T014 | frontend/src/app/page.tsx | Create landing page |
| T015 | frontend/middleware.ts | Create middleware |
| T016 | frontend/src/app/(auth)/signin/page.tsx | Create signin page |
| T017 | frontend/src/app/(auth)/signup/page.tsx | Create signup page |
| T018 | frontend/src/app/dashboard/layout.tsx | Create dashboard layout |
| T019 | frontend/src/components/auth/SignOutButton.tsx | Create sign-out button |
| T020 | frontend/src/components/ui/LoadingSkeleton.tsx | Create loading skeleton |
| T021 | frontend/src/components/ui/EmptyState.tsx | Create empty state |
| T022 | frontend/src/components/ui/ErrorState.tsx | Create error display |
| T023 | frontend/src/components/tasks/TaskCard.tsx | Create TaskCard component |
| T024 | frontend/src/components/tasks/TaskList.tsx | Create TaskList component |
| T025 | frontend/src/app/dashboard/page.tsx | Create dashboard page |
| T026 | frontend/src/components/tasks/TaskCard.tsx | Add responsive styles |
| T027 | frontend/src/components/ui/Input.tsx | Create form input components |
| T028 | frontend/src/components/ui/Textarea.tsx | Create textarea component |
| T029 | frontend/src/components/ui/Button.tsx | Create button component |
| T030 | frontend/src/app/dashboard/layout.tsx | Add CreateTaskForm to layout |
| T031 | frontend/src/components/tasks/CreateTaskForm.tsx | Implement form validation |
| T032 | frontend/src/components/tasks/CreateTaskForm.tsx | Add router refresh |
| T033 | frontend/src/components/tasks/EditTaskForm.tsx | Create EditTaskForm component |
| T034 | frontend/src/components/tasks/TaskCard.tsx | Add edit button |
| T035 | frontend/src/components/tasks/EditTaskForm.tsx | Implement save handler |
| T036 | frontend/src/components/tasks/EditTaskForm.tsx | Implement cancel handler |
| T037 | frontend/src/components/tasks/EditTaskForm.tsx | Add router refresh |
| T038 | frontend/src/components/ui/ConfirmDialog.tsx | Create confirmation dialog |
| T039 | frontend/src/components/tasks/TaskCard.tsx | Add delete button |
| T040 | frontend/src/components/tasks/TaskCard.tsx | Implement delete handler |
| T041 | frontend/src/components/tasks/TaskCard.tsx | Add router refresh |
| T042 | frontend/src/components/tasks/TaskCard.tsx | Add completion toggle |
| T043 | frontend/src/components/tasks/TaskCard.tsx | Implement toggle handler |
| T044 | frontend/src/components/tasks/TaskCard.tsx | Add completed state styling |
| T045 | frontend/src/styles/globals.css | Add global styles |
| T046 | frontend/.eslintrc.json | Add ESLint configuration |
| T047 | frontend/package.json | Add test scripts |
| T048 | frontend/playwright.config.ts | Create Playwright config |
| T049 | frontend/tests/e2e/auth.spec.ts | Create signin e2e test |
| T050 | frontend/tests/e2e/tasks.spec.ts | Create task CRUD e2e test |
| T051 | frontend/README.md | Update README |

---

## Test Coverage

### E2E Tests (Phase 9)

- Authentication flow (signup, signin, signout)
- Task CRUD operations (create, view, edit, delete, toggle)
- Route protection (unauthorized access redirects)

---

## Success Criteria Validation

| Success Criterion | Verification Task |
|-------------------|-------------------|
| SC-001: Auth flow <90s | T016, T017, T049 |
| SC-002: Create task <30s | T029-T032 |
| SC-003: Edit task <45s | T033-T037 |
| SC-004: UI updates <2s | T032, T037, T041, T043 |
| SC-005: 95% first-attempt success | T049, T050 |
| SC-006: Responsive during API calls | T020, T027, T028, T029 |
| SC-007: Mobile/desktop responsive | T026 |
| SC-008: 100% unauth redirect | T014, T015 |
| SC-009: 100% JWT in headers | T011 |
| SC-010: 100% 401 redirect | T011 |
| SC-011: Signout redirect | T019 |

---

## Format Validation

**All tasks follow checklist format**: ✅
- Checkbox: `- [ ]`
- Task ID: T001-T051 (sequential)
- Parallel marker: `[P]` where applicable
- Story labels: `[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`, `[US6]` for user story phases
- File paths: Included in all implementation tasks

---

**Tasks Status**: ✅ Implementation Complete
**Total Tasks**: 51
**Setup**: 7 tasks (T001-T007) ✅ Complete
**Foundational**: 8 tasks (T008-T015) ✅ Complete
**User Story 1 (P1)**: 4 tasks (T016-T019) ✅ Complete
**User Story 2 (P2)**: 7 tasks (T020-T026) ✅ Complete
**User Story 3 (P3)**: 6 tasks (T027-T032) ✅ Complete
**User Story 4 (P4)**: 5 tasks (T033-T037) ✅ Complete
**User Story 5 (P5)**: 4 tasks (T038-T041) ✅ Complete
**User Story 6 (P6)**: 3 tasks (T042-T044) ✅ Complete
**Polish**: 7 tasks (T045-T051) ✅ Complete
**Parallel Opportunities**: 10 sets of parallelizable tasks
**Implementation**: Complete - Ready for testing with backend
