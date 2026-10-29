import { chromium } from 'playwright';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:/Users/hells/.gemini/antigravity/brain/d238af12-572d-4015-b9d6-c892da2ab781';
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

    // 1. Mobil: 390x844
    console.log('Tar skärmbild för mobil (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1000);
    const mobileShotPath = path.join(artifactDir, 'fas-1-mobil-390x844.png');
    await mobilePage.screenshot({ path: mobileShotPath, fullPage: true });
    console.log(`Mobil skärmbild sparad till: ${mobileShotPath}`);
    await mobileContext.close();

    // 2. Laptop: 1440x900
    console.log('Tar skärmbild för laptop (1440x900)...');
    const laptopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const laptopPage = await laptopContext.newPage();
    await laptopPage.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1000);
    const laptopShotPath = path.join(artifactDir, 'fas-1-laptop-1440x900.png');
    await laptopPage.screenshot({ path: laptopShotPath, fullPage: true });
    console.log(`Laptop skärmbild sparad till: ${laptopShotPath}`);
    await laptopContext.close();

    await browser.close();
    console.log('UI-verifiering slutförd!');
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
