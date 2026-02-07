# Data Model: Frontend Web Application — Authenticated Todo UI

**Feature**: 003-frontend-ui
**Date**: 2026-02-02
**Purpose**: TypeScript types and data structures for frontend task management

---

## Overview

The frontend data model mirrors the backend API contract defined in the JWT auth specification (feature 002). All types are designed to be serializable and match the backend request/response schemas exactly.

---

## Core Types

### Task

Represents a single to-do item as returned by the backend API.

```typescript
interface Task {
  id: string;              // UUID format (from backend)
  title: string;           // Required, max length enforced by backend
  description: string;     // Optional, can be empty string
  completed: boolean;      // Completion status (true = completed)
  created_at: string;      // ISO 8601 datetime string
  updated_at: string;      // ISO 8601 datetime string
}
```

**Invariants**:
- `id` is a valid UUID (format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`)
- `title` is non-empty and within backend length limit
- `description` may be empty string
- `created_at` <= `updated_at` (timestamp ordering)

### CreateTaskRequest

Request body for creating a new task via POST endpoint.

```typescript
interface CreateTaskRequest {
  title: string;
  description?: string;  // Optional, defaults to empty string
}
```

**Validation Rules**:
- `title` must be non-empty after trimming
- `title` length <= backend max length (assumed 200 characters)
- `description` length <= backend max length (assumed 1000 characters)

### UpdateTaskRequest

Request body for updating an existing task via PUT endpoint.

```typescript
interface UpdateTaskRequest {
  title?: string;        // Optional partial update
  description?: string;  // Optional partial update
}
```

**Validation Rules**:
- At least one field must be provided
- Same validation as CreateTaskRequest for provided fields

---

## Auth Types

### AuthSession

Represents the current user's authentication session from Better Auth.

```typescript
interface AuthSession {
  user: {
    id: string;          // User ID (used in API paths)
    email: string;       // User's email address
    name?: string;       // Optional display name
  };
  token: string;         // JWT token for API authorization
  expiresAt: Date;      // Token expiration timestamp
}
```

**Invariants**:
- `user.id` is non-empty (used to construct API URLs)
- `token` is a valid JWT format (three dot-separated parts)
- `expiresAt` is in the future for valid sessions

---

## API Response Types

### ApiResponse

Generic wrapper for API responses (used by ApiClient).

```typescript
interface ApiResponse<T> {
  data: T;
  error?: string;        // Present on error responses
}

// Success example
interface TaskListResponse {
  data: Task[];
}

// Error example
interface ErrorResponse {
  error: string;
}
```

---

## UI State Types

### FormState

Represents the state of a form (create or edit task).

```typescript
type FormState = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  title: string;
  description: string;
}

interface FormValidation {
  titleError?: string;
  descriptionError?: string;
}

interface CreateTaskFormState {
  formState: FormState;
  data: FormData;
  validation: FormValidation;
}
```

**State Transitions**:
```
idle -> submitting -> success -> idle
                    -> error -> idle
```

### TaskListState

Represents the state of the task list (for client-side mutations).

```typescript
type TaskListState = 'loading' | 'success' | 'error'

interface TaskListData {
  tasks: Task[];
  filteredTasks: Task[];
  filter: 'all' | 'active' | 'completed';
}

interface TaskListStateData {
  state: TaskListState;
  data: TaskListData;
  error?: string;
}
```

### LoadingState

Represents loading state for individual operations.

```typescript
type LoadingState = 'idle' | 'loading' | 'success' | 'error'

