import { chromium } from 'playwright';

async function inspectHomepageV53() {
  console.log('===========================================================');
  console.log('HOMEPAGE V5.3 DEEP VISUAL & CONVERSION ARCHITECTURE INSPECTION');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const viewports = [
    { width: 320, height: 568, name: '320x568-iPhoneSE' },
    { width: 360, height: 800, name: '360x800-Android' },
    { width: 390, height: 844, name: '390x844-iPhone12' },
    { width: 414, height: 896, name: '414x896-iPhoneXR' },
    { width: 768, height: 1024, name: '768x1024-iPad' },
    { width: 1024, height: 768, name: '1024x768-iPadLandscape' },
    { width: 1280, height: 800, name: '1280x800-Laptop' },
    { width: 1440, height: 900, name: '1440x900-Desktop' },
    { width: 1920, height: 1080, name: '1920x1080-FHD' },
  ];

  const results = {
    viewportsChecked: [],
    sectionsOrder: [],
    ctaAudit: {},
    allPassed: true,
  };

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 1. Audit Section Ordering in DOM
  const sectionIds = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('main > section, main > * > section, main section'));
    return sections.map(s => s.id || s.className.slice(0, 20)).filter(Boolean);
  });
  console.log('Detected Section IDs on Homepage:', sectionIds);
  results.sectionsOrder = sectionIds;

  // 2. Audit All Target CTAs and Behavior
  console.log('\n--- Auditing CTAs ---');
  
  // Hero Primary CTA
  await page.click('#hero-primary-cta');
  await page.waitForTimeout(500);
  const heroPrimaryScrolled = await page.evaluate(() => {
    const el = document.getElementById('vehicle-consultation');
    const r = el?.getBoundingClientRect();
    return r && r.top < 350;
  });
  console.log(`- #hero-primary-cta scrolls to #vehicle-consultation: ${heroPrimaryScrolled}`);
  results.ctaAudit.heroPrimary = heroPrimaryScrolled;

  // Discover Standard CTA
  await page.click('#cta-discover-standard');
  await page.waitForTimeout(500);
  const standardScrolled = await page.evaluate(() => {
    const el = document.getElementById('torque-standard');
    const r = el?.getBoundingClientRect();
    return r && r.top < 350;
  });
  console.log(`- #cta-discover-standard scrolls to #torque-standard: ${standardScrolled}`);
  results.ctaAudit.discoverStandard = standardScrolled;

  // See How It Works CTA
  await page.click('#cta-see-how-it-works');
  await page.waitForTimeout(800);
  const processScrolled = await page.evaluate(() => {
    const el = document.getElementById('process');
    const r = el?.getBoundingClientRect();
    return r && r.top < 450;
  });
  console.log(`- #cta-see-how-it-works scrolls to #process: ${processScrolled}`);
  results.ctaAudit.seeHowItWorks = processScrolled;

  // Process Start Service Request CTA
  await page.click('#cta-start-service-request');
  await page.waitForTimeout(500);
  const processStartScrolled = await page.evaluate(() => {
    const el = document.getElementById('vehicle-consultation');
    const r = el?.getBoundingClientRect();
    return r && r.top < 350;
  });
  console.log(`- #cta-start-service-request scrolls to #vehicle-consultation: ${processStartScrolled}`);
  results.ctaAudit.processStart = processStartScrolled;

  // Final CTA Book Service
  await page.click('#cta-final-book-service');
  await page.waitForTimeout(500);
  const finalBookScrolled = await page.evaluate(() => {
    const el = document.getElementById('vehicle-consultation');
    const r = el?.getBoundingClientRect();
    return r && r.top < 350;
  });
  console.log(`- #cta-final-book-service scrolls to #vehicle-consultation: ${finalBookScrolled}`);
  results.ctaAudit.finalBook = finalBookScrolled;

  // Final CTA Contact Workshop
  await page.click('#cta-final-contact-workshop');
  await page.waitForTimeout(500);
  const finalContactScrolled = await page.evaluate(() => {
    const el = document.getElementById('location');
    const r = el?.getBoundingClientRect();
    return r && r.top < 350;
  });
  console.log(`- #cta-final-contact-workshop scrolls to #location: ${finalContactScrolled}`);
  results.ctaAudit.finalContact = finalContactScrolled;

  // View Service Status CTA
  await page.click('#cta-view-service-status');
  await page.waitForTimeout(600);
  const statusPageLoaded = await page.evaluate(() => {
    return document.body.innerText.includes('SERVICE STATUS') && document.body.innerText.includes('JC-2047');
  });
  console.log(`- #cta-view-service-status navigates to customer portal: ${statusPageLoaded}`);
  results.ctaAudit.viewServiceStatus = statusPageLoaded;

  await page.click('button:has-text("Return Home")');
  await page.waitForTimeout(500);

  // 3. Audit Viewports for Zero Horizontal Overflow & Visual Fidelity
  console.log('\n--- Checking Viewports for Zero Overflow ---');
  for (const vp of viewports) {
    const vContext = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const vPage = await vContext.newPage();
    await vPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const overflowCheck = await vPage.evaluate(() => {
      const docEl = document.documentElement;
      const body = document.body;
      const hasHorizontalScroll = docEl.scrollWidth > docEl.clientWidth || body.scrollWidth > body.clientWidth;
      return {
        clientWidth: docEl.clientWidth,
        scrollWidth: docEl.scrollWidth,
        hasHorizontalScroll
      };
    });

    const isStickyVisible = await vPage.evaluate(() => {
      const el = document.getElementById('mobile-sticky-cta-bar');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && style.visibility !== 'hidden';
    });

    console.log(`- Viewport ${vp.width}x${vp.height} (${vp.name}): Overflow: ${overflowCheck.hasHorizontalScroll} | Sticky CTA: ${isStickyVisible}`);
    results.viewportsChecked.push({
      ...vp,
      hasOverflow: overflowCheck.hasHorizontalScroll,
      stickyVisible: isStickyVisible
    });

    if (overflowCheck.hasHorizontalScroll) {
      results.allPassed = false;
    }
    await vContext.close();
  }

  await browser.close();
  console.log('\nAudit complete:', JSON.stringify(results, null, 2));
}

inspectHomepageV53().catch(console.error);
