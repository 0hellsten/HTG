import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir = process.env.ARTIFACT_DIR || 'C:/Users/hells/.gemini/antigravity/brain/f9b48fb7-66c9-4422-953e-9bdb51a497b8';
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
  console.log('1. Startar Fastify backend...');
  const serverProcess = spawn('node', ['apps/server/dist/index.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3001' },
  });

  console.log('2. Startar Vite preview server för webb...');
  const webProcess = spawn('npx', ['vite', 'preview', '--port', '5173', '--strictPort'], {
    cwd: path.resolve('apps/web'),
    shell: true,
    stdio: 'inherit',
  });

  try {
    await waitForServer('http://localhost:3001/halsa');
    console.log('Backend svarar på /halsa!');

    await waitForServer('http://localhost:5173');
    console.log('Frontend svarar på http://localhost:5173!');

    console.log('3. Startar Chromium via Playwright...');
    const browser = await chromium.launch();

    // ==========================================
    // 1. Mobil: 390x844 — Startsida (Idag)
    // ==========================================
    console.log('Tar skärmbild för mobil (390x844) - Dagens omgång...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1500);

    const mobileIdagPath = path.join(artifactDir, 'fas-3-mobil-idag-390x844.png');
    await mobilePage.screenshot({ path: mobileIdagPath });
    console.log(`Mobil Idag sparad till: ${mobileIdagPath}`);

    // Klicka på Lopp 4 för att öppna loppkortet
    console.log('Mobil: Navigerar in i Lopp 4...');
    const raceButton = mobilePage.locator('button:has-text("Lopp 4")').first();
    await raceButton.click();
    await sleep(1500);

    const mobileLoppPath = path.join(artifactDir, 'fas-3-mobil-lopp-390x844.png');
    await mobilePage.screenshot({ path: mobileLoppPath });
    console.log(`Mobil Loppkort sparad till: ${mobileLoppPath}`);

    // Klicka på färskhetspricken för att visa lugn förklaring
    const dotBtn = mobilePage.locator('button[aria-label="Visa information om uppgifternas färskhet"]').first();
    if (await dotBtn.isVisible()) {
      await dotBtn.click();
      await sleep(500);
      const dotShotPath = path.join(artifactDir, 'fas-3-mobil-prick-klick.png');
      await mobilePage.screenshot({ path: dotShotPath });
      console.log(`Mobil Prick-klick sparad till: ${dotShotPath}`);
    }
    await mobileContext.close();

    // ==========================================
    // 2. Laptop: 1440x900 — Startsida & Loppkort
    // ==========================================
    console.log('Tar skärmbild för laptop (1440x900) - Dagens omgång...');
    const laptopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1500);

    const laptopIdagPath = path.join(artifactDir, 'fas-3-laptop-idag-1440x900.png');
    await laptopPage.screenshot({ path: laptopIdagPath });
    console.log(`Laptop Idag sparad till: ${laptopIdagPath}`);

    // Klicka in på Lopp 4
    console.log('Laptop: Navigerar in i Lopp 4...');
    const laptopRaceBtn = laptopPage.locator('button:has-text("Lopp 4")').first();
    await laptopRaceBtn.click();
    await sleep(1500);

    const laptopLoppPath = path.join(artifactDir, 'fas-3-laptop-lopp-1440x900.png');
    await laptopPage.screenshot({ path: laptopLoppPath });
    console.log(`Laptop Loppkort sparad till: ${laptopLoppPath}`);

    await laptopContext.close();
    await browser.close();
    console.log('UI-verifiering slutförd med alla skärmbilder!');
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
