import { test, expect } from '@playwright/test';

const FORBIDDEN_WORDS = [
  'api',
  'fetch',
  'endpoint',
  'request',
  'response',
  'timeout',
  'cache',
  'parse',
  'null',
  'undefined',
  'json',
  'scraping',
  'adapter',
  '404',
  '500',
  'något gick fel',
  'ett oväntat fel',
  'kunde inte ansluta',
];

test.describe('Dagens bästa — Matchdagsguiden lopp för lopp', () => {
  test('öppnar sidan från Idag, granskar hästar och motiveringar, och kontrollerar språk', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verifiera att genvägen finns på Idag-sidan
    const bannerBtn = page.locator('button:has-text("Öppna Dagens bästa")').first();
    await expect(bannerBtn).toBeVisible();
    await bannerBtn.click();

    // 2. Verifiera rubrik och grundläggande element
    await expect(page.locator('h1')).toContainText('Dagens bästa');
    await expect(
      page.locator('text=De bästa hästarna och motiveringarna för varje lopp')
    ).toBeVisible();

    // 3. Kontrollera att omgångens spik och omgångens skräll visas i topp-bannern
    await expect(page.locator('text=Omgångens spik')).toBeVisible();
    await expect(page.locator('text=Omgångens skräll')).toBeVisible();

    // 4. Kontrollera att minst ett loppkort visas med förutsättningar och hästar
    const loppKort = page.locator('div[id^="lopp-"]').first();
    await expect(loppKort).toBeVisible();

    // 5. Kontrollera rollbrickor och varför-motiveringar
    await expect(page.locator('text=Bästa chansen').first()).toBeVisible();
    await expect(page.locator('text=Varför vi tror på hästen:').first()).toBeVisible();
    await expect(page.locator('text=Läge & startspår:').first()).toBeVisible();
    await expect(page.locator('text=Balans & vagn:').first()).toBeVisible();
    await expect(page.locator('text=Spelvärde & streck:').first()).toBeVisible();

    // 6. Kontrollera loppfilter
    const filterBtn = page.locator('button[role="tab"]:has-text("Lopp")').first();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // 7. Språkgranskning: Inga tekniska eller förbjudna ord på sidan
    const visibleText = (await page.locator('main').innerText()).toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      const found = regex.test(visibleText);
      expect(
        found,
        `Förbjudet ord "${word}" hittades i synlig text på Dagens bästa!`
      ).toBe(false);
    }
  });

  test('fungerar via menyn i botten/sidebar', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const bastaNav = page
      .locator('button:has-text("Dagens bästa"), button:has-text("Bästa")')
      .first();
    await expect(bastaNav).toBeVisible();
    await bastaNav.click();

    await expect(page.locator('h1')).toContainText('Dagens bästa');
  });
});
