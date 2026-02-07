'use client'

import { useState, useEffect } from 'react'
import { TaskList } from '@/components/tasks/TaskList'
import { CreateTaskForm } from '@/components/tasks/CreateTaskForm'
import { LoadingSkeleton } from '@/components/ui/LoadingSkeleton'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Task } from '@/lib/types'
import { apiClient } from '@/lib/api-client'

/**
 * Dashboard page (Client Component)
 * Manages task creation and listing in a single component for demo mode
 */
export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  async function fetchTasks() {
    setIsLoading(true)
    setError(null)

    try {
      const fetchedTasks = await apiClient.listTasks()
      setTasks(fetchedTasks)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setIsLoading(false)
    }
  }

  function handleTaskCreated(newTask: Task) {
    setTasks((prev) => [newTask, ...prev])
  }

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        </div>
        <LoadingSkeleton count={5} />
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={fetchTasks}
      />
    )
  }

  return (
    <>
      <CreateTaskForm onTaskCreated={handleTaskCreated} />
      <TaskList initialTasks={tasks} onUpdateTasks={setTasks} />
    </>
  )
}
