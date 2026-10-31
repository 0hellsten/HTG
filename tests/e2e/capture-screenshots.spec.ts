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

    // 3. Testa "Imorgon"
    const imorgonKnapp = page.locator('button[role="tab"]:has-text("Imorgon")');
    await imorgonKnapp.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'idag-imorgon-mobil.png'),
    });

    // 4. Bong-maskinen med Bong-logga på mobil
    const bongNavBtn = page.locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Bongen")');
    await bongNavBtn.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'bong-logga-mobil.png'),
    });

    // 5. Popout-modal för infosida (Om appen)
    const merBtn = page.locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Mer")');
    await merBtn.click();
    await page.waitForTimeout(300);
    const omKort = page.getByRole('button', { name: /Om appen/i });
    await omKort.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'popout-modal-mobil.png'),
    });

    // 6. Janne Boy med flytande Bong-knapp
    const closeOmBtn = page.locator('div[role="dialog"] button:has-text("Stäng")').first();
    await closeOmBtn.click();
    await page.waitForTimeout(300);

    const menuBtn = page.locator('header button[aria-label="Öppna sidomeny"]');
    await menuBtn.click();
    await page.waitForTimeout(300);
    const janneBoyLink = page.locator('nav[aria-label="Mobil sidonavigering"] button:has-text("Janne Boy")');
    await janneBoyLink.click();
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'janne-boy-bong-knapp-mobil.png'),
    });
  });
});
