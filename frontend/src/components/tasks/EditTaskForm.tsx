'use client'

import { useState } from 'react'
import type { Task, UpdateTaskRequest } from '@/lib/types'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { apiClient } from '@/lib/api-client'
import { isValidTitle, isValidDescription } from '@/lib/utils'

/**
 * EditTaskForm component
 * Inline form for editing existing tasks with save/cancel handlers
 * Returns the updated task via onSave callback
 */
interface EditTaskFormProps {
  task: Task
  onSave: (updatedTask: Task) => void
  onCancel: () => void
}

export function EditTaskForm({ task, onSave, onCancel }: EditTaskFormProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description)
  const [titleError, setTitleError] = useState('')
  const [descriptionError, setDescriptionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

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
  const hasChanges = title !== task.title || description !== task.description

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()

    if (!isFormValid || !hasChanges || isSaving) {
      return
    }

    setIsSaving(true)
    setTitleError('')
    setDescriptionError('')

    const data: UpdateTaskRequest = {}

    // Only include changed fields
    if (title.trim() !== task.title) {
      data.title = title.trim()
    }

    if (description.trim() !== task.description) {
      data.description = description.trim() || undefined
    }

    try {
      const updatedTask = await apiClient.updateTask(task.id, data)
      onSave(updatedTask)
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('title')) {
          setTitleError(error.message)
        } else {
          setTitleError('Failed to update task: ' + error.message)
        }
      }
      setIsSaving(false)
    }
  }

  function handleCancel() {
    // Restore original values
    setTitle(task.title)
    setDescription(task.description)
    setTitleError('')
    setDescriptionError('')
    onCancel()
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
      <form onSubmit={handleSave} className="space-y-4">
        <Input
          id={`edit-task-title-${task.id}`}
          label="Title"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          error={titleError}
          placeholder="Task title"
          disabled={isSaving}
          required
          maxLength={200}
        />

        <Textarea
          id={`edit-task-description-${task.id}`}
          label="Description (optional)"
          value={description}
          onChange={(e) => handleDescriptionChange(e.target.value)}
          error={descriptionError}
          placeholder="Add more details..."
          disabled={isSaving}
          rows={3}
          maxLength={1000}
        />

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSaving}
            disabled={!isFormValid || !hasChanges || isSaving}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
