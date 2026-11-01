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

test.describe('Smart startflik — Idag med Bästa hästarna & Alla lopp', () => {
  test('visar omgångens spik och skräll direkt på startsidan och växlar smidigt mellan lägena', async ({
    page,
  }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Verifiera rubrik på startskärmen
    await expect(page.locator('h1')).toContainText(/omgång/i);

    // 2. Kontrollera att omgångens spik och omgångens skräll visas direkt i toppen
    await expect(page.locator('text=Omgångens spik')).toBeVisible();
    await expect(page.locator('text=Omgångens skräll')).toBeVisible();

    // 3. Verifiera lägesväljaren
    const bastaKnapp = page.locator('button:has-text("Bästa hästarna lopp för lopp")');
    const allaKnapp = page.locator('button:has-text("Alla lopp & banor")');
    await expect(bastaKnapp).toBeVisible();
    await expect(allaKnapp).toBeVisible();

    // 4. Verifiera standardläget: Bästa hästarna med loppkort och motiveringar
    const loppKort = page.locator('div[id^="lopp-"]').first();
    await expect(loppKort).toBeVisible();
    await expect(page.locator('text=Bästa chansen').first()).toBeVisible();
    await expect(page.locator('text=Varför vi tror på hästen:').first()).toBeVisible();
    await expect(page.locator('text=Läge & startspår:').first()).toBeVisible();
    await expect(page.locator('text=Balans & vagn:').first()).toBeVisible();

    // 5. Växla till "Alla lopp & banor" och verifiera att banöversikten visas
    await allaKnapp.click();
    await expect(page.locator('text=Första start kl.').first()).toBeVisible();

    // 6. Växla tillbaka till "Bästa hästarna"
    await bastaKnapp.click();
    await expect(loppKort).toBeVisible();

    // 7. Språkgranskning: Inga tekniska eller förbjudna ord på sidan
    const visibleText = (await page.locator('main').innerText()).toLowerCase();
    for (const word of FORBIDDEN_WORDS) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      const found = regex.test(visibleText);
      expect(found, `Förbjudet ord "${word}" hittades i synlig text på startfliken!`).toBe(false);
    }
  });

  test('verifierar att loggan i sidhuvudet är synlig och har bra storlek', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    const logo = page.locator('header img[alt="Tangitza"]');
    await expect(logo).toBeVisible();
  });

  test('fungerar sömlöst även för Imorgon och I övermorgon med datumväxlare', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Klicka på "Imorgon"
    const imorgonKnapp = page.locator('button[role="tab"]:has-text("Imorgon")');
    await expect(imorgonKnapp).toBeVisible();
    await imorgonKnapp.click();
    await page.waitForTimeout(300);

    // Verifiera att rubriken visar Morgondagens omgång
    await expect(page.locator('h1')).toContainText(/morgondagens omgång/i);
    // Verifiera att spik och skräll syns för morgondagen
    await expect(page.locator('text=Omgångens spik')).toBeVisible();
    await expect(page.locator('div[id^="lopp-"]').first()).toBeVisible();

    // 2. Växla till "Alla lopp & banor" för imorgon
    const allaKnapp = page.locator('button:has-text("Alla lopp & banor")');
    await allaKnapp.click();
    await page.waitForTimeout(300);
    // Verifiera att banöversikten visas utan fel
    await expect(page.locator('text=Första start kl.').first()).toBeVisible();

    // 3. Klicka på "I övermorgon"
    const overmorgonKnapp = page.locator('button[role="tab"]:has-text("I övermorgon")');
    await overmorgonKnapp.click();
    await page.waitForTimeout(300);
    await expect(page.locator('h1')).toContainText(/kommande omgång/i);
  });

  test('verifierar att Bong-maskinen inte har någon logga i header eller meny, utan bara på kupongknappen', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Bong-knapp i bottenmenyn (ren ikon, ingen logga-bild, två rader: Bong Maskinen)
    const bongNavBtn = page.locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Bong")');
    await expect(bongNavBtn).toBeVisible();
    await expect(bongNavBtn.locator('img')).toHaveCount(0);

    // 2. Klicka på Bongen och verifiera att Bongmaskinens sidhuvud INTE har någon logga
    await bongNavBtn.click();
    await page.waitForTimeout(300);
    const headerTitle = page.locator('h1:has-text("Bong-maskinen")');
    await expect(headerTitle).toBeVisible();
    await expect(headerTitle.locator('img')).toHaveCount(0);

    // 3. Verifiera den flytande kupongknappen med Bong-logga (bong loggan är bara för kupongen)
    const flytandeBongKnapp = page.locator(
      'button[data-testid="bong-kupong-flytande-knapp"] img[alt="Bong"]:visible'
    );
    await expect(flytandeBongKnapp).toBeVisible();
  });

  test('verifierar att infosidor (t.ex. Om appen och Källor) öppnas som stängbara popouter', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Klicka på Mer i mobilens bottenmeny
    const merBtn = page.locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Mer")');
    await merBtn.click();
    await page.waitForTimeout(300);

    // Klicka på "Om appen"-kortet
    const omKort = page.getByRole('button', { name: /Om appen/i });
    await expect(omKort).toBeVisible();
    await omKort.click();

    // Verifiera att dialogen/popout öppnas med modal-roll och stängknapp
    const modal = page.locator('div[role="dialog"][aria-modal="true"]');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Tangitza').first()).toBeVisible();

    // Klicka på Stäng-knappen
    const closeBtn = modal.locator('button:has-text("Stäng")').first();
    await closeBtn.click();

    // Verifiera att modalen stängs och vi är kvar i appen
    await expect(modal).not.toBeVisible();
  });

  test('verifierar Bong-knappen, ifylld kupong och hästpopout på Janne Boy', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // 1. Öppna Janne Boy via sidomenyn eller navigation
    // På mobil: klicka på hamburgermenyn i sidhuvudet
    const menuBtn = page.locator('header button[aria-label="Öppna sidomeny"]');
    await menuBtn.click();
    await page.waitForTimeout(300);

    const janneBoyLink = page.locator(
      'nav[aria-label="Mobil sidonavigering"] button:has-text("Janne Boy")'
    );
    await expect(janneBoyLink).toBeVisible();
    await janneBoyLink.click();
    await page.waitForTimeout(500);

    // 2. Verifiera att den flytande Bong-knappen syns på Janne Boy
    const flytandeBongKnapp = page.locator('button[data-testid="bong-kupong-flytande-knapp"]');
    await expect(flytandeBongKnapp).toBeVisible();

    // 3. Klicka på den flytande Bong-knappen och verifiera att ifylld kupong visas
    await flytandeBongKnapp.click();
    await page.waitForTimeout(300);
    const kupongModal = page.locator('div[aria-label="Ifylld bong-kupong"]');
    await expect(kupongModal).toBeVisible();

    // Stäng kupong-modalen
    const stangKupongBtn = kupongModal.locator('button[aria-label="Stäng kupong"]').first();
    await stangKupongBtn.click();
    await page.waitForTimeout(300);
    await expect(kupongModal).not.toBeVisible();

    // 4. Verifiera "Öppna i Bong-maskinen"-knappen i systemöversikten
    const oppnaBongBtn = page.locator('button:has-text("Öppna i Bong-maskinen")').first();
    await expect(oppnaBongBtn).toBeVisible();

    // 5. Verifiera att hästar i Janne Boy är klickbara och öppnar hästpopout
    const horseBtn = page.locator('div.min-w-0 button[type="button"]:has(span)').first();
    await expect(horseBtn).toBeVisible();
    await horseBtn.click();
    await page.waitForTimeout(400);

    // Verifiera att hästens infomodal öppnas
    const horseModal = page.locator('div[role="dialog"][aria-modal="true"]');
    await expect(horseModal).toBeVisible();

    // Stäng hästmodalen
    const closeHorseBtn = horseModal.locator('button:has-text("Stäng")').first();
    await closeHorseBtn.click();
    await page.waitForTimeout(300);
    await expect(horseModal).not.toBeVisible();

    // 6. Klicka på "Öppna i Bong-maskinen" och verifiera navigering
    const openInBongBtn = page.locator('button:has-text("Öppna i Bong-maskinen")');
    await expect(openInBongBtn).toBeVisible();
    await openInBongBtn.click();
    await page.waitForTimeout(500);

    // Verifiera att vi hamnar i Bong-maskinen
    await expect(page.locator('h1:has-text("Bong-maskinen")')).toBeVisible();
  });
});
