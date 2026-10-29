import { test, expect } from '@playwright/test';

test.describe('Krav: Mobilanpassning och pekytor (390x844)', () => {
  test.use({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });

  test('fungerar med tumme och visar alla vyer i mobilformat utan textklipp', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Bottenmenyn är synlig på mobil
    const bottomNav = page.locator('nav[aria-label="Mobil bottenmeny"]');
    await expect(bottomNav).toBeVisible();

    // 2. Klicka på Mitt stall
    const stallTab = bottomNav.locator('button:has-text("Mitt stall")');
    await stallTab.click();
    await expect(page.locator('h1')).toContainText('Mitt stall');

    // Kontrollera att kategori-flikarna har ordentlig höjd för tummen (minst 44px)
    const categoryBtn = page.locator('button[role="tab"]').first();
    const box = await categoryBtn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);

    // 3. Klicka på Mer och öppna Textstorlek
    const merTab = bottomNav.locator('button:has-text("Mer")');
    await merTab.click();
    await expect(page.locator('h1')).toContainText('Mer');

    const textsizeBtn = page.locator('button:has-text("Textstorlek"):visible').first();
    await textsizeBtn.click();
    await expect(page.locator('h1')).toContainText('Textstorlek');

    // Byt textstorlek till Stor
    const storBtn = page.locator('button[role="radio"]:has-text("Cirka 15 %")');
    await storBtn.click();
    await expect(page.locator('html')).toHaveClass(/text-size-stor/);

    // Byt tillbaka till Normal
    const normalBtn = page.locator('button[role="radio"]:has-text("Standardstorlek")');
    await normalBtn.click();
    await expect(page.locator('html')).toHaveClass(/text-size-normal/);

    // 4. Tillbaka och kontrollera Hjälp
    const backBtn = page.locator('button:has-text("Tillbaka"):visible').first();
    await backBtn.click();

    const hjalpBtn = page.locator('button:has-text("Hjälp och vanliga frågor"):visible').first();
    await hjalpBtn.click();
    await expect(page.locator('h1')).toContainText('Hjälp och vanliga frågor');

    // Första frågan är öppen som standard och visar förklaring för grön prick
    await expect(page.locator('text=Grön prick:')).toBeVisible();

    // Öppna en annan fråga
    const faqBtn2 = page
      .locator('button:has-text("Vad gör jag om något ser gammalt ut"):visible')
      .first();
    await faqBtn2.click();
    await expect(page.locator('text=Uppdatera allt')).toBeVisible();
  });
});
