import { test, expect } from '@playwright/test'

/**
 * E2E tests for authentication flow
 * Tests signup, signin, signout, and route protection
 */

test.describe('Authentication Flow', () => {
  const testUser = {
    email: `test-${Date.now()}@example.com`,
    password: 'testpassword123',
    name: 'Test User',
  }

  test('should redirect unauthenticated user to signin', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/signin/)
  })

  test('should allow user to sign up', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', testUser.password)
    await page.fill('input[name="name"]', testUser.name)

    await page.click('button[type="submit"]')

    // Should redirect to dashboard after successful signup
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(
      page.locator('text=Welcome,')
    ).toBeVisible()
  })

  test('should allow user to sign in', async ({ page }) => {
    await page.goto('/signin')

    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)

    await page.click('button[type="submit"]')

    // Should redirect to dashboard after successful signin
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(
      page.locator('text=Welcome,')
    ).toBeVisible()
  })

  test('should allow user to sign out', async ({ page }) => {
    // Sign in first
    await page.goto('/signin')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)

    // Sign out
    await page.click('text=Sign out')

    // Should redirect to signin
    await expect(page).toHaveURL(/\/signin/)
  })

  test('should redirect authenticated user away from signin', async ({
    page,
  }) => {
    // Sign in first
    await page.goto('/signin')
    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL(/\/dashboard/)

    // Try to go to signin
    await page.goto('/signin')

    // Should redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('should show validation error for mismatched passwords', async ({
    page,
  }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', testUser.password)
    await page.fill('input[name="confirmPassword"]', 'differentpassword')

    await page.click('button[type="submit"]')

    // Should show error message
    await expect(page.locator('text=Passwords do not match')).toBeVisible()
  })

  test('should show validation error for short password', async ({ page }) => {
    await page.goto('/signup')

    await page.fill('input[name="email"]', testUser.email)
    await page.fill('input[name="password"]', 'short')
    await page.fill('input[name="confirmPassword"]', 'short')

    await page.click('button[type="submit"]')

    // Should show error message
    await expect(
      page.locator('text=Password must be at least 8 characters long')
    ).toBeVisible()
  })
})
