'use client'

import { useState } from 'react'
import type { Task } from '@/lib/types'
import { formatRelativeTime } from '@/lib/utils'
import { EditTaskForm } from './EditTaskForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { apiClient } from '@/lib/api-client'

/**
 * TaskCard component
 * Displays a single task with title, description, and completion status
 * Includes edit, delete, and toggle completion functionality
 * Responsive design: single column on mobile, grid layout on desktop
 */
interface TaskCardProps {
  task: Task
  onTaskUpdated?: (task: Task) => void
  onTaskDeleted?: (taskId: string) => void
}

export function TaskCard({ task, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleToggle() {
    if (isToggling) return

    setIsToggling(true)
    try {
      const updatedTask = await apiClient.toggleTaskCompletion(task.id)
      if (onTaskUpdated) {
        onTaskUpdated(updatedTask)
      }
    } catch (error) {
      console.error('Failed to toggle task:', error)
    } finally {
      setIsToggling(false)
    }
  }

  function handleEdit() {
    setIsEditing(true)
  }

  function handleCancelEdit() {
    setIsEditing(false)
  }

  async function handleSaveEdit(updatedTask: Task) {
    setIsEditing(false)
    if (onTaskUpdated) {
      onTaskUpdated(updatedTask)
    }
  }

  function handleDeleteClick() {
    setShowDeleteDialog(true)
  }

  function handleDeleteCancel() {
    setShowDeleteDialog(false)
    setIsDeleting(false)
  }

  async function handleDeleteConfirm() {
    setIsDeleting(true)
    setShowDeleteDialog(false)

    try {
      await apiClient.deleteTask(task.id)
      if (onTaskDeleted) {
        onTaskDeleted(task.id)
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      setIsDeleting(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <EditTaskForm
          task={task}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    )
  }

  return (
    <>
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-lg shadow-sm border-2 transition-all duration-200
          ${
            task.completed
              ? 'border-green-200 dark:border-green-900 opacity-75'
              : 'border-gray-200 dark:border-gray-700'
          }
          ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            {/* Completion checkbox */}
            <button
              onClick={handleToggle}
              disabled={isToggling || isDeleting}
              className={`
                flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors
                ${
                  task.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-gray-300 dark:border-gray-600 hover:border-green-500 dark:hover:border-green-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
              aria-label={
                task.completed ? 'Mark as incomplete' : 'Mark as complete'
              }
            >
              {task.completed && (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>

            {/* Task content */}
            <div className="flex-1 min-w-0">
              <h3
                className={`
                  text-base sm:text-lg font-medium mb-1
                  ${
                    task.completed
                      ? 'line-through text-gray-500 dark:text-gray-500'
                      : 'text-gray-900 dark:text-white'
                  }
                `}
              >
                {task.title}
              </h3>

              {task.description && (
                <p
                  className={`
                    text-sm mb-2 line-clamp-2
                    ${
                      task.completed
                        ? 'text-gray-400 dark:text-gray-600'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                >
                  {task.description}
                </p>
              )}

              <p className="text-xs text-gray-400 dark:text-gray-500">
                Created {formatRelativeTime(task.created_at)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex-shrink-0 flex gap-2">
              <button
                onClick={handleEdit}
                disabled={isDeleting || isToggling}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Edit task"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>

              <button
                onClick={handleDeleteClick}
                disabled={isDeleting || isToggling}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Delete task"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        task={task}
        isOpen={showDeleteDialog}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  )
}
