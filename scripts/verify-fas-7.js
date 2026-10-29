import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir =
  process.env.ARTIFACT_DIR ||
  'C:/Users/hells/.gemini/antigravity/brain/0ddd50e8-c86a-4c2b-8e56-135431e064f2';
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
    // DEL 1: MOBIL (390x844) — "STÄLL DEM MOT VARANDRA"
    // ========================================================
    console.log('\n--- 1. Mobil (390x844): Navigerar till Lopp 4 och jämförvy ---');
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

    // Klicka in på Lopp 4 (Solvalla)
    console.log('Mobil: Klickar in på Lopp 4...');
    const raceBtn = mobilePage.locator('button:has-text("Lopp 4")').first();
    await raceBtn.click();
    await sleep(1500);

    // Välj två hästar med "Jämför"-knappen i startlistan
    console.log('Mobil: Väljer hästar i startlistan via Jämför-knappar...');
    const compareButtons = mobilePage.locator('button:has-text("Jämför")');
    const btnCount = await compareButtons.count();
    if (btnCount >= 2) {
      await compareButtons.nth(0).click();
      await sleep(300);
      await compareButtons.nth(1).click();
      await sleep(300);
    }

    // Klicka på "Ställ dem mot varandra"
    console.log('Mobil: Klickar på "Ställ dem mot varandra"...');
    const compareMainBtn = mobilePage.locator('button:has-text("Ställ dem mot varandra")').first();
    await compareMainBtn.click();
    await sleep(2000);

    // Scrolla till toppen så hela jämförvyn syns
    await mobilePage.evaluate(() => window.scrollTo(0, 0));
    await sleep(500);

    // Ta skärmbild på jämförvyn i mobil
    const mobileTabellPath = path.join(artifactDir, 'fas-7-mobil-jamfor-tabell.png');
    await mobilePage.screenshot({ path: mobileTabellPath, fullPage: false });
    console.log(`Mobil Jämför-tabell sparad till: ${mobileTabellPath}`);

    // Scrolla tabellen horisontellt för att verifiera fast första kolumn
    console.log('Mobil: Rullar tabellen horisontellt för att visa fast första kolumn...');
    const tableScrollEl = mobilePage.locator('div.overflow-x-auto').first();
    await tableScrollEl.evaluate((el) => {
      el.scrollLeft = 140;
    });
    await sleep(500);

    const mobileScrollPath = path.join(artifactDir, 'fas-7-mobil-jamfor-scroll.png');
    await mobilePage.screenshot({ path: mobileScrollPath, fullPage: false });
    console.log(`Mobil horisontell scroll sparad till: ${mobileScrollPath}`);

    // Återställ scroll och öppna "Så här läser du tabellen"
    await tableScrollEl.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await sleep(300);
    console.log('Mobil: Fäller ut "Så här läser du tabellen"...');
    const helpBtn = mobilePage.locator('button:has-text("Så här läser du tabellen")');
    await helpBtn.click();
    await sleep(500);

    const mobileHjalpPath = path.join(artifactDir, 'fas-7-mobil-jamfor-hjalp.png');
    await mobilePage.screenshot({ path: mobileHjalpPath, fullPage: false });
    console.log(`Mobil Hjälpruta sparad till: ${mobileHjalpPath}`);

    await mobileContext.close();

    // ========================================================
    // DEL 2: LAPTOP (1440x900) — FULL JÄMFÖRELSETABELL
    // ========================================================
    console.log('\n--- 2. Laptop (1440x900): Full bredd med 13 rader och diskret bäst-markering ---');
    const laptopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    // Klicka in på Lopp 4 på laptop
    const laptopRaceBtn = laptopPage.locator('button:has-text("Lopp 4")').first();
    await laptopRaceBtn.click();
    await sleep(1500);

    // Klicka på "Ställ dem mot varandra"
    console.log('Laptop: Öppnar jämförvyn...');
    const laptopCompareBtn = laptopPage.locator('button:has-text("Ställ dem mot varandra")').first();
    await laptopCompareBtn.click();
    await sleep(2000);

    // Lägg till en fjärde häst via snabbknapparna om sådan finns
    const plusButtons = laptopPage.locator('section button:has-text(".")');
    const plusCount = await plusButtons.count();
    if (plusCount > 0) {
      console.log('Laptop: Lägger till ytterligare häst ur loppet...');
      await plusButtons.first().click();
      await sleep(1000);
    }

    const laptopFullTabellPath = path.join(artifactDir, 'fas-7-laptop-jamfor-full.png');
    await laptopPage.screenshot({ path: laptopFullTabellPath });
    console.log(`Laptop full tabell sparad till: ${laptopFullTabellPath}`);

    await laptopContext.close();

    // ========================================================
    // DEL 3: DEGRADERAT LÄGE (simulateDown=true)
    // ========================================================
    console.log('\n--- 3. Degraderat läge: Verifierar att fel i historik visar tankstreck och gul/grå prick ---');
    const degradedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const degradedPage = await degradedContext.newPage();
    await degradedPage.goto('http://localhost:5174?simulateHistoryDown=true', {
      waitUntil: 'networkidle',
    });
    await sleep(1000);

    const degRaceBtn = degradedPage.locator('button:has-text("Lopp 4")').first();
    await degRaceBtn.click();
    await sleep(1500);

    const degCompareBtn = degradedPage.locator('button:has-text("Ställ dem mot varandra")').first();
    await degCompareBtn.click();
    await sleep(2000);

    const degradedPath = path.join(artifactDir, 'fas-7-laptop-jamfor-degraderad.png');
    await degradedPage.screenshot({ path: degradedPath });
    console.log(`Degraderingsskärmbild sparad till: ${degradedPath}`);

    await degradedContext.close();
    await browser.close();

    console.log('\nSamtliga Playwright UI-verifieringar för Fas 7 slutförda framgångsrikt!');
  } finally {
    serverProcess.kill('SIGTERM');
    webProcess.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Fel under verifiering:', err);
  process.exit(1);
});
