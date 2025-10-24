import { test, expect, Page } from '@playwright/test';

/**
 * Comprehensive Link Validation Test Suite for Next.js App
 * 
 * Tests:
 * 1. All routes defined in app/ directory
 * 2. No 404 errors
 * 3. Navigation links in Header component
 * 4. Button navigation with router.push()
 * 5. Sidebar links in CreateCourseSidebar
 * 6. Footer links
 * 
 * Output: Console log with ✓ or ✗ for each link + summary report
 */

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Test results tracking
interface TestResult {
  route: string;
  status: 'pass' | 'fail';
  statusCode?: number;
  error?: string;
}

const testResults: TestResult[] = [];

// All routes from the app/ directory structure
const publicRoutes = [
  '/',
  '/login',
  '/pricing',
  '/refer',
  '/faq',
  '/help',
  '/support',
  '/tutorials',
  '/api-docs',
  '/terms-of-service',
  '/terms-of-use',
  '/coming-soon',
  '/trust',
  '/trust/privacy',
  '/trust/gdpr',
  '/trust/cookies',
  '/trust/terms-of-service',
  '/trust/terms-of-use',
];

const authenticatedRoutes = [
  '/dashboard',
  '/create',
  '/create/essentials',
  '/create/multimedia',
  '/create/modules',
  '/create/storyboard',
  '/account/credits',
  '/account/pricing',
  '/account/purchases',
  '/account/referrals',
  '/account/settings',
];

const adminRoutes = [
  '/admin/login',
  '/admin/dashboard',
  '/admin/users',
  '/admin/expenses',
  '/admin/settings',
  '/admin/config/platform',
  '/admin/config/pricing',
  '/admin/config/ai-credits',
  '/padmin',
];

// Helper function to log results
function logResult(route: string, success: boolean, details?: string) {
  const icon = success ? '✓' : '✗';
  const color = success ? colors.green : colors.red;
  const message = `${color}${icon}${colors.reset} ${route}${details ? ` - ${details}` : ''}`;
  console.log(message);
  
  testResults.push({
    route,
    status: success ? 'pass' : 'fail',
    error: details,
  });
}

