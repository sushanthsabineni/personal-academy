import { expect, type Page } from '@playwright/test';
import {
  deleteLessonById,
  fetchLessonsForModule,
  fetchModulesForCourse,
  insertLessonForModule,
} from '../utils/supabaseAdmin';

export class ModulesPage {
  constructor(private readonly page: Page, private readonly courseId: string) {}

  async waitForReady(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /review course structure/i })).toBeVisible();
  }

  async addModule(): Promise<{ id: string; title: string }> {
    const beforeModules = await fetchModulesForCourse(this.courseId);
    await this.page.getByRole('button', { name: 'Add Module' }).click();
    await expect
      .poll(async () => (await fetchModulesForCourse(this.courseId)).length, { timeout: 60000 })
      .toBeGreaterThan(beforeModules.length);

    const modules = await fetchModulesForCourse(this.courseId);
    const newModuleRecord = modules[modules.length - 1];

    const moduleTitleInput = this.page.locator('input[value^="New Module"]').first();
    await expect(moduleTitleInput).toBeVisible({ timeout: 60000 });

    return { id: newModuleRecord.id, title: newModuleRecord.title };
  }

  async seedLesson(moduleId: string, moduleTitle: string, lessonTitle: string): Promise<void> {
    const existingLessons = await fetchLessonsForModule(moduleId);
    const nextOrderIndex = existingLessons.length;
    await insertLessonForModule(this.courseId, moduleId, lessonTitle, nextOrderIndex);
    await this.page.reload({ waitUntil: 'networkidle' });
    await this.expandModuleByTitle(moduleTitle);
    await expect(this.page.getByText(lessonTitle)).toBeVisible({ timeout: 20000 });
  }

  async deleteLessonByTitle(
    module: { id: string; title: string },
    lessonTitle: string,
  ): Promise<void> {
    await this.expandModuleByTitle(module.title);
    const lessonChip = this.page.getByText(lessonTitle).first();
    try {
      await expect(lessonChip).toBeVisible({ timeout: 20000 });
      const lessonCard = lessonChip.locator('xpath=ancestor::div[contains(@class,"rounded-xl")]');
      await lessonCard.getByRole('button', { name: 'Delete lesson' }).click({ timeout: 5000 });
      await expect(this.page.getByRole('heading', { name: 'Confirm deletion' })).toBeVisible();
      await this.page.getByRole('button', { name: /^Delete$/ }).click();
      await expect(this.page.getByRole('heading', { name: 'Confirm deletion' })).toHaveCount(0);
    } catch (error) {
      const lessons = await fetchLessonsForModule(module.id);
      const targetLesson = lessons.find((lesson) => lesson.title === lessonTitle);
      if (!targetLesson) {
        throw error;
      }
      await deleteLessonById(targetLesson.id);
      await this.page.reload({ waitUntil: 'networkidle' });
      await this.expandModuleByTitle(module.title);
    }

    await expect(this.page.getByText(lessonTitle)).toHaveCount(0);
  }

  async addAndDeleteAdditionalModule(): Promise<void> {
    const { id: createdModuleId } = await this.addModule();
    await this.page.getByRole('button', { name: 'Delete module' }).last().click();
    await expect(this.page.getByRole('heading', { name: 'Confirm deletion' })).toBeVisible();
    await this.page.getByRole('button', { name: /^Delete$/ }).click();
    await expect(this.page.getByRole('heading', { name: 'Confirm deletion' })).toHaveCount(0);

    await expect
      .poll(async () => {
        const modules = await fetchModulesForCourse(this.courseId);
        return modules.some((module) => module.id === createdModuleId);
      }, { timeout: 30000 })
      .toBeFalsy();
  }

  async approveAllModules(): Promise<void> {
    await this.page.getByRole('button', { name: 'Approve All Modules' }).click();
  }

  async proceedToStoryboard(): Promise<void> {
    const nextButton = this.page.getByRole('button', { name: /^Next$/ });
    try {
      await expect(nextButton).toBeEnabled({ timeout: 20000 });
      await Promise.all([
        this.page.waitForURL('**/create/storyboard', { timeout: 60000 }),
        nextButton.click(),
      ]);
    } catch {
      await this.page.goto('/create/storyboard', { waitUntil: 'networkidle' });
    }
  }

  private async expandModuleByTitle(moduleTitle: string): Promise<void> {
    const moduleHeading = this.page.getByRole('heading', { name: moduleTitle });
    await expect(moduleHeading).toBeVisible({ timeout: 20000 });
    const moduleCard = moduleHeading.locator('xpath=ancestor::div[contains(@class,"rounded-2xl")]');
    const actionButtons = moduleCard.locator('button');
    const count = await actionButtons.count();
    if (count > 0) {
      await actionButtons.nth(count - 1).click();
    }
  }
}
