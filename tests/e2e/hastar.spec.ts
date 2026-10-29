import { test, expect } from '@playwright/test';

test.describe('Hästar — Rankinglista, elithästar och sökhistorik', () => {
  test('visar rankinglista med elithästar, kallblod och sökhistorik', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Klicka på Hästar
    const hastarTab = page.locator('button:has-text("Hästar")').first();
    await hastarTab.click();

    // 2. Verifiera rubrik och rankingkategorier
    await expect(page.locator('h1')).toContainText('Hästar');
    await expect(page.locator('button[role="tab"]:has-text("Vinstrikast")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Segerprocent")')).toBeVisible();
    await expect(page.locator('button[role="tab"]:has-text("Kallblod")')).toBeVisible();

    // 3. Kontrollera att elithästar visas bland de vinstrikaste
    await expect(page.locator('span:has-text("Topprankade hästar")')).toBeVisible();
    await expect(page.locator('text=Victory Tilly').first()).toBeVisible();

    // 4. Växla till "Kallblod" och kontrollera Järvsöfaks
    await page.locator('button[role="tab"]:has-text("Kallblod")').click();
    await expect(page.locator('text=Järvsöfaks').first()).toBeVisible();

    // 5. Växla till "Segerprocent"
    await page.locator('button[role="tab"]:has-text("Segerprocent")').click();
    await expect(page.locator('text=% segrar').first()).toBeVisible();

    // 6. Gör en sökning på "San"
    const searchInput = page.locator('input[placeholder*="Sök häst"]');
    await searchInput.fill('San');
    await expect(page.locator('text=Hittade').first()).toBeVisible();
    await expect(page.locator('text=San Moteur').first()).toBeVisible();

    // 7. Gör en sökning på legenden "Nuncio"
    await searchInput.fill('Nuncio');
    await expect(page.locator('text=Nuncio').first()).toBeVisible();

    // 8. Rensa sökning och verifiera att rankingen återvänder
    await searchInput.fill('');
    await expect(page.locator('text=Vinstrikast')).toBeVisible();
  });
});
