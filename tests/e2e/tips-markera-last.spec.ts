import { test, expect } from '@playwright/test';

test.describe('Tips — Markera lopprankingar och analys/nyheter som lästa', () => {
  test('korten markeras gråare med läst-indikator när man klickat på länken', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Gå till Tips-fliken
    const tipsTab = page.locator('button:has-text("Tips"):visible').first();
    await expect(tipsTab).toBeVisible();
    await tipsTab.click();

    await expect(page.locator('h1')).toContainText('Vad tycker stallbacken?');

    // 2. Kontrollera att artiklar och lopprankingar visas
    const articleLink = page.locator('a:has-text("Läs hela")').first();
    await expect(articleLink).toBeVisible();

    // 3. Klicka på artikellänken
    await articleLink.click();

    // 4. Verifiera att artikeln nu markeras som läst med "Läst"-etikett och ändrad länktext
    await expect(page.locator('article span:has-text("Läst")').first()).toBeVisible();
    await expect(page.locator('a:has-text("Läs igen")').first()).toBeVisible();

    // 5. Verifiera att loppranking också kan markeras som läst
    const openRaceBtn = page.locator('button:has-text("Öppna lopp")').first();
    if (await openRaceBtn.isVisible()) {
      await openRaceBtn.click();

      // Gå tillbaka till Tips
      await tipsTab.click();
      await expect(page.locator('button:has-text("Öppna lopp igen")').first()).toBeVisible();
    }

    // 6. Ladda om sidan och verifiera att läst-statusen kvarstår via localStorage
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await tipsTab.click();
    await expect(page.locator('article span:has-text("Läst")').first()).toBeVisible();
  });
});
