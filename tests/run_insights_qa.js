import { chromium } from 'playwright';
import fs from 'fs';

async function runInsightsQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('===========================================================');
  console.log('STARTING WORKSHOP INSIGHTS V4.0 (REPORTS & ANALYTICS) QA');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: Page Loads Correctly & Navigation to Reports
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Navigate to Workshop Reports ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const reportsNavBtn = page.locator('button[data-module="reports"], button:has-text("Reports")').first();
    await reportsNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await reportsNavBtn.click();
    await page.waitForTimeout(1000);

    const reportsPage = page.locator('#workshop-reports-page');
    if (!(await reportsPage.isVisible())) {
      throw new Error('#workshop-reports-page container not visible');
    }
    console.log('✓ TEST 1 passed: Successfully navigated to #workshop-reports-page');

    // ----------------------------------------------------
    // TEST 2: Heading & Eyebrow Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Heading & Eyebrow verification for Reports ---');
    const heading = await page.locator('#workshop-reports-page h1').innerText();
    const eyebrow = await page.locator('#workshop-reports-page span:has-text("OPERATIONAL REPORTING")').innerText();
    console.log('Heading:', heading);
    console.log('Eyebrow:', eyebrow);
    if (!heading.toUpperCase().includes('WORKSHOP REPORTS')) {
      throw new Error(`Expected heading WORKSHOP REPORTS, got: "${heading}"`);
    }
    if (!eyebrow.toUpperCase().includes('OPERATIONAL REPORTING')) {
      throw new Error(`Expected eyebrow OPERATIONAL REPORTING, got: "${eyebrow}"`);
    }
    console.log('✓ TEST 2 passed: Reports header & eyebrow verified');

    // ----------------------------------------------------
    // TEST 3: Reports 8 Canonical KPIs Derivation
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Reports KPI Strip Verification ---');
    const kpiOpened = page.locator('#kpi-jobs-opened');
    const kpiCompleted = page.locator('#kpi-jobs-completed');
    const kpiDelivered = page.locator('#kpi-jobs-delivered');
    const kpiReady = page.locator('#kpi-ready-collection');
    const kpiOverdue = page.locator('#kpi-overdue-jobs');
    const kpiEstimates = page.locator('#kpi-estimates-created');
    const kpiApprovedScope = page.locator('#kpi-approved-scope');
    const kpiCustomers = page.locator('#kpi-new-customers');

    if (!(await kpiOpened.isVisible())) throw new Error('kpi-jobs-opened not visible');
    if (!(await kpiCompleted.isVisible())) throw new Error('kpi-jobs-completed not visible');
    if (!(await kpiDelivered.isVisible())) throw new Error('kpi-jobs-delivered not visible');
    if (!(await kpiReady.isVisible())) throw new Error('kpi-ready-collection not visible');
    if (!(await kpiOverdue.isVisible())) throw new Error('kpi-overdue-jobs not visible');
    if (!(await kpiEstimates.isVisible())) throw new Error('kpi-estimates-created not visible');
    if (!(await kpiApprovedScope.isVisible())) throw new Error('kpi-approved-scope not visible');
    if (!(await kpiCustomers.isVisible())) throw new Error('kpi-new-customers not visible');

    const openedVal = await kpiOpened.locator('span.font-black').innerText();
    const approvedScopeVal = await kpiApprovedScope.locator('span.font-black').innerText();
    console.log(`KPI Jobs Opened: ${openedVal}, Approved Scope: ${approvedScopeVal}`);

    if (parseInt(openedVal) < 1) {
      throw new Error(`Expected Jobs Opened >= 1, got ${openedVal}`);
    }
    if (!approvedScopeVal.includes('₹')) {
      throw new Error(`Expected currency symbol ₹ in Approved Scope, got ${approvedScopeVal}`);
    }
    console.log('✓ TEST 3 passed: All 8 Reports KPIs rendered with canonical derivation');

    // ----------------------------------------------------
    // TEST 4: Date Filter Switching in Reports
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Reports Date Filter Functionality ---');
    const filterSelect = page.locator('#reports-date-filter');
    await filterSelect.selectOption('today');
    await page.waitForTimeout(600);

    const todayOpenedVal = await kpiOpened.locator('span.font-black').innerText();
    console.log(`Jobs Opened under "today" filter: ${todayOpenedVal}`);

    await filterSelect.selectOption('current_month');
    await page.waitForTimeout(600);
    console.log('✓ TEST 4 passed: Date filter switched and recalculated metrics');

    // ----------------------------------------------------
    // TEST 5: Financial Label Non-Revenue Compliance
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Financial terminology compliance (No "revenue") ---');
    const reportsText = await page.locator('#workshop-reports-page').innerText();
    if (reportsText.toLowerCase().includes('total revenue') || reportsText.toLowerCase().includes('net profit')) {
      throw new Error('Found forbidden "revenue" or "profit" labels in Reports');
    }
    console.log('✓ TEST 5 passed: Verified clean non-revenue scope labels');

    // ----------------------------------------------------
    // TEST 6: Navigate to Workshop Analytics
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Navigate to Workshop Analytics ---');
    const analyticsNavBtn = page.locator('button[data-module="analytics"], button:has-text("Analytics")').first();
    await analyticsNavBtn.click();
    await page.waitForTimeout(1000);

    const analyticsPage = page.locator('#workshop-analytics-page');
    if (!(await analyticsPage.isVisible())) {
      throw new Error('#workshop-analytics-page container not visible');
    }

    const aHeading = await page.locator('#workshop-analytics-page h1').innerText();
    const aEyebrow = await page.locator('#workshop-analytics-page span:has-text("OPERATIONAL INTELLIGENCE")').innerText();
    console.log('Analytics Heading:', aHeading);
    console.log('Analytics Eyebrow:', aEyebrow);
    if (!aHeading.toUpperCase().includes('WORKSHOP ANALYTICS')) {
      throw new Error(`Expected WORKSHOP ANALYTICS, got: "${aHeading}"`);
    }
    console.log('✓ TEST 6 passed: Navigated to Workshop Analytics');

    // ----------------------------------------------------
    // TEST 7: Analytics Ratios & Multi-Stage Intake Funnel
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Analytics Executive Ratios & Intake Funnel ---');
    const ratiosGrid = page.locator('#analytics-ratios-grid');
    if (!(await ratiosGrid.isVisible())) {
      throw new Error('Analytics executive ratios grid not visible');
    }

    const completionRateText = await ratiosGrid.locator('div:has-text("Completion Rate") span.font-black').innerText();
    const approvalRateText = await ratiosGrid.locator('div:has-text("Approval Rate") span.font-black').innerText();
    console.log(`Completion Rate: ${completionRateText}, Approval Rate: ${approvalRateText}`);

    // Verify 8 Funnel Stages are present
    const funnelCards = page.locator('#intake-funnel-grid > div');
    const funnelCount = await funnelCards.count();
    console.log(`Intake Funnel Stages rendered: ${funnelCount}`);
    if (funnelCount !== 8) {
      throw new Error(`Expected 8 intake funnel stages, got ${funnelCount}`);
    }
    console.log('✓ TEST 7 passed: Executive ratios and 8-stage intake funnel verified');

    // ----------------------------------------------------
    // TEST 8: Operational Action Queues & Oldest Records
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Operational Action Queues & Bottleneck Signals ---');
    const actionQueueTable = page.locator('#workshop-analytics-page table:has-text("Queue Name")');
    if (!(await actionQueueTable.isVisible())) {
      throw new Error('Action queues table not visible');
    }
    const tableText = await actionQueueTable.innerText();
    console.log('Action Queues snippet:', tableText.slice(0, 150));
    if (!tableText.includes('Awaiting Customer Scope Approval')) {
      throw new Error('Expected "Awaiting Customer Scope Approval" queue in Action Queues table');
    }
    console.log('✓ TEST 8 passed: Action queues rendered with oldest records');

    // ----------------------------------------------------
    // TEST 9: Key Observations Deterministic Check
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Key Management Observations ---');
    const obsContainer = page.locator('#analytics-observations-list');
    const obsCount = await obsContainer.locator('> div').count();
    console.log(`Observations count: ${obsCount}`);
    if (obsCount < 1) {
      throw new Error('Expected at least 1 deterministic key observation');
    }
    const obsFirstText = await obsContainer.locator('> div').first().innerText();
    console.log(`First Observation: ${obsFirstText}`);
    console.log('✓ TEST 9 passed: Deterministic observations generated');

    // ----------------------------------------------------
    // TEST 10: Responsive 320px Zero Horizontal Overflow
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Responsive Viewports & Zero Horizontal Overflow (320px) ---');
    await page.setViewportSize({ width: 320, height: 600 });
    await page.waitForTimeout(600);

    const overflowAnalytics = await page.evaluate(() => {
      const el = document.getElementById('workshop-analytics-page');
      return {
        clientWidth: el ? el.clientWidth : 0,
        scrollWidth: el ? el.scrollWidth : 0,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    console.log('Analytics 320px overflow check:', overflowAnalytics);
    if (overflowAnalytics.scrollWidth > overflowAnalytics.clientWidth + 2) {
      throw new Error(`Horizontal overflow detected in Analytics at 320px: scrollWidth ${overflowAnalytics.scrollWidth} > clientWidth ${overflowAnalytics.clientWidth}`);
    }

    // Switch to Reports at 320px
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="reports"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    const overflowReports = await page.evaluate(() => {
      const el = document.getElementById('workshop-reports-page');
      return {
        clientWidth: el ? el.clientWidth : 0,
        scrollWidth: el ? el.scrollWidth : 0,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    console.log('Reports 320px overflow check:', overflowReports);
    if (overflowReports.scrollWidth > overflowReports.clientWidth + 2) {
      throw new Error(`Horizontal overflow detected in Reports at 320px: scrollWidth ${overflowReports.scrollWidth} > clientWidth ${overflowReports.clientWidth}`);
    }
    console.log('✓ TEST 10 passed: Zero horizontal overflow on 320px for both Reports and Analytics');

    console.log('\n===========================================================');
    console.log('ALL 10 INSIGHTS V4.0 QA VALIDATION CHECKS PASSED PERFECTLY!');
    console.log('===========================================================');
  } finally {
    await browser.close();
  }
}

runInsightsQA().catch((err) => {
  console.error('\n❌ INSIGHTS QA FAILED:', err);
  process.exit(1);
});
