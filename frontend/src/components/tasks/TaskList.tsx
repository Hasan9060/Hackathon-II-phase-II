'use client'

import { useState, useEffect } from 'react'
import type { Task } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { apiClient } from '@/lib/api-client'

/**
 * TaskList component
 * Client Component that fetches and displays tasks
 * Handles loading, error, and empty states
 * Accepts callback to update parent state when tasks change
 */
interface TaskListProps {
  initialTasks: Task[]
  onUpdateTasks?: (tasks: Task[]) => void
}

export function TaskList({ initialTasks, onUpdateTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update local state when initialTasks changes (e.g., after parent state update)
  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  function updateTasks(updatedTasks: Task[]) {
    setTasks(updatedTasks)
    if (onUpdateTasks) {
      onUpdateTasks(updatedTasks)
    }
  }

  async function fetchTasks() {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedTasks = await apiClient.listTasks()
      updateTasks(fetchedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <LoadingSkeleton count={3} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchTasks} />
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        message="Create your first task to get started"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onTaskUpdated={(updatedTask) => {
            const newTasks = tasks.map((t) =>
              t.id === updatedTask.id ? updatedTask : t
            )
            updateTasks(newTasks)
          }}
          onTaskDeleted={(deletedTaskId) => {
            const newTasks = tasks.filter((t) => t.id !== deletedTaskId)
            updateTasks(newTasks)
          }}
        />
      ))}
    </div>
  )
}
