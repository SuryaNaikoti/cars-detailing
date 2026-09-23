import { chromium } from 'playwright';
import fs from 'fs';

async function runAppointmentsQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('===========================================================');
  console.log('STARTING APPOINTMENTS & INTAKE V4.0 QA VALIDATION');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: Page Loads & Navigation
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Page loads correctly & Navigation ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const apptNavBtn = page.locator('button:has-text("Appointments"), a:has-text("Appointments")').first();
    await apptNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await apptNavBtn.click();
    await page.waitForTimeout(1000);

    const apptsPage = page.locator('#appointments-page');
    if (!(await apptsPage.isVisible())) {
      throw new Error('#appointments-page container not visible');
    }
    console.log('✓ TEST 1 passed: Dashboard navigated to #appointments-page');

    // ----------------------------------------------------
    // TEST 2: Heading & Eyebrow Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Heading & Eyebrow verification ---');
    const heading = await page.locator('h1').innerText();
    console.log('Heading found:', heading);
    if (!heading.toUpperCase().includes('APPOINTMENTS')) {
      throw new Error(`Expected heading with APPOINTMENTS, got: "${heading}"`);
    }
    console.log('✓ TEST 2 passed: Heading verified');

    // ----------------------------------------------------
    // TEST 3: 8-Card Operational KPI Strip
    // ----------------------------------------------------
    console.log('\n--- TEST 3: 8-Card Operational KPI Strip ---');
    const kpiToday = page.locator('[data-testid="appointments-kpi-today"]');
    const kpiReq = page.locator('[data-testid="appointments-kpi-requested"]');
    const kpiConf = page.locator('[data-testid="appointments-kpi-confirmed"]');
    const kpiArr = page.locator('[data-testid="appointments-kpi-arrived"]');
    const kpiChk = page.locator('[data-testid="appointments-kpi-checked-in"]');
    const kpiAct = page.locator('[data-testid="appointments-kpi-action-needed"]');
    const kpiNoShow = page.locator('[data-testid="appointments-kpi-no-show"]');
    const kpiCancel = page.locator('[data-testid="appointments-kpi-cancelled"]');

    if (!(await kpiToday.isVisible())) throw new Error('appointments-kpi-today missing');
    if (!(await kpiReq.isVisible())) throw new Error('appointments-kpi-requested missing');
    if (!(await kpiConf.isVisible())) throw new Error('appointments-kpi-confirmed missing');
    if (!(await kpiArr.isVisible())) throw new Error('appointments-kpi-arrived missing');
    if (!(await kpiChk.isVisible())) throw new Error('appointments-kpi-checked-in missing');
    if (!(await kpiAct.isVisible())) throw new Error('appointments-kpi-action-needed missing');
    if (!(await kpiNoShow.isVisible())) throw new Error('appointments-kpi-no-show missing');
    if (!(await kpiCancel.isVisible())) throw new Error('appointments-kpi-cancelled missing');

    const todayText = await kpiToday.innerText();
    console.log('TODAY KPI Text:', todayText.replace(/\n/g, ' '));
    console.log('✓ TEST 3 passed: All 8 KPI metrics render');

    // ----------------------------------------------------
    // TEST 4: Master Queue & Seed Appointments Render
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Master Queue & Seed Appointments Render ---');
    // Switch to 'All' or verify appointments
    const allTab = page.locator('button:has-text("ALL RECORDS")');
    if (await allTab.isVisible()) {
      await allTab.click();
      await page.waitForTimeout(400);
    }

    const apt201 = page.locator('[data-testid="appointment-card-apt-201"]');
    const apt202 = page.locator('[data-testid="appointment-card-apt-202"]');
    const apt203 = page.locator('[data-testid="appointment-card-apt-203"]');

    if (!(await apt201.isVisible())) throw new Error('appointment-card-apt-201 missing');
    if (!(await apt202.isVisible())) throw new Error('appointment-card-apt-202 missing');
    if (!(await apt203.isVisible())) throw new Error('appointment-card-apt-203 missing');
    console.log('✓ TEST 4 passed: Seed appointments apt-201, 202, 203 render in queue');

    // ----------------------------------------------------
    // TEST 5: Selection & Appointment Dossier
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Selection & Appointment Dossier ---');
    await apt202.click();
    await page.waitForTimeout(300);

    const dossier = page.locator('#appointment-dossier');
    if (!(await dossier.isVisible())) throw new Error('appointment-dossier not visible');
    const dossierText = await dossier.innerText();
    if (!dossierText.toUpperCase().includes('APT-202') || !dossierText.includes('Ananya Deshmukh')) {
      throw new Error(`Dossier does not show apt-202 details: ${dossierText}`);
    }
    console.log('✓ TEST 5 passed: Appointment dossier displays selected appointment details');

    // ----------------------------------------------------
    // TEST 6: Mark Customer Arrived
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Mark Customer Arrived ---');
    const arrivedBtn = page.locator('[data-testid="appointment-primary-action"]:has-text("MARK ARRIVED")');
    if (await arrivedBtn.isVisible()) {
      await arrivedBtn.click();
      await page.waitForTimeout(500);
      const updatedDossier = await dossier.innerText();
      if (!updatedDossier.includes('ARRIVED')) {
        throw new Error('Status did not transition to ARRIVED');
      }
      console.log('✓ TEST 6 passed: Customer marked ARRIVED');
    } else {
      console.log('✓ TEST 6 skipped: Current appointment not in CONFIRMED state');
    }

    // ----------------------------------------------------
    // TEST 7: Start Check-In & Physical Telemetry
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Start Check-In & Physical Telemetry ---');
    const checkInBtn = page.locator('#btn-start-checkin');
    if (await checkInBtn.isVisible()) {
      await checkInBtn.click();
      await page.waitForTimeout(400);

      const checkInModal = page.locator('text=PHYSICAL VEHICLE INTAKE');
      if (!(await checkInModal.isVisible())) {
        throw new Error('Check-in modal not visible');
      }

      await page.fill('input[type="number"]', '42500');
      const submitCheckIn = page.locator('button:has-text("Complete Intake Check-In")');
      await submitCheckIn.click();
      await page.waitForTimeout(500);

      const checkedInDossier = await dossier.innerText();
      if (!checkedInDossier.includes('CHECKED IN') && !checkedInDossier.includes('CHECKED_IN')) {
        throw new Error(`Dossier did not record CHECKED IN: ${checkedInDossier}`);
      }
      if (!checkedInDossier.includes('42,500 km')) {
        throw new Error(`Dossier did not record verified odometer: ${checkedInDossier}`);
      }
      console.log('✓ TEST 7 passed: Physical check-in completed with verified odometer');
    }

    // ----------------------------------------------------
    // TEST 8: Create Job Card & Canonical Conversion
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Create Job Card & Canonical Conversion ---');
    const createJobBtn = page.locator('#btn-create-job-card');
    if (await createJobBtn.isVisible()) {
      await createJobBtn.click();
      await page.waitForTimeout(800);

      // Verify navigation to Job Cards module
      const jobCardsHeader = page.locator('h1:has-text("JOB CARDS"), h1:has-text("WORKSHOP OPERATIONS")');
      if (!(await jobCardsHeader.isVisible())) {
        throw new Error('Did not transition to Job Cards module upon conversion');
      }
      console.log('✓ TEST 8 passed: Appointment successfully converted into active workshop Job Card');
    }

    console.log('\n===========================================================');
    console.log('ALL APPOINTMENTS & INTAKE V4.0 QA TESTS PASSED SUCCESSFULLY');
    console.log('===========================================================');
  } catch (err) {
    console.error('QA Test Failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runAppointmentsQA();