// Helper function to check if page exists (not 404)
async function checkPageExists(page: Page, route: string): Promise<boolean> {
  try {
    const response = await page.goto(route, { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    const statusCode = response?.status() || 0;
    
    // Check for 404 in page content
    const content = await page.content();
    const is404 = content.includes('404') && content.includes('not found');
    
    if (statusCode === 404 || is404) {
      return false;
    }
    
    return statusCode >= 200 && statusCode < 400;
  } catch {
    return false;
  }
}

test.describe('Link Validation Test Suite', () => {
  
  test.beforeAll(async () => {
    console.log(`\n${colors.cyan}${colors.bold}========================================`);
    console.log(`   LINK VALIDATION TEST SUITE`);
    console.log(`========================================${colors.reset}\n`);
  });

  test.afterAll(async () => {
    // Generate summary report
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;
    const total = testResults.length;
    const passRate = ((passed / total) * 100).toFixed(2);

    console.log(`\n${colors.cyan}${colors.bold}========================================`);
    console.log(`   TEST SUMMARY REPORT`);
    console.log(`========================================${colors.reset}`);
    console.log(`Total Tests:  ${total}`);
    console.log(`${colors.green}Passed:       ${passed}${colors.reset}`);
    console.log(`${colors.red}Failed:       ${failed}${colors.reset}`);
    console.log(`Pass Rate:    ${passRate}%`);
    console.log(`${colors.cyan}========================================${colors.reset}\n`);

    if (failed > 0) {
      console.log(`${colors.red}${colors.bold}Failed Routes:${colors.reset}`);
      testResults
        .filter(r => r.status === 'fail')
        .forEach(r => {
          console.log(`  ${colors.red}✗${colors.reset} ${r.route}${r.error ? ` - ${r.error}` : ''}`);
        });
      console.log('');
    }
  });

  test('1. Public Routes - Verify all public routes exist', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Public Routes...${colors.reset}`);
    
    for (const route of publicRoutes) {
      const exists = await checkPageExists(page, route);
      logResult(route, exists, exists ? 'OK' : '404 Not Found');
      expect(exists, `Route ${route} should exist`).toBeTruthy();
    }
  });

  test('2. Authenticated Routes - Verify authenticated routes exist', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Authenticated Routes...${colors.reset}`);
    console.log(`${colors.cyan}Note: These may redirect to login if not authenticated${colors.reset}`);
    
    for (const route of authenticatedRoutes) {
      const response = await page.goto(route, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      const statusCode = response?.status() || 0;
      const currentUrl = page.url();
      
      // Route exists if it loads (even if redirected) and doesn't 404
      const exists = statusCode !== 404 && !currentUrl.includes('404');
      logResult(route, exists, exists ? `OK (${statusCode})` : '404 Not Found');
      expect(exists, `Route ${route} should exist (may redirect)`).toBeTruthy();
    }
  });

  test('3. Admin Routes - Verify admin routes exist', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Admin Routes...${colors.reset}`);
    console.log(`${colors.cyan}Note: These require admin authentication${colors.reset}`);
    
    for (const route of adminRoutes) {
      const response = await page.goto(route, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      const statusCode = response?.status() || 0;
      const exists = statusCode !== 404;
      logResult(route, exists, exists ? `OK (${statusCode})` : '404 Not Found');
      expect(exists, `Admin route ${route} should exist`).toBeTruthy();
    }
  });

  test('4. Header Navigation - Public (Not Logged In)', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Header Navigation (Public)...${colors.reset}`);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Test Pricing button
    const pricingButton = page.locator('button:has-text("Pricing")');
    if (await pricingButton.isVisible()) {
      await pricingButton.click();
      await page.waitForURL('**/pricing', { timeout: 5000 });
      logResult('Header: Pricing button', page.url().includes('/pricing'));
      expect(page.url()).toContain('/pricing');
    }

    // Navigate back
    await page.goto('/');

    // Test Refer & Earn button
    const referButton = page.locator('button:has-text("Refer & Earn")');
    if (await referButton.isVisible()) {
      await referButton.click();
      await page.waitForURL('**/refer', { timeout: 5000 });
      logResult('Header: Refer & Earn button', page.url().includes('/refer'));
      expect(page.url()).toContain('/refer');
    }

    // Navigate back
    await page.goto('/');

    // Test Login button
    const loginButton = page.locator('button:has-text("Login / Sign Up")');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForURL('**/login', { timeout: 5000 });
      logResult('Header: Login button', page.url().includes('/login'));
      expect(page.url()).toContain('/login');
    }
  });

  test('5. Footer Navigation - All Links', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Footer Links...${colors.reset}`);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Footer links to test
    const footerLinks = [
      { text: 'AI Course Generator', href: '/create' },
      { text: 'Pricing Plans', href: '/pricing' },
      { text: 'Dashboard', href: '/dashboard' },
      { text: 'Referral Program', href: '/refer' },
      { text: 'Help Center', href: '/help' },
      { text: 'FAQ', href: '/faq' },
      { text: 'Tutorials', href: '/tutorials' },
      { text: 'API Documentation', href: '/api-docs' },
      { text: 'Overview', href: '/trust' },
      { text: 'Privacy Policy', href: '/trust/privacy' },
      { text: 'GDPR', href: '/trust/gdpr' },
    ];

    for (const link of footerLinks) {
      const linkElement = page.locator(`footer a:has-text("${link.text}")`).first();
      if (await linkElement.isVisible()) {
        const href = await linkElement.getAttribute('href');
        const matches = href === link.href;
        logResult(`Footer: ${link.text}`, matches, `Expected: ${link.href}, Got: ${href}`);
        expect(href).toBe(link.href);
      } else {
        logResult(`Footer: ${link.text}`, false, 'Link not found in footer');
      }
    }
  });

  test('6. CreateCourseSidebar - All Navigation Links', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing CreateCourseSidebar Links...${colors.reset}`);
    
    // Navigate to a create page to see sidebar
    await page.goto('/create/essentials');
    await page.waitForLoadState('domcontentloaded');

    // Sidebar navigation links
    const sidebarLinks = [
      { label: 'Course Info', href: '/create/essentials' },
      { label: 'Multimedia', href: '/create/multimedia' },
      { label: 'Modules', href: '/create/modules' },
      { label: 'Storyboard', href: '/create/storyboard' },
    ];

    for (const link of sidebarLinks) {
      const linkElement = page.locator(`aside a[href="${link.href}"]`);
      const exists = await linkElement.count() > 0;
      
      if (exists) {
        const href = await linkElement.getAttribute('href');
        logResult(`Sidebar: ${link.label}`, href === link.href, `href: ${href}`);
        expect(href).toBe(link.href);
      } else {
        logResult(`Sidebar: ${link.label}`, false, 'Link not found in sidebar');
      }
    }

    // Test "Coming Soon" links
    const comingSoonLinks = [
      { label: 'Course Developer', href: '/coming-soon' },
      { label: 'SME Review', href: '/coming-soon' },
      { label: 'Publish', href: '/coming-soon' },
    ];

    for (const link of comingSoonLinks) {
      const linkElement = page.locator(`aside a[href="${link.href}"]`);
      const count = await linkElement.count();
      logResult(`Sidebar (Coming Soon): ${link.label}`, count > 0, `Found: ${count}`);
    }
  });

  test('7. Button Navigation - Router.push() Buttons', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Button Navigation (router.push)...${colors.reset}`);
    
    // Test main CTA on landing page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const getStartedButton = page.locator('button:has-text("Get Started Free")').first();
    if (await getStartedButton.isVisible()) {
      await getStartedButton.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      const success = url.includes('/login') || url.includes('/dashboard');
      logResult('Landing Page: Get Started button', success, `Navigated to: ${url}`);
    }

    // Test "Start Creating" button from landing
    await page.goto('/');
    const startCreatingButton = page.locator('button:has-text("Start Creating")').first();
    if (await startCreatingButton.isVisible()) {
      await startCreatingButton.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      logResult('Landing Page: Start Creating button', url.includes('/coming-soon'), `Navigated to: ${url}`);
    }
  });

  test('8. 404 Page - Verify non-existent routes return 404', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing 404 Error Handling...${colors.reset}`);
    
    const nonExistentRoutes = [
      '/this-page-does-not-exist',
      '/random-invalid-route',
      '/test/nested/invalid',
    ];

    for (const route of nonExistentRoutes) {
      const response = await page.goto(route, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      const statusCode = response?.status() || 0;
      const content = await page.content();
      const is404 = statusCode === 404 || content.includes('404') || content.includes('not found');
      
      logResult(`404 Check: ${route}`, is404, is404 ? '404 (Correct)' : `Got ${statusCode} (Should be 404)`);
      expect(is404, `Non-existent route ${route} should return 404`).toBeTruthy();
    }
  });

  test('9. Logo Navigation - Test logo click behavior', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing Logo Navigation...${colors.reset}`);
    
    // Test logo from landing page
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const logo = page.locator('header button img[alt="Personal Academy"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForTimeout(1000);
      const url = page.url();
      logResult('Logo click (not logged in)', url.endsWith('/') || url.includes('localhost:3000'), `URL: ${url}`);
    }
  });

  test('10. External Links - Verify external links are valid', async ({ page }) => {
    console.log(`\n${colors.yellow}${colors.bold}Testing External Links...${colors.reset}`);
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Check LinkedIn link
    const linkedinLink = page.locator('footer a[href*="linkedin.com"]').first();
    if (await linkedinLink.isVisible()) {
      const href = await linkedinLink.getAttribute('href');
      const isValid = href?.includes('linkedin.com');
      logResult('External: LinkedIn', isValid || false, `href: ${href}`);
    }

    // Check YouTube link
    const youtubeLink = page.locator('footer a[href*="youtube.com"]').first();
    if (await youtubeLink.isVisible()) {
      const href = await youtubeLink.getAttribute('href');
      const isValid = href?.includes('youtube.com');
      logResult('External: YouTube', isValid || false, `href: ${href}`);
    }
  });
});
