import { expect, test } from '@playwright/test'
import { AuthPage } from '../pageObjects/AuthPage'

/**
 * Admin Login & Dashboard Flow
 * 
 * Tests admin authentication and access to the admin dashboard.
 * Requires ADMIN_EMAIL and ADMIN_PASS environment variables.
 */

test.describe('Admin login flow', () => {
  test.use({ storageState: undefined })

  test('logs in as admin and views admin dashboard', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASS

    test.skip(
      !adminEmail || !adminPass,
      'ADMIN_EMAIL and ADMIN_PASS must be set to run admin tests.'
    )

    const authPage = new AuthPage(page)
    await authPage.goto()
    
    // Admin login (reuses AuthPage, assumes /login routes to correct form)
    await authPage.login(adminEmail!, adminPass!)

    // After login, verify admin dashboard redirect
    await expect(page).toHaveURL(/\/admin/)
    
    // Verify admin dashboard heading
    await expect(page.getByRole('heading', { name: /admin dashboard|admin panel/i }))
      .toBeVisible({ timeout: 10000 })

    // Verify key admin sections appear (sidebar, stats, tables, etc.)
    // Adapt these selectors to match your actual admin layout
    await expect(page.locator('[data-testid="admin-sidebar"]')).toBeVisible()
  })

  test('admin can navigate to users section', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASS

    test.skip(!adminEmail || !adminPass, 'ADMIN_EMAIL and ADMIN_PASS required.')

    const authPage = new AuthPage(page)
    await authPage.goto()
    await authPage.login(adminEmail!, adminPass!)
    await expect(page).toHaveURL(/\/admin/)

    // Click "Users" link in sidebar or menu
    await page.getByRole('link', { name: /users|manage users/i }).click()

    // Verify users page loaded
    await expect(page).toHaveURL(/\/admin\/users/)
    await expect(page.getByRole('heading', { name: /users/i })).toBeVisible()
    
    // Verify users table/list is present
    await expect(page.locator('table, [data-testid="users-list"]')).toBeVisible()
  })

  test('admin can logout', async ({ page }) => {
    const adminEmail = process.env.ADMIN_EMAIL
    const adminPass = process.env.ADMIN_PASS

    test.skip(!adminEmail || !adminPass, 'ADMIN_EMAIL and ADMIN_PASS required.')

    const authPage = new AuthPage(page)
    await authPage.goto()
    await authPage.login(adminEmail!, adminPass!)

    // Logout using existing AuthPage method
    await authPage.logout()

    // After logout, verify redirect to home
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/$/)
  })
})