interface LoadingMap {
  create: LoadingState;
  update: Map<string, LoadingState>;  // Key: task ID
  delete: Map<string, LoadingState>;  // Key: task ID
  toggle: Map<string, LoadingState>;  // Key: task ID
}
```

---

## Component Props Types

### TaskCard Props

```typescript
interface TaskCardProps {
  task: Task;
  onToggle: (taskId: string) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => Promise<void>;
  isLoading?: boolean;
}
```

### CreateTaskForm Props

```typescript
interface CreateTaskFormProps {
  onCreate: (data: CreateTaskRequest) => Promise<void>;
  isLoading?: boolean;
}
```

### EditTaskForm Props

```typescript
interface EditTaskFormProps {
  task: Task;
  onUpdate: (taskId: string, data: UpdateTaskRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}
```

### TaskList Props

```typescript
interface TaskListProps {
  initialTasks: Task[];
  userId: string;  // From auth session
}
```

---

## API Client Types

### ApiClientConfig

```typescript
interface ApiClientConfig {
  baseUrl: string;                      // From NEXT_PUBLIC_API_BASE_URL
  getToken: () => Promise<string | null>;  // JWT token getter
  onUnauthorized: () => void;            // 401 handler (redirect to signin)
}
```

### ApiRequestOptions

```typescript
interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;                          // API path (e.g., '/api/user/tasks')
  body?: unknown;                        // Request body for POST/PUT/PATCH
  queryParams?: Record<string, string>;  // URL query parameters
}
```

---

## Route Types

### ProtectedRouteParams

```typescript
interface ProtectedRouteParams {
  userId: string;  // Must match authenticated user's ID
}
```

**Note**: The frontend never constructs URLs with user_id from user input. The user_id always comes from the authenticated session (`session.user.id`).

---

## Validation Types

### ValidationResult

```typescript
type ValidationResult =
  | { valid: true }
  | { valid: false; errors: Record<string, string> }

interface CreateTaskValidation {
  validateTitle: (title: string) => ValidationResult;
  validateDescription: (description: string) => ValidationResult;
  validateForm: (data: CreateTaskRequest) => ValidationResult;
}
```

---

## Display Types

### TaskDisplayInfo

Derived information for display purposes (computed from Task).

```typescript
interface TaskDisplayInfo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  createdAtFormatted: string;    // e.g., "Feb 2, 2026"
  updatedAtFormatted: string;    // e.g., "2 hours ago"
  isOverdue: boolean;            // Not used in current scope (no due dates)
}
```

---

## Type Guards

### Type Guards for Runtime Validation

```typescript
function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' && obj !== null &&
    'id' in obj && typeof obj.id === 'string' &&
    'title' in obj && typeof obj.title === 'string' &&
    'completed' in obj && typeof obj.completed === 'boolean'
  )
}

function isTaskArray(obj: unknown): obj is Task[] {
  return Array.isArray(obj) && obj.every(isTask)
}

function isAuthSession(obj: unknown): obj is AuthSession {
  return (
    typeof obj === 'object' && obj !== null &&
    'user' in obj && typeof obj.user === 'object' &&
    'token' in obj && typeof obj.token === 'string'
  )
}
```

---

## Null Handling

### Nullable Task Types

```typescript
type TaskOrNull = Task | null
type TaskOrUndefined = Task | undefined

// Usage in components
interface TaskCardWrapperProps {
  task: TaskOrNull;  // Handles loading/missing states
}
```

---

## Environment Types

### EnvironmentVariables

```typescript
interface EnvironmentVariables {
  NEXT_PUBLIC_API_BASE_URL: string;
  BETTER_AUTH_SECRET: string;
  NEXT_PUBLIC_APP_URL: string;
}

// Runtime validation
function validateEnv(): EnvironmentVariables {
  const required = ['NEXT_PUBLIC_API_BASE_URL', 'BETTER_AUTH_SECRET', 'NEXT_PUBLIC_APP_URL']

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`)
    }
  }

  return process.env as unknown as EnvironmentVariables
}
```

---

## Summary

The frontend data model consists of:

1. **Core Types**: Task, CreateTaskRequest, UpdateTaskRequest
2. **Auth Types**: AuthSession with JWT token
3. **API Types**: ApiResponse wrapper
4. **State Types**: FormState, TaskListState, LoadingState
5. **Component Props**: Props for all UI components
6. **API Client Types**: ApiClientConfig, ApiRequestOptions
7. **Validation Types**: ValidationResult, type guards
8. **Display Types**: Derived display information

All types align with the backend API contract and support the spec requirements for JWT authentication, user isolation, and CRUD operations.
