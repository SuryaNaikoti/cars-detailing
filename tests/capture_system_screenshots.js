import { chromium } from 'playwright';
import path from 'path';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '1024', width: 1024, height: 768 },
  { name: '768', width: 768, height: 1024 },
  { name: '430', width: 430, height: 932 },
  { name: '375', width: 375, height: 812 },
  { name: '320', width: 320, height: 700 },
];

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto('http://localhost:5173/dashboard');
    await page.waitForTimeout(1000);

    // 1. Team View
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="team"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    const teamPath = path.join(ARTIFACTS_DIR, `team_${vp.name}.png`);
    await page.screenshot({ path: teamPath, fullPage: false });
    console.log(`Saved: team_${vp.name}.png`);

    // 2. Settings View
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="settings"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    const settingsPath = path.join(ARTIFACTS_DIR, `settings_${vp.name}.png`);
    await page.screenshot({ path: settingsPath, fullPage: false });
    console.log(`Saved: settings_${vp.name}.png`);

    await page.close();
  }

  await browser.close();
  console.log('Finished capturing all responsive screenshots for System V4.0!');
}

capture().catch(console.error);
