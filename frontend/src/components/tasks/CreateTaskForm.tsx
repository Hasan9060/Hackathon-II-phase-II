'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { CreateTaskRequest, Task } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api-client'
import { isValidTitle, isValidDescription } from '@/lib/utils'

/**
 * CreateTaskForm component
 * Controlled form with real-time validation for creating new tasks
 * Accepts an optional callback to update parent component state
 */
interface CreateTaskFormProps {
  onTaskCreated?: (task: Task) => void
}

export function CreateTaskForm({ onTaskCreated }: CreateTaskFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Validate title in real-time
  function handleTitleChange(value: string) {
    setTitle(value)

    if (value.trim().length === 0) {
      setTitleError('Title is required')
    } else if (!isValidTitle(value)) {
      setTitleError('Title must be 200 characters or less')
    } else {
      setTitleError('')
    }
  }

  // Validate description in real-time
  function handleDescriptionChange(value: string) {
    setDescription(value)

    if (value.length > 0 && !isValidDescription(value)) {
      setDescriptionError('Description must be 1000 characters or less')
    } else {
      setDescriptionError('')
    }
  }

  // Check if form is valid
  const isFormValid = !titleError && !descriptionError && title.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!isFormValid || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setTitleError('')
    setDescriptionError('')
    setSuccessMessage('')

    const data: CreateTaskRequest = {
      title: title.trim(),
      description: description.trim() || undefined,
    }

    try {
      const newTask = await apiClient.createTask(data)

      // Reset form
      setTitle('')
      setDescription('')

      // Show success message
      setSuccessMessage('Task created successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Notify parent component to update its state
      if (onTaskCreated) {
        onTaskCreated(newTask)
      }

      // Refresh router to revalidate Server Component
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Failed to create task:', error)
      if (error instanceof Error) {
        if (error.message.includes('title')) {
          setTitleError(error.message)
        } else {
          setTitleError('Failed to create task: ' + error.message)
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Create New Task
      </h2>

      {successMessage && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="task-title"
          label="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          error={titleError}
          placeholder="What needs to be done?"
          disabled={isSubmitting}
          required
          maxLength={200}
        />

        <Textarea
          id="task-description"
          label="Description (optional)"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          error={descriptionError}
          placeholder="Add more details..."
          disabled={isSubmitting}
          rows={3}
          maxLength={1000}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!isFormValid || isSubmitting}
          >
            Create Task
          </Button>
        </div>
      </form>
    </div>
  )
}
