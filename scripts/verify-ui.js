import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir =
  process.env.ARTIFACT_DIR ||
  'C:/Users/hells/.gemini/antigravity/brain/41fc27a5-c530-4154-94fc-7e8952e3926e';
if (!fs.existsSync(artifactDir)) {
  fs.mkdirSync(artifactDir, { recursive: true });
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, maxRetries = 30) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // vänta och försök igen
    }
    await sleep(500);
  }
  throw new Error(`Kunde inte nå ${url} efter ${maxRetries} försök.`);
}

async function run() {
  console.log('1. Startar Fastify backend på port 3001...');
  const serverProcess = spawn('node', ['apps/server/dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3001', USE_FIXTURES: 'true' },
  });

  console.log('2. Startar Vite preview server för webb på port 5174...');
  const webProcess = spawn('npx', ['vite', 'preview', '--port', '5174', '--strictPort'], {
    cwd: path.resolve('apps/web'),
    shell: true,
    stdio: 'inherit',
  });

  try {
    await waitForServer('http://localhost:3001/halsa');
    console.log('Backend svarar på /halsa!');

    await waitForServer('http://localhost:5174');
    console.log('Frontend svarar på http://localhost:5174!');

    console.log('3. Startar Chromium via Playwright...');
    const browser = await chromium.launch();

    // ========================================================
    // DEL 1: NORMALLÄGE (ODDS AKTIVA)
    // ========================================================

    // 1A. Mobil: 390x844 — Lopp 4 med aktiva odds och streck
    console.log('Tar skärmbild för mobil (390x844) med aktiva odds...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    // Klicka in på Lopp 4
    console.log('Mobil: Navigerar in i Lopp 4...');
    const raceButton = mobilePage.locator('button:has-text("Lopp 4")').first();
    await raceButton.scrollIntoViewIfNeeded();
    await raceButton.click();
    await sleep(1500);

    const mobileActiveOddsPath = path.join(artifactDir, 'fas-5-mobil-odds-aktiv.png');
    await mobilePage.screenshot({ path: mobileActiveOddsPath, fullPage: false });
    console.log(`Mobil Loppkort med aktiva odds sparad till: ${mobileActiveOddsPath}`);

    await mobileContext.close();

    // 1B. Laptop: 1440x900 — Lopp 4 med tabellkolumner för odds & streck samt Dagens spik
    console.log('Tar skärmbild för laptop (1440x900) med aktiva odds...');
    const laptopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    const laptopRaceBtn = laptopPage.locator('button:has-text("Lopp 4")').first();
    await laptopRaceBtn.scrollIntoViewIfNeeded();
    await laptopRaceBtn.click();
    await sleep(1500);

    const laptopActiveOddsPath = path.join(artifactDir, 'fas-5-laptop-odds-aktiv.png');
    await laptopPage.screenshot({ path: laptopActiveOddsPath });
    console.log(`Laptop Loppkort med aktiva odds sparad till: ${laptopActiveOddsPath}`);

    await laptopContext.close();

    // ========================================================
    // DEL 2: DEGRADERINGSMODELLEN — ODDSKÄLLAN AVSTÄNGD
    // ========================================================
    console.log('\n--- Prov på arkitekturen: Testar avstängd oddskälla (simulateOddsDown=true) ---');

    // 2A. Mobil: 390x844 med oddskällan nere
    const mobileDegradedContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const mobileDegradedPage = await mobileDegradedContext.newPage();
    await mobileDegradedPage.goto('http://localhost:5174?simulateOddsDown=true', {
      waitUntil: 'networkidle',
    });
    await sleep(1000);

    const degRaceBtn = mobileDegradedPage.locator('button:has-text("Lopp 4")').first();
    await degRaceBtn.scrollIntoViewIfNeeded();
    await degRaceBtn.click();
    await sleep(1500);

    const mobileDownPath = path.join(artifactDir, 'fas-5-mobil-odds-avstangd.png');
    await mobileDegradedPage.screenshot({ path: mobileDownPath });
    console.log(`Mobil Loppkort med oddskälla avstängd sparad till: ${mobileDownPath}`);

    // Klicka på färskhetspricken för oddsen för att visa förklaringen
    console.log('Mobil: Trycker på grå färskhetsprick vid oddsblocket...');
    const oddsSection = mobileDegradedPage.locator('section:has-text("Odds och streck")');
    const dotBtn = oddsSection.locator('button[aria-label="Visa information om uppgifternas färskhet"]').first();
    if (await dotBtn.isVisible()) {
      await dotBtn.click();
      await sleep(500);
      const dotShotPath = path.join(artifactDir, 'fas-5-mobil-prick-klick.png');
      await mobileDegradedPage.screenshot({ path: dotShotPath });
      console.log(`Mobil Prick-klick med lugn svensk förklaring sparad till: ${dotShotPath}`);
    }

    await mobileDegradedContext.close();

    // 2B. Laptop: 1440x900 med oddskällan nere
    const laptopDegradedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopDegradedPage = await laptopDegradedContext.newPage();
    await laptopDegradedPage.goto('http://localhost:5174?simulateOddsDown=true', {
      waitUntil: 'networkidle',
    });
    await sleep(1000);

    const degLaptopBtn = laptopDegradedPage.locator('button:has-text("Lopp 4")').first();
    await degLaptopBtn.scrollIntoViewIfNeeded();
    await degLaptopBtn.click();
    await sleep(1500);

    const laptopDownPath = path.join(artifactDir, 'fas-5-laptop-odds-avstangd.png');
    await laptopDegradedPage.screenshot({ path: laptopDownPath });
    console.log(`Laptop Loppkort med oddskälla avstängd sparad till: ${laptopDownPath}`);

    await laptopDegradedContext.close();
    await browser.close();
    console.log('\nUI-verifiering för Fas 5 slutförd med samtliga skärmbilder!');
  } finally {
    console.log('Stänger ner processer...');
    serverProcess.kill();
    webProcess.kill();
  }
}

run().catch((err) => {
  console.error('Fel under UI-verifiering:', err);
  process.exit(1);
});
