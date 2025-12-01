import { expect, test } from '@playwright/test'
import { CourseWizardPage } from '../pageObjects/CourseWizardPage'

/**
 * Course Creation Outline Flow (Template)
 * 
 * Tests the key milestones of course creation:
 * - Dashboard access
 * - Course wizard initiation
 * - Essentials form fill
 * - Navigation through wizard steps
 * - Course overview/preview
 * 
 * Uses existing page objects and patterns from course-flow.spec.ts.
 * Adapt as needed for your actual course creation requirements.
 */

test.describe.serial('Course creation outline', () => {
  test.use({ storageState: '.auth/user.json' })

  test('user can initiate course creation from dashboard', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    // Verify dashboard loaded
    await expect(page.getByRole('heading', { name: /welcome|dashboard/i }))
      .toBeVisible({ timeout: 10000 })

    // Find and click "Create Course" button
    const createButton = page.getByRole('button', { name: /create course|new course/i }).first()
    await expect(createButton).toBeVisible()
    await createButton.click()

    // Should redirect to course creation wizard
    await expect(page).toHaveURL(/\/create/)
  })

  test('course wizard loads and user fills essentials', async ({ page }) => {
    await page.goto('/create', { waitUntil: 'networkidle' })

    const courseWizard = new CourseWizardPage(page)

    // Verify wizard is ready
    await expect(page.getByRole('heading', { name: /course details|essentials|create/i }))
      .toBeVisible()

    // Fill course essentials
    const courseTitle = `Test Course ${Date.now()}`
    await courseWizard.fillEssentialInformation({
      title: courseTitle,
      industry: 'Technology',
      targetAudience: 'Developers',
      learningOutcomes: 'Understand core concepts and apply in practice.',
    })

    // After filling essentials, verify form submission (wizard progresses)
    // Adapt based on your actual next step (confirmation, multimedia, etc.)
    await expect(page).toHaveURL(/\/create\/(multimedia|modules|storyboard)/)
  })

  test('course wizard shows progress indicator', async ({ page }) => {
    await page.goto('/create', { waitUntil: 'networkidle' })

    // Verify progress bar or step indicator exists
    // Adapt selector to match your actual progress UI
    await expect(
      page.locator('[data-testid="course-wizard-progress"], .wizard-progress, [role="progressbar"]')
    ).toBeVisible()

    // Verify step labels (essentials, multimedia, modules, etc.)
    await expect(
      page.locator('text=/essentials|step 1/i').first()
    ).toBeVisible()
  })

  test('user can navigate back to dashboard from wizard', async ({ page }) => {
    await page.goto('/create', { waitUntil: 'networkidle' })

    // Find back/cancel button
    const backButton = page.getByRole('button', { name: /back|cancel|dashboard/i }).first()
    
    // If no button, try link
    if (!(await backButton.isVisible())) {
      await page.getByRole('link', { name: /back|dashboard/i }).click()
    } else {
      await backButton.click()
    }

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/)
  })

  test('course creation requires authentication', async ({ page }) => {
    // Visit course creation while logged out
    const context = page.context()
    await context.clearCookies()
    
    await page.goto('/create', { waitUntil: 'networkidle' })

    // Should redirect to login or show auth error
    const isLoginPage = page.url().includes('/login')
    const isErrorMessage = await page.getByText(/unauthorized|sign in|login/i).isVisible()

    expect(isLoginPage || isErrorMessage).toBeTruthy()
  })
})
