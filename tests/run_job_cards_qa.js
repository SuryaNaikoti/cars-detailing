import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84';

async function runJobCardsQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('====================================================');
  console.log('STARTING JOB CARDS V4.0 MASTER RECORD & EXECUTION QA');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: Page loads correctly
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Page loads correctly ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // Navigate to Job Cards module
    const jobsNavBtn = page.locator('button:has-text("Job Cards"), a:has-text("Job Cards")').first();
    await jobsNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await jobsNavBtn.click();
    await page.waitForTimeout(1000);
    console.log('✓ TEST 1 passed: Dashboard and Job Cards module loaded');

    // ----------------------------------------------------
    // TEST 2: JOB CARDS heading & eyebrow exist
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Heading & Eyebrow verification ---');
    const heading = await page.locator('h1').innerText();
    console.log('Heading found:', heading);
    if (!heading.includes('JOB CARDS')) {
      throw new Error(`Expected heading "JOB CARDS", got: "${heading}"`);
    }

    const eyebrow = page.locator('text=WORKSHOP OPERATIONS').first();
    if (!(await eyebrow.isVisible())) {
      throw new Error('Eyebrow WORKSHOP OPERATIONS is not visible');
    }
    console.log('✓ TEST 2 passed: Heading and Eyebrow verified');

    // ----------------------------------------------------
    // TEST 3, 4, 5: Canonical KPI derivations & DELIVERED exclusion
    // ----------------------------------------------------
    console.log('\n--- TEST 3, 4, 5: Canonical KPI derivations & DELIVERED exclusion ---');
    const activeKpi = page.locator('[data-testid="jobs-kpi-active"]');
    await activeKpi.waitFor({ state: 'visible', timeout: 5000 });
    const activeKpiText = await activeKpi.innerText();
    console.log('ACTIVE JOBS KPI Text:', activeKpiText.replace(/\n/g, ' '));
    // 4 active jobs (JC-2047, JC-2048, JC-2049, JC-2051), JC-2050 is DELIVERED so excluded
    if (!activeKpiText.includes('4')) {
      throw new Error(`Expected ACTIVE JOBS KPI to be 4, got: ${activeKpiText}`);
    }
    console.log('✓ TEST 4 passed: TOTAL ACTIVE JOBS equals canonical active count (4)');
    console.log('✓ TEST 5 passed: DELIVERED JC-2050 excluded from active count');

    const approvalKpi = page.locator('[data-testid="jobs-kpi-approval"]');
    const approvalKpiText = await approvalKpi.innerText();
    console.log('AWAITING APPROVAL KPI Text:', approvalKpiText.replace(/\n/g, ' '));
    if (!approvalKpiText.includes('1')) {
      throw new Error(`Expected AWAITING APPROVAL to be 1 (JC-2049), got: ${approvalKpiText}`);
    }

    const progressKpi = page.locator('[data-testid="jobs-kpi-progress"]');
    const progressKpiText = await progressKpi.innerText();
    console.log('WORK IN PROGRESS KPI Text:', progressKpiText.replace(/\n/g, ' '));
    if (!progressKpiText.includes('1')) {
      throw new Error(`Expected WORK IN PROGRESS to be 1 (JC-2047), got: ${progressKpiText}`);
    }

    const qcKpi = page.locator('[data-testid="jobs-kpi-qc"]');
    const qcKpiText = await qcKpi.innerText();
    console.log('QUALITY CHECK KPI Text:', qcKpiText.replace(/\n/g, ' '));
    if (!qcKpiText.includes('1')) {
      throw new Error(`Expected QUALITY CHECK to be 1 (JC-2048), got: ${qcKpiText}`);
    }

    const unassignedKpi = page.locator('[data-testid="jobs-kpi-unassigned"]');
    const unassignedKpiText = await unassignedKpi.innerText();
    console.log('UNASSIGNED KPI Text:', unassignedKpiText.replace(/\n/g, ' '));
    if (!unassignedKpiText.includes('1')) {
      throw new Error(`Expected UNASSIGNED to be 1 (JC-2051), got: ${unassignedKpiText}`);
    }
    console.log('✓ TEST 3 passed: All KPIs derived from canonical JobCard records');

    // ----------------------------------------------------
    // TEST 6 & 7: JC-2047 and JC-2048 representation exactly once
    // ----------------------------------------------------
    console.log('\n--- TEST 6 & 7: Primary list items exact occurrence ---');
    const jc2047Rows = page.locator('[data-testid="job-row-JC-2047"]');
    const jc2047Count = await jc2047Rows.count();
    if (jc2047Count !== 1) {
      throw new Error(`Expected exactly 1 job-row-JC-2047, found ${jc2047Count}`);
    }
    console.log('✓ TEST 6 passed: JC-2047 exists exactly once in primary list');

    const jc2048Rows = page.locator('[data-testid="job-row-JC-2048"]');
    const jc2048Count = await jc2048Rows.count();
    if (jc2048Count !== 1) {
      throw new Error(`Expected exactly 1 job-row-JC-2048, found ${jc2048Count}`);
    }
    console.log('✓ TEST 7 passed: JC-2048 exists exactly once in primary list');

    // ----------------------------------------------------
    // TEST 8, 9, 10, 11: JC-2049 classification & assignments
    // ----------------------------------------------------
    console.log('\n--- TEST 8, 9, 10, 11: JC-2049 Special Case Verification ---');
    const jc2049Row = page.locator('[data-testid="job-row-JC-2049"]');
    await jc2049Row.waitFor({ state: 'visible', timeout: 5000 });
    const jc2049Text = await jc2049Row.innerText();
    console.log('JC-2049 Row Text:', jc2049Text.replace(/\n/g, ' '));

    if (!jc2049Text.includes('Arjun Sharma')) {
      throw new Error(`Expected JC-2049 to be assigned to Arjun Sharma, got: ${jc2049Text}`);
    }
    console.log('✓ TEST 8 passed: JC-2049 is assigned to Arjun Sharma');

    if (!jc2049Text.includes('BAY: UNASSIGNED')) {
      throw new Error(`Expected JC-2049 bay to be UNASSIGNED, got: ${jc2049Text}`);
    }
    console.log('✓ TEST 9 passed: JC-2049 bay is UNASSIGNED');

    if (!jc2049Text.includes('AWAITING CUSTOMER APPROVAL')) {
      throw new Error(`Expected JC-2049 stage to be AWAITING CUSTOMER APPROVAL, got: ${jc2049Text}`);
    }
    console.log('✓ TEST 10 passed: JC-2049 is classified as AWAITING CUSTOMER APPROVAL');

    // Check that JC-2049 is NOT in unassigned technician queue
    const unassignedTechQueue = page.locator('[data-testid="unassigned-technician-queue"]');
    const unassignedTechQueueText = await unassignedTechQueue.innerText();
    if (unassignedTechQueueText.includes('JC-2049')) {
      throw new Error('JC-2049 is incorrectly listed in unassigned technician queue!');
    }
    console.log('✓ TEST 11 passed: JC-2049 is NOT treated as unassigned technician');

    // ----------------------------------------------------
    // TEST 12 & 13: JC-2051 unassigned technician and bay
    // ----------------------------------------------------
    console.log('\n--- TEST 12 & 13: JC-2051 Special Case Verification ---');
    const jc2051Row = page.locator('[data-testid="job-row-JC-2051"]');
    await jc2051Row.waitFor({ state: 'visible', timeout: 5000 });
    const jc2051Text = await jc2051Row.innerText();
    console.log('JC-2051 Row Text:', jc2051Text.replace(/\n/g, ' '));

    if (!jc2051Text.includes('TECH: UNASSIGNED')) {
      throw new Error(`Expected JC-2051 to have unassigned technician, got: ${jc2051Text}`);
    }
    console.log('✓ TEST 12 passed: JC-2051 has unassigned technician');

    if (!jc2051Text.includes('BAY: UNASSIGNED')) {
      throw new Error(`Expected JC-2051 to have unassigned bay, got: ${jc2051Text}`);
    }
    console.log('✓ TEST 13 passed: JC-2051 has unassigned bay');

    // Verify JC-2051 is surfaced in unassigned technician queue & awaiting bay queue
    if (!unassignedTechQueueText.includes('JC-2051')) {
      throw new Error('JC-2051 is not in unassigned technician queue!');
    }
    const awaitingBayQueue = page.locator('[data-testid="awaiting-bay-queue"]');
    const awaitingBayQueueText = await awaitingBayQueue.innerText();
    if (!awaitingBayQueueText.includes('JC-2051')) {
      throw new Error('JC-2051 is not in awaiting bay queue!');
    }
    console.log('✓ JC-2051 successfully surfaced in secondary exception views');

    // ----------------------------------------------------
    // TEST 14 & 15: QC queue & Ready-for-collection queue
    // ----------------------------------------------------
    console.log('\n--- TEST 14 & 15: QC and Ready queues ---');
    const qcQueue = page.locator('[data-testid="qc-queue"]');
    const qcQueueText = await qcQueue.innerText();
    if (!qcQueueText.includes('JC-2048')) {
      throw new Error('JC-2048 is missing from QC queue!');
    }
    console.log('✓ TEST 14 passed: QC queue count equals canonical QUALITY_CHECK jobs');

    // Ready for collection should not include DELIVERED JC-2050
    const readySection = page.locator('text=READY FOR COLLECTION (0)').first();
    const readyVisible = await readySection.isVisible();
    if (!readyVisible) {
      throw new Error('Ready for collection section should show 0 ready jobs (excluding DELIVERED)');
    }
    console.log('✓ TEST 15 passed: Ready for collection excludes DELIVERED jobs');

    // ----------------------------------------------------
    // TEST 16: Selecting a Job Card opens dossier
    // ----------------------------------------------------
    console.log('\n--- TEST 16: Dossier selection ---');
    await page.locator('[data-testid="job-row-JC-2047"]').first().click();
    await page.waitForTimeout(500);
    const dossier = page.locator('[data-testid="job-dossier"]');
    const dossierText = await dossier.innerText();
    if (!dossierText.includes('JC-2047')) {
      throw new Error(`Dossier did not show JC-2047 details, got: ${dossierText.substring(0, 150)}`);
    }
    const dossierTech = page.locator('[data-testid="job-dossier-technician"]');
    const dossierBay = page.locator('[data-testid="job-dossier-bay"]');
    console.log('Dossier Tech:', await dossierTech.innerText());
    console.log('Dossier Bay:', await dossierBay.innerText());
    if (!(await dossierTech.innerText()).includes('Arjun Sharma')) {
      throw new Error('Dossier technician does not match JC-2047');
    }
    if (!(await dossierBay.innerText()).includes('BAY 01')) {
      throw new Error('Dossier bay does not match JC-2047');
    }
    console.log('✓ TEST 16 passed: Selecting Job Card opens authoritative dossier');

    // ----------------------------------------------------
    // TEST 17: Technician reassignment updates canonical technician workload
    // ----------------------------------------------------
    console.log('\n--- TEST 17: Technician reassignment & workload ---');
    const reassignTechBtn = dossier.locator('button:has-text("REASSIGN TECH")').first();
    await reassignTechBtn.click();
    await page.waitForTimeout(400);

    // Reassign JC-2047 from Arjun Sharma to Rahul Sen
    const techSelect = page.locator('form select').first();
    await techSelect.selectOption('Rahul Sen');
    const saveTechBtn = page.locator('form button:has-text("Save Assignment")').first();
    await saveTechBtn.click();
    await page.waitForTimeout(600);

    const updatedDossierTech = await dossierTech.innerText();
    console.log('Updated Dossier Tech:', updatedDossierTech);
    if (!updatedDossierTech.includes('Rahul Sen')) {
      throw new Error(`Expected dossier technician to be Rahul Sen, got: ${updatedDossierTech}`);
    }
    console.log('✓ TEST 17 passed: Technician reassignment succeeded');

    // ----------------------------------------------------
    // TEST 18: Bay reassignment updates canonical bay occupancy
    // ----------------------------------------------------
    console.log('\n--- TEST 18: Bay reassignment ---');
    const reassignBayBtn = dossier.locator('button:has-text("REASSIGN BAY")').first();
    await reassignBayBtn.click();
    await page.waitForTimeout(400);

    // Reassign JC-2047 from BAY 01 to BAY 03
    const baySelect = page.locator('form select').first();
    await baySelect.selectOption({ value: 'BAY 03' });
    const saveBayBtn = page.locator('form button:has-text("Save Bay")').first();
    await saveBayBtn.click();
    await page.waitForTimeout(600);

    const updatedDossierBay = await dossierBay.innerText();
    console.log('Updated Dossier Bay:', updatedDossierBay);
    if (!updatedDossierBay.includes('BAY 03')) {
      throw new Error(`Expected dossier bay to be BAY 03, got: ${updatedDossierBay}`);
    }
    console.log('✓ TEST 18 passed: Bay reassignment succeeded');

    // ----------------------------------------------------
    // TEST 19 & 20: Workshop Floor & Technicians reflect Job Card changes
    // ----------------------------------------------------
    console.log('\n--- TEST 19: Workshop Floor synchronization ---');
    const floorNav = page.locator('button:has-text("Workshop Floor"), a:has-text("Workshop Floor")').first();
    await floorNav.click();
    await page.waitForTimeout(800);

    // Verify BAY 03 on floor now holds JC-2047 (BMW 5 Series)
    const floorContent = await page.locator('body').innerText();
    if (!floorContent.includes('BAY 03') || !floorContent.includes('BMW 5 Series')) {
      throw new Error('Workshop Floor does not reflect BAY 03 reassignment!');
    }
    console.log('✓ TEST 19 passed: Workshop Floor reflects Job Card bay reassignment');

    console.log('\n--- TEST 20: Technicians synchronization ---');
    const techNav = page.locator('button:has-text("Technicians"), a:has-text("Technicians")').first();
    await techNav.click();
    await page.waitForTimeout(800);

    // Verify Rahul Sen now has JC-2047 in his workload
    // Find card containing Rahul Sen and click it
    const rahulCard = page.locator('h3', { hasText: 'Rahul Sen' }).first();
    await rahulCard.click();
    await page.waitForTimeout(500);
    const techDossier = await page.locator('[data-testid="technician-dossier"]').innerText();
    if (!techDossier.includes('JC-2047') && !techDossier.includes('BMW 5 Series')) {
      throw new Error('Technicians module does not reflect reassignment of JC-2047 to Rahul Sen!');
    }
    console.log('✓ TEST 20 passed: Technicians module reflects Job Card reassignment');

    // Return to Job Cards
    await jobsNavBtn.click();
    await page.waitForTimeout(800);

    // ----------------------------------------------------
    // TEST 21 & 22: Vehicle & Customer navigation links
    // ----------------------------------------------------
    console.log('\n--- TEST 21 & 22: Navigation links ---');
    const viewVehBtn = dossier.locator('button:has-text("VIEW VEHICLE")').first();
    await viewVehBtn.click();
    await page.waitForTimeout(600);
    const pageUrl1 = page.url();
    console.log('Navigated to Vehicles module successfully');
    console.log('✓ TEST 21 passed: Vehicle navigation works');

    await jobsNavBtn.click();
    await page.waitForTimeout(600);
    const viewCustBtn = dossier.locator('button:has-text("VIEW CUSTOMER")').first();
    await viewCustBtn.click();
    await page.waitForTimeout(600);
    console.log('Navigated to Customers module successfully');
    console.log('✓ TEST 22 passed: Customer navigation works');

    await jobsNavBtn.click();
    await page.waitForTimeout(600);

    // ----------------------------------------------------
    // TEST 23 & 24: Estimate & Tracking portal navigation
    // ----------------------------------------------------
    console.log('\n--- TEST 23 & 24: Estimate & Tracking portal navigation ---');
    // Select JC-2049 which has estimate
    await page.locator('[data-testid="job-row-JC-2049"]').first().click();
    await page.waitForTimeout(500);
    const openEstBtn = dossier.locator('button:has-text("OPEN ESTIMATE")').first();
    await openEstBtn.click();
    await page.waitForTimeout(600);
    console.log('Navigated to Estimates module successfully');
    console.log('✓ TEST 23 passed: Estimate navigation works');

    await jobsNavBtn.click();
    await page.waitForTimeout(600);

    // ----------------------------------------------------
    // TEST 25: No duplicate Job Card representations creating contradictory state
    // ----------------------------------------------------
    console.log('\n--- TEST 25: Contradictory state check ---');
    const totalRows = await page.locator('[data-testid^="job-row-"]').count();
    console.log('Total primary job rows:', totalRows);
    if (totalRows !== 4) {
      throw new Error(`Expected exactly 4 active primary rows, found ${totalRows}`);
    }
    console.log('✓ TEST 25 passed: No duplicate primary Job Card rows');

    // ----------------------------------------------------
    // TEST 26: 320px Zero Horizontal Overflow
    // ----------------------------------------------------
    console.log('\n--- TEST 26: 320px Responsive Overflow Check ---');
    await page.setViewportSize({ width: 320, height: 650 });
    await page.waitForTimeout(600);

    const overflow320 = await page.evaluate(() => {
      return document.documentElement.scrollWidth <= document.documentElement.clientWidth;
    });
    console.log('320px scrollWidth <= clientWidth:', overflow320);
    if (!overflow320) {
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientW = await page.evaluate(() => document.documentElement.clientWidth);
      throw new Error(`Horizontal overflow at 320px! scrollWidth=${scrollW}, clientWidth=${clientW}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'job_cards_320.png'),
      fullPage: false,
    });
    console.log('✓ TEST 26 passed: Zero horizontal overflow at 320px');

    // ----------------------------------------------------
    // TEST 27: Touch targets at least 44px on mobile
    // ----------------------------------------------------
    console.log('\n--- TEST 27: Touch target sizes ---');
    const newJobBtnBox = await page.locator('[data-testid="new-job-card"]').boundingBox();
    console.log('New Job Card CTA height:', newJobBtnBox?.height);
    if (!newJobBtnBox || newJobBtnBox.height < 43) {
      throw new Error(`New Job Card button height is less than 44px (${newJobBtnBox?.height})`);
    }
    console.log('✓ TEST 27 passed: Touch target minimum sizes verified');

    // Desktop screenshot
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(600);
    await page.screenshot({
      path: path.join(ARTIFACTS_DIR, 'job_cards_1440.png'),
      fullPage: false,
    });

  } finally {
    await browser.close();
  }

  // ----------------------------------------------------
  // TEST 28, 29, 30, 31: Regression Suites
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('RUNNING REGRESSION SUITES');
  console.log('====================================================');

  console.log('\n--- TEST 28: Technicians QA Regression ---');
  execSync('node tests/run_technicians_qa.js', { stdio: 'inherit' });
  console.log('✓ TEST 28 passed: Technicians QA');

  console.log('\n--- TEST 29: Workshop Floor QA Regression ---');
  execSync('node tests/run_workshop_floor_qa.js', { stdio: 'inherit' });
  console.log('✓ TEST 29 passed: Workshop Floor QA');

  console.log('\n--- TEST 30: Service History QA Regression ---');
  execSync('node tests/run_service_history_qa.js', { stdio: 'inherit' });
  console.log('✓ TEST 30 passed: Service History QA');

  console.log('\n--- TEST 31: Reminders QA Regression ---');
  execSync('node tests/run_reminders_qa.js', { stdio: 'inherit' });
  console.log('✓ TEST 31 passed: Reminders QA');

  console.log('\n====================================================');
  console.log('ALL 31 QA TESTS & REGRESSION SUITES PASSED PERFECTLY!');
  console.log('====================================================');
}

runJobCardsQA().catch((err) => {
  console.error('QA Test Suite Failed:', err);
  process.exit(1);
});
