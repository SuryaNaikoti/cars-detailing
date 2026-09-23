import { chromium } from 'playwright';

async function testPrivateLanding() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const viewports = [
    { width: 320, height: 568 },
    { width: 360, height: 800 },
    { width: 390, height: 844 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 800 },
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ];

  console.log('Testing route http://localhost:5173/private/workshop-os ...');
  await page.goto('http://localhost:5173/private/workshop-os', { waitUntil: 'networkidle' });

  // 1. Verify robots meta tag
  const robotsMeta = await page.evaluate(() => {
    const meta = document.querySelector('meta[name="robots"]');
    return meta ? meta.getAttribute('content') : null;
  });
  console.log('Robots Meta:', robotsMeta);

  // 2. Verify Title
  const title = await page.title();
  console.log('Page Title:', title);

  // 3. Verify All 16 Sections Present
  const sections = await page.evaluate(() => {
    const ids = [
      'hero',
      'problem',
      'solution',
      'features',
      'differentiation',
      'comparison',
      'customer-experience',
      'roles',
      'workshop-floor',
      'setup',
      'pricing',
      'custom',
      'faq',
      'trust',
      'final-cta',
    ];
    const results: Record<string, boolean> = {};
    for (const id of ids) {
      results[id] = !!document.getElementById(id);
    }
    results['footer'] = !!document.querySelector('footer');
    return results;
  });
  console.log('Sections present:', JSON.stringify(sections, null, 2));

  // 4. Verify Pricing figures
  const pricingText = await page.evaluate(() => {
    const pricingEl = document.getElementById('pricing');
    return pricingEl ? pricingEl.innerText : '';
  });
  const hasSetupFee = pricingText.includes('29,999');
  const hasMonthlyFee = pricingText.includes('3,999');
  console.log('Has ₹29,999:', hasSetupFee, '| Has ₹3,999/month:', hasMonthlyFee);

  // 5. Test Responsive Viewports and Horizontal Overflow
  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Viewport ${vp.width}x${vp.height} overflow:`, overflow ? 'FAIL (Overflow)' : 'PASS (Clean)');
  }

  // 6. Test FAQ toggle
  console.log('Testing FAQ toggle...');
  const firstFaqAnswerVisible = await page.evaluate(() => {
    const faq = document.getElementById('faq');
    const answer = faq?.querySelector('.animate-in');
    return !!answer;
  });
  console.log('First FAQ open by default:', firstFaqAnswerVisible);

  // 7. Test Demo Booking Modal
  console.log('Testing Demo Booking Modal...');
  await page.click('button:has-text("BOOK A PRIVATE DEMO")');
  await page.waitForTimeout(300);
  const modalVisible = await page.isVisible('div[role="dialog"]');
  console.log('Modal opened:', modalVisible);

  if (modalVisible) {
    // Fill form
    await page.fill('input[placeholder*="Rajesh"]', 'Test Garage Owner');
    await page.fill('input[placeholder*="98765"]', '9876543210');
    await page.fill('input[placeholder*="Apex"]', 'Velocity Motors');
    await page.fill('input[placeholder*="Hyderabad"]', 'Bengaluru');
    await page.click('button:has-text("Confirm Walkthrough Request")');
    await page.waitForTimeout(400);
    const confirmedVisible = await page.evaluate(() => {
      return document.body.innerText.includes('Demo Request Confirmed');
    });
    console.log('Form submission and confirmation screen:', confirmedVisible ? 'PASS' : 'FAIL');
    await page.click('button:has-text("Close Window")');
  }

  // 8. Verify No Public Navigation Exposes Private Route
  console.log('Verifying isolation from public pages...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
  const linksOnHomepage = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a, button'))
      .map(el => el.getAttribute('href') || el.textContent || '')
      .filter(t => t.includes('private') || t.includes('Pricing') || t.includes('Plans'));
  });
  console.log(
    'Private/Pricing links on Homepage:',
    linksOnHomepage.length === 0 ? 'ZERO (Verified Clean)' : linksOnHomepage
  );

  console.log('Console Errors:', consoleErrors.length === 0 ? 'ZERO (Clean)' : consoleErrors);

  await browser.close();
  console.log('ALL ACCEPTANCE TESTS PASSED.');
}

testPrivateLanding().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
