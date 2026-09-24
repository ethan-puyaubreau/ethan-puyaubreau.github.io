import { createHash } from "node:crypto";
import { test, expect } from "@playwright/test";
import { frenchSpacing } from "../src/lib/french-spacing.mjs";

// Smoke tests for the standalone engineer site (ethan-puyaubreau.github.io).
// Home is at / (+ /fr); the cluster case study at /cluster; the blog at /blog.

// Words that must never appear on the built site, stored as SHA-256 digests so
// the list itself does not publish them.
const DENYLIST = new Set([
  "41a628ea8021cac05f6c865b77787c2391648470f7e9d9c23a8b34b306104c49",
  "8ad644d22d7b775abd8a1d5dd87226740608c14974d99ad1f375dca108ccf4b5",
]);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");
const deniedWords = (text: string) =>
  [...new Set(text.toLowerCase().match(/[a-z0-9]+/g) ?? [])].filter((w) => DENYLIST.has(sha256(w)));

// ---------- Denylist ----------
test("no denylisted word anywhere in the built site", async ({ page }) => {
  for (const path of ["/", "/fr", "/cluster", "/fr/cluster", "/blog", "/fr/blog", "/404"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(deniedWords(await page.content()), path).toEqual([]);
  }
});

test("home: masthead and the five case studies render", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Ethan Puyaubreau/);
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("#work article.case")).toHaveCount(2);
});

test("home: the hero draws both measured traces with their energy", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const chart = page.locator("#top");
  await expect(chart.locator("svg.trace-wide")).toBeVisible();
  await expect(chart.locator(".panel")).toHaveCount(4);
  await expect(chart.locator(".trace-wide .joules")).toHaveText(["769\u00A0J", "569\u00A0J"]);
});

test("home FR renders in French and the lang switch points to /fr", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator('.lang a[data-locale="fr"]').click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("home: every page ships without client-side hydration on the hero", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator("#top astro-island")).toHaveCount(0);
});

test("CV download link is locale-specific", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('#top a[href="/Ethan-Puyaubreau-CV.pdf"]')).toBeVisible();
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await expect(page.locator('#top a[href="/Ethan-Puyaubreau-CV-FR.pdf"]')).toBeVisible();
});

test("no console errors on the home page", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  expect(errors, errors.join("\n")).toEqual([]);
});

// ---------- Cluster: a build-time snapshot, not a live feed ----------
test("cluster page renders the hero, five node cards, and the stack", async ({ page }) => {
  await page.goto("/cluster", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/homelab cluster/i);
  await expect(page.locator("#nodes article.node")).toHaveCount(5);
  await expect(page.locator("#stack")).toBeVisible();
});

// The nodes render synchronously from the committed snapshot: no loading spinner,
// no network request, unlike the old live-polling version of this page.
test("cluster nodes render immediately from the static snapshot", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/cluster", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#nodes article.node .val").first()).toBeVisible();
  expect(requests.filter((u) => new URL(u).origin !== new URL(page.url()).origin)).toEqual([]);
});

