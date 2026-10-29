import { test, expect } from '@playwright/test';

test.describe('Bong-maskinen — Systemkalkylator, tävlingsväljare och reducering', () => {
  test('öppnar fliken, visar dragbar datumväljare och hanterar omgångar samt reducering', async ({
    page,
  }) => {
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

    // 3. Verifiera dragbar datumväljare med kommande tävlingar
    await expect(page.locator('text=Kommande tävlingar')).toBeVisible();
    await expect(page.locator('text=14 dagar framåt')).toBeVisible();

    // Dagens datum ska ha distinkt färg och "Idag"-märkning
    const todayBtn = page.locator('button:has-text("Idag")').first();
    await expect(todayBtn).toBeVisible();

    // 4. Växla till en V86-omgång i datumväljaren
    const v86Btn = page.locator('button:has-text("V86")').first();
    await expect(v86Btn).toBeVisible();
    await v86Btn.click();

    // Kontrollera 8 avdelningar, saxade banor och rätt starttid
    await expect(page.locator('text=Avd 8')).toBeVisible();
    await expect(page.getByText('Solvalla / Åby (Xpress)').first()).toBeVisible();
    await expect(page.locator('text=Start kl. 20:30').first()).toBeVisible();

    // 5. Växla till en V75-omgång i datumväljaren
    const v75Btn = page.locator('button:has-text("V75")').first();
    await expect(v75Btn).toBeVisible();
    await v75Btn.click();
    await expect(page.locator('text=Avd 7')).toBeVisible();

    // 6. Öppna filter och justera ABCD-krav
    const filterBtn = page.locator('button:has-text("Reduceringsmotor")');
    await filterBtn.click();
    await expect(page.locator('text=ABCD-villkor per enkelrad')).toBeVisible();

    // 7. Kontrollera att export-knapparna finns
    await expect(page.getByRole('button', { name: 'Kopiera', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Fil', exact: true })).toBeVisible();
  });
});
