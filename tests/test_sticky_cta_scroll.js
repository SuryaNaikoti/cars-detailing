import { chromium } from 'playwright';

const VIEWPORTS = [
  { width: 320, height: 600, label: '320px' },
  { width: 360, height: 740, label: '360px' },
  { width: 390, height: 844, label: '390px' },
  { width: 414, height: 896, label: '414px' },
];

async function runTest() {
  console.log('--- Testing Sticky Mobile CTA Scroll Behavior ---');
  const browser = await chromium.launch({ headless: true });
  let allPass = true;

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    // 1. Initial load at top of page (Hero is fully visible)
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    const isVisibleAtTop = await page.evaluate(() => {
      const el = document.getElementById('mobile-sticky-cta-bar');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const isAriaHidden = el.getAttribute('aria-hidden') === 'true';
      const hasOpacity0 = style.opacity === '0';
      const hasPointerNone = style.pointerEvents === 'none';
      return !isAriaHidden && !hasOpacity0 && !hasPointerNone;
    });

    console.log(`[${vp.label}] Initial load (Hero visible): Sticky CTA visible? ${isVisibleAtTop} (Expected: false)`);
    if (isVisibleAtTop) {
      console.error(`FAIL: Sticky CTA should NOT be visible when hero is in view at ${vp.label}`);
      allPass = false;
    }

    // 2. Scroll down past hero (e.g. 1200px)
    await page.evaluate(() => window.scrollTo({ top: 1200, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 500));

    const isVisibleAfterHero = await page.evaluate(() => {
      const el = document.getElementById('mobile-sticky-cta-bar');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const isAriaHidden = el.getAttribute('aria-hidden') === 'true';
      const hasOpacity1 = style.opacity === '1';
      return !isAriaHidden && hasOpacity1;
    });

    console.log(`[${vp.label}] Scrolled past hero: Sticky CTA visible? ${isVisibleAfterHero} (Expected: true)`);
    if (!isVisibleAfterHero) {
      console.error(`FAIL: Sticky CTA SHOULD be visible after scrolling past hero at ${vp.label}`);
      allPass = false;
    }

    // 3. Click the sticky CTA and verify smooth scroll to Action Hub
    const ctaClicked = await page.evaluate(() => {
      const el = document.getElementById('mobile-sticky-cta-bar');
      const btn = el ? el.querySelector('button') : null;
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    await new Promise((r) => setTimeout(r, 800));

    const finalScrollTop = await page.evaluate(() => window.pageYOffset || document.documentElement.scrollTop);
    const actionHubTop = await page.evaluate(() => {
      const hub = document.getElementById('action-hub');
      return hub ? hub.getBoundingClientRect().top : -999;
    });
    console.log(`[${vp.label}] Clicked Sticky CTA: scrolled to scrollTop=${Math.round(finalScrollTop)}, action-hub relative top=${Math.round(actionHubTop)}px`);

    // 4. Scroll back to top (Hero visible again)
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await new Promise((r) => setTimeout(r, 500));

    const isVisibleBackAtTop = await page.evaluate(() => {
      const el = document.getElementById('mobile-sticky-cta-bar');
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const isAriaHidden = el.getAttribute('aria-hidden') === 'true';
      const hasOpacity0 = style.opacity === '0';
      return !isAriaHidden && !hasOpacity0;
    });

    console.log(`[${vp.label}] Scrolled back to top: Sticky CTA visible? ${isVisibleBackAtTop} (Expected: false)`);
    if (isVisibleBackAtTop) {
      console.error(`FAIL: Sticky CTA should disappear when scrolling back to hero at ${vp.label}`);
      allPass = false;
    }

    await page.close();
  }

  await browser.close();

  if (allPass) {
    console.log('✅ ALL STICKY CTA VIEWPORT SCROLL TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    console.error('❌ STICKY CTA TESTS FAILED!');
    process.exit(1);
  }
}

runTest().catch((err) => {
  console.error(err);
  process.exit(1);
});
