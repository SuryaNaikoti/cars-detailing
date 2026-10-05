import { chromium } from 'playwright';

const BREAKPOINTS = [
  { name: '320px', width: 320, height: 640 },
  { name: '360px', width: 360, height: 740 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
];

async function runHomepageMobileAudit() {
  console.log('--- RUNNING AUDIT FOR ROUTE 01: HOMEPAGE ---');
  const browser = await chromium.launch();
  const results = {};

  for (const bp of BREAKPOINTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: bp.width, height: bp.height });
    
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

    // 1. Check Horizontal Overflow
    const overflowCheck = await page.evaluate(() => {
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const innerWidth = window.innerWidth;
      
      // Check which elements might exceed width
      const overflowingElements = [];
      const all = document.querySelectorAll('*');
      for (const el of all) {
        const rect = el.getBoundingClientRect();
        if (rect.right > innerWidth + 1 || rect.left < -1) {
          overflowingElements.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className || '').toString().slice(0, 50),
            right: rect.right,
          });
        }
      }
      return {
        hasOverflow: scrollWidth > clientWidth,
        scrollWidth,
        clientWidth,
        innerWidth,
        badElements: overflowingElements.slice(0, 5),
      };
    });

    // 2. Check Hero CTA tap and smooth scroll to Action Hub
    let heroCtaPassed = false;
    try {
      const heroCta = page.locator('#hero-primary-cta');
      if (await heroCta.isVisible()) {
        await heroCta.click();
        await page.waitForTimeout(1800);
        const actionHubInView = await page.evaluate(() => {
          const el = document.getElementById('action-hub');
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.top >= -100 && rect.top <= window.innerHeight;
        });
        heroCtaPassed = actionHubInView;
      }
    } catch (e) {
      console.error(`Hero CTA failed at ${bp.name}:`, e.message);
    }

    // 3. Check Mobile Menu Drawer open/close on mobile breakpoints
    let mobileDrawerPassed = true;
    if (bp.width <= 414) {
      try {
        const trigger = page.locator('#mobile-menu-trigger');
        await trigger.click();
        await page.waitForTimeout(300);
        const drawerVisible = await page.locator('#mobile-navigation-drawer').isVisible();
        
        // Click FAQ link in drawer
        const faqLink = page.locator('#mobile-navigation-drawer a[href="#faq"]');
        if (await faqLink.isVisible()) {
          await faqLink.click();
          await page.waitForTimeout(500);
          const drawerClosed = !(await page.locator('#mobile-navigation-drawer').isVisible());
          mobileDrawerPassed = drawerVisible && drawerClosed;
        }
      } catch (e) {
        mobileDrawerPassed = false;
        console.error(`Mobile drawer test failed at ${bp.name}:`, e.message);
      }
    }

    // 4. Check Action Hub Form interaction at this breakpoint
    let formPassed = false;
    try {
      await page.evaluate(() => document.getElementById('action-hub')?.scrollIntoView());
      await page.waitForTimeout(300);

      // Fill name & phone
      await page.fill('#action-hub-name', 'Mobile Test User');
      await page.fill('#action-hub-phone', '9876543210');
      
      const submitBtn = page.locator('#btn-action-hub-request-service');
      await submitBtn.click();
      await page.waitForTimeout(800);

      // Verify success container
      const successMsg = await page.locator('text=Service Request Received');
      formPassed = await successMsg.isVisible();
    } catch (e) {
      console.error(`Form submission failed at ${bp.name}:`, e.message);
    }

    results[bp.name] = {
      overflow: !overflowCheck.hasOverflow,
      scrollWidth: overflowCheck.scrollWidth,
      clientWidth: overflowCheck.clientWidth,
      badElements: overflowCheck.badElements,
      heroCtaPassed,
      mobileDrawerPassed,
      formPassed,
      consoleErrorsCount: consoleErrors.length,
    };

    console.log(`[${bp.name}] Overflow: ${!overflowCheck.hasOverflow ? 'PASS' : 'FAIL'} (${overflowCheck.scrollWidth}px vs ${overflowCheck.clientWidth}px) | CTA: ${heroCtaPassed} | Drawer: ${mobileDrawerPassed} | Form: ${formPassed}`);

    await page.close();
  }

  await browser.close();
  console.log('Results Summary:', JSON.stringify(results, null, 2));
}

runHomepageMobileAudit().catch(console.error);
