import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForLoadState('networkidle');

  // Leads 1440
  await page.evaluate(() => window.location.hash = '#leads');
  await page.click('button[data-module="leads"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/leads_1440.png' });

  // Appointments 1440
  await page.click('button[data-module="appointments"]');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/appointments_1440.png' });

  // Tablet 768px
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/appointments_768.png' });

  // Mobile viewport 375px
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/appointments_375.png' });

  // Switch to Leads in mobile via evaluate or drawer
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-module="leads"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/leads_375.png' });

  // Leads 320px
  await page.setViewportSize({ width: 320, height: 600 });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/leads_320.png' });

  // Appointments 320px
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-module="appointments"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84/appointments_320.png' });

  await browser.close();
  console.log('All responsive screenshots captured successfully!');
})();
