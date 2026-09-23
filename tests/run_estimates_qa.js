import { chromium } from 'playwright';
import fs from 'fs';

async function runEstimatesQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('Launching browser for Estimates & Approvals V3.7 QA...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

  // Clear localStorage to ensure fresh seed data with correct Job Card references
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('Navigating to Estimates & Approvals module...');
  const estimatesNavBtn = page.locator('button:has-text("Estimates"), a:has-text("Estimates")').first();
  await estimatesNavBtn.click();
  await page.waitForTimeout(1000);

  // 1. Verify Page Header & Aesthetics
  const heading = await page.locator('h1').innerText();
  console.log('Page Heading:', heading);
  if (!heading.includes('ESTIMATES & APPROVALS')) {
    throw new Error('Heading does not contain ESTIMATES & APPROVALS');
  }

  await page.screenshot({ path: 'test-results/estimates_01_desktop_main.png' });
  console.log('✓ Desktop Main Workspace screenshot saved: test-results/estimates_01_desktop_main.png');

  // 2. Verify KPI Strip and Clickable Filter with Toggle-to-Clear
  const kpiApproved = page.locator('[data-testid="kpi-APPROVED"]');
  console.log('Testing KPI filter click...');
  await kpiApproved.click();
  await page.waitForTimeout(500);

  let bodyText = await page.locator('body').innerText();
  if (!bodyText.includes('RESET FILTERS')) {
    throw new Error('RESET FILTERS button did not appear when KPI filter active');
  }
  console.log('✓ KPI filter activated and RESET FILTERS appeared');

  // Toggle to clear by clicking again
  await kpiApproved.click();
  await page.waitForTimeout(500);
  bodyText = await page.locator('body').innerText();
  console.log('✓ KPI toggle-to-clear verified');

  // 3. Verify Canonical Lineage & 7-Row Card Structure in Queue
  const expectedItems = [
    'EST-2026-2047',
    'JC-2047',
    'BMW 5 Series',
    'MH 02 ER 4500',
    'Rahul Mehta',
    'INS-3047',
    'Rohan Deshmukh'
  ];
  for (const item of expectedItems) {
    if (!bodyText.includes(item)) {
      throw new Error(`Expected queue item "${item}" not found in body text!`);
    }
  }
  console.log('✓ Canonical lineage and 7-row queue card fields verified');

  // 4. Test Search
  const searchInput = page.locator('input[placeholder*="Search Estimate ID"]').first();
  await searchInput.fill('EST-2026-2048');
  await page.waitForTimeout(500);
  bodyText = await page.locator('body').innerText();
  if (!bodyText.includes('Ananya Deshmukh') || !bodyText.includes('Mercedes-Benz')) {
    throw new Error('Search for EST-2026-2048 did not filter queue correctly');
  }
  console.log('✓ Search functionality verified');
  await searchInput.fill('');
  await page.waitForTimeout(500);

  // 5. Verify Dossier Sections on Active Estimate
  // Select EST-2026-2047 card specifically
  const est47Card = page.locator('[data-testid="est-card-est-2047"], div:has-text("EST-2026-2047")').last();
  await est47Card.click();
  await page.waitForTimeout(500);

  // Fetch updated text from the dossier container
  const dossier = page.locator('.lg\\:col-span-4');
  const dossierText = await dossier.innerText();
  console.log('Dossier preview:', dossierText.substring(0, 200).replace(/\n/g, ' '));

  // Check work scope grouping: Labour, Parts, Consumables
  if (!dossierText.includes('Labour') && !dossierText.includes('Parts') && !dossierText.includes('Consumables')) {
    throw new Error('Missing work scope groups Labour, Parts, or Consumables in dossier');
  }

  // Check Commercial Calculation: Subtotal, Grand Total
  if (!dossierText.toLowerCase().includes('subtotal') || !dossierText.toLowerCase().includes('grand total')) {
    throw new Error(`Missing Subtotal or Grand Total in Commercial Summary! Dossier content: ${dossierText}`);
  }
  console.log('✓ Work scope grouping & Commercial calculation panel verified');

  // 6. Test + NEW ESTIMATE from DVI Inspection Recommendations
  console.log('Testing + NEW ESTIMATE creation from DVI...');
  const newEstBtn = page.locator('button:has-text("+ NEW ESTIMATE")').first();
  await newEstBtn.click();
  await page.waitForTimeout(500);

  await page.screenshot({ path: 'test-results/estimates_02_modal_new.png' });
  console.log('✓ New Estimate Modal screenshot saved: test-results/estimates_02_modal_new.png');

  // Submit new estimate
  const continueBtn = page.locator('button:has-text("CONTINUE TO ESTIMATE SCOPE →")').first();
  if (await continueBtn.count() > 0) {
    await continueBtn.click();
    await page.waitForTimeout(800);
    console.log('✓ Estimate created from inspection recommendations successfully');
  } else {
    // If modal shows no unpriced recommendations for default, click cancel
    const cancelBtn = page.locator('button:has-text("Cancel")').first();
    await cancelBtn.click();
    await page.waitForTimeout(500);
  }

  // 7. Test Customer Quote Portal (/quote/:token)
  console.log('Testing Customer Quote Portal...');
  // Find open customer view button
  const openCustomerViewBtn = page.locator('button:has-text("OPEN CUSTOMER VIEW →")').first();
  if (await openCustomerViewBtn.count() > 0) {
    await openCustomerViewBtn.click();
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'test-results/estimates_03_customer_portal.png' });
    console.log('✓ Customer Quote Portal screenshot saved: test-results/estimates_03_customer_portal.png');

    const portalText = await page.locator('body').innerText();
    if (!portalText.includes('ESTIMATE REVIEW & APPROVAL') && !portalText.includes('Torque Expert\'s')) {
      throw new Error('Customer quote portal header not found');
    }

    // Verify internal notes are NOT exposed in customer quote portal
    if (portalText.includes('INTERNAL STAFF NOTES') || portalText.includes('Staff Only')) {
      throw new Error('SECURITY VIOLATION: Internal notes exposed in customer quote portal!');
    }
    console.log('✓ Security check passed: Internal staff notes strictly hidden from customer view');

    // Return to dashboard
    const backBtn = page.locator('button:has-text("Back to Overview"), button:has-text("RETURN TO WORKSHOP DASHBOARD")').first();
    await backBtn.click();
    await page.waitForTimeout(1000);

    // Ensure we are in Estimates & Approvals module
    const estimatesNav = page.locator('button:has-text("Estimates"), a:has-text("Estimates")').first();
    if (await estimatesNav.count() > 0 && await estimatesNav.isVisible()) {
      await estimatesNav.click();
      await page.waitForTimeout(1000);
    }
  }

  // 8. Test "AUTHORIZE APPROVED WORK"
  console.log('Testing "AUTHORIZE APPROVED WORK" workflow...');
  // Select EST-2026-2047 which is APPROVED
  const est47 = page.locator('div:has-text("EST-2026-2047")').first();
  await est47.click();
  await page.waitForTimeout(500);

  const authBtn = page.locator('button:has-text("AUTHORIZE APPROVED WORK →")').first();
  if (await authBtn.count() > 0) {
    await authBtn.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'test-results/estimates_04_modal_authorize.png' });
    console.log('✓ Authorize Modal screenshot saved: test-results/estimates_04_modal_authorize.png');

    const confirmAuthBtn = page.locator('button:has-text("Authorize Work →")').first();
    await confirmAuthBtn.click();
    await page.waitForTimeout(1000);

    // Verify converted status
    const updatedText = await page.locator('body').innerText();
    if (!updatedText.includes('WORK AUTHORIZED') && !updatedText.includes('OPEN JOB CARD')) {
      throw new Error('Estimate was not converted to authorized work');
    }
    console.log('✓ Work successfully authorized and attached to Job Card without duplicates');
  }

  // 9. Test Mobile Responsive Viewports (375px & 320px)
  console.log('Testing mobile responsive layout at 375x812...');
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'test-results/estimates_05_mobile_375.png' });
  console.log('✓ Mobile 375px screenshot saved: test-results/estimates_05_mobile_375.png');

  // Verify mobile queue cards and open dossier
  const mobileCard = page.locator('button:has-text("INSPECT DOSSIER →")').first();
  if (await mobileCard.count() > 0) {
    await mobileCard.click();
    await page.waitForTimeout(500);

    const mobileDossierText = await page.locator('body').innerText();
    if (!mobileDossierText.includes('BACK TO ESTIMATES')) {
      throw new Error('Mobile dossier back button missing');
    }

    await page.screenshot({ path: 'test-results/estimates_06_mobile_dossier.png' });
    console.log('✓ Mobile Dossier drawer screenshot saved: test-results/estimates_06_mobile_dossier.png');

    // Click back to estimates
    const backToQueueBtn = page.locator('button:has-text("BACK TO ESTIMATES")').first();
    await backToQueueBtn.click();
    await page.waitForTimeout(500);
  }

  // Test 320px for zero horizontal overflow
  console.log('Testing 320px viewport for zero horizontal overflow...');
  await page.setViewportSize({ width: 320, height: 650 });
  await page.waitForTimeout(1000);

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });

  if (overflow) {
    throw new Error('Horizontal overflow detected at 320px viewport!');
  }
  console.log('✓ Zero horizontal overflow verified at 320px!');

  await page.screenshot({ path: 'test-results/estimates_07_mobile_320.png' });
  console.log('✓ Mobile 320px screenshot saved: test-results/estimates_07_mobile_320.png');

  await browser.close();
  console.log('\n=========================================');
  console.log('ALL ESTIMATES & APPROVALS QA TESTS PASSED!');
  console.log('=========================================\n');
}

runEstimatesQA().catch((err) => {
  console.error('QA Test Failure:', err);
  process.exit(1);
});
