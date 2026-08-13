import { test, expect } from "@playwright/test";

// Smoke tests for the standalone engineer site (ethan-puyaubreau.github.io).
// Home is at / (+ /fr); the cluster case study at /cluster; the blog at /blog.
// This site names one identity only: no chooser, no second persona, no
// mention of the creator side, anywhere.

// ---------- Identity: this site names one person, one way ----------
test("no trace of the other identity, anywhere in the built site", async ({ page }) => {
  for (const path of ["/", "/fr", "/cluster", "/fr/cluster", "/blog", "/fr/blog", "/404"]) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    const html = await page.content();
    expect(html.toLowerCase(), `${path} mentions the other identity`).not.toContain("kerboul");
  }
});

test("home: masthead and the five case studies render", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page).toHaveTitle(/Ethan Puyaubreau/);
  await expect(page.locator("#work")).toBeVisible();
  await expect(page.locator("#expertise")).toBeVisible();
  await expect(page.locator("#about")).toBeVisible();
  await expect(page.locator("#contact")).toBeVisible();
  await expect(page.locator("#work article.case")).toHaveCount(5);
});

test("home: hero island mounts (live canvas or graceful fallback)", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const status = page.locator("#top canvas, #top [data-status]").first();
  await expect(status).toBeVisible();
});

test("home FR renders in French and the lang switch points to /fr", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.locator('.lang a[data-locale="fr"]').click();
  await expect(page).toHaveURL(/\/fr$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "fr");
});

test("command palette opens and closes", async ({ page }) => {
  await page.goto("/", { waitUntil: "load" });
  const trigger = page.locator("button.trigger");
  await expect(trigger).toBeVisible();
  // client:idle: the click handler attaches once Vue hydrates on idle, not
  // necessarily by "load".
  await expect(async () => {
    await trigger.click();
    await expect(page.locator('.palette[role="dialog"]')).toBeVisible({ timeout: 500 });
  }).toPass({ timeout: 5000 });
  await page.keyboard.press("Escape");
  await expect(page.locator('.palette[role="dialog"]')).toBeHidden();
});

test("CV download link is locale-specific", async ({ page }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/Ethan-Puyaubreau-CV.pdf"]')).toBeVisible();
  await page.goto("/fr", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/Ethan-Puyaubreau-CV-FR.pdf"]')).toBeVisible();
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
  await expect(page).toHaveTitle(/sentinel cluster/i);
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
  expect(requests.some((u) => u.includes("kerboul.me"))).toBe(false);
});

test("cluster page renders the request path and the deploy pipeline", async ({ page }) => {
  await page.goto("/cluster", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#path .station")).toHaveCount(6);
  await expect(page.locator("#pipeline .stage")).toHaveCount(3);
});

test("cluster constellation canvas mounts", async ({ page }) => {
  await page.goto("/cluster", { waitUntil: "load" });
  await page.waitForTimeout(800);
  await expect(page.locator("canvas.field-canvas")).toBeVisible();
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
  expect(xml).toContain("<loc>https://ethan-puyaubreau.github.io</loc>");
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

test("header: with 5 sections the nav retires to the palette and the bar never wraps", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1300, height: 900 });
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.locator("#site-header .sections")).toBeHidden();
});

// ---------- 404 ----------
test("the 404 page points back to home and names the real identity", async ({ page }) => {
  await page.goto("/does-not-exist", { waitUntil: "domcontentloaded" });
  await expect(page.locator('a[href="/"]')).toBeVisible();
  await expect(page).toHaveTitle(/Ethan Puyaubreau/);
});
