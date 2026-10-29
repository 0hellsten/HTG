import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR =
  'C:/Users/hells/.gemini/antigravity/brain/48948aed-71f7-43ba-a72f-51c883ce3e00';

test.describe('Verifierande skärmdumpar', () => {
  test('Laptop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Bong-maskinen på laptop
    const bongTab = page.locator('aside button:has-text("Bong-maskinen")').first();
    await expect(bongTab).toBeVisible();
    await bongTab.click();
    await expect(page.locator('h1:has-text("Bong-maskinen")')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bong-maskinen-laptop.png'),
    });

    // 2. Hästar med ranking på laptop
    const hastarTab = page.locator('aside button:has-text("Hästar")').first();
    await expect(hastarTab).toBeVisible();
    await hastarTab.click();
    await expect(page.locator('h1:has-text("Hästar")')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hastar-ranking-laptop.png'),
    });

    // 3. Tips med Aftonbladet på laptop
    const tipsTab = page.locator('aside button:has-text("Tips")').first();
    await expect(tipsTab).toBeVisible();
    await tipsTab.click();
    await expect(page.locator('h1:has-text("Vad tycker stallbacken?")')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'tips-aftonbladet-laptop.png'),
    });
  });

  test('Mobil (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Bong-maskinen på mobil
    const bongTab = page
      .locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Bongen")')
      .first();
    await expect(bongTab).toBeVisible();
    await bongTab.click();
    await expect(page.locator('h1:has-text("Bong-maskinen")')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bong-maskinen-mobil.png'),
    });

    // 2. Hästar på mobil
    const hastarTab = page
      .locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Hästar")')
      .first();
    await expect(hastarTab).toBeVisible();
    await hastarTab.click();
    await expect(page.locator('h1:has-text("Hästar")')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'hastar-ranking-mobil.png'),
    });
  });
});
