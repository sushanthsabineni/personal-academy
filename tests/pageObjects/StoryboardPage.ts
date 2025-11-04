import { expect, type Page } from '@playwright/test';

export class StoryboardPage {
  public lastAddSlideAlert: string | null = null;

  constructor(private readonly page: Page) {}

  async waitForLoad(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /your storyboard/i })).toBeVisible();
  }

  async addSlide(): Promise<void> {
    const firstSlideButton = this.page.getByRole('button', { name: /add your first slide/i });
    const dialogPromise = this.page.waitForEvent('dialog', { timeout: 2000 }).catch(() => null);

    if (await firstSlideButton.count()) {
      await firstSlideButton.click();
    } else {
      await this.page.getByRole('button', { name: /^Add Slide$/ }).first().click();
    }

    const dialog = await dialogPromise;
    if (dialog) {
      this.lastAddSlideAlert = dialog.message();
      await dialog.dismiss();
      return;
    }

    const slideItems = this.page.locator('main ul li');
    await expect(slideItems.first()).toBeVisible({ timeout: 30000 });
  }

  async openPublishPreview(): Promise<void> {
    let publishLink = this.page.getByRole('link', { name: 'Publish' });

    if (!(await publishLink.count())) {
      await this.page.locator('aside button').first().click();
      publishLink = this.page.getByRole('link', { name: 'Publish' });
    }

    await publishLink.first().click();
    await expect(this.page.getByRole('heading', { name: /coming soon/i })).toBeVisible();
  }
}
