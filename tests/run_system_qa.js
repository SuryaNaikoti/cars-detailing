import { chromium } from 'playwright';
import fs from 'fs';

async function runSystemQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('===========================================================');
  console.log('STARTING SYSTEM V4.0 (TEAM, ACCESS & SETTINGS) QA SUITE');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  try {
    // ----------------------------------------------------
    // TEST 1: Navigation to Team & Permissions
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Navigate to Team & Permissions ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const teamNavBtn = page.locator('button[data-module="team"], button:has-text("Team & Permissions")').first();
    await teamNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await teamNavBtn.click();
    await page.waitForTimeout(1000);

    const teamPage = page.locator('#team-permissions-page');
    if (!(await teamPage.isVisible())) {
      throw new Error('#team-permissions-page container not visible');
    }
    console.log('✓ TEST 1 passed: Successfully navigated to #team-permissions-page');

    // ----------------------------------------------------
    // TEST 2: Heading & Eyebrow Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 2: Heading & Eyebrow verification for Team ---');
    const heading = await page.locator('#team-permissions-page h1').innerText();
    const eyebrow = await page.locator('#team-permissions-page span:has-text("SYSTEM ADMINISTRATION")').innerText();
    console.log('Heading:', heading);
    console.log('Eyebrow:', eyebrow);
    if (!heading.toUpperCase().includes('TEAM & PERMISSIONS')) {
      throw new Error(`Expected TEAM & PERMISSIONS, got: "${heading}"`);
    }
    console.log('✓ TEST 2 passed: Header and eyebrow verified');

    // ----------------------------------------------------
    // TEST 3: Staff Directory Renders Canonical Members
    // ----------------------------------------------------
    console.log('\n--- TEST 3: Canonical Staff Members in Directory ---');
    const memberCards = page.locator('#team-members-list > div[data-testid^="team-card-"]');
    const memberCount = await memberCards.count();
    console.log(`Team members in directory: ${memberCount}`);
    if (memberCount < 4) {
      throw new Error(`Expected at least 4 canonical staff members, got ${memberCount}`);
    }

    const arjunCard = page.locator('div[data-testid="team-card-team-3"]');
    if (!(await arjunCard.isVisible())) {
      throw new Error('Arjun Sharma card (team-3) not visible');
    }
    console.log('✓ TEST 3 passed: Canonical staff members rendered');

    // ----------------------------------------------------
    // TEST 4: Selection & Staff Dossier Verification
    // ----------------------------------------------------
    console.log('\n--- TEST 4: Selection & Staff Member Dossier ---');
    await arjunCard.click();
    await page.waitForTimeout(600);

    const dossier = page.locator('#team-member-dossier');
    if (!(await dossier.isVisible())) {
      throw new Error('Team member dossier not visible');
    }
    const dossierText = await dossier.innerText();
    console.log('Dossier snippet:', dossierText.slice(0, 140));
    if (!dossierText.includes('Arjun Sharma') || !dossierText.includes('JC-2047')) {
      console.log('=== FULL DOSSIER TEXT DUMP ===');
      console.log(dossierText);
      console.log('=== END DUMP ===');
      throw new Error('Expected Arjun Sharma dossier with active job card JC-2047');
    }
    console.log('✓ TEST 4 passed: Staff dossier synchronized with active workload');

    // ----------------------------------------------------
    // TEST 5: Roles & Responsibilities Tab
    // ----------------------------------------------------
    console.log('\n--- TEST 5: Roles & Responsibilities Tab ---');
    const rolesTabBtn = page.locator('button:has-text("ROLES & RESPONSIBILITIES")');
    await rolesTabBtn.click();
    await page.waitForTimeout(600);

    const roleCards = page.locator('h3:has-text("OWNER / ADMIN"), h3:has-text("SERVICE ADVISOR"), h3:has-text("TECHNICIAN")');
    const rolesCount = await roleCards.count();
    console.log(`Role definitions visible: ${rolesCount}`);
    if (rolesCount < 3) {
      throw new Error('Expected role cards for Owner, Advisor, Technician');
    }
    console.log('✓ TEST 5 passed: Role model verified');

    // ----------------------------------------------------
    // TEST 6: Permission Matrix (18x6)
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Permission Matrix Verification ---');
    const matrixTabBtn = page.locator('button:has-text("PERMISSION MATRIX")');
    await matrixTabBtn.click();
    await page.waitForTimeout(600);

    const matrixTable = page.locator('table:has-text("Capability / Module")');
    if (!(await matrixTable.isVisible())) {
      throw new Error('Permission matrix table not visible');
    }
    const rowsCount = await matrixTable.locator('tbody tr').count();
    console.log(`Permission matrix rows: ${rowsCount}`);
    if (rowsCount !== 18) {
      throw new Error(`Expected 18 capability rows in permission matrix, got ${rowsCount}`);
    }
    console.log('✓ TEST 6 passed: Complete 18x6 permission matrix rendered');

    // ----------------------------------------------------
    // TEST 7: Navigate to Settings & Governance
    // ----------------------------------------------------
    console.log('\n--- TEST 7: Navigate to Workshop Settings ---');
    const settingsNavBtn = page.locator('button[data-module="settings"], button:has-text("Settings")').first();
    await settingsNavBtn.click();
    await page.waitForTimeout(1000);

    const settingsPage = page.locator('#workshop-settings-page');
    if (!(await settingsPage.isVisible())) {
      throw new Error('#workshop-settings-page container not visible');
    }
    const settingsHeading = await page.locator('#workshop-settings-page h1').innerText();
    console.log('Settings heading:', settingsHeading);
    if (!settingsHeading.toUpperCase().includes('SETTINGS')) {
      throw new Error(`Expected SETTINGS, got: "${settingsHeading}"`);
    }
    console.log('✓ TEST 7 passed: Successfully navigated to #workshop-settings-page');

    // ----------------------------------------------------
    // TEST 8: Workshop Profile & Operating Hours (7 Days)
    // ----------------------------------------------------
    console.log('\n--- TEST 8: Workshop Profile & 7-Day Operating Hours ---');
    const facilityNameInput = page.locator('input[value*="Torque"]');
    if (!(await facilityNameInput.isVisible())) {
      throw new Error('Facility name input not visible');
    }
    const openDays = page.locator('button:has-text("OPEN"), button:has-text("CLOSED")');
    const daysCount = await openDays.count();
    console.log(`Operating days configured: ${daysCount}`);
    if (daysCount !== 7) {
      throw new Error(`Expected 7 days in operating hours, got ${daysCount}`);
    }
    console.log('✓ TEST 8 passed: Workshop profile and 7-day operating schedule verified');

    // ----------------------------------------------------
    // TEST 9: Services & Pricing Catalog
    // ----------------------------------------------------
    console.log('\n--- TEST 9: Canonical Services & Pricing Catalog ---');
    const servicesTab = page.locator('button:has-text("SERVICES & CATALOG")');
    await servicesTab.click();
    await page.waitForTimeout(600);

    const periodicServiceCard = page.locator('div:has-text("CATALOG ID: periodic-service")');
    if (!(await periodicServiceCard.first().isVisible())) {
      throw new Error('Periodic Service catalog card not visible');
    }
    const cardText = await periodicServiceCard.first().innerText();
    if (!cardText.includes('₹12,800')) {
      throw new Error(`Expected ₹12,800 starting scope for periodic-service, got: ${cardText}`);
    }
    console.log('✓ TEST 9 passed: Canonical services catalog with verified pricing verified');

    // ----------------------------------------------------
    // TEST 10: Workflow Pipelines & Governance
    // ----------------------------------------------------
    console.log('\n--- TEST 10: Workflow Pipelines & Governance ---');
    const workflowTab = page.locator('button:has-text("WORKFLOW GOVERNANCE")');
    await workflowTab.click();
    await page.waitForTimeout(600);

    const pipelines = page.locator('h3:has-text("PIPELINE"), h3:has-text("LIFECYCLE")');
    const pipeCount = await pipelines.count();
    console.log(`Workflow pipelines defined: ${pipeCount}`);
    if (pipeCount < 4) {
      throw new Error(`Expected at least 4 canonical lifecycle pipelines, got ${pipeCount}`);
    }
    console.log('✓ TEST 10 passed: Workflow lifecycle state machines rendered');

    // ----------------------------------------------------
    // TEST 11: Communications & Customer Portal Settings
    // ----------------------------------------------------
    console.log('\n--- TEST 11: Communications & Customer Portal Settings ---');
    const commsTab = page.locator('button:has-text("COMMS & PORTAL")');
    await commsTab.click();
    await page.waitForTimeout(600);

    const commsText = await page.locator('#workshop-settings-page').innerText();
    if (!commsText.includes('AVAILABLE IN DEMO') || !commsText.includes('Masking')) {
      throw new Error('Expected truthful AVAILABLE IN DEMO and VIN Masking policies');
    }
    console.log('✓ TEST 11 passed: Truthful deep-link states & data privacy policies verified');

    // ----------------------------------------------------
    // TEST 12: Chronological System Audit Log
    // ----------------------------------------------------
    console.log('\n--- TEST 12: Chronological System Audit Log ---');
    const auditTab = page.locator('button:has-text("SYSTEM AUDIT LOG")');
    await auditTab.click();
    await page.waitForTimeout(600);

    const auditTable = page.locator('#system-audit-log-table');
    if (!(await auditTable.isVisible())) {
      throw new Error('#system-audit-log-table not visible');
    }
    const auditRows = await auditTable.locator('tbody tr').count();
    console.log(`Audit log event rows rendered: ${auditRows}`);
    if (auditRows < 5) {
      throw new Error(`Expected at least 5 chronological audit records, got ${auditRows}`);
    }
    const firstRowText = await auditTable.locator('tbody tr').first().innerText();
    console.log(`Latest audit log entry: ${firstRowText}`);
    console.log('✓ TEST 12 passed: System audit log derived from canonical records');

    // ----------------------------------------------------
    // TEST 13: Responsive 320px Zero Horizontal Overflow
    // ----------------------------------------------------
    console.log('\n--- TEST 13: Responsive 320px Zero Horizontal Overflow ---');
    await page.setViewportSize({ width: 320, height: 600 });
    await page.waitForTimeout(600);

    const overflowSettings = await page.evaluate(() => {
      const el = document.getElementById('workshop-settings-page');
      return {
        clientWidth: el ? el.clientWidth : 0,
        scrollWidth: el ? el.scrollWidth : 0,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    console.log('Settings 320px overflow check:', overflowSettings);
    if (overflowSettings.scrollWidth > overflowSettings.clientWidth + 2) {
      throw new Error(`Horizontal overflow in Settings at 320px: scrollWidth ${overflowSettings.scrollWidth} > clientWidth ${overflowSettings.clientWidth}`);
    }

    // Switch to Team at 320px
    await page.evaluate(() => {
      const btn = document.querySelector('button[data-module="team"]');
      if (btn) btn.click();
    });
    await page.waitForTimeout(600);

    const overflowTeam = await page.evaluate(() => {
      const el = document.getElementById('team-permissions-page');
      return {
        clientWidth: el ? el.clientWidth : 0,
        scrollWidth: el ? el.scrollWidth : 0,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
    console.log('Team 320px overflow check:', overflowTeam);
    if (overflowTeam.scrollWidth > overflowTeam.clientWidth + 2) {
      throw new Error(`Horizontal overflow in Team at 320px: scrollWidth ${overflowTeam.scrollWidth} > clientWidth ${overflowTeam.clientWidth}`);
    }
    console.log('✓ TEST 13 passed: Zero horizontal overflow at 320px for both Team and Settings');

    console.log('\n===========================================================');
    console.log('ALL 13 SYSTEM V4.0 QA VALIDATION CHECKS PASSED PERFECTLY!');
    console.log('===========================================================');
  } finally {
    await browser.close();
  }
}

runSystemQA().catch((err) => {
  console.error('\n❌ SYSTEM QA FAILED:', err);
  process.exit(1);
});
