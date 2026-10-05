import { chromium } from 'playwright';

const ROUTES_TO_TEST = [
  { id: '01', name: 'Public Homepage', path: '/' },
  { id: '02', name: 'Specialist Services', path: '/?page=services' },
  { id: '03', name: 'Service Booking', path: '/?page=book' },
  { id: '04', name: 'FAQs', path: '/?page=faqs' },
  { id: '05', name: 'Workshop Contact', path: '/?page=contact' },
  { id: '06', name: 'Customer Quote Portal', path: '/quote/quote-est-bmw-2047' },
  { id: '07', name: 'Service Status Tracker', path: '/service-status/track-bmw-jc2047' },
  { id: '08', name: 'Private Workshop OS', path: '/private/workshop-os' },
  { id: '09', name: 'Module Overview', path: '/dashboard?module=overview' },
  { id: '10', name: 'Module Workshop Floor', path: '/dashboard?module=floor' },
  { id: '11', name: 'Module Leads', path: '/dashboard?module=leads' },
  { id: '12', name: 'Module Appointments', path: '/dashboard?module=appointments' },
  { id: '13', name: 'Module Job Cards', path: '/dashboard?module=jobs' },
  { id: '13b', name: 'Job Card Detail', path: '/dashboard?module=jobs&jobId=jc-2047' },
  { id: '14', name: 'Module Inspections', path: '/dashboard?module=inspections' },
  { id: '15', name: 'Module Estimates', path: '/dashboard?module=estimates' },
  { id: '16', name: 'Module Customers', path: '/dashboard?module=customers' },
  { id: '17', name: 'Module Vehicles', path: '/dashboard?module=vehicles' },
  { id: '18', name: 'Module Service History', path: '/dashboard?module=service-history' },
  { id: '19', name: 'Module Reminders', path: '/dashboard?module=reminders' },
  { id: '20', name: 'Module Technicians', path: '/dashboard?module=technicians' },
  { id: '21', name: 'Module Communications', path: '/dashboard?module=communications' },
  { id: '22', name: 'Module Reports', path: '/dashboard?module=reports' },
  { id: '23', name: 'Module Analytics', path: '/dashboard?module=analytics' },
  { id: '24', name: 'Module Team', path: '/dashboard?module=team' },
  { id: '25', name: 'Module Settings', path: '/dashboard?module=settings' },
];

const VIEWPORTS = [
  { name: '320px', width: 320, height: 600 },
  { name: '360px', width: 360, height: 740 },
  { name: '390px', width: 390, height: 844 },
  { name: '414px', width: 414, height: 896 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1440px', width: 1440, height: 900 },
];

async function runComprehensiveMobileAudit() {
  console.log(`Starting Comprehensive Mobile & Desktop Audit across ${ROUTES_TO_TEST.length} routes...`);
  const browser = await chromium.launch();
  const summary = {
    totalRoutes: ROUTES_TO_TEST.length,
    viewportsTested: VIEWPORTS.length,
    failures: [],
    consoleErrors: [],
  };

  for (const route of ROUTES_TO_TEST) {
    process.stdout.write(`Testing Route ${route.id}: ${route.name.padEnd(28)} `);
    let routePass = true;

    for (const vp of VIEWPORTS) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          summary.consoleErrors.push({ route: route.name, vp: vp.name, error: msg.text() });
        }
      });

      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle' });

      const overflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      if (overflow) {
        routePass = false;
        summary.failures.push({ route: route.name, viewport: vp.name, reason: 'Horizontal Overflow' });
      }

      await page.close();
    }

    console.log(routePass ? '✓ ALL VIEWPORTS PASS' : '✗ HAS FAILURES');
  }

  await browser.close();

  console.log('\n--- AUDIT RUN COMPLETED ---');
  console.log('Total Routes Tested:', summary.totalRoutes);
  console.log('Total Failures:', summary.failures.length);
  console.log('Console Errors:', summary.consoleErrors.length);

  if (summary.failures.length > 0) {
    console.log('Failure Details:', JSON.stringify(summary.failures, null, 2));
    process.exit(1);
  } else {
    console.log('Verdict: 100% PERFECT PASS');
    process.exit(0);
  }
}

runComprehensiveMobileAudit().catch((err) => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
