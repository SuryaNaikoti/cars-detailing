import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const ARTIFACT_DIR = 'C:\\Users\\HP\\.gemini\\antigravity-ide\\brain\\53ab3be5-994c-49cb-ae4e-7e9d379f96c4';

async function runRemindersQA() {
  console.log('====================================================');
  console.log('STARTING REMINDERS & FOLLOW-UPS V4.1 QA TEST SUITE');
  console.log('====================================================');

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  try {
    // 1. Navigate to Reminders module
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    // Clear localStorage to ensure fresh seed data with canonical records
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Navigate to Reminders
    console.log('Navigating to Reminders module...');
    const remindersNavBtn = page.locator('button:has-text("Reminders"), a:has-text("Reminders")').first();
    await remindersNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await remindersNavBtn.click();
    await page.waitForTimeout(1000);

    // Verify Heading
    const heading = await page.locator('h1').textContent();
    console.log(`Page Heading: ${heading?.trim()}`);
    if (!heading?.includes('Reminders & Follow-Ups')) {
      throw new Error(`Expected heading "Reminders & Follow-Ups", found "${heading}"`);
    }

    // 2. Verify Top Tabs: [ OVERDUE ] [ DUE TODAY ] [ THIS WEEK ] [ UPCOMING ] [ COMPLETED ]
    console.log('Verifying top filter tabs...');
    const tabs = ['ALL', 'OVERDUE', 'DUE_TODAY', 'THIS_WEEK', 'UPCOMING', 'COMPLETED'];
    for (const tab of tabs) {
      const tabLoc = page.locator(`[data-testid="tab-${tab}"]`);
      await tabLoc.waitFor({ state: 'visible', timeout: 5000 });
      const text = await tabLoc.textContent();
      console.log(`✓ Tab ${tab} present: ${text?.trim()}`);
    }

    // 3. Verify High Priority Service Due Card (Rahul Mehta - BMW 5 Series)
    console.log('Verifying High Priority Service Due Card (Rahul Mehta)...');
    const rahulCard = page.locator('[data-testid="reminder-card-rem-bmw-rahul"]');
    await rahulCard.waitFor({ state: 'visible', timeout: 5000 });
    const rahulText = await rahulCard.innerText();
    console.log('Rahul Card snippet:', rahulText.slice(0, 150).replace(/\n/g, ' '));
    if (!rahulText.includes('Rahul Mehta') || !rahulText.includes('MH 02 ER 4500') || !rahulText.includes('HIGH PRIORITY')) {
      throw new Error('Rahul Mehta High Priority card content mismatch');
    }
    // Verify buttons on Rahul Card: [ OPEN VEHICLE ] [ WHATSAPP ] [ CALL ] [ COMPLETE ]
    await rahulCard.locator('[data-testid="open-vehicle-btn"]').waitFor({ state: 'visible' });
    await rahulCard.locator('[data-testid="whatsapp-btn"]').waitFor({ state: 'visible' });
    await rahulCard.locator('[data-testid="call-btn"]').waitFor({ state: 'visible' });
    await rahulCard.locator('[data-testid="complete-btn"]').waitFor({ state: 'visible' });
    console.log('✓ Rahul Mehta Service Due card and all action buttons verified');

    // 4. Verify Customer Follow-Up Declined Recommendation Card (Ananya Deshmukh)
    console.log('Verifying Customer Follow-Up Declined Rec Card (Ananya Deshmukh)...');
    const ananyaCard = page.locator('[data-testid="reminder-card-rem-merc-ananya"]');
    await ananyaCard.waitFor({ state: 'visible', timeout: 5000 });
    const ananyaText = await ananyaCard.innerText();
    console.log('Ananya Card snippet:', ananyaText.slice(0, 150).replace(/\n/g, ' '));
    if (!ananyaText.includes('Ananya Deshmukh') || !ananyaText.includes('DECLINED RECOMMENDATION') || !ananyaText.includes('Front parking sensor replacement')) {
      throw new Error('Ananya Deshmukh Declined Rec card content mismatch');
    }
    // Verify buttons on Ananya Card: [ VIEW ESTIMATE ] [ WHATSAPP ] [ CREATE FOLLOW-UP ]
    await ananyaCard.locator('[data-testid="view-estimate-btn"]').waitFor({ state: 'visible' });
    await ananyaCard.locator('[data-testid="whatsapp-btn"]').waitFor({ state: 'visible' });
    await ananyaCard.locator('[data-testid="create-follow-up-btn"]').waitFor({ state: 'visible' });
    console.log('✓ Ananya Deshmukh Declined Recommendation card and action buttons verified');

    // 5. Test Search
    console.log('Testing search functionality...');
    const searchInput = page.locator('[data-testid="reminders-search"]');
    await searchInput.fill('MH 02 ER 4500');
    await page.waitForTimeout(300);
    const visibleCardsAfterReg = await page.locator('[data-testid^="reminder-card-"]').count();
    console.log(`Cards visible after searching "MH 02 ER 4500": ${visibleCardsAfterReg}`);
    if (visibleCardsAfterReg !== 1) {
      throw new Error(`Expected 1 card for MH 02 ER 4500, got ${visibleCardsAfterReg}`);
    }

    await searchInput.fill('Ananya');
    await page.waitForTimeout(300);
    const visibleCardsAfterCustomer = await page.locator('[data-testid^="reminder-card-"]').count();
    console.log(`Cards visible after searching "Ananya": ${visibleCardsAfterCustomer}`);
    if (visibleCardsAfterCustomer !== 1) {
      throw new Error(`Expected 1 card for Ananya, got ${visibleCardsAfterCustomer}`);
    }
    await searchInput.fill('');
    await page.waitForTimeout(300);
    console.log('✓ Search by registration and customer passed');

    // 6. Test Type Filter
    console.log('Testing Type dropdown filter...');
    const typeFilter = page.locator('[data-testid="filter-type"]');
    await typeFilter.selectOption('DECLINED_RECOMMENDATION');
    await page.waitForTimeout(300);
    const declinedCount = await page.locator('[data-testid^="reminder-card-"]').count();
    console.log(`Cards visible with DECLINED_RECOMMENDATION: ${declinedCount}`);
    if (declinedCount !== 1) {
      throw new Error(`Expected 1 declined card, got ${declinedCount}`);
    }
    await typeFilter.selectOption('ALL');
    await page.waitForTimeout(300);
    console.log('✓ Type filter verified');

    // 7. Test Tab Filtering: OVERDUE
    console.log('Testing Tab Filtering: OVERDUE...');
    await page.locator('[data-testid="tab-OVERDUE"]').click();
    await page.waitForTimeout(300);
    const overdueCount = await page.locator('[data-testid^="reminder-card-"]').count();
    console.log(`Cards visible in OVERDUE tab: ${overdueCount}`);
    if (overdueCount < 2) {
      throw new Error(`Expected at least 2 overdue cards (Vikramaditya, Rajesh), got ${overdueCount}`);
    }

    // Test Tab Filtering: DUE TODAY
    console.log('Testing Tab Filtering: DUE TODAY...');
    await page.locator('[data-testid="tab-DUE_TODAY"]').click();
    await page.waitForTimeout(300);
    const dueTodayCount = await page.locator('[data-testid^="reminder-card-"]').count();
    console.log(`Cards visible in DUE TODAY tab: ${dueTodayCount}`);
    if (dueTodayCount < 1) {
      throw new Error(`Expected at least 1 due today card (Meera Nambiar), got ${dueTodayCount}`);
    }

    // Switch back to ALL
    await page.locator('[data-testid="tab-ALL"]').click();
    await page.waitForTimeout(300);
    console.log('✓ Tab filtering verified');

    // 8. Test WhatsApp URL Generation
    console.log('Verifying WhatsApp deep links...');
    const rahulWaHref = await rahulCard.locator('[data-testid="whatsapp-btn"]').getAttribute('href');
    console.log('Rahul WhatsApp URL snippet:', rahulWaHref?.slice(0, 70));
    if (!rahulWaHref?.includes('wa.me') || !rahulWaHref?.includes('9876543210')) {
      throw new Error('Rahul WhatsApp URL invalid');
    }

    const ananyaWaHref = await ananyaCard.locator('[data-testid="whatsapp-btn"]').getAttribute('href');
    console.log('Ananya WhatsApp URL snippet:', ananyaWaHref?.slice(0, 70));
    if (!ananyaWaHref?.includes('wa.me') || !ananyaWaHref?.includes('parking%20sensor')) {
      throw new Error('Ananya WhatsApp URL invalid');
    }
    console.log('✓ Contextual WhatsApp links verified');

    // 9. Test Mark as Complete
    console.log('Testing Mark as COMPLETE on Rahul Mehta card...');
    const completeBtn = rahulCard.locator('[data-testid="complete-btn"]');
    await completeBtn.click();
    await page.waitForTimeout(500);

    // Verify Toast notification
    const toast = page.locator('[data-testid="reminders-toast"]');
    if (await toast.isVisible()) {
      console.log(`✓ Toast confirmed: ${await toast.textContent()}`);
    }

    // 10. Test Modal: + New Follow-Up
    console.log('Testing + New Follow-Up modal creation...');
    await page.locator('[data-testid="add-reminder-btn"]').click();
    const modal = page.locator('[data-testid="add-reminder-modal"]');
    await modal.waitFor({ state: 'visible', timeout: 3000 });

    await page.fill('[data-testid="modal-input-customer"]', 'Karan Singhania');
    await page.fill('[data-testid="modal-input-phone"]', '+91 98999 11223');
    await page.fill('[data-testid="modal-input-reg"]', 'MH 04 BK 1122');
    await page.fill('[data-testid="modal-input-service"]', 'Exhaust Valve Check & Drivetrain Health');
    await page.locator('[data-testid="modal-submit-btn"]').click();
    await page.waitForTimeout(1000);

    // Verify new card rendered
    const karanCard = page.locator('text=Karan Singhania').first();
    await karanCard.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Successfully created new follow-up and verified in queue');

    // 11. Capture Responsive Screenshots
    console.log('Capturing responsive viewports...');
    // Desktop 1440x900
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_1440.png'), fullPage: false });
    console.log('✓ 1440x900 screenshot saved');

    // Desktop 1280x800
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_1280.png'), fullPage: false });
    console.log('✓ 1280x800 screenshot saved');

    // Tablet 768x1024
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_768.png'), fullPage: false });
    console.log('✓ 768x1024 screenshot saved');

    // Mobile 430x932
    await page.setViewportSize({ width: 430, height: 932 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_430.png'), fullPage: false });
    console.log('✓ 430x932 screenshot saved');

    // Mobile 375x812
    await page.setViewportSize({ width: 375, height: 812 });
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_375.png'), fullPage: false });
    console.log('✓ 375x812 screenshot saved');

    // Mobile 320px Zero Overflow Check
    await page.setViewportSize({ width: 320, height: 650 });
    const overflowDimensions = await page.evaluate(() => {
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    console.log('320px Viewport dimensions:', overflowDimensions);
    if (overflowDimensions.scrollWidth > overflowDimensions.clientWidth) {
      throw new Error(`320px viewport has horizontal overflow: scrollWidth (${overflowDimensions.scrollWidth}) > clientWidth (${overflowDimensions.clientWidth})`);
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'reminders_320.png'), fullPage: false });
    console.log('✓ 320px has ZERO horizontal overflow and screenshot saved');

    console.log('====================================================');
    console.log('REMINDERS & FOLLOW-UPS V4.1 QA TEST PASSED COMPLETELY');
    console.log('====================================================');
  } finally {
    await browser.close();
  }
}

runRemindersQA().catch((err) => {
  console.error('QA FAILED:', err);
  process.exit(1);
});
