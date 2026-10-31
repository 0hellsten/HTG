import { test, expect } from '@playwright/test';

test.describe('Janne Boy — Superintelligent kupongmotor', () => {
  test('öppnar fliken, genererar system med olika strategier och öppnar i Bong-maskinen', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Klicka på fliken Janne Boy
    const janneTab = page.locator('button:has-text("Janne Boy"), button:has-text("Janne")').first();
    await expect(janneTab).toBeVisible();
    await janneTab.click();

    // 2. Verifiera rubrik och grundläggande element
    await expect(page.locator('h1')).toContainText('Janne Boy');
    await expect(page.locator('text=Kupongförslag för vald omgång')).toBeVisible();

    // 3. Kontrollera strategival och budgetknappar
    await expect(page.locator('text=Balanserad Janne')).toBeVisible();
    await expect(page.locator('text=Jannes Miljondrag')).toBeVisible();
    await expect(page.locator('text=Jannes Säkerhet')).toBeVisible();
    await expect(page.locator('text=Stallbackens Form')).toBeVisible();

    // 4. Välj budget 200 kr och klicka på skapa systemförslag
    const budgetBtn = page.locator('button:has-text("200 kr")').first();
    await budgetBtn.click();

    // 5. Växla till strategin Jannes Miljondrag
    const miljodragCard = page.locator('button:has-text("Jannes Miljondrag")').first();
    await miljodragCard.click();

    // 6. Kontrollera att systemresultatet uppdateras och visar rader samt nyckeltal
    await expect(page.locator('text=Jannes Kupongförslag')).toBeVisible();
    await expect(page.locator('text=Spikar').first()).toBeVisible();
    await expect(page.locator('text=Skrälldrag').first()).toBeVisible();
    await expect(page.locator('text=Spelvärdesindex').first()).toBeVisible();

    // 7. Klicka på knappen "Öppna i Bong-maskinen"
    const openInBongBtn = page.locator('button:has-text("Öppna i Bong-maskinen")').first();
    await expect(openInBongBtn).toBeVisible();
    await openInBongBtn.click();

    // 8. Verifiera att Bong-maskinen öppnas med kupongen
    await expect(page.locator('h1:has-text("Bong-maskinen")')).toBeVisible();
    await expect(page.locator('text=Snabbkupong:')).toBeVisible();
  });
});
