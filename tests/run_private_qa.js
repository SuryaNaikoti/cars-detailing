const { chromium } = require('playwright');

async function testJs() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  console.log('Navigating to http://localhost:5173/private/workshop-os ...');
  await page.goto('http://localhost:5173/private/workshop-os', { waitUntil: 'networkidle' });

  const title = await page.title();
  const robots = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="robots"]');
    return meta ? meta.getAttribute('content') : null;
  });

  const ids = [
    'hero', 'problem', 'solution', 'features', 'differentiation',
    'comparison', 'customer-experience', 'roles', 'workshop-floor',
    'setup', 'pricing', 'custom', 'faq', 'trust', 'final-cta'
  ];

  const present = {};
  for (const id of ids) {
    present[id] = await page.locator('#' + id).count();
  }
  const footerPresent = await page.locator('footer').count();

  // Test 9 viewports
  const viewports = [320, 360, 390, 414, 768, 1024, 1280, 1440, 1920];
  const overflows = {};
  for (const w of viewports) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.waitForTimeout(100);
    const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    overflows[w] = hasOverflow;
  }

  // Pricing verification
  const pricingText = await page.locator('#pricing').innerText();
  const has29k = pricingText.includes('29,999');
  const has3k = pricingText.includes('3,999');

  // Verify FAQ toggle
  await page.locator('#faq button').first().click();
  
  // Verify Modal
  await page.locator('button:has-text("BOOK A PRIVATE DEMO")').first().click();
  const dialogVisible = await page.locator('div[role="dialog"]').isVisible();
  await page.locator('button:has-text("Cancel")').click();

  // Verify Homepage Isolation
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button'))
      .map(el => el.getAttribute('href') || el.textContent || '')
      .filter(t => t.includes('private') || t.includes('Pricing') || t.includes('Plans'));
  });

  console.log('RESULTS:', JSON.stringify({
    title,
    robots,
    sections: present,
    footer: footerPresent,
    overflows,
    has29k,
    has3k,
    dialogVisible,
    publicLinksCount: links.length,
    consoleErrorsCount: consoleErrors.length
  }, null, 2));

  await browser.close();
}

testJs().catch(e => { console.error(e); process.exit(1); });
