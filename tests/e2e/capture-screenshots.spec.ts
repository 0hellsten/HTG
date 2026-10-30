import { test, expect } from '@playwright/test';
import path from 'path';

const ARTIFACTS_DIR =
  'C:/Users/hells/.gemini/antigravity/brain/2cc29c58-6aea-4590-a26f-8057872053f1';

test.describe('Verifierande skärmdumpar för ny startflik och logga', () => {
  test('Laptop (1440x900)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Startsidan med Dagens spik/skräll och Bästa hästarna
    await expect(page.locator('text=Omgångens spik')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'idag-startflik-laptop.png'),
    });
  });

  test('Mobil (390x844)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Startsidan på mobil med större logga och Bästa hästarna
    await expect(page.locator('header img[alt="Tangitza"]')).toBeVisible();
    await expect(page.locator('text=Omgångens spik')).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'idag-startflik-mobil.png'),
    });

    // 2. Växla till "Alla lopp & banor" på mobil
    const allaKnapp = page.locator('button:has-text("Alla lopp & banor")');
    await allaKnapp.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'idag-alla-lopp-mobil.png'),
    });
  });
});
