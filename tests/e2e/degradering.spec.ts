import { test, expect } from '@playwright/test';

test.describe('Krav: Tålighet och degradering med avstängda källor', () => {
  test('med odds och väder avstängt fungerar hela appen och visar lugna förklaringar', async ({
    page,
  }) => {
    // 1. Tvinga testkällan fake-source till failed via backend-endpoint
    await page.request.post('http://localhost:3001/api/test/fake-source', {
      data: {
        status: 'failed',
        message: 'Testkällan är tillfälligt avstängd',
      },
    });

    // 2. Öppna appen med simulerade avstängda källor (odds + väder)
    await page.goto('/?simulateOddsDown=true&simulateWeatherDown=true');

    // Verifiera att startsidan laddas och visar tävlingar
    await expect(page.locator('h1')).toContainText(/omgång/i);
    const trackCard = page.locator('button:has-text("lopp"):visible').first();
    await expect(trackCard).toBeVisible();

    // 3. Öppna första loppet (navigera till LoppScreen)
    const openDirectBtn = page.locator('button:has-text("Se alla loppets hästar och full startlista")').first();
    if (await openDirectBtn.isVisible().catch(() => false)) {
      await openDirectBtn.click();
    } else {
      const loppForLopp = page.locator('button:has-text("Lopp för lopp")').first();
      if (await loppForLopp.isVisible().catch(() => false)) {
        await loppForLopp.click();
      }
      const race1 = page.locator('button:has-text("Lopp 1 ·")').first();
      await race1.waitFor({ state: 'visible', timeout: 5000 });
      await race1.click();
    }

    // Verifiera att loppkortet visas trots att oddsen är nere
    await expect(page.locator('h1')).toContainText(/Lopp/i);

    // Verifiera att oddsen visar status "Oddsen uppdateras inte just nu" och tankstreck
    const oddsStatus = page.locator('text=Oddsen uppdateras inte just nu').first();
    await expect(oddsStatus).toBeVisible();

    // 4. Verifiera att Tips-fliken fungerar
    const tipsNav = page.locator('button:has-text("Tips"):visible').first();
    await tipsNav.click();
    await expect(page.locator('h1')).toContainText(/Vad tycker stallbacken\?/i);
    await expect(page.locator('text=Aftonbladet').first()).toBeVisible();

    // 5. Verifiera att Mitt stall fungerar
    const stallNav = page.locator('button:has-text("Mitt stall"):visible').first();
    await stallNav.click();
    await expect(page.locator('h1')).toContainText(/Mitt stall/i);

    // Återställ fake-source
    await page.request.post('http://localhost:3001/api/test/fake-source', {
      data: { reset: true },
    });
  });
});
