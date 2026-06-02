import { test, expect } from '@playwright/test';

test('cockpit shell loads and authenticates with migrated v081 surface', async ({ page }) => {
  await page.goto('/app/');

  await expect(page).toHaveTitle(/GAGA Cockpit Dashboard/i);
  await expect(page.getByRole('heading', { name: /Masuk Cockpit/i })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.getByLabel('PIN')).toBeVisible();

  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('PIN').fill('1234');
  await page.getByRole('button', { name: /Buka Cockpit/i }).click();

  await expect(page.getByRole('heading', { name: /Color-first production cockpit/i })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'BOLT' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: 'BNI LIFE' })).toBeVisible();
  await expect(page.locator('.cockpit-dock [data-gg-action="open-discovery"]')).toBeVisible();
});

test('keyboard user can reach primary controls', async ({ page }) => {
  await page.goto('/app/');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: /Lewati ke konten utama/i })).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Email')).toBeFocused();
});

test('discovery can find a migrated work item', async ({ page }) => {
  await page.goto('/app/');

  await page.getByLabel('Email').fill('demo@example.com');
  await page.getByLabel('PIN').fill('1234');
  await page.getByRole('button', { name: /Buka Cockpit/i }).click();

  await page.locator('.cockpit-dock [data-gg-action="open-discovery"]').click();
  await page.getByLabel('Search').fill('Laporan Direksi');

  const results = page.locator('[data-gg-hook="discovery-results"]');
  const firstWorkItem = results
    .locator('[data-gg-hook="discovery-result"]')
    .filter({ hasText: 'Laporan Direksi' })
    .first();

  await expect(firstWorkItem).toBeVisible();
  await expect(firstWorkItem.locator('[data-gg-bind="type"]')).toHaveText('Work Item');
  await expect(firstWorkItem.locator('[data-gg-bind="title"]')).toContainText('Laporan Direksi');
});
