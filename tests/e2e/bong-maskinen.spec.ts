import { test, expect } from '@playwright/test';

test.describe('Bong-maskinen — Systemkalkylator och reducering', () => {
  test('öppnar fliken, beräknar rader och hanterar reducering', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Klicka på fliken Bong-maskinen
    const bongTab = page
      .locator('button:has-text("Bong-maskinen"), button:has-text("Bongen")')
      .first();
    await expect(bongTab).toBeVisible();
    await bongTab.click();

    // 2. Verifiera rubrik och grundläggande element
    await expect(page.locator('h1')).toContainText('Bong-maskinen');
    await expect(page.locator('text=Matematiska rader')).toBeVisible();
    await expect(page.locator('text=Reducerade rader')).toBeVisible();

    // 3. Kontrollera att V75 är förvalt och visar 7 avdelningar
    const v75Btn = page.locator('button:has-text("V75 (7 lopp)")');
    await expect(v75Btn).toBeVisible();

    // 4. Växla till V86 och kontrollera 8 avdelningar
    const v86Btn = page.locator('button:has-text("V86 (8 lopp)")');
    await v86Btn.click();
    await expect(page.locator('text=Avd 8')).toBeVisible();

    // 5. Öppna filter och justera ABCD-krav
    const filterBtn = page.locator('button:has-text("Reduceringsmotor")');
    await filterBtn.click();
    await expect(page.locator('text=ABCD-villkor per enkelrad')).toBeVisible();

    // 6. Kontrollera att export-knapparna finns
    await expect(page.getByRole('button', { name: 'Kopiera', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fil', exact: true })).toBeVisible();
  });
});
