/**
 * Utility functions for the Todo application
 */

import type { Task } from './types'

// ============================================
// Environment Validation
// ============================================

/**
 * Validates that all required environment variables are set
 * @throws Error if any required variable is missing
 */
export function validateEnv(): void {
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
    'BETTER_AUTH_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}. Using defaults.`)
  }
}

/**
 * Gets the API base URL from environment
 * @returns API base URL
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
}

/**
 * Gets the app URL from environment
 * @returns App URL
 */
export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// ============================================
// Date Formatting
// ============================================

/**
 * Formats an ISO date string to a readable format
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Feb 2, 2026")
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * Formats a date as relative time (e.g., "2 hours ago")
 * @param isoString - ISO 8601 date string
 * @returns Relative time string
 */
export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  return formatDate(isoString)
}

// ============================================
// Task Validation
// ============================================

/**
 * Validates a task title
 * @param title - Task title to validate
 * @returns True if valid, false otherwise
 */
export function isValidTitle(title: string): boolean {
  return typeof title === 'string' && title.trim().length > 0 && title.length <= 200
}

/**
 * Validates a task description
 * @param description - Task description to validate
 * @returns True if valid, false otherwise
 */
export function isValidDescription(description: string): boolean {
  return typeof description === 'string' && description.length <= 1000
}

/**
 * Validates a complete task object
 * @param task - Task object to validate
 * @returns True if valid, false otherwise
 */
export function isValidTask(task: Task): boolean {
  return (
    typeof task.id === 'string' &&
    isValidTitle(task.title) &&
    isValidDescription(task.description) &&
    typeof task.completed === 'boolean' &&
    typeof task.created_at === 'string' &&
    typeof task.updated_at === 'string'
  )
}

// ============================================
// String Utilities
// ============================================

/**
 * Truncates a string to a maximum length
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @returns Truncated string with ellipsis if needed
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

/**
 * Converts a string to title case
 * @param str - String to convert
 * @returns Title case string
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============================================
// Array Utilities
// ============================================

/**
 * Sorts tasks by creation date (newest first)
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export function sortTasksByCreatedAt(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.created_at)
    const dateB = new Date(b.created_at)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Sorts tasks by update date (most recently updated first)
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export function sortTasksByUpdatedAt(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const dateA = new Date(a.updated_at)
    const dateB = new Date(b.updated_at)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * Filters tasks by completion status
 * @param tasks - Array of tasks to filter
 * @param completed - Completion status to filter by
 * @returns Filtered array of tasks
 */
export function filterTasksByCompletion(tasks: Task[], completed: boolean): Task[] {
  return tasks.filter(task => task.completed === completed)
}

// ============================================
// Error Utilities
// ============================================

/**
 * Extracts a user-friendly error message from an error object
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (typeof error === 'object' && error !== null && 'detail' in error) {
    return String(error.detail)
  }
  return 'An unexpected error occurred'
}

/**
 * Checks if an error is a network error
 * @param error - Error object
 * @returns True if network error, false otherwise
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return error.message.includes('fetch') || error.message.includes('network')
  }
  return false
}

// ============================================
// Debounce Utility
// ============================================

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * @param func - Function to debounce
 * @param wait - Milliseconds to wait
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

// ============================================
// Local Storage Utilities
// ============================================

const STORAGE_PREFIX = 'todo_app_'

/**
 * Gets an item from local storage
 * @param key - Storage key
 * @returns Stored value or null
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key)
    return item ? JSON.parse(item) : null
  } catch {
    return null
  }
}

/**
 * Sets an item in local storage
 * @param key - Storage key
 * @param value - Value to store
 */
export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
  } catch {
    // Silently fail if storage is full or disabled
  }
}

/**
 * Removes an item from local storage
 * @param key - Storage key
 */
export function removeStorageItem(key: string): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.removeItem(STORAGE_PREFIX + key)
  } catch {
    // Silently fail
  }
}
