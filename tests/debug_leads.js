import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173/dashboard');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(1000);

  const leadsNav = page.locator('button:has-text("Leads"), a:has-text("Leads")').first();
  await leadsNav.click();
  await page.waitForTimeout(1000);

  console.log('Current URL:', page.url());
  const h1 = await page.locator('h1').innerText();
  console.log('h1:', h1);

  const queueHtml = await page.locator('#leads-queue').innerHTML().catch(e => e.message);
  console.log('Queue HTML snippet:', queueHtml.substring(0, 500));

  const count = await page.locator('[data-testid^="lead-card-"]').count();
  console.log('Total lead-cards count in DOM:', count);

  for (let i = 0; i < count; i++) {
    const el = page.locator('[data-testid^="lead-card-"]').nth(i);
    const tid = await el.getAttribute('data-testid');
    const vis = await el.isVisible();
    console.log(`card ${i}:`, tid, 'visible:', vis);
  }

  await browser.close();
})();
