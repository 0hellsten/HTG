import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir =
  process.env.ARTIFACT_DIR ||
  'C:/Users/hells/.gemini/antigravity/brain/48948aed-71f7-43ba-a72f-51c883ce3e00';

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
    // DEL 1: MOBIL (390x844) — MITT STALL
    // ========================================================
    console.log('\n--- 1. Mobil (390x844): Mitt stall ---');
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

    // Klicka på Mitt stall i bottenmenyn
    console.log('Mobil: Klickar på Mitt stall...');
    const stallTab = mobilePage.locator('button:has-text("Mitt stall")').last();
    await stallTab.click();
    await sleep(1200);

    const mobileStallPath = path.join(artifactDir, 'fas-9-mobil-mitt-stall.png');
    await mobilePage.screenshot({ path: mobileStallPath, fullPage: false });
    console.log(`Mobil Mitt stall sparad till: ${mobileStallPath}`);

    // ========================================================
    // DEL 2: MOBIL (390x844) — STATUS (HUR FÄRSKT ÄR DET HÄR?)
    // ========================================================
    console.log('\n--- 2. Mobil (390x844): Hur färskt är det här? ---');
    const merTab = mobilePage.locator('button:has-text("Mer")').last();
    await merTab.click();
    await sleep(800);

    const statusBtn = mobilePage.locator('button:has-text("Hur färskt är det här?")').first();
    await statusBtn.click();
    await sleep(1200);

    const mobileStatusPath = path.join(artifactDir, 'fas-9-mobil-status.png');
    await mobilePage.screenshot({ path: mobileStatusPath, fullPage: false });
    console.log(`Mobil Status sparad till: ${mobileStatusPath}`);

    // ========================================================
    // DEL 3: MOBIL (390x844) — TEXTSTORLEK & HJÄLP
    // ========================================================
    console.log('\n--- 3. Mobil (390x844): Textstorlek och Hjälp ---');
    const backBtn1 = mobilePage.locator('button:has-text("Tillbaka")').first();
    await backBtn1.click();
    await sleep(600);

    const textSizeBtn = mobilePage.locator('button:has-text("Textstorlek")').first();
    await textSizeBtn.click();
    await sleep(800);

    const mobileTextsizePath = path.join(artifactDir, 'fas-9-mobil-textstorlek.png');
    await mobilePage.screenshot({ path: mobileTextsizePath, fullPage: false });
    console.log(`Mobil Textstorlek sparad till: ${mobileTextsizePath}`);

    const backBtn2 = mobilePage.locator('button:has-text("Tillbaka")').first();
    await backBtn2.click();
    await sleep(600);

    const hjalpBtn = mobilePage.locator('button:has-text("Hjälp och vanliga frågor")').first();
    await hjalpBtn.click();
    await sleep(1000);

    const mobileHjalpPath = path.join(artifactDir, 'fas-9-mobil-hjalp.png');
    await mobilePage.screenshot({ path: mobileHjalpPath, fullPage: false });
    console.log(`Mobil Hjälp sparad till: ${mobileHjalpPath}`);

    // ========================================================
    // DEL 4: MOBIL (390x844) — OFFLINE-REMSA
    // ========================================================
    console.log('\n--- 4. Mobil (390x844): Simulerad offline med remsa ---');
    await mobilePage.goto('http://localhost:5174/?simulateOffline=true', { waitUntil: 'networkidle' });
    await sleep(1000);

    const mobileOfflinePath = path.join(artifactDir, 'fas-9-mobil-offline.png');
    await mobilePage.screenshot({ path: mobileOfflinePath, fullPage: false });
    console.log(`Mobil Offline sparad till: ${mobileOfflinePath}`);

    // ========================================================
    // DEL 5: LAPTOP (1440x900) — MITT STALL & STATUS
    // ========================================================
    console.log('\n--- 5. Laptop (1440x900): Mitt stall och Status ---');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5174', { waitUntil: 'networkidle' });
    await sleep(1000);

    // Klicka på Mitt stall i vänstermenyn
    const desktopStallTab = desktopPage.locator('aside nav button:has-text("Mitt stall")');
    await desktopStallTab.click();
    await sleep(1200);

    const desktopStallPath = path.join(artifactDir, 'fas-9-laptop-mitt-stall.png');
    await desktopPage.screenshot({ path: desktopStallPath, fullPage: false });
    console.log(`Laptop Mitt stall sparad till: ${desktopStallPath}`);

    // Klicka på Mer och öppna Status
    const desktopMerTab = desktopPage.locator('aside nav button:has-text("Mer")');
    await desktopMerTab.click();
    await sleep(800);

    const desktopStatusBtn = desktopPage.locator('button:has-text("Hur färskt är det här?")').first();
    await desktopStatusBtn.click();
    await sleep(1200);

    const desktopStatusPath = path.join(artifactDir, 'fas-9-laptop-status.png');
    await desktopPage.screenshot({ path: desktopStatusPath, fullPage: false });
    console.log(`Laptop Status sparad till: ${desktopStatusPath}`);

    // ========================================================
    // DEL 6: LAPTOP (1440x900) — LOPPKORT MED FAVORITER
    // ========================================================
    console.log('\n--- 6. Laptop (1440x900): Loppkort med favorit-hästskor ---');
    const desktopIdagTab = desktopPage.locator('aside nav button:has-text("Idag")');
    await desktopIdagTab.click();
    await sleep(800);

    const firstLoppBtn = desktopPage.locator('button:has-text("Lopp 1")').first();
    if (await firstLoppBtn.isVisible()) {
      await firstLoppBtn.click();
    } else {
      await desktopPage.locator('button:has-text("lopp")').first().click();
    }
    await sleep(1200);

    const desktopLoppPath = path.join(artifactDir, 'fas-9-laptop-lopp-favoriter.png');
    await desktopPage.screenshot({ path: desktopLoppPath, fullPage: false });
    console.log(`Laptop Loppkort med favoriter sparad till: ${desktopLoppPath}`);

    await browser.close();
    console.log('\nAlla skärmbilder och verifieringar slutförda framgångsrikt!');
  } finally {
    serverProcess.kill('SIGTERM');
    if (process.platform === 'win32') {
      try {
        spawn('taskkill', ['/pid', String(webProcess.pid), '/f', '/t']);
      } catch {
        webProcess.kill();
      }
    } else {
      webProcess.kill();
    }
  }
}

run().catch((err) => {
  console.error('[FEL] Verifieringen misslyckades:', err);
  process.exit(1);
});
