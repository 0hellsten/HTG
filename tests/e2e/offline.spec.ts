import { test, expect } from '@playwright/test';

test.describe('Krav: Offline och sparad data', () => {
  test('visar senast sparade data och lugn tidsstämpelremsa vid offline-läge', async ({ page }) => {
    // Öppna appen i simulerat offline-läge
    await page.goto('/?simulateOffline=true');

    // Verifiera att offlineremsan visas högst upp
    const offlineBanner = page.locator('div[role="status"]');
    await expect(offlineBanner).toBeVisible();
    await expect(offlineBanner).toContainText(/Du är inte uppkopplad\. Det här hämtades/i);

    // Verifiera att startsidans innehåll fortfarande laddar från lokal data
    await expect(page.locator('h1')).toContainText(/omgång/i);

    // Navigera till Mitt stall i offlineläge via synlig knapp
    const stallNav = page.locator('button:has-text("Mitt stall"):visible').first();
    await stallNav.click();
    await expect(page.locator('h1')).toContainText(/Mitt stall/i);
    await expect(offlineBanner).toBeVisible();
  });
});
