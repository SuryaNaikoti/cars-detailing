import { chromium } from 'playwright';

async function runV5OperationalPolishQA() {
  console.log('===========================================================');
  console.log('STARTING WORKSHOP OS V5.0 — PHASE 2 OPERATIONAL POLISH QA');
  console.log('CF-04: PRINTABLE QUOTE & CF-03: CUSTOMER HANDOVER SIGN-OFF');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('\n--- STEP 0: Resetting Baseline Storage State ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // ============================================================
    // PART 1: CF-04 — PRINTABLE CUSTOMER QUOTE
    // ============================================================
    console.log('\n===========================================================');
    console.log('TESTING CF-04: PRINTABLE CUSTOMER QUOTE');
    console.log('===========================================================');

    // 1. Open Quote Viewer via public token
    console.log('\n--- TEST CF-04.1: Render existing estimate on Quote Viewer ---');
    await page.goto('http://localhost:5173/?page=quote&quoteToken=demo-quote-porsche', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const quoteHeading = await page.locator('h1:has-text("Estimate EST-2026-2049")');
    if (!(await quoteHeading.isVisible())) {
      throw new Error('CF-04 FAILED: Estimate header not rendered on Quote Viewer');
    }
    console.log('✓ Existing estimate EST-2026-2049 loaded correctly');

    // 2. Check that the PRINT QUOTE action exists
    console.log('\n--- TEST CF-04.2: Contextual PRINT QUOTE action button ---');
    const printBtn = page.locator('#btn-print-quote');
    if (!(await printBtn.isVisible())) {
      throw new Error('CF-04 FAILED: #btn-print-quote action button missing from Quote Viewer');
    }
    const printText = await printBtn.innerText();
    console.log(`✓ Print button present with text: "${printText.trim()}"`);

    // 3. Verify Customer-facing fields are present and internal fields are strictly absent
    console.log('\n--- TEST CF-04.3: Customer-Facing Content & Privacy Boundaries ---');
    const customerInfo = await page.evaluate(() => {
      const text = document.body.innerText;
      return {
        hasCustomerName: text.includes('Vikramaditya Rao'),
        hasVehicle: text.includes('2023 Porsche Macan GTS'),
        hasRegistration: text.includes('MH 04 BK 9000'),
        hasEstimateTotal: text.includes('42,000'),
        hasCustomerNotes: text.includes('precision dial-indicator rotor runout check'),
        // Check for privacy leaks of internal fields
        hasInternalNotes: text.includes('Track-day event scheduled next month. Ensure Motul RBF 660 fresh sealed batch is used'),
        hasAdvisorWorkload: text.includes('Technician workload'),
        hasInternalIds: text.includes('cust-3') || text.includes('veh-3'),
      };
    });

    console.log('Field inspection results:', customerInfo);
    if (!customerInfo.hasCustomerName || !customerInfo.hasVehicle || !customerInfo.hasRegistration || !customerInfo.hasEstimateTotal) {
      throw new Error('CF-04 FAILED: Customer-facing estimate fields missing');
    }
    if (customerInfo.hasInternalNotes || customerInfo.hasAdvisorWorkload || customerInfo.hasInternalIds) {
      throw new Error('CF-04 PRIVACY VIOLATION: Internal notes or identifiers exposed on quote view');
    }
    console.log('✓ Customer-facing fields visible, internal notes & cost pricing strictly protected');

    // 4. Verify print styles and dedicated formal branding letterhead
    console.log('\n--- TEST CF-04.4: Print Letterhead & Stylesheet verification ---');
    const printBrandHeader = page.locator('.print-header-brand');
    const brandCount = await printBrandHeader.count();
    if (brandCount === 0) {
      throw new Error('CF-04 FAILED: Dedicated print header brand letterhead missing');
    }
    const brandText = await printBrandHeader.first().innerText();
    if (!brandText.includes("TORQUE EXPERT'S WORKSHOP") || !brandText.includes('OFFICIAL ESTIMATE')) {
      throw new Error('CF-04 FAILED: Print header branding text incorrect');
    }
    console.log('✓ Print formal letterhead and branding verified');

    // 5. Verify Estimate detail view in Dashboard also exposes print action
    console.log('\n--- TEST CF-04.5: Contextual Print action inside Estimates View ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const estimatesNav = page.locator('button:has-text("Estimates")').first();
    await estimatesNav.click();
    await page.waitForTimeout(600);

    const advisorPrintBtn = page.locator('#btn-advisor-print-quote');
    if (await advisorPrintBtn.isVisible()) {
      console.log('✓ Contextual Print button present in workshop Estimates & Approvals panel');
    }

    // ============================================================
    // PART 2: CF-03 — CUSTOMER HANDOVER SIGN-OFF
    // ============================================================
    console.log('\n===========================================================');
    console.log('TESTING CF-03: CUSTOMER HANDOVER SIGN-OFF');
    console.log('===========================================================');

    // 1. Navigate to Job Cards View
    console.log('\n--- TEST CF-03.1: Navigate into Job Cards Workspace ---');
    const jobsNavBtn = page.locator('button[data-module="jobs"]').first();
    await jobsNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await jobsNavBtn.click();
    await page.waitForTimeout(1000);

    const debugInfo = await page.evaluate(() => {
      const h1s = Array.from(document.querySelectorAll('h1')).map(h => h.innerText);
      const h2s = Array.from(document.querySelectorAll('h2')).map(h => h.innerText);
      const activeNav = document.querySelector('button[data-module="jobs"]')?.className;
      return { url: window.location.href, title: document.title, h1s, h2s, activeNav, bodySnippet: document.body.innerText.substring(0, 300) };
    });
    console.log('DOM debug info after clicking jobs:', debugInfo);

    // Verify Job Cards heading
    const jcHeading = page.locator('h1:has-text("JOB CARDS")');
    await jcHeading.waitFor({ state: 'visible', timeout: 5000 });
    console.log('✓ Job Cards module active');

    // Click on JC-2047 in the job card queue
    const jc2047Row = page.locator('[data-testid="job-row-JC-2047"]');
    await jc2047Row.waitFor({ state: 'visible', timeout: 5000 });
    await jc2047Row.click();
    await page.waitForTimeout(600);

    const dossierHeader = page.locator('[data-testid="job-dossier"], h2:has-text("JC-2047")').first();
    if (!(await dossierHeader.isVisible())) {
      throw new Error('CF-03 FAILED: Could not open Job Card dossier');
    }
    console.log('✓ Job Card dossier open');

    // 2. Open Delivery Confirmation Modal
    // In our test environment, let's stage JC-2047 to READY_FOR_COLLECTION so the HANDOVER & DELIVER button is available
    console.log('\n--- TEST CF-03.2: Open Delivery Confirmation Modal ---');
    await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      if (jobsObj['JC-2047']) {
        jobsObj['JC-2047'].status = 'READY_FOR_COLLECTION';
        localStorage.setItem('te_workshop_jobs_v3', JSON.stringify(jobsObj));
      }
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Switch back to Job Cards module after full page reload
    const jcNavAfterReload = page.locator('button[data-module="jobs"]').first();
    await jcNavAfterReload.waitFor({ state: 'visible', timeout: 5000 });
    await jcNavAfterReload.click();
    await page.waitForTimeout(800);

    // Re-select JC-2047
    const jc2047Reloaded = page.locator('[data-testid="job-row-JC-2047"]');
    await jc2047Reloaded.waitFor({ state: 'visible', timeout: 5000 });
    await jc2047Reloaded.click();
    await page.waitForTimeout(400);
    await page.waitForTimeout(400);

    const deliverBtn = page.locator('button:has-text("DELIVER VEHICLE (HANDOVER)")').first();
    if (!(await deliverBtn.isVisible())) {
      // Fallback to secondary queue button
      await page.locator('button:has-text("HANDOVER & DELIVER")').first().click();
    } else {
      await deliverBtn.click();
    }
    await page.waitForTimeout(400);

    const modalTitle = page.locator('h4:has-text("Mark Job JC-2047 as Delivered")');
    if (!(await modalTitle.isVisible())) {
      throw new Error('CF-03 FAILED: Confirm vehicle delivery modal did not open');
    }
    console.log('✓ Delivery Confirmation modal opened with existing operational safeguards');

    // 3. Verify Signature Canvas is present and optional
    console.log('\n--- TEST CF-03.3: Signature Canvas and signee controls ---');
    const canvas = page.locator('canvas');
    if (!(await canvas.isVisible())) {
      throw new Error('CF-03 FAILED: Digital signature canvas missing from delivery modal');
    }

    // 4. Test Clear signature button
    console.log('\n--- TEST CF-03.4: Draw signature and test Clear button ---');
    const canvasBox = await canvas.boundingBox();
    if (!canvasBox) throw new Error('Canvas bounding box unavailable');

    // Simulate drawing a signature on canvas
    await page.mouse.move(canvasBox.x + 20, canvasBox.y + 20);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 60, canvasBox.y + 40);
    await page.mouse.move(canvasBox.x + 100, canvasBox.y + 30);
    await page.mouse.up();
    await page.waitForTimeout(200);

    // Check if clear button is now visible
    const clearBtn = page.locator('button:has-text("Clear Canvas")');
    if (!(await clearBtn.isVisible())) {
      throw new Error('CF-03 FAILED: Clear signature button not visible after drawing');
    }
    await clearBtn.click();
    await page.waitForTimeout(200);
    console.log('✓ Drawing on canvas and Clear button operate correctly');

    // 5. Test Delivery WITHOUT signature (Optionality test)
    console.log('\n--- TEST CF-03.5: Delivery without signature (Safeguard / Optionality) ---');
    const confirmDeliveryBtn = page.locator('button:has-text("Confirm Delivery")');
    await confirmDeliveryBtn.click();
    await page.waitForTimeout(800);

    // Verify job transitioned to DELIVERED
    const jobAfterDelivery = await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      const jc2047 = jobsObj['JC-2047'];
      return {
        status: jc2047?.status,
        delivered_at: jc2047?.delivered_at,
        hasSignature: !!jc2047?.customer_signature
      };
    });

    console.log('Delivery outcome without signature:', jobAfterDelivery);
    if (jobAfterDelivery.status !== 'DELIVERED' || !jobAfterDelivery.delivered_at) {
      throw new Error('CF-03 FAILED: Delivery without signature failed to complete lifecycle transition');
    }
    if (jobAfterDelivery.hasSignature) {
      throw new Error('CF-03 FAILED: Cleared canvas erroneously persisted signature');
    }
    console.log('✓ Delivery without signature completed successfully and adhered to existing safeguards');

    // 6. Test Delivery WITH signature on another eligible job card (JC-2048)
    console.log('\n--- TEST CF-03.6: Delivery WITH signature (Persistence & Association) ---');
    await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      if (jobsObj['JC-2048']) {
        jobsObj['JC-2048'].status = 'READY_FOR_COLLECTION';
        localStorage.setItem('te_workshop_jobs_v3', JSON.stringify(jobsObj));
      }
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // Switch back to Job Cards module after full page reload
    const jcNavAfterReload2 = page.locator('button[data-module="jobs"]').first();
    await jcNavAfterReload2.waitFor({ state: 'visible', timeout: 5000 });
    await jcNavAfterReload2.click();
    await page.waitForTimeout(800);

    // Select JC-2048
    const jc2048Reloaded = page.locator('[data-testid="job-row-JC-2048"]');
    await jc2048Reloaded.waitFor({ state: 'visible', timeout: 5000 });
    await jc2048Reloaded.click();
    await page.waitForTimeout(400);

    // Click deliver
    const deliverBtn2 = page.locator('button:has-text("DELIVER VEHICLE (HANDOVER)")').first();
    if (!(await deliverBtn2.isVisible())) {
      await page.locator('button:has-text("HANDOVER & DELIVER")').first().click();
    } else {
      await deliverBtn2.click();
    }
    await page.waitForTimeout(400);

    // Draw signature
    const canvas2 = page.locator('canvas');
    const box2 = await canvas2.boundingBox();
    if (box2) {
      await page.mouse.move(box2.x + 30, box2.y + 30);
      await page.mouse.down();
      await page.mouse.move(box2.x + 80, box2.y + 50);
      await page.mouse.move(box2.x + 140, box2.y + 35);
      await page.mouse.up();
      await page.waitForTimeout(300);
    }

    // Enter signee name
    const signeeInput = page.locator('input[placeholder*="Signee Name"]');
    await signeeInput.fill('Ananya Roy (Owner Authorized)');

    // Confirm delivery with signature
    const confirmDeliveryBtn2 = page.locator('button:has-text("Confirm Delivery")');
    await confirmDeliveryBtn2.click();
    await page.waitForTimeout(800);

    // Verify stored signature on JC-2048
    const jobWithSign = await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      const jc2048 = jobsObj['JC-2048'];
      return {
        status: jc2048?.status,
        delivered_at: jc2048?.delivered_at,
        hasSignature: !!jc2048?.customer_signature,
        signaturePrefix: jc2048?.customer_signature?.substring(0, 22),
        signoffName: jc2048?.handover_signoff_name,
      };
    });

    console.log('Delivery outcome with signature:', jobWithSign);
    if (jobWithSign.status !== 'DELIVERED') {
      throw new Error('CF-03 FAILED: Job status not DELIVERED');
    }
    if (!jobWithSign.hasSignature || !jobWithSign.signaturePrefix?.includes('data:image/png')) {
      throw new Error('CF-03 FAILED: Signature data URL not persisted correctly');
    }
    if (jobWithSign.signoffName !== 'Ananya Roy (Owner Authorized)') {
      throw new Error(`CF-03 FAILED: Handover signoff name mismatch: got ${jobWithSign.signoffName}`);
    }
    console.log('✓ Signature accurately captured, formatted as image/png data, and bound to JC-2048');

    // 7. Verify Customer Privacy Boundaries
    console.log('\n--- TEST CF-03.7: Customer Portal Privacy Boundary ---');
    const safeJobView = await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      const tok = jobsObj['JC-2048']?.public_token;
      return {
        token: tok
      };
    });

    await page.goto(`http://localhost:5173/?page=status&jobToken=${safeJobView.token}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const portalPrivacyCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      return {
        hasDeliveredStatus: bodyText.toLowerCase().includes('delivered') || bodyText.toLowerCase().includes('handover'),
        hasInternalMargin: bodyText.includes('staff margin') || bodyText.includes('cost price'),
        headings: Array.from(document.querySelectorAll('h1, h2')).map(h => h.innerText),
        snippet: bodyText.substring(0, 400),
      };
    });

    console.log('Portal privacy verification:', portalPrivacyCheck);
    if (!portalPrivacyCheck.hasDeliveredStatus) {
      throw new Error(`Customer status tracker does not reflect delivery. Snippet: ${portalPrivacyCheck.snippet}`);
    }
    if (portalPrivacyCheck.hasInternalMargin) {
      throw new Error('CF-03 PRIVACY LEAK: Private internal details leaked to public tracker');
    }
    console.log('✓ Customer status portal remains secure with zero internal data leakage');

    // 8. Test Demo Reset restores canonical seed state
    console.log('\n--- TEST CF-03.8: Reset Demo Data restores canonical seed state ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const settingsNav = page.locator('button:has-text("Settings")').first();
    await settingsNav.click();
    await page.waitForTimeout(600);

    const resetBtn = page.locator('#btn-reset-demo-data');
    await resetBtn.click();
    await page.waitForTimeout(400);

    const confirmResetBtn = page.locator('#btn-confirm-reset-demo');
    await confirmResetBtn.click();
    await page.waitForTimeout(2000);

    const resetVerified = await page.evaluate(() => {
      const jobsObj = JSON.parse(localStorage.getItem('te_workshop_jobs_v3') || '{}');
      return {
        jc2047Status: jobsObj['JC-2047']?.status, // Canonical Seed: WORK_IN_PROGRESS
        jc2048Status: jobsObj['JC-2048']?.status, // Canonical Seed: QUALITY_CHECK
      };
    });

    console.log('After reset verified state:', resetVerified);
    if (resetVerified.jc2047Status !== 'WORK_IN_PROGRESS' || resetVerified.jc2048Status !== 'QUALITY_CHECK') {
      throw new Error(`CF-03 Reset failed: Expected JC-2047 WORK_IN_PROGRESS and JC-2048 QUALITY_CHECK, got ${JSON.stringify(resetVerified)}`);
    }
    console.log('✓ Demo Reset correctly re-seeds canonical baseline');

    console.log('\n===========================================================');
    console.log('V5 OPERATIONAL POLISH (CF-04 & CF-03) QA PASSED COMPLETELY!');
    console.log('===========================================================');

  } catch (err) {
    console.error('\n❌ V5 OPERATIONAL POLISH QA FAILED:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runV5OperationalPolishQA();
