import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir =
  process.env.ARTIFACT_DIR ||
  'C:/Users/hells/.gemini/antigravity/brain/52937b17-f562-4b7c-82d7-d45a4ee954d2';
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
    // DEL 1: MOBIL (390x844) — TIPS ("VAD TYCKER STALLBACKEN?")
    // ========================================================
    console.log('\n--- 1. Mobil (390x844): Tips-skärmen ("Vad tycker stallbacken?") ---');
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

    // Klicka på Tips i bottenmenyn
    console.log('Mobil: Klickar på Tips i bottenmenyn...');
    const tipsTab = mobilePage.locator('button:has-text("Tips")').last();
    await tipsTab.click();
    await sleep(1500);

    const mobileTipsPath = path.join(artifactDir, 'fas-8-mobil-tips.png');
    await mobilePage.screenshot({ path: mobileTipsPath, fullPage: false });
    console.log(`Mobil Tips sparad till: ${mobileTipsPath}`);

    // ========================================================
    // DEL 2: MOBIL (390x844) — BANVISAREN
    // ========================================================
    console.log('\n--- 2. Mobil (390x844): Banvisaren (Solvalla) ---');
    // Klicka på Mer i bottenmenyn
    const merTab = mobilePage.locator('button:has-text("Mer")').last();
    await merTab.click();
    await sleep(1000);

    // Klicka på Banvisaren
    const banvisarenBtn = mobilePage.locator('button:has-text("Banvisaren")').first();
    await banvisarenBtn.click();
    await sleep(1500);

    const mobileBanvisarenPath = path.join(artifactDir, 'fas-8-mobil-banvisaren.png');
    await mobilePage.screenshot({ path: mobileBanvisarenPath, fullPage: false });
    console.log(`Mobil Banvisaren sparad till: ${mobileBanvisarenPath}`);

    // ========================================================
    // DEL 3: MOBIL (390x844) — LOPPKORT BLOCK 3 TIPS
    // ========================================================
    console.log('\n--- 3. Mobil (390x844): Loppkort med Block 3 Tips ---');
    const idagTab = mobilePage.locator('button:has-text("Idag")').last();
    await idagTab.click();
    await sleep(1000);

    const raceBtn = mobilePage.locator('button:has-text("Lopp 4")').first();
    await raceBtn.click();
    await sleep(1500);

    // Scrolla ner till Block 3: Vad tycker stallbacken?
    await mobilePage.evaluate(() => window.scrollBy(0, 450));
    await sleep(500);

    const mobileLoppTipsPath = path.join(artifactDir, 'fas-8-mobil-lopp-tips.png');
    await mobilePage.screenshot({ path: mobileLoppTipsPath, fullPage: false });
    console.log(`Mobil Lopp Block 3 sparad till: ${mobileLoppTipsPath}`);

    await mobileContext.close();

    // ========================================================
    // DEL 4: LAPTOP (1440x900) — BANVISAREN
    // ========================================================
    console.log('\n--- 4. Laptop (1440x900): Banvisaren ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    // Klicka på Mer i vänstermenyn
    const desktopMerBtn = desktopPage.locator('aside button:has-text("Mer")');
    await desktopMerBtn.click();
    await sleep(1000);

    const desktopBanvisarenBtn = desktopPage.locator('button:has-text("Banvisaren")').first();
    await desktopBanvisarenBtn.click();
    await sleep(1500);

    const desktopBanvisarenPath = path.join(artifactDir, 'fas-8-laptop-banvisaren.png');
    await desktopPage.screenshot({ path: desktopBanvisarenPath, fullPage: false });
    console.log(`Laptop Banvisaren sparad till: ${desktopBanvisarenPath}`);

    // ========================================================
    // DEL 5: LAPTOP (1440x900) — TIPS ("VAD TYCKER STALLBACKEN?")
    // ========================================================
    console.log('\n--- 5. Laptop (1440x900): Tips ---');
    const desktopTipsBtn = desktopPage.locator('aside button:has-text("Tips")');
    await desktopTipsBtn.click();
    await sleep(1500);

    const desktopTipsPath = path.join(artifactDir, 'fas-8-laptop-tips.png');
    await desktopPage.screenshot({ path: desktopTipsPath, fullPage: false });
    console.log(`Laptop Tips sparad till: ${desktopTipsPath}`);

    // ========================================================
    // DEL 6: LAPTOP (1440x900) — IDAG-SKÄRM MED VÄDER & BANVISAREN-LÄNK
    // ========================================================
    console.log('\n--- 6. Laptop (1440x900): Idag-skärm med väder & Banvisaren ---');
    const desktopIdagBtn = desktopPage.locator('aside button:has-text("Idag")');
    await desktopIdagBtn.click();
    await sleep(1500);

    const desktopIdagPath = path.join(artifactDir, 'fas-8-laptop-idag-vader.png');
    await desktopPage.screenshot({ path: desktopIdagPath, fullPage: false });
    console.log(`Laptop Idag med väder sparad till: ${desktopIdagPath}`);

    await desktopContext.close();
    await browser.close();

    console.log('\nAlla browserverifieringar slutförda!');
  } finally {
    console.log('Stänger ner bakgrundsprocesser...');
    serverProcess.kill();
    webProcess.kill();
  }
}

run().catch((err) => {
  console.error('Fel under verifiering:', err);
  process.exit(1);
});
