import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
const destination = path.resolve('../docs/figma-rebuild/screenshots');
await fs.mkdir(destination, {recursive: true});
const browser = await chromium.launch({headless: true});
const results = [];
try {
  for (const width of [360, 390, 768, 1024, 1440, 1920]) {
    const page = await browser.newPage({viewport: {width, height: 1080}});
    for (const route of ['/', '/home-2', '/home-3', '/about', '/about-us', '/our-team', '/review', '/shop', '/products/classic-pistachio-gelato', '/cart', '/checkout', '/wishlist', '/contact', '/faqs', '/special-offers', '/thankyou', '/blog', '/login', '/register', '/admin/login']) {
      const errors = [];
      const onError = error => errors.push(error.message);
      page.on('pageerror', onError);
      const response = await page.goto(`http://localhost:3000${route}`, {waitUntil: 'networkidle'});
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 800) { window.scrollTo(0, y); await new Promise(resolve => setTimeout(resolve, 50)); }
        window.scrollTo(0, 0);
        await document.fonts.ready;
      });
      await page.waitForTimeout(700);
      await page.evaluate(async () => {
        // Carousel slides outside the clipped viewport are intentionally lazy.
        // Load them explicitly so this audit checks assets, not lazy-load timing.
        for (const img of document.images) img.loading = 'eager';
        await Promise.race([
          Promise.allSettled([...document.images].map(img => img.decode())),
          new Promise(resolve => setTimeout(resolve, 15000)),
        ]);
      });
      const state = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(img => img.getClientRects().length && (!img.complete || !img.naturalWidth)).map(img => img.getAttribute('src')),
      }));
      await page.screenshot({path: path.join(destination, `${route.replaceAll('/', '') || 'home'}-${width}.png`), fullPage: true});
      results.push({route, width, status: response.status(), ...state, errors});
      page.off('pageerror', onError);
      console.log(JSON.stringify(results.at(-1)));
    }
    await page.close();
  }
} finally {
  await browser.close();
  await fs.writeFile(path.join(destination, 'audit.json'), JSON.stringify(results, null, 2));
}
