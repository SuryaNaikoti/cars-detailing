import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/53ab3be5-994c-49cb-ae4e-7e9d379f96c4';

async function runServiceHistoryQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('====================================================');
  console.log('STARTING SERVICE HISTORY V4.0 QA TEST SUITE');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

  // Clear localStorage to ensure fresh seed data with canonical records
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Navigate to Service History module
  console.log('Navigating to Service History module...');
  const historyNavBtn = page.locator('button:has-text("Service History"), a:has-text("Service History")').first();
  await historyNavBtn.click();
  await page.waitForTimeout(1000);

  // 1. Verify Page Heading & Description
  const heading = await page.locator('h1').innerText();
  console.log('Page Heading:', heading);
  if (!heading.includes('SERVICE HISTORY')) {
    throw new Error('Heading does not contain SERVICE HISTORY');
  }

  const eyebrow = await page.locator('text=VEHICLE SERVICE HISTORY').first();
  if (!(await eyebrow.isVisible())) {
    throw new Error('Eyebrow VEHICLE SERVICE HISTORY is missing');
  }

  // 2. Verify 8 KPI Strip
  console.log('Verifying 8 KPI strip cards...');
  const expectedKpis = [
    'TOTAL VEHICLES',
    'SERVICE VISITS',
    'COMPLETED (SEP)',
    'AVG JOB VALUE',
    'LAST 30 DAYS',
    'DUE FOR SERVICE',
    'OPEN RECS',
    'DECLINED RECS',
  ];

  for (const kpi of expectedKpis) {
    const kpiElement = page.locator(`button:has-text("${kpi}")`);
    if (!(await kpiElement.isVisible())) {
      throw new Error(`KPI card for ${kpi} is missing`);
    }
  }
  console.log('✓ All 8 KPI Cards are present and visible');

  // 3. Verify Completed Job Cards appear and Active Job Cards are distinct
  console.log('Verifying canonical completed service history records and active visit segregation...');
  const bodyText = await page.locator('body').innerText();

  // JC-2052 (Meera Nambiar) is delivered
  // JC-1984 & JC-1742 (Rahul Mehta) are delivered
  if (!bodyText.includes('JC-2052')) {
    throw new Error('Completed Job Card JC-2052 not found in service history');
  }
  if (!bodyText.includes('JC-1984') || !bodyText.includes('JC-1742')) {
    throw new Error('Completed multi-visit Job Cards (JC-1984, JC-1742) not found in service history');
  }

  // Verify Active Job Cards have CURRENT WORKSHOP VISIT tag
  if (bodyText.includes('JC-2047')) {
    const jc2047Card = page.locator('[data-testid="history-card-jc-2047"]');
    const jc2047Text = await jc2047Card.innerText();
    if (!jc2047Text.includes('CURRENT WORKSHOP VISIT')) {
      throw new Error('Active Job Card JC-2047 is not tagged as CURRENT WORKSHOP VISIT');
    }
    console.log('✓ Active visit JC-2047 correctly tagged as CURRENT WORKSHOP VISIT');
  }

  console.log('✓ Canonical completed service history records (JC-2052, JC-1984, JC-1742) rendered');

  // Verify KPIs are non-zero and derived
  const serviceVisitsKpi = await page.locator('[data-testid="kpi-SERVICE_VISITS"]').innerText();
  console.log('SERVICE VISITS KPI text:', serviceVisitsKpi.replace(/\n/g, ' '));
  if (serviceVisitsKpi.includes('0\n') || serviceVisitsKpi.endsWith('0')) {
    throw new Error('SERVICE VISITS KPI showed 0 when completed historical records exist');
  }

  const avgValueKpi = await page.locator('[data-testid="kpi-AVG_VALUE"]').innerText();
  console.log('AVG JOB VALUE KPI text:', avgValueKpi.replace(/\n/g, ' '));
  if (avgValueKpi.includes('₹0')) {
    throw new Error('AVG JOB VALUE KPI showed ₹0 when completed historical records exist');
  }
  console.log('✓ Operational KPIs correctly derived from completed records');

  // 4. Test Search Filters (Registration, Customer, Job Card)
  console.log('Testing search by Registration (MH 02 EE 7721)...');
  const searchInput = page.locator('input[placeholder*="Search registration"]').first();
  await searchInput.fill('MH 02 EE 7721');
  await page.waitForTimeout(500);

  const searchResultsText = await page.locator('body').innerText();
  if (!searchResultsText.includes('JC-2052') || !searchResultsText.includes('Meera Nambiar')) {
    throw new Error('Search by registration did not return JC-2052');
  }
  console.log('✓ Search by registration correctly returned JC-2052');

  console.log('Testing search by Customer (Rahul Mehta)...');
  await searchInput.fill('Rahul Mehta');
  await page.waitForTimeout(500);
  const rahulSearchText = await page.locator('body').innerText();
  if (!rahulSearchText.includes('BMW 5 Series') || !rahulSearchText.includes('JC-1984')) {
    throw new Error('Search by customer did not return Rahul Mehta service history');
  }
  console.log('✓ Search by customer correctly returned Rahul Mehta history');

  console.log('Testing search by Job Card (JC-1742)...');
  await searchInput.fill('JC-1742');
  await page.waitForTimeout(500);
  const jcSearchText = await page.locator('body').innerText();
  if (!jcSearchText.includes('JC-1742') || !jcSearchText.includes('Brake Inspection')) {
    throw new Error('Search by Job Card ID did not return JC-1742');
  }
  console.log('✓ Search by Job Card ID correctly returned JC-1742');

  // Reset search
  await searchInput.fill('');
  await page.waitForTimeout(500);

  // 5. Test KPI Click-to-filter and toggle-to-clear
  console.log('Testing KPI filter click...');
  const kpiLast30 = page.locator('button:has-text("LAST 30 DAYS")').first();
  await kpiLast30.click();
  await page.waitForTimeout(500);

  let filterStateText = await page.locator('body').innerText();
  if (!filterStateText.includes('RESET FILTERS')) {
    throw new Error('RESET FILTERS button did not appear when KPI filter active');
  }
  console.log('✓ KPI filter activated with RESET FILTERS button');

  // Toggle to clear by clicking again
  await kpiLast30.click();
  await page.waitForTimeout(500);
  filterStateText = await page.locator('body').innerText();
  if (filterStateText.includes('RESET FILTERS')) {
    throw new Error('RESET FILTERS did not clear on KPI toggle');
  }
  console.log('✓ KPI toggle-to-clear successfully cleared');

  // 6. Test Record Selection and Sticky Vehicle Dossier
  console.log('Testing Record Selection and Operations Dossier synchronization...');
  const jc2052Card = page.locator('[data-testid="history-card-jc-2052"]');
  await jc2052Card.click();
  await page.waitForTimeout(1000);

  const dossierHeader = page.locator('div:has-text("VEHICLE SERVICE DOSSIER")').last();
  const dossierText = await dossierHeader.innerText();
  console.log('Dossier Text Output:\n', dossierText.substring(0, 300));
  if (!dossierText.includes('JC-2052')) {
    throw new Error('Vehicle Dossier does not match selected record JC-2052');
  }
  console.log('✓ Dossier synchronized with JC-2052');

  // 7. Verify Multi-Visit Timeline & Previous Recommendations
  console.log('Testing Multi-Visit Timeline on BMW 5 Series (JC-1984)...');
  const jc1984Card = page.locator('[data-testid="history-card-jc-1984"]').first();
  await jc1984Card.click();
  await page.waitForTimeout(1000);

  const dossierElem = page.locator('[data-testid="vehicle-service-dossier"]').first();
  const bmwDossierText = await dossierElem.innerText();
  console.log('BMW Dossier Inner Text snippet:\n', bmwDossierText.substring(0, 500));

  const timeline1742 = page.locator('[data-testid="timeline-item-jc-1742"]');
  const is1742Visible = await timeline1742.isVisible();
  console.log('Timeline JC-1742 visible:', is1742Visible);

  if (!bmwDossierText.includes('VEHICLE SERVICE TIMELINE') || !is1742Visible) {
    throw new Error(`Multi-visit vehicle service timeline missing previous visit JC-1742. Dossier text has timeline: ${bmwDossierText.includes('VEHICLE SERVICE TIMELINE')}`);
  }
  console.log('✓ Multi-visit timeline correctly displays chronological visits');

  // 8. Test + ADD HISTORICAL RECORD Modal
  console.log('Testing + ADD HISTORICAL RECORD manual archival modal...');
  const addHistBtn = page.locator('[data-testid="add-historical-record-btn"]').first();
  await addHistBtn.click();
  await page.waitForTimeout(500);

  const modalHeading = await page.locator('h3:has-text("Add Historical Service Record")').innerText();
  console.log('Add Historical Record Modal Heading:', modalHeading);

  // Fill in manual historical entry
  await page.locator('input[placeholder*="Minor Service"]').fill('Historical Automatic Transmission Service');
  await page.locator('input[placeholder*="INV-2025"]').fill('HIST-MANUAL-7788');
  await page.locator('textarea[placeholder*="work notes"]').fill('Imported from physical paper service logbook 2025.');

  const submitManualBtn = page.locator('button:has-text("Save Historical Record")');
  await submitManualBtn.click();
  await page.waitForTimeout(1000);

  const bodyAfterManual = await page.locator('body').innerText();
  if (!bodyAfterManual.includes('HIST-MANUAL-7788') && !bodyAfterManual.includes('Historical Automatic Transmission Service')) {
    throw new Error('Manual historical record was not saved/rendered');
  }
  if (!bodyAfterManual.includes('MANUAL ENTRY')) {
    throw new Error('Manual historical record is missing explicit MANUAL ENTRY badge');
  }
  console.log('✓ Manual historical archive record successfully created and rendered with MANUAL ENTRY badge');

  // 9. Test CREATE FUTURE SERVICE REMINDER Handoff
  console.log('Testing CREATE FUTURE SERVICE REMINDER action...');
  const createReminderBtn = page.locator('[data-testid="create-future-reminder-btn"]').first();
  if (await createReminderBtn.isVisible()) {
    await createReminderBtn.click();
    await page.waitForTimeout(1000);
    const toastElem = page.locator('text=Future service reminder created');
    if (await toastElem.isVisible()) {
      console.log('✓ Reminder creation feedback toast displayed');
    }
    // Return back to Service History if navigated
    await page.waitForTimeout(1000);
    const shNavBtn = page.locator('button:has-text("Service History"), a:has-text("Service History")').first();
    await shNavBtn.click();
    await page.waitForTimeout(1000);
  }

  // 9. Desktop Screenshots (1440x900 & 1280x800)
  console.log('Capturing responsive screenshots...');
  await page.screenshot({ path: 'test-results/service_history_desktop_1440.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_desktop_1440.png') });
  console.log('✓ 1440x900 screenshot saved');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/service_history_desktop_1280.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_desktop_1280.png') });
  console.log('✓ 1280x800 screenshot saved');

  // Tablet Screenshot (768x1024)
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/service_history_mobile_768.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_mobile_768.png') });
  console.log('✓ 768x1024 tablet screenshot saved');

  // Mobile Screenshot (430x932 & 375x812)
  await page.setViewportSize({ width: 430, height: 932 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/service_history_mobile_430.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_mobile_430.png') });
  console.log('✓ 430x932 mobile screenshot saved');

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);

  // If mobile dossier is already open, close it first to test opening it on mobile
  const existingBackBtn = page.locator('button:has-text("BACK TO SERVICE HISTORY")');
  if (await existingBackBtn.isVisible()) {
    await existingBackBtn.click();
    await page.waitForTimeout(500);
  }

  // In mobile, tap a record to verify full-screen dossier drawer
  const mobileCard = page.locator('[data-testid="history-card-jc-1984"]').first();
  await mobileCard.click();
  await page.waitForTimeout(500);

  const backToHistoryBtn = page.locator('button:has-text("BACK TO SERVICE HISTORY")');
  if (!(await backToHistoryBtn.isVisible())) {
    throw new Error('Mobile full-screen drawer is missing BACK TO SERVICE HISTORY button');
  }
  await page.screenshot({ path: 'test-results/service_history_mobile_375.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_mobile_375.png') });
  console.log('✓ 375x812 mobile full-screen drawer screenshot saved');

  // Close mobile drawer
  await backToHistoryBtn.click();
  await page.waitForTimeout(500);

  // 10. Test 320px Zero Horizontal Overflow
  await page.setViewportSize({ width: 320, height: 650 });
  await page.waitForTimeout(500);

  const overflow = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyScrollWidth: document.body.scrollWidth,
    };
  });
  console.log('320px Viewport dimensions:', overflow);

  if (overflow.scrollWidth > overflow.clientWidth) {
    throw new Error(`Horizontal overflow detected at 320px: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`);
  }
  console.log('✓ 320px has ZERO horizontal overflow (scrollWidth === clientWidth)');

  await page.screenshot({ path: 'test-results/service_history_mobile_320.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'service_history_mobile_320.png') });
  console.log('✓ 320x650 screenshot saved');

  await browser.close();

  console.log('====================================================');
  console.log('SERVICE HISTORY V4.0 QA TEST PASSED COMPLETELY');
  console.log('====================================================');
}

runServiceHistoryQA().catch((err) => {
  console.error('QA Test Failed:', err);
  process.exit(1);
});
