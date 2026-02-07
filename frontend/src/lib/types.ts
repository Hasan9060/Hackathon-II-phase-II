/**
 * Core domain types for the Todo application
 * All types align with backend API contract
 */

// ============================================
// Core Types
// ============================================

/**
 * Represents a single to-do item as returned by the backend API
 */
export interface Task {
  id: string              // UUID format (from backend)
  title: string           // Required, max length enforced by backend
  description: string     // Optional, can be empty string
  completed: boolean      // Completion status (true = completed)
  created_at: string      // ISO 8601 datetime string
  updated_at: string      // ISO 8601 datetime string
}

/**
 * Request body for creating a new task via POST endpoint
 */
export interface CreateTaskRequest {
  title: string
  description?: string  // Optional, defaults to empty string
}

/**
 * Request body for updating an existing task via PUT endpoint
 */
export interface UpdateTaskRequest {
  title?: string        // Optional partial update
  description?: string  // Optional partial update
}

// ============================================
// Auth Types
// ============================================

/**
 * Represents the current user's authentication session from Better Auth
 */
export interface AuthSession {
  user: {
    id: string          // User ID (used in API paths)
    email: string       // User's email address
    name?: string       // Optional display name
  }
  token: string         // JWT token for API authorization
  expiresAt: Date      // Token expiration timestamp
}

// ============================================
// API Response Types
// ============================================

/**
 * Generic wrapper for API responses (used by ApiClient)
 */
export interface ApiResponse<T> {
  data: T
  error?: string        // Present on error responses
}

/**
 * Error response from backend API
 */
export interface ErrorResponse {
  detail: string        // Human-readable error message
}

// ============================================
// UI State Types
// ============================================

/**
 * Form state transitions
 */
export type FormState = 'idle' | 'submitting' | 'success' | 'error'

/**
 * Form data structure
 */
export interface FormData {
  title: string
  description: string
}

/**
 * Form validation errors
 */
export interface FormValidation {
  titleError?: string
  descriptionError?: string
}

/**
 * Complete form state for create/edit forms
 */
export interface CreateTaskFormState {
  formState: FormState
  data: FormData
  validation: FormValidation
}

/**
 * Task list state
 */
export type TaskListState = 'loading' | 'success' | 'error'

/**
 * Task list data with filtering
 */
export interface TaskListData {
  tasks: Task[]
  filteredTasks: Task[]
  filter: 'all' | 'active' | 'completed'
}

/**
 * Complete task list state
 */
export interface TaskListStateData {
  state: TaskListState
  data: TaskListData
  error?: string
}

/**
 * Loading state for individual operations
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ============================================
// Component Props Types
// ============================================

/**
 * Props for TaskCard component
 */
export interface TaskCardProps {
  task: Task
  onToggle: (taskId: string) => Promise<void>
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => Promise<void>
  isLoading?: boolean
}

/**
 * Props for CreateTaskForm component
 */
export interface CreateTaskFormProps {
  onCreate: (data: CreateTaskRequest) => Promise<void>
  isLoading?: boolean
}

/**
 * Props for EditTaskForm component
 */
export interface EditTaskFormProps {
  task: Task
  onUpdate: (taskId: string, data: UpdateTaskRequest) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Props for TaskList component
 */
export interface TaskListProps {
  initialTasks: Task[]
  userId: string  // From auth session
}

// ============================================
// API Client Types
// ============================================

/**
 * Configuration for API client
 */
export interface ApiClientConfig {
  baseUrl: string                              // From NEXT_PUBLIC_API_BASE_URL
  getToken: () => Promise<string | null>       // JWT token getter
  onUnauthorized: () => void                   // 401 handler (redirect to signin)
}

/**
 * Options for API requests
 */
export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string                                 // API path (e.g., '/api/user/tasks')
  body?: unknown                               // Request body for POST/PUT/PATCH
  queryParams?: Record<string, string>         // URL query parameters
}

// ============================================
// Validation Types
// ============================================

/**
 * Validation result for form fields
 */
export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: Record<string, string> }

// ============================================
// Type Guards
// ============================================

/**
 * Type guard for Task objects
 */
export function isTask(obj: unknown): obj is Task {
  return (
    typeof obj === 'object' && obj !== null &&
    'id' in obj && typeof obj.id === 'string' &&
    'title' in obj && typeof obj.title === 'string' &&
    'completed' in obj && typeof obj.completed === 'boolean'
  )
}

/**
 * Type guard for Task arrays
 */
export function isTaskArray(obj: unknown): obj is Task[] {
  return Array.isArray(obj) && obj.every(isTask)
}

/**
 * Type guard for AuthSession objects
 */
export function isAuthSession(obj: unknown): obj is AuthSession {
  return (
    typeof obj === 'object' && obj !== null &&
    'user' in obj && typeof obj.user === 'object' &&
    'token' in obj && typeof obj.token === 'string'
  )
}
