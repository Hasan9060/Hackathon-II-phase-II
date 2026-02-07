/**
 * API Client for communicating with FastAPI backend
 * Handles JWT token attachment and 401 error redirects
 * Includes demo mode for testing without backend
 */

import type {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiRequestOptions,
  ErrorResponse,
} from './types'
import { getApiBaseUrl } from './utils'

const API_BASE_URL = getApiBaseUrl()

// Demo mode - set to false to use real backend
const DEMO_MODE = false

// Demo task storage (for testing without backend)
const demoTasks = new Map<string, Task[]>()

/**
 * Get the auth token from cookies
 * Uses a more robust parsing method that handles URL-encoded values
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  try {
    // Parse cookies more robustly
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
      const [name, value] = cookie.trim().split('=')
      if (name && value !== undefined) {
        acc[name] = value
      }
      return acc
    }, {} as Record<string, string>)

    const token = cookies['auth_token']
    if (token) {
      // URL decode the token in case it contains encoded characters
      return decodeURIComponent(token)
    }
  } catch (error) {
    console.warn('Error parsing auth token from cookie:', error)
  }

  return null
}

/**
 * Generate a demo task
 */
function generateDemoTask(title: string, description?: string): Task {
  return {
    id: 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
    title,
    description: description || '',
    completed: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Centralized API client for backend communication
 * Automatically attaches JWT tokens and handles authentication errors
 */
class ApiClient {
  /**
   * Gets headers with JWT token attached
   */
  private async getHeaders(): Promise<HeadersInit> {
    const token = getAuthToken()

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  /**
   * Makes an HTTP request with authentication
   */
  async request<T>(options: ApiRequestOptions): Promise<T> {
    // Demo mode - simulate API responses
    if (DEMO_MODE) {
      console.log('Demo mode: Simulating', options.method, options.path)

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500))

      // Handle demo task endpoints
      if (options.path === '/api/me/tasks') {
        const tasks = demoTasks.get('default') || []
        return tasks as T
      }

      if (options.path.match(/\/api\/me\/tasks\/[^/]+/) && options.method === 'PUT') {
        // Update task - just return the updated task
        return generateDemoTask('Updated Task', 'Updated description') as T
      }

      if (options.path.match(/\/api\/me\/tasks\/[^/]+\/complete/) && options.method === 'PATCH') {
        // Toggle completion - just return a task
        return generateDemoTask('Toggled Task') as T
      }

      if (options.path.match(/\/api\/me\/tasks\/[^/]+/) && options.method === 'DELETE') {
        return undefined as T
      }

      // Default demo response
      return generateDemoTask('Demo Task') as T
    }

    const url = new URL(options.path, API_BASE_URL)

    if (options.queryParams) {
      Object.entries(options.queryParams).forEach(([key, value]) => {
        url.searchParams.append(key, value)
      })
    }

    const headers = await this.getHeaders()

    const response = await fetch(url.toString(), {
      method: options.method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    })

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Redirect to signin
      if (typeof window !== 'undefined') {
        window.location.href = '/signin'
      }
      throw new Error('Unauthorized')
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = (await response.json()) as ErrorResponse
      throw new Error(errorData.detail || `HTTP ${response.status}`)
    }

    // Return empty for 204 No Content
    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  /**
   * GET request
   */
  async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', path, queryParams })
  }

  /**
   * POST request
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: 'POST', path, body })
  }

  /**
   * PUT request
   */
  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>({ method: 'PUT', path, body })
  }

  /**
   * PATCH request
   */
  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>({ method: 'PATCH', path, body })
  }

  /**
   * DELETE request
   */
  async delete(path: string): Promise<void> {
    return this.request<void>({ method: 'DELETE', path })
  }

  // ============================================
  // Task API Methods
  // ============================================

  /**
   * Lists all tasks for the authenticated user
   */
  async listTasks(): Promise<Task[]> {
    if (DEMO_MODE) {
      const tasks = demoTasks.get('default') || []
      return tasks
    }

    return this.get<Task[]>(`/api/me/tasks`)
  }

  /**
   * Creates a new task
   */
  async createTask(data: CreateTaskRequest): Promise<Task> {
    if (DEMO_MODE) {
      const newTask = generateDemoTask(data.title, data.description)
      const tasks = demoTasks.get('default') || []
      demoTasks.set('default', [...tasks, newTask])
      return newTask
    }

    return this.post<Task>(`/api/me/tasks`, data)
  }

  /**
   * Gets a single task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    return this.get<Task>(`/api/me/tasks/${taskId}`)
  }

  /**
   * Updates an existing task
   */
  async updateTask(taskId: string, data: UpdateTaskRequest): Promise<Task> {
    if (DEMO_MODE) {
      const tasks = demoTasks.get('default') || []
      const index = tasks.findIndex(t => t.id === taskId)
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...data, updated_at: new Date().toISOString() }
        return tasks[index]
      }
      throw new Error('Task not found')
    }

    return this.put<Task>(`/api/me/tasks/${taskId}`, data)
  }

  /**
   * Deletes a task
   */
  async deleteTask(taskId: string): Promise<void> {
    if (DEMO_MODE) {
      const tasks = demoTasks.get('default') || []
      const filtered = tasks.filter(t => t.id !== taskId)
      demoTasks.set('default', filtered)
      return
    }

    return this.delete(`/api/me/tasks/${taskId}`)
  }

  /**
   * Toggles task completion status
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    if (DEMO_MODE) {
      const tasks = demoTasks.get('default') || []
      const task = tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        task.updated_at = new Date().toISOString()
        return { ...task }
      }
      throw new Error('Task not found')
    }

    return this.patch<Task>(`/api/me/tasks/${taskId}/complete`)
  }
}

// Export singleton instance
export const apiClient = new ApiClient()
