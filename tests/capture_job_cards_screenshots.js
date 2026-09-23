import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84';

async function captureScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1000);

  const jobsNavBtn = page.locator('button:has-text("Job Cards"), a:has-text("Job Cards")').first();
  await jobsNavBtn.click();
  await page.waitForTimeout(1200);

  const viewports = [
    { w: 1440, h: 900, name: 'job_cards_1440' },
    { w: 1280, h: 800, name: 'job_cards_1280' },
    { w: 1024, h: 768, name: 'job_cards_1024' },
    { w: 768, h: 1024, name: 'job_cards_768' },
    { w: 430, h: 932, name: 'job_cards_430' },
    { w: 375, h: 812, name: 'job_cards_375' },
    { w: 320, h: 650, name: 'job_cards_320' },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.w, height: vp.h });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `${vp.name}.png`) });
    console.log(`Saved screenshot: ${vp.name}.png`);
  }

  await browser.close();
}

captureScreenshots().catch(console.error);
