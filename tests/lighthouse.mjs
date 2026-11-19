// Runs Lighthouse against the exported web build (served by tests/serve-web.mjs on :8099).
// Fails the run if any category score is under the threshold.
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from '@playwright/test';

const THRESHOLD = Number(process.env.LH_MIN || 0.9);
const BASE = 'http://localhost:8099';
const PAGES = (process.env.LH_PAGES || '/demo.html,/welcome').split(',');

const chromePath = chromium.executablePath();
const chrome = await chromeLauncher.launch({ chromePath, chromeFlags: ['--headless=new', '--no-sandbox'] });

let failed = false;
try {
  for (const path of PAGES) {
    const { lhr } = await lighthouse(`${BASE}${path}`, {
      port: chrome.port,
      output: 'json',
      logLevel: 'error',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      // LH_PRESET=desktop runs the desktop network and CPU profile. Default is mobile.
      ...(process.env.LH_PRESET === 'desktop' ? { preset: 'desktop' } : {}),
    });
    console.log(`\n${path}`);
    for (const cat of Object.values(lhr.categories)) {
      const score = Math.round((cat.score ?? 0) * 100);
      const ok = score / 100 >= THRESHOLD;
      if (!ok) failed = true;
      console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${cat.title.padEnd(16)} ${score}`);
    }
    for (const id of ['largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time']) {
      const a = lhr.audits[id];
      console.log(`        ${a.title}: ${a.displayValue ?? a.score}`);
    }
    const failing = Object.values(lhr.audits).filter((a) => a.score !== null && a.score < 1 && a.scoreDisplayMode === 'binary');
    for (const a of failing) console.log(`        audit: ${a.title}`);
  }
} finally {
  await chrome.kill();
}
console.log(`\nThreshold ${Math.round(THRESHOLD * 100)}: ${failed ? 'FAILED' : 'PASSED'}`);
process.exit(failed ? 1 : 0);
