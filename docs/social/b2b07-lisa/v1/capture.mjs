#!/usr/bin/env node
// Read-only screenshot capture from the public product; no login or mutations.
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
const { chromium } = createRequire('/srv/orbital/workspaces/Content-Factory/package.json')('playwright');
await mkdir(join(dir, 'assets'), { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const report = [];
try {
  for (const spec of [
    { name: 'lisa-landing-desktop', url: 'https://www.localisa.pe/', width: 1440, height: 960, mobile: false },
    { name: 'lisa-landing-mobile', url: 'https://www.localisa.pe/', width: 390, height: 844, mobile: true },
    { name: 'lisa-map-desktop-live', url: 'https://www.localisa.pe/map', width: 1440, height: 1000, mobile: false },
    { name: 'lisa-map-mobile-live', url: 'https://www.localisa.pe/map', width: 390, height: 844, mobile: true },
  ]) {
    const page = await browser.newPage({
      viewport: { width: spec.width, height: spec.height },
      deviceScaleFactor: 1,
      isMobile: spec.mobile,
      hasTouch: spec.mobile,
      locale: 'es-PE',
    });
    let status = 0; let error = '';
    try {
      const response = await page.goto(spec.url, {waitUntil: 'domcontentloaded', timeout: 25000});
      status = response?.status() || 0;
      await page.waitForTimeout(5000);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(dir, 'assets', spec.name + '.png'), fullPage: false, animations: 'disabled' });
      const evidence = await page.evaluate(() => ({
        title: document.title,
        text: document.body?.innerText.slice(0, 450) || '',
        viewport: { w: innerWidth, h: innerHeight },
        brokenImages: [...document.images].filter(i => !i.complete || i.naturalWidth === 0).length
      }));
      report.push({ ...spec, status, evidence, file: 'assets/' + spec.name + '.png', at: new Date().toISOString() });
    } catch(e) { error = String(e.message); report.push({...spec, status, error}); }
    finally { await page.close(); }
  }
} finally { await browser.close(); }
await writeFile(join(dir,'capture-evidence.json'), JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report, null, 2));
