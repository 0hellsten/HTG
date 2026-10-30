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
    await expect(page.locator('text=Snabbkupong:')).toBeVisible();
    await expect(page.locator('button:has-text("Liten (~50 kr)")')).toBeVisible();
    await expect(page.locator('button:has-text("Lagom (~100 kr)")')).toBeVisible();
    await expect(page.locator('button:has-text("Större (~200 kr)")')).toBeVisible();
    await expect(page.locator('button:has-text("Favoritrad (1 häst/lopp)")')).toBeVisible();

    // Testa hjälp-ruta
    const helpBtn = page.locator('button:has-text("Hur gör jag?")');
    await expect(helpBtn).toBeVisible();
    await helpBtn.click();
    await expect(page.locator('text=Så här fungerar Bong-maskinen:')).toBeVisible();

    // Testa snabbkupongsval
    await page.locator('button:has-text("Favoritrad (1 häst/lopp)")').click();
    await expect(page.locator('text=1 rader')).toBeVisible();
    await page.locator('button:has-text("Lagom (~100 kr)")').click();

    // 3. Verifiera dragbar datumväljare med kommande tävlingar
    await expect(page.locator('text=Kommande tävlingar')).toBeVisible();
    await expect(page.locator('text=14 dagar framåt')).toBeVisible();

    // Dagens datum ska ha distinkt färg och "Idag"-märkning
    const todayBtn = page.locator('button:has-text("Idag")').first();
    await expect(todayBtn).toBeVisible();

    // 4. Växla till en V86-omgång i datumväljaren
    const v86Btn = page.locator('button:has-text("V86")').first();
    await v86Btn.scrollIntoViewIfNeeded();
    await expect(v86Btn).toBeVisible();
    await v86Btn.click();

    // Kontrollera 8 avdelningar, saxade banor och rätt starttid
    await expect(page.locator('text=Avd 8')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/Solvalla/i).first()).toBeVisible();
    await expect(page.locator('text=Start kl. 20:30').first()).toBeVisible();

    // 5. Växla till en V75-omgång i datumväljaren
    const v75Btn = page.locator('button:has-text("V75")').first();
    await v75Btn.scrollIntoViewIfNeeded();
    await expect(v75Btn).toBeVisible();
    await v75Btn.click();
    await expect(page.locator('text=Avd 7')).toBeVisible();

    // 6. Öppna filter och justera ABCD-krav
    const filterBtn = page.locator('button:has-text("Reduceringsmotor")');
    await filterBtn.click();
    await expect(page.locator('text=ABCD-villkor per enkelrad')).toBeVisible();

    // 7. Kontrollera informations-I och öppna hästinfo och analys
    const infoBtn = page.locator('button[title*="Information och analys"]').first();
    await expect(infoBtn).toBeVisible();
    await infoBtn.click();

    // Verifiera att analysrutan öppnats med rätt innehåll
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('Kupongstatus')).toBeVisible();
    await expect(dialog.getByText('Stallbackens analys och spelvärde')).toBeVisible();
    await expect(dialog.getByText('Vinnarodds', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Streckprocent', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Spelvärde', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Spår och startsätt')).toBeVisible();

    // Välj hästen på kupongen om den inte redan är vald
    const selectBtn = dialog.locator('button:has-text("Välj på kupongen")');
    if (await selectBtn.isVisible()) {
      await selectBtn.click();
    }

    // Ändra rank till C direkt i analysrutan
    const rankCBtn = dialog.locator('button:has-text("Rank C")').first();
    await expect(rankCBtn).toBeVisible();
    await rankCBtn.click();

    // Klicka på "Öppna fullständigt hästkort" och verifiera att fullständigt hästkort öppnas utan fel
    const openHorseBtn = dialog.locator('button:has-text("Öppna fullständigt hästkort")');
    await expect(openHorseBtn).toBeVisible();
    await openHorseBtn.click();

    // Verifiera att HästScreen öppnas med hästens info och ALDRIG "Hästen saknas"
    await expect(page.locator('text=Hästen saknas')).not.toBeVisible();
    await expect(page.locator('button:has-text("Tillbaka")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Mitt stall")').first()).toBeVisible();

    // Klicka på Tillbaka för att återgå till Bong-maskinen
    await page.locator('button:has-text("Tillbaka")').first().click();
    await expect(page.locator('h1')).toContainText('Bong-maskinen');
  });
});
