# AI Agent Example Tasks

This document shows how to approach common feature additions using patterns from the codebase. Use these as templates when implementing similar tasks.

---

## Task 1: Add a new API route that uses `lib/supabase`

**Scenario:** Create an endpoint to fetch user course progress from the database.

### Checklist

- [ ] Create `app/api/user/course-progress/route.ts`
- [ ] Import `createServerSupabaseClient` from `lib/supabase/server.ts`
- [ ] Check auth session (abort with 401 if no session)
- [ ] Query `courses` and `user_courses` tables via Supabase client
- [ ] Return JSON with proper error handling (try/catch, 500 on error)
- [ ] Test with Playwright: call the endpoint in authenticated context
- [ ] Update `tests/e2e/course-flow.spec.ts` or create `tests/e2e/api.spec.ts`

### Starter Code

**File: `app/api/user/course-progress/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * GET /api/user/course-progress
 * Fetch user's progress on all enrolled courses.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Query course progress
    const { data: progressData, error: progressError } = await supabase
      .from('user_courses')
      .select('id, course_id, progress, completed_at, courses(id, title)')
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (progressError) {
      console.error('Error fetching course progress:', progressError)
      return NextResponse.json(
        { error: 'Failed to fetch progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({ progress: progressData })

  } catch (error) {
    console.error('Error in course-progress API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

**Test snippet (add to `tests/e2e/course-flow.spec.ts`):**

```typescript
test('fetches user course progress via API', async ({ page }) => {
  // Assumes authenticated context (storageState: '.auth/user.json')
  const response = await page.request.get('/api/user/course-progress')
  
  expect(response.status()).toBe(200)
  const json = await response.json()
  expect(json).toHaveProperty('progress')
  expect(Array.isArray(json.progress)).toBe(true)
})
```

---

## Task 2: Add a Playwright test for a new admin feature

**Scenario:** Test the admin ability to view and approve pending courses.

### Test Task Checklist

- [ ] Create admin login PageObject (or use existing `AuthPage`)
- [ ] Create admin-specific page object (e.g., `AdminCoursesPage.ts`) with selectors for:
  - Pending courses list
  - Approve button
  - Course status indicator
- [ ] Write test in `tests/e2e/admin.spec.ts`
- [ ] Use admin credentials from `process.env.ADMIN_EMAIL`, `ADMIN_PASS` (or `.auth/admin.json` for pre-auth)
- [ ] Assert navigation, button clicks, and status changes
- [ ] Run test locally: `npm run test:e2e` (or `npm run test:ui` for interactive)

### Starter Files

**File: `tests/pageObjects/AdminCoursesPage.ts`**

```typescript
import { expect, type Page } from '@playwright/test'

export class AdminCoursesPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/admin/courses', { waitUntil: 'networkidle' })
  }

  async waitForReady() {
    await expect(this.page.getByRole('heading', { name: /pending courses/i })).toBeVisible()
  }

  async getPendingCourseCount(): Promise<number> {
    const rows = await this.page.locator('table tbody tr').count()
    return rows
  }

  async approveCourseByTitle(courseTitle: string) {
    const row = this.page.locator('table tbody tr', {
      has: this.page.locator(`text=${courseTitle}`),
    })
    await row.locator('button', { hasText: 'Approve' }).click()
  }

  async assertCourseApproved(courseTitle: string) {
    const row = this.page.locator('table tbody tr', {
      has: this.page.locator(`text=${courseTitle}`),
    })
    await expect(row.locator('[data-status="approved"]')).toBeVisible()
  }
}
```

**File: `tests/e2e/admin.spec.ts`** (new file)

```typescript
import { expect, test } from '@playwright/test'
import { AuthPage } from '../pageObjects/AuthPage'
import { AdminCoursesPage } from '../pageObjects/AdminCoursesPage'

test.describe('Admin course approval flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    const authPage = new AuthPage(page)
    await authPage.goto()
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    const adminPass = process.env.ADMIN_PASS || 'admin-password'
    await authPage.login(adminEmail, adminPass)
  })

  test('views pending courses and approves one', async ({ page }) => {
    const adminCourses = new AdminCoursesPage(page)
    await adminCourses.goto()
    await adminCourses.waitForReady()

    const initialCount = await adminCourses.getPendingCourseCount()
    expect(initialCount).toBeGreaterThan(0)

    const courseTitle = 'Test Course for Approval'
    await adminCourses.approveCourseByTitle(courseTitle)
    
    // Wait for approval confirmation (toast or redirect)
    await expect(page.getByText(/approved successfully/i)).toBeVisible()
    
    await adminCourses.assertCourseApproved(courseTitle)
  })
})
```

---

## Common Patterns

### Using Supabase in API routes

```typescript
// Always start with:
const supabase = await createServerSupabaseClient()
const { data: { session } } = await supabase.auth.getSession()
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Then query:
const { data, error } = await supabase.from('table_name').select(...).eq(...)
if (error) console.error(error); return NextResponse.json({ error: '...' }, { status: 500 })

// Return:
return NextResponse.json({ data })
```

### Playwright page objects

```typescript
// Structure: one class per page/feature
// Methods: goto(), wait*(), click*(), assert*()
// Use page.getByRole(), page.locator() for selectors
// Always await and expect appropriately
export class MyPage {
  constructor(private page: Page) {}
  async goto() { await this.page.goto('/path', { waitUntil: 'networkidle' }) }
  async myAction() { await this.page.getByRole('button', { name: /text/i }).click() }
  async assertState() { await expect(this.page.getByRole('heading')).toBeVisible() }
}
```

### Error handling

- API routes: wrap in try/catch, log errors, return 500 with generic message
- Tests: use `test.skip()` if preconditions missing (e.g., `USER_EMAIL` not set)
- Always check for auth before querying user-specific data

---

## Next Steps

- Use these templates as **starting points** — adapt selectors, column names, and endpoint logic to your actual feature
- Reference existing test files in `tests/e2e/` and page objects in `tests/pageObjects/` for exact patterns
- Run `npm run test:e2e` locally to validate your tests before pushing
- Update `DATABASE_SCHEMA.md` if your API route adds or modifies tables
