import { chromium } from 'playwright';

/**
 * Automated Content Security QA Test:
 * Scans rendered customer quote pages for forbidden internal terms.
 * Blocks deployment (exits with non-zero code) if any forbidden terms are detected.
 */

const FORBIDDEN_TERMS = [
  { term: 'technician', regex: /\btechnician\b/i },
  { term: 'bay allocation', regex: /\bbay allocation\b/i },
  { term: 'requisition', regex: /\brequisition\b/i },
  { term: 'wholesale', regex: /\bwholesale\b/i },
  { term: 'margin', regex: /\bmargin\b/i },
  { term: 'internal note', regex: /\binternal\s+note[s]?\b/i },
  { term: 'cost price', regex: /\bcost\s+price\b/i },
  { term: 'dealer cost', regex: /\bdealer\s+cost\b/i },
];

const QUOTE_TOKENS = [
  'demo-quote-bmw',
  'demo-quote-merc',
  'demo-quote-porsche',
  'demo-quote-volvo',
  'demo-quote-audi',
  'demo-quote-bmw3',
];

async function scanPageForForbiddenTerms(page, urlLabel) {
  // Extract all text content from the rendered quote container
  const pageText = await page.evaluate(() => {
    // Exclude developer overlay or scripts if any, focus on main document body
    return document.body.innerText || '';
  });

  const violations = [];
  for (const { term, regex } of FORBIDDEN_TERMS) {
    const matches = pageText.match(new RegExp(regex, 'gi'));
    if (matches && matches.length > 0) {
      violations.push({ term, count: matches.length, matches });
    }
  }

  return violations;
}

async function runQuoteContentSecurityQA() {
  console.log('===========================================================');
  console.log('STARTING CUSTOMER QUOTE CONTENT SECURITY & LEAK AUDIT');
  console.log('===========================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  let totalViolations = 0;

  try {
    // 1. Reset storage to clean seeds
    console.log('\n--- STEP 1: Initializing Baseline State ---');
    await page.goto('http://localhost:5173/dashboard', { waitUntil: 'networkidle' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    // 2. Audit each quote token in default rendered state
    console.log('\n--- STEP 2: Scanning Public Customer Quote Views ---');
    for (const token of QUOTE_TOKENS) {
      const url = `http://localhost:5173/?page=quote&quoteToken=${token}`;
      await page.goto(url, { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      const h1Text = await page.locator('h1').innerText();
      console.log(`Auditing Quote: ${token} (${h1Text.trim()})`);

      const violations = await scanPageForForbiddenTerms(page, token);
      if (violations.length > 0) {
        console.error(`❌ SECURITY LEAK FOUND on ${token}:`);
        for (const v of violations) {
          console.error(`   - Forbidden term "${v.term}" detected ${v.count} time(s)`);
          totalViolations += v.count;
        }
      } else {
        console.log(`   ✓ Clean: 0 forbidden terms found.`);
      }
    }

    // 3. Test interactive states (Declining all, Authorizing scope)
    console.log('\n--- STEP 3: Testing Interactive Customer Action Copy ---');
    // Using demo-quote-porsche (pending)
    await page.goto('http://localhost:5173/?page=quote&quoteToken=demo-quote-porsche', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Click Authorize Full Scope
    const authorizeBtn = page.locator('button:has-text("Authorize Full Scope")');
    if (await authorizeBtn.isVisible()) {
      await authorizeBtn.click();
      await page.waitForTimeout(600);

      const actionViolations = await scanPageForForbiddenTerms(page, 'demo-quote-porsche [Actioned]');
      if (actionViolations.length > 0) {
        console.error(`❌ SECURITY LEAK FOUND in post-authorization confirmation text:`);
        for (const v of actionViolations) {
          console.error(`   - Forbidden term "${v.term}" detected ${v.count} time(s)`);
          totalViolations += v.count;
        }
      } else {
        console.log(`   ✓ Clean post-authorization action banner: 0 forbidden terms found.`);
      }
    }

    // 4. Test interactive Decline All on fresh load
    await page.goto('http://localhost:5173/?page=quote&quoteToken=demo-quote-audi', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    const declineBtn = page.locator('button:has-text("Decline All")');
    if (await declineBtn.isVisible()) {
      await declineBtn.click();
      await page.waitForTimeout(600);

      const declineViolations = await scanPageForForbiddenTerms(page, 'demo-quote-audi [Declined]');
      if (declineViolations.length > 0) {
        console.error(`❌ SECURITY LEAK FOUND in post-decline confirmation text:`);
        for (const v of declineViolations) {
          console.error(`   - Forbidden term "${v.term}" detected ${v.count} time(s)`);
          totalViolations += v.count;
        }
      } else {
        console.log(`   ✓ Clean post-decline action banner: 0 forbidden terms found.`);
      }
    }

    console.log('\n===========================================================');
    if (totalViolations > 0) {
      console.error(`❌ AUDIT FAILED: ${totalViolations} forbidden term occurrence(s) detected.`);
      console.error('BLOCKING DEPLOYMENT.');
      console.log('===========================================================');
      process.exit(1);
    } else {
      console.log('🎉 AUDIT PASSED: Customer quote portal is 100% sanitized.');
      console.log('Zero internal terms, notes, bay allocations, or technician references leak to customers.');
      console.log('===========================================================');
    }

  } catch (err) {
    console.error('Fatal execution error during quote security audit:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

runQuoteContentSecurityQA();
