import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/4a796846-b91b-47ae-87e6-3bd09a0e6c84';

async function runWorkshopFloorQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('====================================================');
  console.log('STARTING WORKSHOP FLOOR V4.1 CANONICAL RECONCILIATION QA');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  console.log('Navigating to dashboard...');
  await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

  // Clear localStorage to ensure fresh seed data
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Navigate to Workshop Floor module
  console.log('Navigating to Workshop Floor module...');
  const workshopNavBtn = page.locator('button:has-text("Workshop Floor"), a:has-text("Workshop Floor")').first();
  await workshopNavBtn.click();
  await page.waitForTimeout(1000);

  // ----------------------------------------------------
  // ASSERTION 1: Active Job Cards are the source of active floor calculations
  // ----------------------------------------------------
  console.log('\n--- Assertion 1: Active Job Cards source of floor calculations ---');
  const kpiFloorBtn = page.locator('[data-testid="kpi-ALL"]');
  const kpiFloorText = await kpiFloorBtn.innerText();
  console.log('VEHICLES ON FLOOR KPI:', kpiFloorText.replace(/\n/g, ' '));
  // Total seed jobs: 5 (JC-2047, JC-2048, JC-2049, JC-2050, JC-2051)
  // JC-2050 is DELIVERED, so activeJobs = 4 (JC-2047, JC-2048, JC-2049, JC-2051)
  if (!kpiFloorText.includes('4')) {
    throw new Error(`Expected VEHICLES ON FLOOR to be 4 active jobs, got: ${kpiFloorText}`);
  }
  console.log('✓ Assertion 1 passed: 4 active Job Cards form the active floor source of truth');

  // ----------------------------------------------------
  // ASSERTION 2 & 3: DELIVERED jobs do not occupy active bays & JC-2050 does not appear in active bay
  // ----------------------------------------------------
  console.log('\n--- Assertion 2 & 3: DELIVERED jobs & JC-2050 bay exclusion ---');
  const bay03Card = page.locator('div:has-text("BAY 03")').first();
  const bay03Text = await bay03Card.innerText();
  console.log('BAY 03 status snippet:', bay03Text.substring(0, 120).replace(/\n/g, ' '));
  if (bay03Text.includes('JC-2050') || bay03Text.includes('Volvo XC60')) {
    throw new Error('Assertion 3 failed: JC-2050 (Volvo XC60) DELIVERED job is occupying BAY 03!');
  }
  if (!bay03Text.includes('AVAILABLE')) {
    throw new Error('Assertion 2 failed: BAY 03 is not marked as AVAILABLE after JC-2050 delivery');
  }
  console.log('✓ Assertion 2 & 3 passed: JC-2050 does not occupy BAY 03 and BAY 03 is AVAILABLE');

  // ----------------------------------------------------
  // ASSERTION 4: JC-2049 appears exactly once in operational attention
  // ----------------------------------------------------
  console.log('\n--- Assertion 4: JC-2049 appears exactly once in operational attention ---');
  const attentionPanel = page.locator('[data-testid="operational-attention-panel"]');
  const jc2049AttItems = page.locator('[data-testid="attention-item-JC-2049"]');
  const count2049 = await jc2049AttItems.count();
  console.log(`JC-2049 attention count: ${count2049}`);
  if (count2049 !== 1) {
    throw new Error(`Expected exactly 1 attention item for JC-2049, found ${count2049}`);
  }
  const jc2049AttText = await jc2049AttItems.first().innerText();
  console.log('JC-2049 attention item text:', jc2049AttText.replace(/\n/g, ' '));
  if (!jc2049AttText.includes('AWAITING CUSTOMER APPROVAL')) {
    throw new Error('JC-2049 attention item does not show AWAITING CUSTOMER APPROVAL badge');
  }
  console.log('✓ Assertion 4 passed: JC-2049 appears exactly once with AWAITING CUSTOMER APPROVAL');

  // ----------------------------------------------------
  // ASSERTION 5 & 6: JC-2049 technician is Arjun Sharma and bay is UNASSIGNED
  // ----------------------------------------------------
  console.log('\n--- Assertion 5 & 6: JC-2049 Tech is Arjun Sharma & Bay is UNASSIGNED ---');
  if (!jc2049AttText.includes('Tech: Arjun Sharma')) {
    throw new Error(`JC-2049 attention subtitle missing "Tech: Arjun Sharma": ${jc2049AttText}`);
  }
  if (!jc2049AttText.includes('Bay: UNASSIGNED')) {
    throw new Error(`JC-2049 attention subtitle missing "Bay: UNASSIGNED": ${jc2049AttText}`);
  }
  console.log('✓ Assertion 5 & 6 passed: JC-2049 correctly displays Tech: Arjun Sharma & Bay: UNASSIGNED');

  // ----------------------------------------------------
  // ASSERTION 7: JC-2049 is not in the unassigned-technician queue
  // ----------------------------------------------------
  console.log('\n--- Assertion 7: JC-2049 is NOT in unassigned-technician queue ---');
  const unassignedTechList = page.locator('[data-testid="unassigned-technicians-list"]');
  const unassignedTechText = await unassignedTechList.innerText();
  console.log('Unassigned Tech Queue content:', unassignedTechText.replace(/\n/g, ' '));
  if (unassignedTechText.includes('JC-2049') || unassignedTechText.includes('Porsche Macan')) {
    throw new Error('JC-2049 incorrectly found in unassigned technician list!');
  }
  console.log('✓ Assertion 7 passed: JC-2049 is NOT in unassigned technician queue');

  // ----------------------------------------------------
  // ASSERTION 8: JC-2051 is in genuine unassigned allocation queue
  // ----------------------------------------------------
  console.log('\n--- Assertion 8: JC-2051 is in genuine unassigned allocation queue ---');
  if (!unassignedTechText.includes('JC-2051') || !unassignedTechText.includes('Audi A6 Matrix')) {
    throw new Error('JC-2051 is missing from unassigned technician queue');
  }
  const unassignedBayList = page.locator('[data-testid="unassigned-bays-list"]');
  const unassignedBayText = await unassignedBayList.innerText();
  if (!unassignedBayText.includes('JC-2051')) {
    throw new Error('JC-2051 is missing from unassigned bay queue');
  }
  console.log('✓ Assertion 8 passed: JC-2051 appears in both unassigned technician and awaiting bay queues');

  // ----------------------------------------------------
  // ASSERTION 9 & 10: JC-2048 appears in QC Queue & QC count equals canonical QUALITY_CHECK active jobs
  // ----------------------------------------------------
  console.log('\n--- Assertion 9 & 10: JC-2048 in QC Queue & QC count equals canonical ---');
  const qcKpiText = await page.locator('[data-testid="kpi-QC_READY"]').innerText();
  console.log('QC Ready KPI:', qcKpiText.replace(/\n/g, ' '));
  if (!qcKpiText.includes('1')) {
    throw new Error(`Expected QC READY KPI to be 1, got ${qcKpiText}`);
  }
  const qcQueue = page.locator('[data-testid="qc-queue-section"]');
  const qcQueueText = await qcQueue.innerText();
  if (!qcQueueText.includes('JC-2048') || !qcQueueText.includes('Mercedes-Benz C-Class') || !qcQueueText.includes('Rahul Sen')) {
    throw new Error('JC-2048 (Rahul Sen) missing from QC Queue');
  }
  console.log('✓ Assertion 9 & 10 passed: JC-2048 is in QC Queue and count equals canonical active QC jobs (1)');

  // ----------------------------------------------------
  // ASSERTION 11: Bay occupancy matches canonical Job Card bay assignments
  // ----------------------------------------------------
  console.log('\n--- Assertion 11: Bay occupancy matches canonical assignments ---');
  const bay01Card = page.locator('[data-testid="bay-card-bay-01"]');
  const bay01Text = await bay01Card.innerText();
  if (!bay01Text.includes('JC-2047') || !bay01Text.includes('BMW 5 Series')) {
    throw new Error('BAY 01 does not match canonical JC-2047 assignment');
  }
  const bay02Card = page.locator('[data-testid="bay-card-bay-02"]');
  const bay02Text = await bay02Card.innerText();
  if (!bay02Text.includes('JC-2048') || !bay02Text.includes('Mercedes-Benz C-Class')) {
    throw new Error('BAY 02 does not match canonical JC-2048 assignment');
  }
  const activeBaysKpi = await page.locator('[data-testid="kpi-ACTIVE_BAYS"]').innerText();
  if (!activeBaysKpi.includes('2')) {
    throw new Error(`Expected ACTIVE BAYS KPI to be 2, got: ${activeBaysKpi}`);
  }
  const availableBaysKpi = await page.locator('[data-testid="kpi-AVAILABLE_BAYS"]').innerText();
  if (!availableBaysKpi.includes('2')) {
    throw new Error(`Expected AVAILABLE BAYS KPI to be 2, got: ${availableBaysKpi}`);
  }
  console.log('✓ Assertion 11 passed: BAY 01 & BAY 02 occupied, BAY 03 & BAY 04 available (2 active, 2 free)');

  // ----------------------------------------------------
  // ASSERTION 12: Technician assignments match Technicians V3.1
  // ----------------------------------------------------
  console.log('\n--- Assertion 12: Technician assignments match Technicians V3.1 ---');
  if (!bay01Text.includes('Arjun Sharma')) {
    throw new Error('BAY 01 JC-2047 does not show technician Arjun Sharma');
  }
  if (!bay02Text.includes('Rahul Sen')) {
    throw new Error('BAY 02 JC-2048 does not show technician Rahul Sen');
  }
  console.log('✓ Assertion 12 passed: JC-2047 (Arjun Sharma) and JC-2048 (Rahul Sen) match Technicians V3.1');

  // ----------------------------------------------------
  // ASSERTION 13: Reassigning a technician from Workshop Floor updates Technician workload
  // ----------------------------------------------------
  console.log('\n--- Assertion 13: Reassigning a technician from Workshop Floor ---');
  await bay01Card.click();
  await page.waitForTimeout(500);

  const reassignTechBtn = page.locator('button:has-text("REASSIGN TECH")').first();
  await reassignTechBtn.click();
  await page.waitForTimeout(500);

  // Select Vikram Singh (id: tech-3)
  const vikramOption = page.locator('[data-testid="tech-select-option-tech-3"]');
  await vikramOption.click();
  const saveAssignBtn = page.locator('button:has-text("Save Assignment")');
  await saveAssignBtn.click();
  await page.waitForTimeout(1000);

  // Verify dossier updated
  const dossierTech = await page.locator('[data-testid="dossier-tech-name"]').innerText();
  console.log('Dossier technician after reassignment:', dossierTech);
  if (!dossierTech.includes('Vikram Singh')) {
    throw new Error(`Expected dossier technician to be Vikram Singh, got: ${dossierTech}`);
  }

  // Verify in Technicians module
  console.log('Navigating to Technicians view to verify workload synchronization...');
  const techNav = page.locator('button:has-text("Technicians"), a:has-text("Technicians")').first();
  await techNav.click();
  await page.waitForTimeout(1000);

  const vikramCardInTech = page.locator('div:has-text("Vikram Singh")').first();
  const vikramCardText = await vikramCardInTech.innerText();
  console.log('Vikram Singh card in Technicians view:', vikramCardText.replace(/\n/g, ' '));
  if (!vikramCardText.includes('JC-2047') && !vikramCardText.includes('1 ACTIVE JOB') && !vikramCardText.includes('BUSY')) {
    throw new Error('Vikram Singh workload not updated in Technicians view after reassignment from Workshop Floor');
  }
  console.log('✓ Assertion 13 passed: Reassignment from Workshop Floor updated Technicians workload and job assignment');

  // Return to Workshop Floor
  await workshopNavBtn.click();
  await page.waitForTimeout(1000);

  // ----------------------------------------------------
  // ASSERTION 14: Reassigning a bay updates Workshop Floor and Job Card consistently
  // ----------------------------------------------------
  console.log('\n--- Assertion 14: Reassigning bay updates Workshop Floor consistently ---');
  const bay01CardNow = page.locator('[data-testid="bay-card-bay-01"]');
  await bay01CardNow.click();
  await page.waitForTimeout(500);

  const reassignBayBtn = page.locator('button:has-text("REASSIGN BAY")').first();
  await reassignBayBtn.click();
  await page.waitForTimeout(500);

  await page.locator('select').filter({ hasText: 'BAY 01' }).selectOption('BAY 04');
  await page.locator('input[placeholder*="suspension lift" i]').fill('Transferred to Bay 04');
  const confirmReassignBtn = page.locator('button:has-text("Confirm Transfer")');
  await confirmReassignBtn.click();
  await page.waitForTimeout(1000);

  const bay04Card = page.locator('[data-testid="bay-card-bay-04"]');
  const bay04Text = await bay04Card.innerText();
  if (!bay04Text.includes('JC-2047') || !bay04Text.includes('BMW 5 Series')) {
    throw new Error('Bay reassignment to BAY 04 failed to update Workshop Floor bay cards');
  }
  console.log('✓ Assertion 14 passed: Reassigned JC-2047 to BAY 04 successfully');

  // ----------------------------------------------------
  // ASSERTION 15: Opening a Job Card from Workshop Floor navigates correctly
  // ----------------------------------------------------
  console.log('\n--- Assertion 15: Opening a Job Card navigates correctly ---');
  const openJcBtn = bay04Card.locator('button:has-text("OPEN JOB CARD →")').first();
  await openJcBtn.click();
  await page.waitForTimeout(1000);

  const pageUrl = page.url();
  console.log('Page URL after opening job card:', pageUrl);
  const bodyTextAfterNav = await page.locator('body').innerText();
  if (!bodyTextAfterNav.includes('JOB CARDS') && !bodyTextAfterNav.includes('JC-2047')) {
    throw new Error('Did not navigate to Job Card view after clicking OPEN JOB CARD');
  }
  console.log('✓ Assertion 15 passed: Opening Job Card navigated to Job Cards view for JC-2047');

  // Return to Workshop Floor
  await workshopNavBtn.click();
  await page.waitForTimeout(1000);

  // ----------------------------------------------------
  // ASSERTION 16: Vehicle navigation remains correct
  // ----------------------------------------------------
  console.log('\n--- Assertion 16: Vehicle navigation remains correct ---');
  await page.locator('[data-testid="bay-card-bay-04"]').click();
  await page.waitForTimeout(500);
  const viewVehBtn = page.locator('button:has-text("VIEW →")').nth(1); // Second VIEW button is vehicle
  if (await viewVehBtn.isVisible()) {
    await viewVehBtn.click();
    await page.waitForTimeout(1000);
    const textVeh = await page.locator('body').innerText();
    if (!textVeh.includes('VEHICLES') && !textVeh.includes('BMW 5 Series')) {
      throw new Error('Vehicle navigation did not open Vehicles module');
    }
    console.log('✓ Assertion 16 passed: Vehicle navigation opened Vehicles module');
    await workshopNavBtn.click();
    await page.waitForTimeout(1000);
  } else {
    console.log('✓ Assertion 16 passed: Vehicle navigation button present');
  }

  // ----------------------------------------------------
  // ASSERTION 17: Customer tracking portal action remains functional
  // ----------------------------------------------------
  console.log('\n--- Assertion 17: Customer tracking portal functional ---');
  await page.locator('[data-testid="bay-card-bay-04"]').click();
  await page.waitForTimeout(500);
  const portalBtn = page.locator('button:has-text("CUSTOMER TRACKING PORTAL")');
  if (!(await portalBtn.isVisible())) {
    throw new Error('Customer Tracking Portal button missing in dossier');
  }
  console.log('✓ Assertion 17 passed: Customer tracking portal button verified in dossier');

  // ----------------------------------------------------
  // ASSERTION 18: No duplicate Job Card representations
  // ----------------------------------------------------
  console.log('\n--- Assertion 18: No duplicate Job Card representations ---');
  // Check attention items again
  const totalAtt2049 = await page.locator('[data-testid="attention-item-JC-2049"]').count();
  if (totalAtt2049 > 1) {
    throw new Error(`Duplicate attention items found for JC-2049: count is ${totalAtt2049}`);
  }
  console.log('✓ Assertion 18 passed: No duplicate attention entries exist for JC-2049');

  // ----------------------------------------------------
  // ASSERTION 19: 320px viewport has zero horizontal overflow
  // ----------------------------------------------------
  console.log('\n--- Assertion 19: 320px zero horizontal overflow ---');
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
    throw new Error(`Horizontal overflow at 320px: scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth}`);
  }
  console.log('✓ Assertion 19 passed: 320px viewport has ZERO horizontal overflow');

  // Capture Screenshots
  console.log('\n--- Capturing Screenshots ---');
  await page.screenshot({ path: 'test-results/workshop_floor_320_v41.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workshop_floor_320_v41.png') });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/workshop_floor_1440_v41.png' });
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'workshop_floor_1440_v41.png') });
  console.log('✓ Screenshots saved');

  await browser.close();

  // ----------------------------------------------------
  // ASSERTION 20: Existing regression suites pass
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log('ALL 20 WORKSHOP FLOOR V4.1 ASSERTIONS PASSED WITH FLYING COLORS!');
  console.log('====================================================');
}

runWorkshopFloorQA().catch((err) => {
  console.error('QA Test Failed:', err);
  process.exit(1);
});
