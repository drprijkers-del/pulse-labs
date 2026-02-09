import { test, expect } from '@playwright/test'

test.describe('Sign In Page', () => {
  test('shows Clerk sign-in form', async ({ page }) => {
    await page.goto('/sign-in')
    await expect(page.locator('text=Log in').first()).toBeVisible()
    // Clerk renders its own form elements inside an iframe/shadow DOM
    // Just verify the page loads and shows our heading
    await expect(page.locator('h1')).toContainText('Log in')
  })

  test('redirects unauthenticated /teams access to sign-in', async ({ page }) => {
    await page.goto('/teams')
    await expect(page).toHaveURL(/\/sign-in/)
  })
})
