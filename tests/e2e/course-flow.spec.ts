import { expect, test } from '@playwright/test';
import { AuthPage } from '../pageObjects/AuthPage';
import { CourseWizardPage } from '../pageObjects/CourseWizardPage';
import { ModulesPage } from '../pageObjects/ModulesPage';
import { StoryboardPage } from '../pageObjects/StoryboardPage';
import { fetchLatestCourseIdForUser } from '../utils/supabaseAdmin';

test.describe('Authentication flow', () => {
  test.use({ storageState: undefined });

  test('logs in via the sign-in form and lands on the dashboard', async ({ page }) => {
    const email = process.env.USER_EMAIL;
    const password = process.env.USER_PASS;

    test.skip(!email || !password, 'USER_EMAIL and USER_PASS must be set to run authentication tests.');

    const authPage = new AuthPage(page);
    await authPage.goto();
    await authPage.login(email!, password!);
    await authPage.assertDashboard();
  });
});

test.describe.serial('Course creation journey', () => {
  test.use({ storageState: '.auth/user.json' });

  test('creates, edits, reviews, and prepares a course for publish', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();

    await page.getByRole('button', { name: 'Create Course' }).first().click();

    const courseWizard = new CourseWizardPage(page);
    const courseTitle = `Automation Course ${Date.now()}`;
    let courseId = await courseWizard.fillEssentialInformation({
      title: courseTitle,
      industry: 'Technology',
      targetAudience: 'Team Leads and Managers',
      learningOutcomes:
        'Learners will analyze real-world case studies, design actionable plans, and implement cross-team improvements with confidence.',
    });

    await courseWizard.configureMultimedia({
      courseType: 'Interactive',
      multimediaSelections: ['Audio Narration Script', 'Image Generation Prompts'],
    });

    if (!courseId) {
      const email = process.env.USER_EMAIL;
      test.skip(!email, 'USER_EMAIL is required to resolve the latest course identifier.');
      courseId = (await fetchLatestCourseIdForUser(email!)) ?? '';
    }

    test.skip(!courseId, 'Unable to determine the created course identifier.');

    const modulesPage = new ModulesPage(page, courseId);
    await modulesPage.waitForReady();
    const primaryModule = await modulesPage.addModule();
    const seededLessonTitle = 'Automation Lesson';
    await modulesPage.seedLesson(primaryModule.id, primaryModule.title, seededLessonTitle);
    await modulesPage.deleteLessonByTitle(primaryModule, seededLessonTitle);
    await modulesPage.addAndDeleteAdditionalModule();
    await modulesPage.approveAllModules();
    await modulesPage.proceedToStoryboard();

    const storyboardPage = new StoryboardPage(page);
    await storyboardPage.waitForLoad();
    await storyboardPage.addSlide();
    await storyboardPage.openPublishPreview();

    await page.getByRole('button', { name: 'Back to Dashboard' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    const authPage = new AuthPage(page);
    await authPage.logout();
    await expect(page).toHaveURL(/\/$/);
  });
});
