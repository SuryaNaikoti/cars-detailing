import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1500);

  const teamNavBtn = page.locator('button[data-module="team"]').first();
  await teamNavBtn.click();
  await page.waitForTimeout(1000);

  const arjunCard = page.locator('div[data-testid="team-card-team-3"]');
  console.log('Arjun card count:', await arjunCard.count());
  await arjunCard.click();
  await page.waitForTimeout(1000);

  const dossierText = await page.locator('#team-member-dossier').innerText();
  console.log('--- DOSSIER TEXT ---');
  console.log(dossierText);

  const jobsData = await page.evaluate(() => {
    const raw = localStorage.getItem('te_workshop_jobs_v4');
    return raw ? Object.keys(JSON.parse(raw)) : 'null';
  });
  console.log('LocalStorage jobs keys:', jobsData);

  await browser.close();
}

test().catch(console.error);
