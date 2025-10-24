# Link Validation Test Suite

Comprehensive link validation testing for the Personal Academy Next.js application using Playwright.

## Overview

This test suite validates all navigation links, routes, and buttons in the application to ensure:
- ✓ No 404 errors on defined routes
- ✓ All navigation links work correctly
- ✓ Header dropdown links are valid
- ✓ Footer links are accessible
- ✓ Sidebar navigation is functional
- ✓ Button clicks navigate to correct destinations

## Installation

Dependencies are already installed. If you need to reinstall:

```bash
npm install -D @playwright/test
```

## Running Tests

### Run all link validation tests:
```bash
npm run test:links
```

### Run tests with UI mode (interactive):
```bash
npm run test:links:ui
```

### View test report:
```bash
npm run test:links:report
```

## Test Coverage

### 1. **Public Routes** (19 routes)
Tests all publicly accessible pages:
- Landing page (`/`)
- Authentication (`/login`)
- Marketing pages (`/pricing`, `/refer`)
- Support pages (`/help`, `/faq`, `/support`, `/tutorials`, `/api-docs`)
- Legal pages (`/terms-of-service`, `/terms-of-use`)
- Trust Center (`/trust/*`)

### 2. **Authenticated Routes** (11 routes)
Tests protected pages (may redirect to login):
- Dashboard (`/dashboard`)
- Course creation flow (`/create/*`)
- Account management (`/account/*`)

### 3. **Admin Routes** (8 routes)
Tests admin-only pages:
- Admin dashboard and management
- Configuration pages
- User and expense management

### 4. **Header Navigation**
Tests navigation buttons in Header component:
- ✓ Pricing button
- ✓ Refer & Earn button
- ✓ Login/Sign Up button
- ✓ Logo navigation
- ✓ Dashboard button (authenticated)
- ✓ Credits button (authenticated)
- ✓ Notifications icon
- ✓ Theme toggle
- ✓ User dropdown menu items

### 5. **Footer Links**
Tests all footer navigation links:
- Products section (4 links)
- Support section (4 links)
- Trust Center section (5 links)
- Quick links
- External social links (LinkedIn, YouTube)

### 6. **CreateCourseSidebar**
Tests course creation sidebar navigation:
- ✓ Course Info (`/create/essentials`)
- ✓ Multimedia (`/create/multimedia`)
- ✓ Modules (`/create/modules`)
- ✓ Storyboard (`/create/storyboard`)
- ✓ Coming Soon links (Course Developer, SME Review, Publish)

### 7. **Button Navigation**
Tests all buttons using `router.push()`:
- Landing page CTAs
- Course creation navigation
- Dashboard actions
- Account navigation

### 8. **404 Error Handling**
Verifies non-existent routes properly return 404 errors.

### 9. **Logo Navigation**
Tests logo click behavior based on authentication state.

### 10. **External Links**
Validates external social media links.

## Test Output

The test suite provides colorful console output with:
- ✓ Green checkmarks for passing tests
- ✗ Red X marks for failing tests
- Detailed error messages for failures
- Summary report with pass/fail statistics

### Example Output:
```
========================================
   LINK VALIDATION TEST SUITE
========================================

Testing Public Routes...
✓ / - OK
✓ /login - OK
✓ /pricing - OK
✓ /refer - OK
...

Testing Footer Links...
✓ Footer: AI Course Generator - Expected: /create, Got: /create
✓ Footer: Pricing Plans - Expected: /pricing, Got: /pricing
...

========================================
   TEST SUMMARY REPORT
========================================
Total Tests:  85
Passed:       83
Failed:       2
Pass Rate:    97.65%
========================================
```

## Configuration

Test configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:3000` (configurable via `BASE_URL` env var)
- **Browser**: Chromium (can add Firefox, WebKit)
- **Workers**: 1 (sequential execution)
- **Retries**: 0 locally, 2 on CI
- **Reports**: List format + HTML report

## Advanced Usage

### Run specific test:
```bash
npx playwright test --grep "Header Navigation"
```

### Run in headed mode (see browser):
```bash
npx playwright test --headed
```

### Debug mode:
```bash
npx playwright test --debug
```

### Run on different browser:
```bash
npx playwright test --project=chromium
```

### Set custom base URL:
```bash
BASE_URL=http://localhost:4000 npm run test:links
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# GitHub Actions example
- name: Install dependencies
  run: npm ci

- name: Run link validation tests
  run: npm run test:links

- name: Upload test report
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

### Tests timing out
Increase timeout in `playwright.config.ts`:
```typescript
use: {
  timeout: 30000, // 30 seconds per test
}
```

### Port conflicts
Change the port in `playwright.config.ts`:
```typescript
webServer: {
  command: 'PORT=3001 npm run dev',
  url: 'http://localhost:3001',
}
```

### Dev server not starting
Ensure no other process is using port 3000:
```bash
# Windows
netstat -ano | findstr :3000

# Kill process
taskkill /PID <PID> /F
```

## Maintenance

When adding new routes or links:

1. Add route to appropriate array in `tests/links.test.ts`:
   - `publicRoutes`
   - `authenticatedRoutes`
   - `adminRoutes`

2. Add link tests for new components

3. Run tests to verify:
   ```bash
   npm run test:links
   ```

## Test Structure

```
tests/
  └── links.test.ts          # Main test suite

playwright.config.ts         # Playwright configuration
playwright-report/           # HTML test reports (generated)
test-results/               # Test artifacts (generated)
```

## Best Practices

1. **Run tests before committing** - Catch broken links early
2. **Update tests when adding routes** - Keep tests in sync
3. **Review failed tests** - Fix broken links or update tests
4. **Monitor test performance** - Optimize slow-running tests
5. **Use CI/CD** - Automate testing on every push

## Support

For issues or questions:
- Check Playwright docs: https://playwright.dev
- Review test output for specific failures
- Verify dev server is running properly

---

**Last Updated**: October 24, 2025
