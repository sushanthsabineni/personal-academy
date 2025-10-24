# Quick Start Guide - Link Validation Tests

## Prerequisites

1. Make sure your Next.js dev server is NOT running
2. The test suite will automatically start the dev server

## Run Tests

```bash
# Simple command to run all link validation tests
npm run test:links
```

## What Gets Tested

✅ **38+ Public Routes** - All pages accessible without login  
✅ **11 Authenticated Routes** - Protected pages that require login  
✅ **8 Admin Routes** - Admin-only pages  
✅ **Header Navigation** - All navigation buttons and links  
✅ **Footer Links** - All footer navigation  
✅ **Sidebar Navigation** - Course creation sidebar  
✅ **Button Actions** - All buttons with router.push()  
✅ **404 Handling** - Verify invalid routes return 404  
✅ **External Links** - Social media links  

## Expected Output

You'll see colorful console output like this:

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
✓ Footer: AI Course Generator
✓ Footer: Pricing Plans
...

========================================
   TEST SUMMARY REPORT
========================================
Total Tests:  85
Passed:       85
Failed:       0
Pass Rate:    100.00%
========================================
```

## Test Modes

### 1. Standard Mode (Recommended)
```bash
npm run test:links
```
- Runs all tests
- Shows pass/fail in terminal
- Fastest execution

### 2. UI Mode (Interactive)
```bash
npm run test:links:ui
```
- Opens Playwright UI
- See tests run in real-time
- Click to debug specific tests
- Great for development

### 3. View Report
```bash
npm run test:links:report
```
- Opens HTML report in browser
- See detailed test results
- Screenshots of failures
- Trace viewer for debugging

## Common Scenarios

### ✅ All Tests Pass
```
Passed: 85
Failed: 0
Pass Rate: 100.00%
```
**Action**: Great! All links are working.

### ❌ Some Tests Fail
```
Passed: 80
Failed: 5
Pass Rate: 94.12%

Failed Routes:
  ✗ /some-route - 404 Not Found
```
**Action**: Check failed routes and fix them or update tests.

### ⏱️ Tests Timeout
```
Error: page.goto: Timeout 30000ms exceeded
```
**Action**: 
1. Make sure dev server can start on port 3000
2. Check if another process is using port 3000
3. Increase timeout in `playwright.config.ts`

## Troubleshooting

### Port Already in Use
```bash
# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

### Dev Server Won't Start
Make sure you're in the project directory and dependencies are installed:
```bash
npm install
npm run dev  # Test if server starts manually
```

### Tests Run But Fail
1. Check if routes exist in `app/` directory
2. Verify component links match test expectations
3. Look for typos in hrefs
4. Check authentication requirements

## Updating Tests

When you add new routes or links:

1. **Open** `tests/links.test.ts`

2. **Add** your route to the appropriate array:
   ```typescript
   const publicRoutes = [
     '/',
     '/your-new-route',  // Add here
   ];
   ```

3. **Run** tests to verify:
   ```bash
   npm run test:links
   ```

## CI/CD

These tests run automatically on:
- Pull requests
- Commits to main branch
- Manual workflow dispatch

Check the Actions tab in GitHub for results.

## Need Help?

- Check `tests/README.md` for detailed documentation
- Review Playwright docs: https://playwright.dev
- Check test output for specific error messages

---

**Pro Tip**: Run tests before committing changes to catch broken links early! 🚀
