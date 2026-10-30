import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR =
  'C:/Users/hells/.gemini/antigravity/brain/2cc29c58-6aea-4590-a26f-8057872053f1';

test.describe('Verifierande skärmdumpar för Dagens bästa', () => {
  test('Laptop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Startsidan med Dagens bästa-banner
    await expect(page.locator('button:has-text("Öppna Dagens bästa")')).toBeVisible();
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'idag-banner-laptop.png'),
    });

    // 2. Klicka på Dagens bästa i menyn
    const bastaTab = page.locator('aside button:has-text("Dagens bästa")').first();
    await expect(bastaTab).toBeVisible();
    await bastaTab.click();
    await expect(page.locator('h1:has-text("Dagens bästa")')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'dagens-basta-laptop.png'),
    });
  });

  test('Mobil (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Gå till Dagens bästa via bottenmenyn
    const bastaTab = page
      .locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Bästa")')
      .first();
    await expect(bastaTab).toBeVisible();
    await bastaTab.click();
    await expect(page.locator('h1:has-text("Dagens bästa")')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'dagens-basta-mobil.png'),
    });
  });
});
