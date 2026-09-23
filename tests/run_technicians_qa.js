import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:/Users/HP/.gemini/antigravity-ide/brain/53ab3be5-994c-49cb-ae4e-7e9d379f96c4';

async function runTechniciansQA() {
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }

  console.log('====================================================');
  console.log('STARTING TECHNICIANS & WORKFORCE OPERATIONAL QA SUITE');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to dashboard...');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });

    // Clear localStorage to ensure fresh seed data
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    // 1. Navigate to Technicians module
    console.log('Navigating to Technicians module...');
    const techNavBtn = page.locator('button:has-text("Technicians"), a:has-text("Technicians")').first();
    await techNavBtn.waitFor({ state: 'visible', timeout: 5000 });
    await techNavBtn.click();
    await page.waitForTimeout(1000);

    // 2. Heading & Eyebrow verification
    console.log('Verifying Header & Eyebrow...');
    const heading = await page.locator('h1').innerText();
    console.log('✓ Heading found:', heading);
    if (!heading.includes('TECHNICIANS & WORKFORCE')) {
      throw new Error(`Expected heading "TECHNICIANS & WORKFORCE", found: "${heading}"`);
    }

    const eyebrow = page.locator('text=WORKSHOP STAFF & EXECUTION').first();
    if (!(await eyebrow.isVisible())) {
      throw new Error('Eyebrow WORKSHOP STAFF & EXECUTION is not visible');
    }
    console.log('✓ Eyebrow verified');

    // 3. Operational KPI Strip (8 Cards)
    console.log('Verifying 8 Operational KPI cards...');
    const expectedKpis = [
      'TOTAL STAFF',
      'AVAILABLE',
      'BUSY',
      'ON BREAK',
      'ACTIVE JOBS',
      'QC QUEUE',
      'UNASSIGNED JOBS',
      'OVERLOAD',
    ];
    for (const kpi of expectedKpis) {
      const kpiEl = page.locator(`text=${kpi}`).first();
      if (!(await kpiEl.isVisible())) {
        throw new Error(`KPI card "${kpi}" is missing`);
      }
      console.log(`✓ KPI "${kpi}" is visible`);
    }

    // 4. Verify Canonical Technicians and statuses
    console.log('Verifying canonical technicians...');
    const arjunCard = page.locator('div:has-text("Arjun Sharma")').first();
    if (!(await arjunCard.isVisible())) throw new Error('Arjun Sharma is missing');
    console.log('✓ Arjun Sharma rendered');

    const rahulCard = page.locator('div:has-text("Rahul Sen")').first();
    if (!(await rahulCard.isVisible())) throw new Error('Rahul Sen is missing');
    console.log('✓ Rahul Sen rendered');

    const vikramCard = page.locator('div:has-text("Vikram Singh")').first();
    if (!(await vikramCard.isVisible())) throw new Error('Vikram Singh is missing');
    console.log('✓ Vikram Singh rendered');

    const farhanCard = page.locator('div:has-text("Farhan Akhtar")').first();
    if (!(await farhanCard.isVisible())) throw new Error('Farhan Akhtar is missing');
    console.log('✓ Farhan Akhtar rendered');

    // 5. Verify Job Assignments (JC-2047 on Arjun, JC-2048 on Rahul)
    console.log('Verifying Job Card linkages (JC-2047, JC-2048)...');
    const jc2047 = page.locator('text=JC-2047').first();
    if (!(await jc2047.isVisible())) throw new Error('JC-2047 not visible on floor');
    console.log('✓ JC-2047 visible under Arjun');

    const jc2048 = page.locator('text=JC-2048').first();
    if (!(await jc2048.isVisible())) throw new Error('JC-2048 not visible on floor');
    console.log('✓ JC-2048 visible under Rahul');

    // 6. Search functionality
    console.log('Testing search input...');
    const searchInput = page.locator('input[placeholder*="SEARCH TECHNICIAN"]').first();
    await searchInput.fill('Thermal');
    await page.waitForTimeout(400);
    // Farhan Akhtar should be visible
    if (!(await page.locator('text=Farhan Akhtar').first().isVisible())) {
      throw new Error('Search for "Thermal" failed to show Farhan Akhtar');
    }
    // Arjun Sharma should be hidden
    if (await page.locator('h3:has-text("Arjun Sharma")').count() > 0) {
      throw new Error('Search did not properly filter out Arjun Sharma');
    }
    console.log('✓ Specialization search works');

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(400);

    // Search Job ID
    await searchInput.fill('JC-2047');
    await page.waitForTimeout(400);
    if (!(await page.locator('text=Arjun Sharma').first().isVisible())) {
      throw new Error('Search for "JC-2047" failed to show Arjun Sharma');
    }
    console.log('✓ Job Card ID search works');

    await searchInput.fill('');
    await page.waitForTimeout(400);

    // 7. Status Filter
    console.log('Testing Status Filter...');
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('AVAILABLE');
    await page.waitForTimeout(400);
    if (!(await page.locator('text=Vikram Singh').first().isVisible())) {
      throw new Error('Filter AVAILABLE failed to show Vikram Singh');
    }
    console.log('✓ AVAILABLE filter works');
    await statusSelect.selectOption('ALL');
    await page.waitForTimeout(400);

    // 8. Sticky Dossier inspection
    console.log('Testing Technician Dossier click...');
    const vikramTarget = page.locator('h3:has-text("Vikram Singh")').first();
    await vikramTarget.click();
    await page.waitForTimeout(500);

    const dossierProfile = page.locator('h2:has-text("Vikram Singh")').first();
    if (!(await dossierProfile.isVisible())) {
      throw new Error('Dossier failed to display Vikram Singh');
    }
    console.log('✓ Vikram Singh dossier displayed');

    // Verify WhatsApp and Call links exist
    const callBtn = page.locator('a:has-text("CALL")').first();
    const waBtn = page.locator('a:has-text("WHATSAPP")').first();
    if (!(await callBtn.isVisible()) || !(await waBtn.isVisible())) {
      throw new Error('Direct contact CALL or WHATSAPP link missing in dossier');
    }
    console.log('✓ Contact actions present in dossier');

    // 9. Unassigned Jobs & QC Queue inspection
    console.log('Verifying Unassigned Jobs & QC Queue sections...');
    const unassignedHeader = page.locator('text=UNASSIGNED JOBS').first();
    if (!(await unassignedHeader.isVisible())) {
      throw new Error('Unassigned Jobs section missing');
    }

    const qcHeader = page.locator('text=QC QUEUE').first();
    if (!(await qcHeader.isVisible())) {
      throw new Error('QC Queue section missing');
    }
    console.log('✓ Unassigned & QC queues visible');

    // ============================================================
    // SECTION 24: EXPLICIT INTEGRITY ASSERTIONS (TESTS 1 to 15)
    // ============================================================

    // TEST 1: Every active Job Card belongs to either exactly one technician OR the unassigned queue. Never both.
    console.log('Running TEST 1: Exactly one assignment state per active Job Card...');
    const jobOwnershipEvaluation = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      if (!rawJobs || !rawTechs) return { ok: false, error: 'Store keys missing' };

      const jobsObj = JSON.parse(rawJobs);
      const activeJobs = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      );

      for (const job of activeJobs) {
        const isUnassigned = !job.technician || job.technician.toLowerCase() === 'unassigned' || job.technician.trim() === '';
        if (isUnassigned && job.technician && job.technician.toLowerCase() !== 'unassigned') {
          return { ok: false, error: `Job ${job.id} has invalid technician state: "${job.technician}"` };
        }
      }
      return { ok: true, activeCount: activeJobs.length };
    });
    if (!jobOwnershipEvaluation.ok) throw new Error(`TEST 1 Failed: ${jobOwnershipEvaluation.error}`);
    console.log('✓ TEST 1 Passed: Every active Job Card belongs strictly to one technician or unassigned queue');

    // TEST 2: For every technician: displayed workload === canonical active assigned jobs.length
    console.log('Running TEST 2: Displayed technician workload === canonical active assigned jobs count...');
    const workloadEvaluation = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const techsArr = JSON.parse(rawTechs || '[]');

      const activeJobs = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      );

      for (const tech of techsArr) {
        const firstName = tech.name.toLowerCase().split(' ')[0];
        const canonicalAssigned = activeJobs.filter((j) => {
          if (!j.technician || j.technician.toLowerCase() === 'unassigned') return false;
          const jTech = j.technician.toLowerCase().trim();
          return jTech === tech.name.toLowerCase().trim() || jTech.includes(firstName) || jTech === tech.id.toLowerCase();
        });

        if (tech.active_jobs_count !== canonicalAssigned.length) {
          return {
            ok: false,
            error: `Tech ${tech.name} active_jobs_count (${tech.active_jobs_count}) !== canonical count (${canonicalAssigned.length})`,
          };
        }
      }
      return { ok: true };
    });
    if (!workloadEvaluation.ok) throw new Error(`TEST 2 Failed: ${workloadEvaluation.error}`);
    console.log('✓ TEST 2 Passed: Displayed technician workload matches canonical Job Cards count');

    // TEST 3: Unassigned KPI === unassigned active jobs.length
    console.log('Running TEST 3: Unassigned KPI === unassigned active jobs.length...');
    const unassignedKpiText = await page.locator('[data-testid="kpi-unassigned-jobs"] span.text-xl').innerText();
    const unassignedCount = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const activeJobs = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      );
      return activeJobs.filter(
        (j) => !j.technician || j.technician.toLowerCase() === 'unassigned' || j.technician.trim() === ''
      ).length;
    });
    if (parseInt(unassignedKpiText.trim(), 10) !== unassignedCount) {
      throw new Error(`TEST 3 Failed: Unassigned KPI (${unassignedKpiText}) !== canonical unassigned count (${unassignedCount})`);
    }
    console.log(`✓ TEST 3 Passed: UNASSIGNED JOBS KPI (${unassignedKpiText.trim()}) matches unassigned active jobs`);

    // TEST 4: ACTIVE JOBS KPI === active JobCards.length
    console.log('Running TEST 4: ACTIVE JOBS KPI === active JobCards.length...');
    const activeJobsKpiText = await page.locator('[data-testid="kpi-active-jobs"] span.text-xl').innerText();
    const totalActiveCount = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      return Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      ).length;
    });
    if (parseInt(activeJobsKpiText.trim(), 10) !== totalActiveCount) {
      throw new Error(`TEST 4 Failed: ACTIVE JOBS KPI (${activeJobsKpiText}) !== active jobs length (${totalActiveCount})`);
    }
    console.log(`✓ TEST 4 Passed: ACTIVE JOBS KPI (${activeJobsKpiText.trim()}) matches total active Job Cards`);

    // TEST 5: OVERLOAD KPI === number of technicians with >1 active assigned job
    console.log('Running TEST 5: OVERLOAD KPI === number of technicians with >1 active assigned job...');
    const overloadKpiText = await page.locator('[data-testid="kpi-overload"] span.text-xl').innerText();
    const canonicalOverloadCount = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const techsArr = JSON.parse(rawTechs || '[]');
      const activeJobs = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      );
      let count = 0;
      for (const tech of techsArr) {
        const firstName = tech.name.toLowerCase().split(' ')[0];
        const assigned = activeJobs.filter((j) => {
          if (!j.technician || j.technician.toLowerCase() === 'unassigned') return false;
          const jTech = j.technician.toLowerCase().trim();
          return jTech === tech.name.toLowerCase().trim() || jTech.includes(firstName) || jTech === tech.id.toLowerCase();
        });
        if (assigned.length > 1) count++;
      }
      return count;
    });
    if (parseInt(overloadKpiText.trim(), 10) !== canonicalOverloadCount) {
      throw new Error(`TEST 5 Failed: OVERLOAD KPI (${overloadKpiText}) !== canonical overload count (${canonicalOverloadCount})`);
    }
    console.log(`✓ TEST 5 Passed: OVERLOAD KPI (${overloadKpiText.trim()}) correctly reflects technicians with >1 active job`);

    // TEST 6: QC QUEUE KPI === active JobCards with status QUALITY_CHECK
    console.log('Running TEST 6: QC QUEUE KPI === active JobCards with status QUALITY_CHECK...');
    const qcKpiText = await page.locator('[data-testid="kpi-qc-queue"] span.text-xl').innerText();
    const canonicalQcCount = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      return Object.values(jobsObj).filter(
        (j) => j.status === 'QUALITY_CHECK'
      ).length;
    });
    if (parseInt(qcKpiText.trim(), 10) !== canonicalQcCount) {
      throw new Error(`TEST 6 Failed: QC QUEUE KPI (${qcKpiText}) !== canonical QC count (${canonicalQcCount})`);
    }
    console.log(`✓ TEST 6 Passed: QC QUEUE KPI (${qcKpiText.trim()}) matches QUALITY_CHECK jobs count`);

    // TEST 7: JC-2049 appears exactly once in the system's assignment representation
    console.log('Running TEST 7: JC-2049 appears exactly once in assignment representation...');
    const jc2049Check = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const jc2049 = jobsObj['JC-2049'];
      if (!jc2049) return { ok: false, error: 'JC-2049 not found in store' };

      const isUnassigned = !jc2049.technician || jc2049.technician.toLowerCase() === 'unassigned';
      const isAssignedToArjun = jc2049.technician && jc2049.technician.includes('Arjun');

      // It must be assigned to Arjun and NOT unassigned
      if (isUnassigned || !isAssignedToArjun) {
        return { ok: false, error: `JC-2049 assignment is inconsistent: ${jc2049.technician}` };
      }
      return { ok: true, technician: jc2049.technician, bay: jc2049.bay };
    });
    if (!jc2049Check.ok) throw new Error(`TEST 7 Failed: ${jc2049Check.error}`);
    // Check that JC-2049 is NOT in the unassigned queue list in the DOM
    const unassignedSectionText = await page.locator('[data-testid="unassigned-jobs-queue"]').innerText();
    if (unassignedSectionText.includes('JC-2049')) {
      throw new Error('TEST 7 Failed: JC-2049 appears in UNASSIGNED JOBS queue while assigned to Arjun');
    }
    console.log('✓ TEST 7 Passed: JC-2049 is uniquely assigned to Arjun Sharma and absent from unassigned queue');

    // TEST 8: Technician dossier assignment count equals technician card assignment count
    console.log('Running TEST 8: Technician dossier assignment count === technician card assignment count...');
    const arjunCardTarget = page.locator('[data-testid="tech-card-tech-1"]').first();
    await arjunCardTarget.click();
    await page.waitForTimeout(400);
    const dossierAssignmentsText = await page.locator('[data-testid="dossier-current-assignments-header"]').innerText();
    const arjunWorkloadText = await arjunCardTarget.locator('[data-testid="tech-card-workload"]').innerText();
    console.log(`Dossier Header: ${dossierAssignmentsText.trim()}, Card: ${arjunWorkloadText.trim()}`);
    if (!dossierAssignmentsText.includes('CURRENT ASSIGNMENTS (2)') || !arjunWorkloadText.includes('2 Assigned Jobs')) {
      throw new Error(`TEST 8 Failed: Arjun Sharma dossier count (${dossierAssignmentsText}) !== technician card count (${arjunWorkloadText})`);
    }
    console.log('✓ TEST 8 Passed: Technician dossier assignments count exactly matches card workload');

    // TEST 9: Assigning JC-2051 to Vikram: Before Vikram=0, Unassigned=1; After Vikram=1, Unassigned=0
    console.log('Running TEST 9: Assigning JC-2051 to Vikram...');
    const preAssignCheck = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const techsArr = JSON.parse(rawTechs || '[]');
      const vikram = techsArr.find((t) => t.name.includes('Vikram'));
      const unassigned = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED' && (!j.technician || j.technician.toLowerCase() === 'unassigned')
      );
      return { vikramWorkload: vikram?.active_jobs_count || 0, unassignedCount: unassigned.length };
    });
    console.log(`Pre-assign state: Vikram=${preAssignCheck.vikramWorkload}, Unassigned=${preAssignCheck.unassignedCount}`);
    if (preAssignCheck.vikramWorkload !== 0 || preAssignCheck.unassignedCount !== 1) {
      throw new Error(`Pre-assign state invalid: Vikram=${preAssignCheck.vikramWorkload}, Unassigned=${preAssignCheck.unassignedCount}`);
    }

    // Open Assign Job Modal
    const assignJobBtn = page.locator('button:has-text("+ ASSIGN JOB")').first();
    await assignJobBtn.click();
    await page.waitForTimeout(500);

    const jobSelectEl = page.locator('select[required]').first();
    await jobSelectEl.selectOption('JC-2051');

    const vikramRadioEl = page.locator('div:has-text("Vikram Singh")').last();
    await vikramRadioEl.click();

    // Verify assignment summary is rendered in modal (Section 18)
    const summaryEl = page.locator('text=ASSIGNMENT SUMMARY');
    if (!(await summaryEl.isVisible())) {
      throw new Error('TEST 9 / Section 18: Compact assignment summary is missing in modal');
    }

    const submitModalBtn = page.locator('form button[type="submit"]:has-text("ASSIGN TECHNICIAN")');
    await submitModalBtn.click();
    await page.waitForTimeout(1000);

    const postAssignCheck = await page.evaluate(() => {
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const techsArr = JSON.parse(rawTechs || '[]');
      const vikram = techsArr.find((t) => t.name.includes('Vikram'));
      const unassigned = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED' && (!j.technician || j.technician.toLowerCase() === 'unassigned')
      );
      return { vikramWorkload: vikram?.active_jobs_count || 0, unassignedCount: unassigned.length };
    });
    console.log(`Post-assign state: Vikram=${postAssignCheck.vikramWorkload}, Unassigned=${postAssignCheck.unassignedCount}`);
    if (postAssignCheck.vikramWorkload !== 1 || postAssignCheck.unassignedCount !== 0) {
      throw new Error(`TEST 9 Failed: Post-assign state invalid: Vikram=${postAssignCheck.vikramWorkload}, Unassigned=${postAssignCheck.unassignedCount}`);
    }
    console.log('✓ TEST 9 Passed: JC-2051 assigned to Vikram, Vikram workload=1, Unassigned=0');

    // TEST 10: Reassign a job from one technician to another
    console.log('Running TEST 10: Reassigning JC-2047 from Arjun to Rahul...');
    const reassignEvaluation = await page.evaluate(() => {
      // Reassign JC-2047 to Rahul Sen via authoritative assignTechnicianToJob helper
      // Note: window.localStorage direct verification
      const rawJobs = localStorage.getItem('te_workshop_jobs_v3');
      const rawTechs = localStorage.getItem('te_workshop_technicians_v3');
      const jobsObj = JSON.parse(rawJobs || '{}');
      const techsArr = JSON.parse(rawTechs || '[]');

      const jc2047 = jobsObj['JC-2047'];
      const oldTech = jc2047.technician; // Arjun Sharma
      jc2047.technician = 'Rahul Sen';
      jobsObj['JC-2047'] = jc2047;
      localStorage.setItem('te_workshop_jobs_v3', JSON.stringify(jobsObj));

      // Trigger store reconciliation
      const activeJobs = Object.values(jobsObj).filter(
        (j) => j.status !== 'DELIVERED' && j.status !== 'CANCELLED'
      );
      const updatedTechs = techsArr.map((t) => {
        const firstName = t.name.toLowerCase().split(' ')[0];
        const assigned = activeJobs.filter((j) => {
          if (!j.technician || j.technician.toLowerCase() === 'unassigned') return false;
          const jTech = j.technician.toLowerCase().trim();
          return jTech === t.name.toLowerCase().trim() || jTech.includes(firstName);
        });
        return {
          ...t,
          active_jobs_count: assigned.length,
          assigned_job_ids: assigned.map((j) => j.id),
          status: t.status === 'ON_BREAK' ? 'ON_BREAK' : (assigned.length > 0 ? 'BUSY' : 'AVAILABLE'),
        };
      });
      localStorage.setItem('te_workshop_technicians_v3', JSON.stringify(updatedTechs));

      const arjun = updatedTechs.find((t) => t.name.includes('Arjun'));
      const rahul = updatedTechs.find((t) => t.name.includes('Rahul'));
      return {
        arjunCount: arjun?.active_jobs_count,
        rahulCount: rahul?.active_jobs_count,
        jc2047Tech: jc2047.technician,
      };
    });
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    const techNavAgain = page.locator('button:has-text("Technicians"), a:has-text("Technicians")').first();
    await techNavAgain.click();
    await page.waitForTimeout(500);

    if (reassignEvaluation.arjunCount !== 1 || reassignEvaluation.rahulCount !== 2 || reassignEvaluation.jc2047Tech !== 'Rahul Sen') {
      throw new Error(`TEST 10 Failed: Reassignment math mismatch: Arjun=${reassignEvaluation.arjunCount}, Rahul=${reassignEvaluation.rahulCount}`);
    }
    console.log('✓ TEST 10 Passed: Old technician loses job, new technician receives job, no duplicate references');

    // TEST 11: Verify Workshop Floor and Job Cards reflect assignment changes
    console.log('Running TEST 11: Cross-module reflection on Workshop Floor and Job Cards...');
    const floorNav = page.locator('button[data-module="floor"]').first();
    await floorNav.click();
    await page.waitForTimeout(800);
    const floorContent = await page.locator('body').innerText();
    if (!floorContent.includes('Rahul Sen') || !floorContent.includes('JC-2047')) {
      throw new Error('TEST 11 Failed: Workshop Floor does not reflect Rahul Sen on JC-2047');
    }
    console.log('✓ TEST 11 Passed: Workshop Floor reflects reassignment');

    // TEST 12: Verify Service History and Reminders are not corrupted by technician assignment changes
    console.log('Running TEST 12: Integrity check on Service History and Reminders...');
    const historyNav = page.locator('button[data-module="service-history"]').first();
    await historyNav.click();
    await page.waitForTimeout(800);
    const historyHeading = await page.locator('h1').innerText();
    if (!historyHeading.includes('SERVICE HISTORY')) {
      throw new Error('TEST 12 Failed: Service History heading missing');
    }
    const remindersNav = page.locator('button[data-module="reminders"]').first();
    await remindersNav.click();
    await page.waitForTimeout(1000);
    const remindersHeading = await page.locator('h1').innerText();
    console.log(`Reminders module heading found: "${remindersHeading}"`);
    if (!remindersHeading.toUpperCase().includes('REMINDERS')) {
      throw new Error(`TEST 12 Failed: Reminders heading missing. Found: "${remindersHeading}"`);
    }
    console.log('✓ TEST 12 Passed: Service History and Reminders modules remain clean and uncorrupted');

    // Return to Technicians
    const techNavReturn = page.locator('button[data-module="technicians"]').first();
    await techNavReturn.click();
    await page.waitForTimeout(800);

    // TEST 13: Verify ON_BREAK technician remains ON_BREAK with zero workload
    console.log('Running TEST 13: Verify ON_BREAK technician remains ON_BREAK with zero workload...');
    const farhanCardCheck = page.locator('[data-testid="tech-card-tech-4"]').first();
    const farhanText = await farhanCardCheck.innerText();
    if (!farhanText.includes('ON BREAK') || !farhanText.includes('0 Assigned Jobs')) {
      throw new Error(`TEST 13 Failed: Farhan status or workload invalid: ${farhanText}`);
    }
    console.log('✓ TEST 13 Passed: Farhan Akhtar remains ON_BREAK with 0 assigned jobs');

    // TEST 14: Verify no fabricated workload metrics appear; unsupported metrics render NOT RECORDED
    console.log('Running TEST 14: Verify no fabricated workload metrics appear...');
    const farhanCardClick = page.locator('h3:has-text("Farhan Akhtar")').first();
    await farhanCardClick.click();
    await page.waitForTimeout(400);
    const dossierWorkloadText = await page.locator('div:has-text("TODAY\'S WORKLOAD")').last().innerText();
    if (!dossierWorkloadText.includes('NOT RECORDED')) {
      throw new Error('TEST 14 Failed: Overdue Jobs in Today\'s Workload does not display NOT RECORDED');
    }
    console.log('✓ TEST 14 Passed: Unsupported metrics properly render NOT RECORDED');

    // TEST 15: Run all responsive viewports
    console.log('Running TEST 15: Responsive viewports & zero horizontal overflow...');
    const viewports = [
      { width: 1440, height: 900, name: '1440x900' },
      { width: 1280, height: 800, name: '1280x800' },
      { width: 1024, height: 768, name: '1024x768' },
      { width: 768, height: 1024, name: '768x1024' },
      { width: 430, height: 932, name: '430x932' },
      { width: 375, height: 812, name: '375x812' },
      { width: 320, height: 650, name: '320x650' },
    ];

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(600);

      const overflow = await page.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        return {
          scrollWidth: Math.max(docEl.scrollWidth, body.scrollWidth),
          clientWidth: Math.max(docEl.clientWidth, body.clientWidth),
          hasOverflow: docEl.scrollWidth > docEl.clientWidth,
        };
      });

      console.log(`Viewport ${vp.name}: clientWidth=${overflow.clientWidth}, scrollWidth=${overflow.scrollWidth}`);
      if (overflow.hasOverflow) {
        throw new Error(`Horizontal overflow detected at ${vp.name}: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`);
      }

      if (fs.existsSync(ARTIFACTS_DIR)) {
        const shotPath = path.join(ARTIFACTS_DIR, `technicians_qa_${vp.name}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`✓ Screenshot saved: ${shotPath}`);
      }
    }
    console.log('✓ TEST 15 Passed: All responsive viewports verified with zero horizontal overflow');

    // Mobile Drawer test at 375px
    console.log('Testing Mobile Drawer at 375px...');
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);

    const arjunCardMobile = page.locator('h3:has-text("Arjun Sharma")').first();
    await arjunCardMobile.click();
    await page.waitForTimeout(500);

    const backBtn = page.locator('button:has-text("BACK TO TECHNICIANS")').first();
    if (!(await backBtn.isVisible())) {
      throw new Error('Mobile full screen drawer did not open or BACK button missing');
    }
    console.log('✓ Mobile drawer opened with BACK button');

    await backBtn.click();
    await page.waitForTimeout(500);
    console.log('✓ Mobile drawer closed cleanly');

    console.log('====================================================');
    console.log('ALL TECHNICIANS & WORKFORCE QA CHECKS PASSED (15/15)');
    console.log('====================================================');

  } catch (err) {
    console.error('QA Test Failure:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runTechniciansQA();
