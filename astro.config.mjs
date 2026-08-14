import { defineConfig } from "astro/config";
import vue from "@astrojs/vue";
import sitemap from "@astrojs/sitemap";
import { SITE_ORIGIN } from "./site.config.mjs";

// Static-first: Astro ships zero JS by default; Vue runs only inside the
// interactive islands (hero, command palette, cluster panels).
// https://astro.build/config
export default defineConfig({
  site: SITE_ORIGIN,
  output: "static",
  trailingSlash: "never",
  // Astro's default build.format is "directory" (path/index.html), which GitHub
  // Pages 301-redirects an extensionless request to its trailing-slash form
  // when it finds the directory. Under trailingSlash: "never" that would send
  // every canonical/hreflang URL through a redirect it was never built for.
  // "file" emits path.html and serves it directly at the extensionless URL.
  build: {
    format: "file",
    inlineStylesheets: "auto",
    assets: "_assets",
  },
  // Two posts were renamed when the machine codenames were dropped from the
  // site. Both URLs were in the published sitemap, so they get redirects
  // rather than 404s. Static output emits a meta-refresh page with a canonical
  // link, which is what GitHub Pages can serve.
  redirects: {
    "/blog/ultron-debian-nvidia": "/blog/gpu-debian-nvidia",
    "/fr/blog/ultron-debian-nvidia": "/fr/blog/gpu-debian-nvidia",
    "/blog/sentinel-status-page": "/blog/status-page-zero-js",
    "/fr/blog/sentinel-status-page": "/fr/blog/status-page-zero-js",
  },
  // English at /, French at /fr/. The default locale is not prefixed.
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr"],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    vue(),
    // i18n: emit hreflang alternates per page; keep /og out of the sitemap.
    sitemap({
      i18n: { defaultLocale: "en", locales: { en: "en", fr: "fr" } },
      filter: (page) => !page.includes("/og"),
    }),
  ],
  prefetch: {
    defaultStrategy: "hover",
  },
});
