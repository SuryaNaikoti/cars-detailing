import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 320, height: 800 } });
  await page.goto('http://localhost:5173/dashboard');
  await page.waitForTimeout(1000);

  const teamBtn = page.locator('button[data-module="team"]').first();
  await teamBtn.click();
  await page.waitForTimeout(800);

  const overflowInfo = await page.evaluate(() => {
    const parent = document.getElementById('team-permissions-page');
    if (!parent) return { error: 'No parent found' };
    const parentWidth = parent.clientWidth;
    const all = parent.querySelectorAll('*');
    const culprits = [];

    all.forEach(el => {
      if (el.scrollWidth > parentWidth) {
        culprits.push({
          tag: el.tagName,
          id: el.id,
          class: el.className,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          text: el.innerText ? el.innerText.slice(0, 30).replace(/\n/g, ' ') : ''
        });
      }
    });

    return {
      parentWidth,
      parentScrollWidth: parent.scrollWidth,
      culprits: culprits.slice(0, 10)
    };
  });

  console.log(JSON.stringify(overflowInfo, null, 2));
  await browser.close();
}

test().catch(console.error);
