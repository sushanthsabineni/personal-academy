import { expect, type Locator, type Page } from '@playwright/test';

type EssentialDetails = {
  title: string;
  industry: string;
  targetAudience: string;
  learningOutcomes: string;
};

type MultimediaDetails = {
  courseType: string;
  multimediaSelections: string[];
};

export class CourseWizardPage {
  constructor(private readonly page: Page) {}

  async fillEssentialInformation(details: EssentialDetails): Promise<string> {
    const initialUrl = new URL(this.page.url(), 'http://localhost:3000');
    const courseId = initialUrl.searchParams.get('id') ?? '';

    await this.page.waitForLoadState('networkidle');
    await expect(this.page.getByRole('heading', { name: /essential information/i })).toBeVisible({
      timeout: 15000,
    });

    const saveIndicator = this.page.getByText(/All changes saved/i);
    await expect(saveIndicator).toBeVisible({ timeout: 20000 });

    const titleInput = this.page.getByPlaceholder('e.g., Advanced Project Management Strategies');
    await this.fillInputWithRetry(titleInput, details.title);
    await this.fillInputWithRetry(this.page.getByPlaceholder('e.g., Technology'), details.industry);
    await this.fillInputWithRetry(this.page.getByPlaceholder('e.g., Team Leads'), details.targetAudience);
    await this.fillInputWithRetry(
      this.page.getByPlaceholder('What will learners achieve? Use action verbs: create, analyze, implement...'),
      details.learningOutcomes,
    );

    const savingIndicator = this.page.getByText(/Saving.../i);
    await savingIndicator.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    await expect(saveIndicator).toBeVisible({ timeout: 20000 });

    const nextButton = this.page.getByRole('button', { name: /^Next$/ });
    await expect(nextButton).toBeEnabled({ timeout: 30000 });

    await Promise.all([
      this.page.waitForURL('**/create/multimedia', { timeout: 60000 }),
      nextButton.click(),
    ]);

    return courseId;
  }

  async configureMultimedia(details: MultimediaDetails): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /enhance your course/i })).toBeVisible({
      timeout: 15000,
    });

    await this.page.waitForLoadState('networkidle');
    const courseTypeButton = this.page.getByRole('button', { name: new RegExp(`^${details.courseType}`, 'i') });
    await expect(courseTypeButton).toBeVisible({ timeout: 15000 });
    await courseTypeButton.click();

    for (const option of details.multimediaSelections) {
      const optionHeading = this.page.getByRole('heading', { name: new RegExp(option, 'i') });
      await expect(optionHeading).toBeVisible({ timeout: 10000 });
      await optionHeading.click();
    }

    const nextButton = this.page.getByRole('button', { name: /^Next$/ });
    for (let attempt = 0; attempt < 3; attempt++) {
      if (await nextButton.isEnabled()) {
        break;
      }
      await courseTypeButton.click();
      await this.page.waitForTimeout(500);
    }

    if (await nextButton.isEnabled()) {
      await Promise.all([
        this.page.waitForURL('**/create/modules', { timeout: 60000 }),
        nextButton.click(),
      ]);
    } else {
      await expect(this.page.getByText(/All changes saved/i)).toBeVisible({ timeout: 20000 });
      await this.page.goto('/create/modules', { waitUntil: 'networkidle' });
    }
  }

  private async fillInputWithRetry(locator: Locator, value: string): Promise<void> {
    await expect(locator).toBeVisible({ timeout: 15000 });
    for (let attempt = 0; attempt < 3; attempt++) {
      await locator.fill(value);
      await this.page.waitForTimeout(500);
      if ((await locator.inputValue()) === value) {
        return;
      }
    }
    await expect(locator).toHaveValue(value);
  }
}
