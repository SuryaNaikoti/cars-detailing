import { chromium } from 'playwright';
import fs from 'fs';

async function runLeadsQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('===========================================================');
  console.log('STARTING LEADS & ENQUIRIES V4.0 QA VALIDATION');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: Page Loads Correctly & Navigation
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Page loads correctly & Navigation ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const leadsNavBtn = page.locator('button:has-text("Leads"), a:has-text("Leads")').first();
    await leadsNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await leadsNavBtn.click();
    await page.waitForTimeout(1000);

    const leadsPage = page.locator('#leads-page');
    if (!(await leadsPage.isVisible())) {
      throw new Error('#leads-page container not visible');
    }
    console.log('✓ TEST 1 passed: Dashboard navigated to #leads-page');

    // ----------------------------------------------------
    // TEST 2: Header & Eyebrow Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Heading & Eyebrow verification ---');
    const heading = await page.locator('h1').innerText();
    console.log('Heading found:', heading);
    if (!heading.toUpperCase().includes('LEADS')) {
      throw new Error(`Expected heading with LEADS, got: "${heading}"`);
    }
    console.log('✓ TEST 2 passed: Heading verified');

    // ----------------------------------------------------
    // TEST 3: Canonical KPI Strip Derivation
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Canonical KPI Strip Verification ---');
    const kpiNew = page.locator('#leads-kpi-new');
    const kpiFollowup = page.locator('#leads-kpi-followup');
    const kpiHighPriority = page.locator('#leads-kpi-high-priority');
    const kpiApptReq = page.locator('#leads-kpi-appointment-requested');
    const kpiConverted = page.locator('#leads-kpi-converted');
    const kpiLost = page.locator('#leads-kpi-lost');

    if (!(await kpiNew.isVisible())) throw new Error('#leads-kpi-new missing');
    if (!(await kpiFollowup.isVisible())) throw new Error('#leads-kpi-followup missing');
    if (!(await kpiHighPriority.isVisible())) throw new Error('#leads-kpi-high-priority missing');
    if (!(await kpiApptReq.isVisible())) throw new Error('#leads-kpi-appointment-requested missing');
    if (!(await kpiConverted.isVisible())) throw new Error('#leads-kpi-converted missing');
    if (!(await kpiLost.isVisible())) throw new Error('#leads-kpi-lost missing');

    const newCount = await kpiNew.innerText();
    console.log('NEW KPI Text:', newCount.replace(/\n/g, ' '));
    console.log('✓ TEST 3 passed: All 6 KPI metrics render');

    // ----------------------------------------------------
    // TEST 4: Master Queue & Seed Leads Render
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Master Queue & Seed Leads Render ---');
    const lead101 = page.locator('[data-testid="lead-card-lead-101"]:visible');
    const lead102 = page.locator('[data-testid="lead-card-lead-102"]:visible');
    const lead103 = page.locator('[data-testid="lead-card-lead-103"]:visible');

    if (!(await lead101.isVisible())) throw new Error('lead-101 card missing');
    if (!(await lead102.isVisible())) throw new Error('lead-102 card missing');
    if (!(await lead103.isVisible())) throw new Error('lead-103 card missing');
    console.log('✓ TEST 4 passed: Seed leads 101, 102, 103 render in queue');

    // ----------------------------------------------------
    // TEST 5: Selection & Dossier Display
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Selection & Dossier Display ---');
    await lead101.click();
    await page.waitForTimeout(300);

    const dossier = page.locator('#lead-dossier');
    if (!(await dossier.isVisible())) throw new Error('lead-dossier not visible');
    const dossierText = await dossier.innerText();
    if (!dossierText.includes('Devendra Patel') || !dossierText.includes('lead-101')) {
      throw new Error(`Dossier does not show lead-101 details: ${dossierText}`);
    }
    console.log('✓ TEST 5 passed: Lead dossier displays selected lead details');

    // ----------------------------------------------------
    // TEST 6: Dynamic Primary Action Button
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Dynamic Primary Action Button ---');
    const primaryBtn = page.locator('#lead-primary-action');
    if (!(await primaryBtn.isVisible())) throw new Error('#lead-primary-action missing');
    const primaryBtnText = await primaryBtn.innerText();
    console.log('Primary Action on lead-101 (NEW):', primaryBtnText);
    if (!primaryBtnText.includes('CONTACT CUSTOMER')) {
      throw new Error(`Expected CONTACT CUSTOMER, got: ${primaryBtnText}`);
    }
    console.log('✓ TEST 6 passed: Contextual primary action verified');

    // ----------------------------------------------------
    // TEST 7: Status Transition to QUALIFIED & Primary Action Update
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Status Transition to QUALIFIED ---');
    const statusSelect = page.locator('#lead-status-select');
    await statusSelect.selectOption('QUALIFIED');
    await page.waitForTimeout(400);

    const updatedPrimaryText = await primaryBtn.innerText();
    console.log('Primary Action after QUALIFIED:', updatedPrimaryText);
    if (!updatedPrimaryText.includes('CREATE APPOINTMENT')) {
      throw new Error(`Expected CREATE APPOINTMENT, got: ${updatedPrimaryText}`);
    }
    console.log('✓ TEST 7 passed: Status transition updates primary action to CREATE APPOINTMENT');

    // ----------------------------------------------------
    // TEST 8: Timeline Audit Logging
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Timeline Audit Logging ---');
    const timeline = page.locator('#lead-activity-timeline');
    const timelineText = await timeline.innerText();
    console.log('Timeline snippet:', timelineText.replace(/\n/g, ' '));
    if (!timelineText.includes('QUALIFIED')) {
      throw new Error(`Timeline missing QUALIFIED status transition: ${timelineText}`);
    }
    console.log('✓ TEST 8 passed: Audit timeline logged QUALIFIED status update');

    // ----------------------------------------------------
    // TEST 9: Mark Lost with Structured Reason
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Mark Lost with Structured Reason ---');
    await statusSelect.selectOption('LOST');
    await page.waitForTimeout(400);

    const lostModal = page.locator('text=RECORD LOST OPPORTUNITY');
    if (!(await lostModal.isVisible())) throw new Error('Lost opportunity modal did not open');

    const lostReasonSelect = page.locator('select:has-text("Customer Declined")');
    await lostReasonSelect.selectOption('PRICE');

    const confirmLostBtn = page.locator('button:has-text("Mark as Lost")');
    await confirmLostBtn.click();
    await page.waitForTimeout(500);

    const lostDossierText = await dossier.innerText();
    if (!lostDossierText.includes('PRICE')) {
      throw new Error(`Dossier did not record PRICE as lost reason: ${lostDossierText}`);
    }
    console.log('✓ TEST 9 passed: Structured lost reason PRICE recorded in dossier');

    // ----------------------------------------------------
    // TEST 10: Create New Lead Flow
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Create New Lead Flow ---');
    const newLeadBtn = page.locator('#btn-new-lead');
    await newLeadBtn.click();
    await page.waitForTimeout(400);

    await page.fill('input[placeholder="e.g. Vikramaditya Rao"]', 'Karan Johar');
    await page.fill('input[placeholder="+91 98XXX XXXXX"]', '+91 99220 11000');
    await page.fill('input[placeholder="e.g. 2023 Porsche Macan GTS"]', 'Audi Q8');
    await page.fill('input[placeholder="e.g. MH 02 ER 4500"]', 'MH 01 BZ 9999');
    await page.fill('textarea[placeholder="Record customer\'s stated symptoms or requested scope..."]', 'Suspension clunk over bumps.');

    const submitLeadBtn = page.locator('button:has-text("Create Lead")');
    await submitLeadBtn.click();
    await page.waitForTimeout(600);

    const queueText = await page.locator('#leads-queue').innerText();
    if (!queueText.includes('Karan Johar') || !queueText.includes('MH 01 BZ 9999')) {
      throw new Error(`New lead not found in queue: ${queueText}`);
    }
    console.log('✓ TEST 10 passed: New lead created with canonical vehicle details');

    // ----------------------------------------------------
    // TEST 11: Convert Lead to Appointment & Cross-Module Transfer
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Convert Lead to Appointment ---');
    const lead102Card = page.locator('[data-testid="lead-card-lead-102"]:visible');
    await lead102Card.click();
    await page.waitForTimeout(300);

    // Open Convert / Schedule Appointment
    const scheduleBtn = page.locator('#lead-primary-action');
    await scheduleBtn.click();
    await page.waitForTimeout(400);

    const apptModal = page.locator('text=SCHEDULE WORKSHOP APPOINTMENT');
    if (!(await apptModal.isVisible())) {
      throw new Error('Schedule workshop appointment modal did not open');
    }

    const confirmApptBtn = page.locator('button:has-text("Confirm Appointment")');
    await confirmApptBtn.click();
    await page.waitForTimeout(800);

    // Verify it navigated to Appointments module
    const apptsPage = page.locator('#appointments-page');
    if (!(await apptsPage.isVisible())) {
      throw new Error('Did not navigate to appointments module upon conversion');
    }
    console.log('✓ TEST 11 passed: Converted lead transitioned seamlessly to Appointments module');

    console.log('\n===========================================================');
    console.log('ALL 11 LEADS & ENQUIRIES V4.0 QA TESTS PASSED SUCCESSFULLY');
    console.log('===========================================================');
  } catch (err) {
    console.error('QA Test Failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

runLeadsQA();
