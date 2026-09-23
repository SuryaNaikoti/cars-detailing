import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForLoadState('networkidle');

  const viewports = [
    { width: 1440, height: 900, name: '1440' },
    { width: 1280, height: 800, name: '1280' },
    { width: 1024, height: 768, name: '1024' },
    { width: 768, height: 1024, name: '768' },
    { width: 430, height: 932, name: '430' },
    { width: 375, height: 812, name: '375' },
    { width: 320, height: 650, name: '320' },
  ];

  // Capture Reports across all viewports
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="reports"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/reports_${vp.name}.png`,
    });
  }

  // Capture Analytics across all viewports
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="analytics"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: `C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/analytics_${vp.name}.png`,
    });
  }

  await browser.close();
  console.log('All 14 responsive screenshots captured successfully!');
})();
