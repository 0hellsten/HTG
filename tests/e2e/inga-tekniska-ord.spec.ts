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

test.describe('Krav: Språkgranskning — inga tekniska ord i gränssnittet', () => {
  test('inga förbjudna ord syns på de olika sidorna', async ({ page }) => {
    // 1. Startsidan
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const checkText = async (screenName: string) => {
      const visibleText = (await page.locator('main').innerText()).toLowerCase();
      for (const word of FORBIDDEN_WORDS) {
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        const found = regex.test(visibleText);
        expect(
          found,
          `Förbjudet ord "${word}" hittades i synlig text på sidan ${screenName}!`
        ).toBe(false);
      }
    };

    await checkText('Idag');

    // 2. Tips
    await page.locator('button:has-text("Tips"):visible').first().click();
    await page.waitForTimeout(500);
    await checkText('Tips');

    // 3. Mitt stall
    await page.locator('button:has-text("Mitt stall"):visible').first().click();
    await page.waitForTimeout(500);
    await checkText('Mitt stall');

    // 4. Mer-menyn
    await page.locator('button:has-text("Mer"):visible').first().click();
    await page.waitForTimeout(500);
    await checkText('Mer');

    // 5. Hur färskt är det här?
    await page.locator('button:has-text("Hur färskt är det här?"):visible').first().click();
    await page.waitForTimeout(500);
    await checkText('Hur färskt är det här?');

    // Tillbaka och öppna Hjälp
    await page.locator('button:has-text("Tillbaka"):visible').first().click();
    await page.locator('button:has-text("Hjälp och vanliga frågor"):visible').first().click();
    await page.waitForTimeout(500);
    await checkText('Hjälp');
  });
});
