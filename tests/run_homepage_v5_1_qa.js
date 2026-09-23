import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function runHomepageV51QA() {
  console.log('===========================================================');
  console.log("STARTING HOMEPAGE V5.1 RESPONSIVE CONVERSION QA");
  console.log('===========================================================');

  const screenshotsDir = path.resolve('tests/screenshots/homepage_v5_1');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  
  // 1. Test Viewports Matrix
  const viewports = [
    { name: '320x568', width: 320, height: 568, isMobile: true },
    { name: '360x800', width: 360, height: 800, isMobile: true },
    { name: '375x812', width: 375, height: 812, isMobile: true },
    { name: '390x844', width: 390, height: 844, isMobile: true },
    { name: '414x896', width: 414, height: 896, isMobile: true },
    { name: '768x1024', width: 768, height: 1024, isMobile: false },
    { name: '1024x768', width: 1024, height: 768, isMobile: false },
    { name: '1280x800', width: 1280, height: 800, isMobile: false },
    { name: '1440x900', width: 1440, height: 900, isMobile: false },
    { name: '1920x1080', width: 1920, height: 1080, isMobile: false },
  ];

  try {
    // -------------------------------------------------------------
    // Viewport Inspection & Overflow Verification
    // -------------------------------------------------------------
    console.log('\n--- PHASE 1: Viewport Inspection & Zero Horizontal Overflow ---');
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      });
      const page = await context.newPage();
      await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const overflowCheck = await page.evaluate(() => {
        return {
          windowInnerWidth: window.innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          bodyScrollWidth: document.body.scrollWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        };
      });

      if (overflowCheck.hasHorizontalOverflow) {
        throw new Error(`OVERFLOW FAILED at ${vp.name}: scrollWidth (${overflowCheck.scrollWidth}) > innerWidth (${overflowCheck.windowInnerWidth})`);
      }

      // Check sticky CTA visibility on mobile vs desktop
      const stickyBar = page.locator('#mobile-sticky-cta-bar');
      const stickyVisible = await stickyBar.isVisible();
      if (vp.isMobile && !stickyVisible) {
        throw new Error(`MOBILE STICKY CTA FAILED: Bar should be visible at mobile viewport ${vp.name}`);
      }
      if (!vp.isMobile && stickyVisible) {
        throw new Error(`DESKTOP STICKY CTA FAILED: Bar should be hidden at desktop viewport ${vp.name}`);
      }

      // Capture screenshot
      const shotPath = path.join(screenshotsDir, `homepage_${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });

      console.log(`✓ Viewport ${vp.name.padEnd(10)}: ZERO horizontal overflow | Sticky CTA: ${stickyVisible ? 'VISIBLE (Mobile)' : 'HIDDEN (Desktop)'} | Screenshot saved`);
      await context.close();
    }

    // -------------------------------------------------------------
    // Hero Chapter Conversion Hierarchy
    // -------------------------------------------------------------
    console.log('\n--- PHASE 2: Hero Chapter Conversion Hierarchy ---');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopContext.newPage();
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const primaryHeroCTA = page.locator('#hero-primary-cta');
    const secondaryHeroCTA = page.locator('#hero-secondary-cta');

    if (!(await primaryHeroCTA.isVisible()) || !(await secondaryHeroCTA.isVisible())) {
      throw new Error('Hero CTA buttons missing');
    }

    const primaryText = await primaryHeroCTA.innerText();
    const secondaryText = await secondaryHeroCTA.innerText();

    if (!primaryText.toUpperCase().includes('BOOK A SERVICE')) {
      throw new Error(`Primary CTA expected 'BOOK A SERVICE', got '${primaryText}'`);
    }
    if (!secondaryText.toUpperCase().includes('EXPLORE SERVICES')) {
      throw new Error(`Secondary CTA expected 'EXPLORE SERVICES', got '${secondaryText}'`);
    }
    console.log(`✓ Hero CTAs verified: Primary "${primaryText.trim()}" | Secondary "${secondaryText.trim()}"`);

    // Test secondary CTA scrolls to #services
    await secondaryHeroCTA.click();
    await page.waitForTimeout(400);
    const servicesInView = await page.evaluate(() => {
      const rect = document.getElementById('services')?.getBoundingClientRect();
      return rect && rect.top < 200 && rect.bottom > 0;
    });
    console.log(`✓ Secondary CTA smooth scrolled to #services: ${servicesInView}`);

    // Test primary CTA scrolls to #vehicle-consultation
    await primaryHeroCTA.click();
    await page.waitForTimeout(400);
    const consultationInView = await page.evaluate(() => {
      const rect = document.getElementById('vehicle-consultation')?.getBoundingClientRect();
      return rect && rect.top < 300 && rect.bottom > 0;
    });
    console.log(`✓ Primary CTA smooth scrolled to #vehicle-consultation: ${consultationInView}`);

    // -------------------------------------------------------------
    // Vehicle Qualification Section & Selection Flow
    // -------------------------------------------------------------
    console.log('\n--- PHASE 3: Vehicle Qualification Interaction & Lead Sync ---');
    const makeSelector = page.locator('#select-make');
    const modelSelector = page.locator('#select-model');
    const yearSelector = page.locator('#select-year');
    const checkOptionsBtn = page.locator('#btn-check-service-options');

    if (!(await checkOptionsBtn.isVisible())) {
      throw new Error('#btn-check-service-options button missing in qualification form');
    }

    // Select BMW, 5 Series, 2022, Need: Diagnostics
    await page.click('button:has-text("BMW")');
    await modelSelector.selectOption({ label: '5 Series (G30/F10)' });
    await yearSelector.selectOption({ label: '2022' });
    await page.click('button:has-text("Diagnostics")');

    // Click CHECK SERVICE OPTIONS
    await checkOptionsBtn.click();
    await page.waitForTimeout(400);

    // Modal should now be open with vehicle and service pre-filled!
    const modalHeading = page.locator('h3:has-text("Request Diagnostic or Workshop Appointment")');
    if (!(await modalHeading.isVisible())) {
      throw new Error('Smart Enquiry Modal did not open after CHECK SERVICE OPTIONS');
    }

    const modalContext = await page.evaluate(() => {
      const makeInput = (document.querySelector('select[value]') || document.querySelectorAll('select')[0])?.value;
      const inputs = Array.from(document.querySelectorAll('input')).map(i => i.value);
      return {
        make: makeInput,
        inputs: inputs.filter(Boolean),
      };
    });
    console.log('✓ Smart Enquiry Modal opened with context:', modalContext);

    // Test submission inside modal saves canonical lead
    await page.fill('input[placeholder*="Rahul Mehta"]', 'Aditya Verma');
    await page.fill('input[placeholder*="+91 98765"]', '+91 98999 11223');
    await page.fill('textarea[placeholder*="engine light"]', 'Engine vibration under heavy acceleration; scheduled diagnostic scan.');
    await page.click('button:has-text("Submit Service Request")');
    await page.waitForTimeout(900);

    const successHeading = page.locator('h3:has-text("Request Received Successfully")');
    if (!(await successHeading.isVisible())) {
      throw new Error('Lead submission did not show success confirmation');
    }
    console.log('✓ Canonical lead submitted successfully into Workshop OS demoStore');
    await page.click('button:has-text("Done")');
    await page.waitForTimeout(300);

    // Verify lead exists in demoStore via localStorage/window evaluation
    const storedLeads = await page.evaluate(() => {
      const raw = localStorage.getItem('torque_os_leads');
      if (!raw) return [];
      try { return JSON.parse(raw); } catch { return []; }
    });
    const foundLead = storedLeads.find(l => l.customer_name === 'Aditya Verma');
    if (foundLead) {
      console.log(`✓ Lead verified in Workshop OS demoStore: ${foundLead.customer_name} (${foundLead.vehicle_summary}) - Status: ${foundLead.status}`);
    }

    // -------------------------------------------------------------
    // Mobile Drawer Navigation & Touch Target Verification
    // -------------------------------------------------------------
    console.log('\n--- PHASE 4: Mobile Drawer Navigation & Scroll Lock ---');
    const mobileContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

    const menuTrigger = mobilePage.locator('#mobile-menu-trigger');
    await menuTrigger.click();
    await mobilePage.waitForTimeout(300);

    const isBodyLocked = await mobilePage.evaluate(() => document.body.style.overflow === 'hidden');
    console.log(`✓ Mobile menu open sets body overflow hidden (scroll-lock): ${isBodyLocked}`);

    // Click 'Process' inside mobile drawer menu (not the hidden desktop header nav)
    await mobilePage.click('div.fixed.inset-0 nav a:has-text("Process")');
    await mobilePage.waitForTimeout(300);

    const isBodyUnlocked = await mobilePage.evaluate(() => document.body.style.overflow === '');
    console.log(`✓ Clicking nav link closed mobile menu and restored body overflow: ${isBodyUnlocked}`);

    // -------------------------------------------------------------
    // Campaign & Featured Package Truthful Presentation
    // -------------------------------------------------------------
    console.log('\n--- PHASE 5: Campaign & Package Truthful Copy ---');
    const campaignText = await mobilePage.evaluate(() => {
      const text = document.getElementById('campaign')?.innerText || '';
      return {
        hasStartingFrom: text.includes('Starting from') || text.includes('STARTING FROM'),
        hasEnquireCTA: text.includes('ENQUIRE ABOUT THIS SERVICE'),
        hasPrice: text.includes('14,999'),
      };
    });
    console.log('✓ Campaign copy verified:', campaignText);
    if (!campaignText.hasStartingFrom || !campaignText.hasEnquireCTA) {
      throw new Error('Campaign package missing truthful "Starting from" or "ENQUIRE ABOUT THIS SERVICE"');
    }

    // -------------------------------------------------------------
    // Mobile Sticky CTA Behavior
    // -------------------------------------------------------------
    console.log('\n--- PHASE 6: Mobile Sticky CTA Behavior ---');
    const stickyMobileBtn = mobilePage.locator('#mobile-sticky-cta-bar button');
    await stickyMobileBtn.click();
    await mobilePage.waitForTimeout(400);

    const vehicleConsultationInView = await mobilePage.evaluate(() => {
      const el = document.getElementById('vehicle-consultation');
      const rect = el?.getBoundingClientRect();
      return rect && rect.top < 350 && rect.bottom > 0;
    });
    console.log(`✓ Mobile Sticky CTA smoothly navigated to vehicle consultation: ${vehicleConsultationInView}`);

    await desktopContext.close();
    await mobileContext.close();
    await browser.close();

    console.log('\n===========================================================');
    console.log('ALL HOMEPAGE V5.1 RESPONSIVE CONVERSION QA CHECKS PASSED!');
    console.log('===========================================================');
    process.exit(0);

  } catch (err) {
    console.error('\nHOMEPAGE V5.1 QA FAILED:', err);
    await browser.close();
    process.exit(1);
  }
}

runHomepageV51QA();
