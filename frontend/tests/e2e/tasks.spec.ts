import { test, expect } from '@playwright/test'

/**
 * E2E tests for task CRUD operations
 * Tests create, view, edit, delete, and toggle completion
 */

test.describe('Task CRUD Operations', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
  }

  // Sign in before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show empty state when no tasks exist', async ({ page }) => {
    await expect(page.locator('text=No tasks yet')).toBeVisible()
    await expect(page.locator('text=Create your first task')).toBeVisible()
  })

  test('should allow user to create a task', async ({ page }) => {
    await page.fill('input[id="task-title"]', 'Test Task')
    await page.click('button[type="submit"]')

    // Task should appear in the list
    await expect(page.locator('text=Test Task')).toBeVisible()

    // Form should be reset
    await expect(page.locator('input[id="task-title"]')).toHaveValue('')
  })

  test('should allow user to create a task with description', async ({
    page,
  }) => {
    await page.fill('input[id="task-title"]', 'Task with Description')
    await page.fill(
      'textarea[id="task-description"]',
      'This is a test description'
    )
    await page.click('button[type="submit"]')

    // Task should appear in the list
    await expect(page.locator('text=Task with Description')).toBeVisible()
    await expect(page.locator('text=This is a test description')).toBeVisible()
  })

  test('should show validation error for empty title', async ({ page }) => {
    await page.click('button[type="submit"]')

    // Should show validation error
    await expect(page.locator('text=Title is required')).toBeVisible()

    // Submit button should be disabled
    const submitButton = page.locator('button[type="submit"]')
    await expect(submitButton).toBeDisabled()
  })

  test('should allow user to toggle task completion', async ({ page }) => {
    // Create a task first
    await page.fill('input[id="task-title"]', 'Toggle Test Task')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Toggle Test Task')).toBeVisible()

    // Find the task card
    const taskCard = page.locator('text=Toggle Test Task').locator('../..')

    // Click the completion checkbox
    await taskCard.locator('button[aria-label*="Mark as complete"]').click()

    // Task should be marked as completed (strikethrough style)
    await expect(
      taskCard.locator('.line-through')
    ).toBeVisible()

    // Click again to uncheck
    await taskCard
      .locator('button[aria-label*="Mark as incomplete"]')
      .click()

    // Task should be unmarked
    await expect(taskCard.locator('.line-through')).not.toBeVisible()
  })

  test('should allow user to edit a task', async ({ page }) => {
    // Create a task first
    await page.fill('input[id="task-title"]', 'Original Title')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Original Title')).toBeVisible()

    // Click edit button
    const taskCard = page.locator('text=Original Title').locator('../..')
    await taskCard.locator('button[aria-label="Edit task"]').click()

    // Edit form should appear
    const editForm = page.locator('.bg-blue-50')
    await expect(editForm).toBeVisible()

    // Update title
    await editForm.locator('input[id^="edit-task-title-"]').fill('Updated Title')

    // Click save
    await editForm.locator('button:has-text("Save Changes")').click()

    // Updated title should appear
    await expect(page.locator('text=Updated Title')).toBeVisible()
    await expect(page.locator('text=Original Title')).not.toBeVisible()
  })

  test('should allow user to cancel editing a task', async ({ page }) => {
    // Create a task first
    await page.fill('input[id="task-title"]', 'Cancel Edit Test')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Cancel Edit Test')).toBeVisible()

    // Click edit button
    const taskCard = page.locator('text=Cancel Edit Test').locator('../..')
    await taskCard.locator('button[aria-label="Edit task"]').click()

    // Edit form should appear
    const editForm = page.locator('.bg-blue-50')
    await expect(editForm).toBeVisible()

    // Update title
    await editForm.locator('input[id^="edit-task-title-"]').fill('Changed Title')

    // Click cancel
    await editForm.locator('button:has-text("Cancel")').click()

    // Original title should remain
    await expect(page.locator('text=Cancel Edit Test')).toBeVisible()
    await expect(page.locator('text=Changed Title')).not.toBeVisible()
  })

  test('should allow user to delete a task', async ({ page }) => {
    // Create a task first
    await page.fill('input[id="task-title"]', 'Delete Test Task')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Delete Test Task')).toBeVisible()

    // Click delete button
    const taskCard = page.locator('text=Delete Test Task').locator('../..')
    await taskCard.locator('button[aria-label="Delete task"]').click()

    // Confirmation dialog should appear
    const dialog = page.locator('text=Delete Task').locator('..')
    await expect(dialog).toBeVisible()
    await expect(dialog.locator('text=Delete Test Task')).toBeVisible()

    // Click confirm delete
    await dialog.locator('button:has-text("Delete Task")').click()

    // Task should be removed
    await expect(page.locator('text=Delete Test Task')).not.toBeVisible()

    // Empty state should show
    await expect(page.locator('text=No tasks yet')).toBeVisible()
  })

  test('should allow user to cancel deleting a task', async ({ page }) => {
    // Create a task first
    await page.fill('input[id="task-title"]', 'Cancel Delete Test')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Cancel Delete Test')).toBeVisible()

    // Click delete button
    const taskCard = page.locator('text=Cancel Delete Test').locator('../..')
    await taskCard.locator('button[aria-label="Delete task"]').click()

    // Confirmation dialog should appear
    const dialog = page.locator('text=Delete Task').locator('..')
    await expect(dialog).toBeVisible()

    // Click cancel
    await dialog.locator('button:has-text("Cancel")').click()

    // Task should remain
    await expect(page.locator('text=Cancel Delete Test')).toBeVisible()
  })

  test('should display multiple tasks in list', async ({ page }) => {
    // Create multiple tasks
    await page.fill('input[id="task-title"]', 'First Task')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=First Task')).toBeVisible()

    await page.fill('input[id="task-title"]', 'Second Task')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Second Task')).toBeVisible()

    await page.fill('input[id="task-title"]', 'Third Task')
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Third Task')).toBeVisible()

    // All tasks should be visible
    await expect(page.locator('text=First Task')).toBeVisible()
    await expect(page.locator('text=Second Task')).toBeVisible()
    await expect(page.locator('text=Third Task')).toBeVisible()
  })
})
