import { test, expect } from '@playwright/test';

test('Verify Inspections V3.6.1 Data Integrity and UX', async ({ page }) => {
  // Clear localStorage before testing to ensure fresh seed data
  await page.goto('http://localhost:5173/dashboard');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  await page.waitForLoadState('networkidle');

  // Navigate to Inspections
  const inspectionsNav = page.locator('button:has-text("Inspections"), a:has-text("Inspections")').first();
  await inspectionsNav.click();

  await page.waitForTimeout(1000);

  // Take screenshot of inspections main view
  await page.screenshot({ path: 'test-results/inspections-main.png', fullPage: true });

  // 1. Data lineage: check queue cards for real vehicles & reg numbers
  const bodyText = await page.locator('body').innerText();
  console.log('Queue text preview...');
  
  // Verify vehicles exist in queue
  expect(bodyText).toContain('BMW 5 Series');
  expect(bodyText).toContain('MH 02 ER 4500');
  expect(bodyText).toContain('Mercedes C-Class');
  expect(bodyText).toContain('MH 01 DK 8812');
  expect(bodyText).toContain('Porsche Macan GTS');
  expect(bodyText).toContain('MH 04 BK 9000');
  expect(bodyText).toContain('Volvo XC60');
  expect(bodyText).toContain('MH 02 CZ 5510');
  expect(bodyText).toContain('Audi A6 Matrix');
  expect(bodyText).toContain('MH 02 BG 3311');

  // Verify NO "Vehicle Unspecified" or "No Reg"
  expect(bodyText).not.toContain('Vehicle Unspecified');
  expect(bodyText).not.toContain('No Reg');

  // 2. Check KPI strip
  const activeKpi = page.locator('text=ACTIVE').first();
  await expect(activeKpi).toBeVisible();

  // Test KPI toggle filter
  await activeKpi.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/inspections-kpi-active-filter.png' });
  
  // Click again to clear
  await activeKpi.click();
  await page.waitForTimeout(500);

  // 3. Inspect Dossier for INS-3047 (BMW 5 Series)
  const bmwCard = page.locator('text=MH 02 ER 4500').first();
  await bmwCard.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/inspections-dossier.png' });

  // Verify Dossier Hierarchy
  const dossierText = await page.locator('body').innerText();
  expect(dossierText).toContain('INS-3047');
  expect(dossierText).toContain('JC-2047');
  expect(dossierText).toContain('Rahul Mehta');
  expect(dossierText).toContain('34,250 km');
  expect(dossierText).toContain('OPEN JOB CARD →');
  expect(dossierText).toContain('OPEN VEHICLE →');
  expect(dossierText).toContain('CONDITION SUMMARY');
  expect(dossierText).toContain('FINDINGS REQUIRING ACTION');
  expect(dossierText).toContain('RECOMMENDATIONS');
  expect(dossierText).toContain('DVI CHECKLIST');

  // Smart accordion: verify Brakes or Suspension or AC is open
  expect(dossierText).toContain('BRAKES');
  expect(dossierText).toContain('checked');

  // Test Review Recommendations modal
  const reviewRecsBtn = page.locator('button:has-text("REVIEW RECOMMENDATIONS →"), button:has-text("REVIEW ESTIMATE →")').first();
  if (await reviewRecsBtn.isVisible()) {
    await reviewRecsBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/inspections-recommendations-modal.png' });
    const modalText = await page.locator('body').innerText();
    expect(modalText).toContain('RECOMMENDATIONS FOR ESTIMATE');
    // Close modal
    const closeBtn = page.locator('button:has-text("CLOSE"), button:has-text("✕")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  // Test Customer View modal
  const customerViewBtn = page.locator('button:has-text("CUSTOMER VIEW"), button:has-text("OPEN CUSTOMER VIEW")').first();
  if (await customerViewBtn.isVisible()) {
    await customerViewBtn.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'test-results/inspections-customer-view.png' });
    const custText = await page.locator('body').innerText();
    expect(custText).toContain('BMW 5 Series');
    expect(custText).toContain('MH 02 ER 4500');
    // Close customer modal
    const closeBtn = page.locator('button:has-text("CLOSE"), button:has-text("✕")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
  }

  // 4. Mobile responsiveness check
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/inspections-mobile-375.png' });

  // On mobile, tap on a card and check drawer with BACK TO INSPECTIONS
  const mobileCard = page.locator('text=MH 02 ER 4500').first();
  await mobileCard.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/inspections-mobile-dossier.png' });
  const mobileDossierText = await page.locator('body').innerText();
  expect(mobileDossierText).toContain('BACK TO INSPECTIONS');

  // Test 320px width
  await page.setViewportSize({ width: 320, height: 650 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'test-results/inspections-mobile-320.png' });

  console.log('All Playwright assertions PASSED successfully!');
});
