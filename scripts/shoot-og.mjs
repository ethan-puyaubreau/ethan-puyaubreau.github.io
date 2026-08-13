// Render the OG card at exactly 1200x630 and write the PNG.
// Requires the preview server running on $OG_URL (default http://localhost:4321).
// Usage: node scripts/shoot-og.mjs
import { chromium } from "@playwright/test";

const base = process.env.OG_URL ?? "http://localhost:4321";

const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.goto(`${base}/og`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator(".og").screenshot({ path: "public/og.png" });
  console.log("wrote public/og.png");
} finally {
  await browser.close();
}
