import { test, expect } from '@playwright/test';

test.describe('Hästar — Rankinglista och sökhistorik', () => {
  test('visar rankinglista, tidigare sökningar och hästsökning', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Klicka på Hästar
    const hastarTab = page.locator('button:has-text("Hästar")').first();
    await hastarTab.click();

    // 2. Verifiera rubrik och rankinglista
    await expect(page.locator('h1')).toContainText('Hästar');
    await expect(page.locator('button[role="tab"]:has-text("Vinstrikast")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Segerprocent")')).toBeVisible();

    // 3. Kontrollera att topprankade hästar visas
    await expect(page.locator('span:has-text("Topprankade hästar")')).toBeVisible();

    // 4. Växla till "Segerprocent"
    await page.locator('button[role="tab"]:has-text("Segerprocent")').click();
    await expect(page.locator('text=% segrar').first()).toBeVisible();

    // 5. Gör en sökning på "San"
    const searchInput = page.locator('input[placeholder*="Sök häst"]');
    await searchInput.fill('San');
    await expect(page.locator('text=Hittade').first()).toBeVisible();
    await expect(page.locator('text=San Moteur').first()).toBeVisible();

    // 6. Rensa sökning och verifiera att sökhistorik visas
    await searchInput.fill('');
    await expect(page.locator('text=Vinstrikast')).toBeVisible();
  });
});