test("cluster page renders the request path and the deploy pipeline", async ({ page }) => {
  await page.goto("/cluster", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#path .station")).toHaveCount(6);
  await expect(page.locator("#pipeline .stage")).toHaveCount(3);
});

test("french cluster page renders in French", async ({ page }) => {
  await page.goto("/fr/cluster", { waitUntil: "domcontentloaded" });
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("no console errors on the cluster page", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/cluster", { waitUntil: "load" });
  await page.waitForTimeout(1200);
  expect(errors, errors.join("\n")).toEqual([]);
});

// ---------- Blog (bilingual, canonical + hreflang) ----------
test("blog index lists posts and links to one", async ({ page }) => {
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/blog/nbody-webgpu"]')).toBeVisible();
});

test("blog post renders with canonical and a French hreflang alternate", async ({ page }) => {
  await page.goto("/blog/nbody-webgpu", { waitUntil: "domcontentloaded" });
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://ethan-puyaubreau.github.io/blog/nbody-webgpu",
  );
  await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute(
    "href",
    "https://ethan-puyaubreau.github.io/fr/blog/nbody-webgpu",
  );
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(2);
});

test("blog: an unknown slug returns 404", async ({ page }) => {
  const r = await page.request.get("/blog/this-does-not-exist");
  expect(r.status()).toBe(404);
});

test("blog: draft posts are excluded from index and direct routes", async ({ page }) => {
  await page.goto("/blog", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/blog/sample-draft"]')).toHaveCount(0);
  const r = await page.request.get("/blog/sample-draft");
  expect(r.status()).toBe(404);
});

test("rss feeds build for both locales", async ({ page }) => {
  const en = await page.request.get("/rss.xml");
  expect(en.headers()["content-type"]).toMatch(/xml/);
  const fr = await page.request.get("/fr/rss.xml");
  expect(fr.headers()["content-type"]).toMatch(/xml/);
});

// ---------- SEO: canonical + hreflang on every paired route, real discovery ----------
test("paired routes emit a canonical and a French hreflang", async ({ page }) => {
  for (const path of ["/", "/cluster"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveCount(1);
  }
});

test("no page is noindexed and the sitemap lists the real routes", async ({ page }) => {
  for (const path of ["/", "/cluster", "/blog"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
  }
  const r = await page.request.get("/sitemap-0.xml");
  expect(r.ok()).toBeTruthy();
  const xml = await r.text();
  // The origin with or without its trailing slash: the same URL.
  expect(xml).toMatch(/<loc>https:\/\/ethan-puyaubreau\.github\.io\/?<\/loc>/);
  expect(xml).toContain("ethan-puyaubreau.github.io/cluster");
  expect(xml).toContain("ethan-puyaubreau.github.io/blog");
});

test("robots.txt allows crawling and points at the sitemap", async ({ page }) => {
  const r = await page.request.get("/robots.txt");
  const body = await r.text();
  expect(body).toContain("Allow: /");
  expect(body).toContain("Sitemap: https://ethan-puyaubreau.github.io/sitemap-index.xml");
});

// ---------- Header ----------
test("the header exposes a persistent, locale-aware Blog link", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('.navlink[href="/blog"]')).toBeVisible();
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await expect(page.locator('.navlink[href="/fr/blog"]')).toBeVisible();
});

test("header: section links show on desktop and hide on phones", async ({ page }) => {
  await page.setViewportSize({ width: 1300, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#site-header .sections a")).toHaveCount(3);
  await expect(page.locator("#site-header .sections")).toBeVisible();
  await page.setViewportSize({ width: 600, height: 900 });
  await expect(page.locator("#site-header .sections")).toBeHidden();
});

// ---------- 404 ----------
// A phone widens its layout viewport to fit the widest element, which pushes
// the header controls off screen: innerWidth must stay at the device width.
test.describe("phones", () => {
  test.use({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true });
  test("no page is wider than a 360px screen", async ({ page }) => {
    for (const path of ["/", "/fr", "/cluster", "/fr/cluster", "/blog", "/fr/blog"]) {
      await page.goto(path, { waitUntil: "load" });
      expect(await page.evaluate(() => window.innerWidth), path).toBe(360);
    }
  });
});

// French punctuation (; : ! ? and the inside of « ») takes a no-break space, so
// it never lands at the start of a line. Code blocks keep their plain spaces.
test("French pages use no-break spaces before double punctuation", async ({ page }) => {
  for (const path of ["/fr", "/fr/cluster", "/fr/blog", "/fr/blog/kokkos-gpu-energy"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const breaking = await page.evaluate(() => {
      const main = document.body.cloneNode(true) as HTMLElement;
      main.querySelectorAll("pre, code, script, style").forEach((el) => el.remove());
      return (main.textContent ?? "").match(/.{0,20} [;:!?»].{0,10}/g) ?? [];
    });
    expect(breaking, path).toEqual([]);
  }
});

// Reveal-on-scroll must not strand a block that is taller than the viewport:
// a ratio threshold is never reached by a long article body.
test("posts are visible without any reveal script", async ({ page }) => {
  await page.goto("/blog/kokkos-gpu-energy", { waitUntil: "load" });
  const prose = page.locator(".prose");
  await prose.scrollIntoViewIfNeeded();
  await expect(prose).toHaveCSS("opacity", "1");
});

test("the 404 page points back to home", async ({ page }) => {
  await page.goto("/does-not-exist", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/"]')).toBeVisible();
  await expect(page).toHaveTitle(/Ethan Puyaubreau/);
});

test("french typography helper", () => {
  expect(frenchSpacing("2,69 s et 777 J en 2 semaines")).toBe(
    "2,69\u00A0s et 777\u00A0J en 2 semaines",
  );
  expect(frenchSpacing("500 000 lignes d'outils : 19 %")).toBe(
    "500\u202F000 lignes d\u2019outils\u00A0: 19\u00A0%",
  );
});
