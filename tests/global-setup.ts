import { chromium, expect, type FullConfig } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export default async function globalSetup(config: FullConfig) {
  dotenv.config({ path: '.env.local' });
  dotenv.config();

  const email = process.env.USER_EMAIL;
  const password = process.env.USER_PASS;

  if (!email || !password) {
    throw new Error('USER_EMAIL and USER_PASS must be defined in the environment.');
  }

  await ensureTestUser(email, password);

  const storageStatePath = path.resolve('.auth/user.json');
  fs.mkdirSync(path.dirname(storageStatePath), { recursive: true });

  const baseURL = config.projects[0]?.use?.baseURL ?? 'http://localhost:3000';

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(`${baseURL}/login`, { waitUntil: 'networkidle' });

    const cookieButton = page.getByRole('button', { name: 'Accept All' });
    try {
      await cookieButton.first().waitFor({ timeout: 5000 });
      await cookieButton.first().click();
    } catch {
      // Banner did not appear; proceed without interaction.
    }

    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('********').fill(password);

    await Promise.all([
      page.waitForURL('**/dashboard', { timeout: 60000 }),
      page.getByRole('button', { name: /sign in/i }).click(),
    ]);

    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible({ timeout: 30000 });

    await page.context().storageState({ path: storageStatePath });
  } finally {
    await browser.close();
  }
}

async function ensureTestUser(email: string, password: string): Promise<void> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin credentials are required to provision the test user.');
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const normalizedEmail = email.toLowerCase();
  const perPage = 100;
  let page = 1;
  let existingUser: { id: string } | null = null;

  while (page < 50 && !existingUser) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw error;
    }

    const match = data.users.find((user) => (user.email ?? '').toLowerCase() === normalizedEmail);
    existingUser = match ? { id: match.id } : null;

    if (!existingUser && data.users.length < perPage) {
      break;
    }

    page += 1;
  }

  if (existingUser) {
    const { error: updateError } = await adminClient.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
    });
    if (updateError) {
      throw updateError;
    }
  } else {
    const { error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) {
      throw createError;
    }
  }
}
