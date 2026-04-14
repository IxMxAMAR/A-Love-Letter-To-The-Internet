const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080';
const OUT = path.join(__dirname, 'screenshots');

const pages = [
  { name: '01-landing', url: '/', scroll: true },
  { name: '02-hub', url: '/hub.html' },
  { name: '03-scroll-animations', url: '/zones/scroll-animations.html', scroll: true },
  { name: '04-popover-dialog', url: '/zones/popover-dialog.html', scroll: true },
  { name: '05-css-art', url: '/zones/css-art.html', scroll: true },
  { name: '06-container-queries', url: '/zones/container-queries.html', scroll: true },
  { name: '07-view-transitions', url: '/zones/view-transitions.html', scroll: true },
  { name: '08-houdini', url: '/zones/houdini.html', scroll: true },
  { name: '09-has-selector', url: '/zones/has-selector.html', scroll: true },
  { name: '10-cascade-layers', url: '/zones/cascade-layers.html', scroll: true },
  { name: '11-playground', url: '/playground.html' },
  { name: '12-components', url: '/components.html', scroll: true },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
  });

  for (const pg of pages) {
    const page = await context.newPage();
    console.log(`Capturing ${pg.name}...`);

    try {
      await page.goto(BASE + pg.url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000); // let animations settle

      // Full page screenshot
      await page.screenshot({
        path: path.join(OUT, `${pg.name}-full.png`),
        fullPage: true,
      });

      // Viewport-only hero shot
      await page.screenshot({
        path: path.join(OUT, `${pg.name}-hero.png`),
        fullPage: false,
      });

      // If scrollable, capture mid-page and bottom
      if (pg.scroll) {
        const height = await page.evaluate(() => document.body.scrollHeight);

        // Scroll to middle
        await page.evaluate((h) => window.scrollTo(0, h * 0.4), height);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(OUT, `${pg.name}-mid.png`),
          fullPage: false,
        });

        // Scroll to bottom
        await page.evaluate((h) => window.scrollTo(0, h), height);
        await page.waitForTimeout(500);
        await page.screenshot({
          path: path.join(OUT, `${pg.name}-bottom.png`),
          fullPage: false,
        });
      }

      console.log(`  ✓ ${pg.name} done`);
    } catch (err) {
      console.error(`  ✗ ${pg.name} failed: ${err.message}`);
    }

    await page.close();
  }

  await browser.close();
  console.log(`\nAll screenshots saved to ${OUT}`);
})();
