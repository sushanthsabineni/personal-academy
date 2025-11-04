import { expect, type Page } from '@playwright/test';

export class AuthPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/login', { waitUntil: 'networkidle' });
    await this.dismissCookieBanner();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByPlaceholder('you@example.com').fill(email);
    await this.page.getByPlaceholder('********').fill(password);

    await Promise.all([
      this.page.waitForURL('**/dashboard', { timeout: 60000 }),
      this.page.getByRole('button', { name: /sign in/i }).click(),
    ]);
  }

  async assertDashboard(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: /welcome/i })).toBeVisible();
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async logout(): Promise<void> {
    await this.page.goto('/dashboard', { waitUntil: 'networkidle' });
    const profileButton = this.page.locator('header button').last();
    await profileButton.click();

    const logoutButton = this.page.getByRole('button', { name: /^Logout$/i });
    await expect(logoutButton).toBeVisible({ timeout: 5000 });

    await Promise.all([
      this.page.waitForURL(/\/$/),
      logoutButton.click(),
    ]);
  }

  private async dismissCookieBanner(): Promise<void> {
    const cookieButton = this.page.getByRole('button', { name: 'Accept All' });
    try {
      await cookieButton.first().waitFor({ timeout: 5000 });
      await cookieButton.first().click();
    } catch {
      // Banner did not appear; nothing to do.
    }
  }
}
