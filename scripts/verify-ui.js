import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir =
  process.env.ARTIFACT_DIR ||
  'C:/Users/hells/.gemini/antigravity/brain/f24ef41b-2172-4e6f-abd4-7c5845855bd6';
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
    // DEL 1: NORMALLÄGE — HÄSTKORTET I MOBIL & LAPTOP
    // ========================================================

    // 1A. Mobil: 390x844 — Hästkortet (via lopp eller sök)
    console.log('Tar skärmbild för mobil (390x844) Hästkort...');
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

    // Klicka in på fliken Hästar i bottenmenyn
    console.log('Mobil: Navigerar till fliken Hästar...');
    const hastarTab = mobilePage.locator('nav[aria-label="Mobil bottenmeny"] button:has-text("Hästar")');
    await hastarTab.click();
    await sleep(1000);

    // Sök efter Global
    await mobilePage.fill('input[placeholder="Sök häst..."]', 'Global');
    await sleep(800);

    // Ta skärmbild på sökskärmen i mobil
    const mobileSearchPath = path.join(artifactDir, 'fas-6-mobil-hastsok.png');
    await mobilePage.screenshot({ path: mobileSearchPath, fullPage: false });
    console.log(`Mobil Hästsök sparad till: ${mobileSearchPath}`);

    // Klicka på hästen Global F.N.P. för att öppna Hästkortet
    console.log('Mobil: Klickar på häst i söklistan...');
    const horseBtn = mobilePage.locator('div.divide-y button').first();
    await horseBtn.click();
    await sleep(1500);

    const mobileHastkortPath = path.join(artifactDir, 'fas-6-mobil-hastkort.png');
    await mobilePage.screenshot({ path: mobileHastkortPath, fullPage: false });
    console.log(`Mobil Hästkort sparad till: ${mobileHastkortPath}`);

    await mobileContext.close();

    // 1B. Laptop: 1440x900 — Hästkortet med full tabell & stamtavla
    console.log('Tar skärmbild för laptop (1440x900) Hästkort...');
    const laptopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    // Klicka in på fliken Hästar på laptop
    const laptopHastarBtn = laptopPage.locator('aside nav button:has-text("Hästar")').first();
    await laptopHastarBtn.click();
    await sleep(1000);

    await laptopPage.fill('input[placeholder="Sök häst..."]', 'Global');
    await sleep(800);

    const firstHorse = laptopPage.locator('div.divide-y button').first();
    await firstHorse.click();
    await sleep(1500);

    const laptopHastkortPath = path.join(artifactDir, 'fas-6-laptop-hastkort.png');
    await laptopPage.screenshot({ path: laptopHastkortPath });
    console.log(`Laptop Hästkort sparad till: ${laptopHastkortPath}`);

    await laptopContext.close();

    // ========================================================
    // DEL 2: DEGRADERINGSMODELLEN — HISTORIK AVSTÄNGD
    // ========================================================
    console.log('\n--- Prov på arkitekturen: Testar avstängd historik (simulateHistoryDown=true) ---');

    const degradedContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const degradedPage = await degradedContext.newPage();
    await degradedPage.goto('http://localhost:5174?simulateHistoryDown=true', {
      waitUntil: 'networkidle',
    });
    await sleep(1000);

    // Navigera till hästen
    const degHastarBtn = degradedPage.locator('aside nav button:has-text("Hästar")').first();
    await degHastarBtn.click();
    await sleep(1000);

    await degradedPage.fill('input[placeholder="Sök häst..."]', 'Global');
    await sleep(800);

    const degFirstHorse = degradedPage.locator('div.divide-y button').first();
    await degFirstHorse.click();
    await sleep(1500);

    // Klicka på färskhetspricken vid Form i backspegeln
    console.log('Trycker på färskhetsprick för Form i backspegeln i degraderat läge...');
    const formSection = degradedPage.locator('section:has-text("Form i backspegeln")');
    const dotBtn = formSection.locator('button[aria-label="Visa information om uppgifternas färskhet"]').first();
    if (await dotBtn.isVisible()) {
      await dotBtn.click();
      await sleep(500);
    }

    const degradedPath = path.join(artifactDir, 'fas-6-degradering-historik.png');
    await degradedPage.screenshot({ path: degradedPath });
    console.log(`Degraderingsskärmbild med sparad till: ${degradedPath}`);

    await degradedContext.close();
    await browser.close();

    console.log('\nSamtliga Playwright UI-verifieringar för Fas 6 slutförda!');
  } finally {
    serverProcess.kill('SIGTERM');
    webProcess.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error('Fel under verifiering:', err);
  process.exit(1);
});
