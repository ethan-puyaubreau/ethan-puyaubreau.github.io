/**
 * i18n primitives. English at `/`, French at `/fr/` (see astro.config.mjs).
 *
 * The locale is derived from the route via `Astro.currentLocale`; everything
 * user-facing is resolved through the typed `getContent`/`getSite`/`getUI`
 * accessors so there is one source of truth per language and no English can
 * leak into the French page. (House style: no em dashes anywhere in copy.)
 */

export const LOCALES = ["en", "fr"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** BCP 47 tag for `<html lang>` / `og:locale`. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
};
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  fr: "fr_FR",
};

/** Narrow an unknown value (e.g. `Astro.currentLocale`) to a supported locale. */
export function toLocale(value: string | undefined): Locale {
  return value === "fr" ? "fr" : DEFAULT_LOCALE;
}

/** Path prefix for a locale: "" for the default, "/fr" otherwise. */
export function localePrefix(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "" : `/${locale}`;
}

/**
 * The home path for a locale: "/" for EN, "/fr" for FR.
 * No trailing slash on the prefixed locale: the site runs trailingSlash: "never"
 * (astro.config.mjs), so "/fr/" would 404. The conceptual home is still /fr/.
 */
export function localeHome(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/" : `/${locale}`;
}

/** The blog index for a locale: "/blog" or "/fr/blog". */
export function blogHome(locale: Locale): string {
  return locale === DEFAULT_LOCALE ? "/blog" : `/${locale}/blog`;
}

/** A blog post URL for a locale: "/blog/<slug>" or "/fr/blog/<slug>". */
export function blogPost(locale: Locale, slug: string): string {
  return locale === DEFAULT_LOCALE ? `/blog/${slug}` : `/${locale}/blog/${slug}`;
}

/** localStorage key the language switch and the first-visit detector share. */
export const LOCALE_STORAGE_KEY = "site.locale";

/** Routes that exist in both locales, so they get a canonical + hreflang pair. */
export const PAIRED_ROUTES: readonly string[] = ["/", "/cluster"];

/**
 * Strip Astro.url.pathname down to the clean, extensionless route. Under
 * `build.format: "file"` (needed for GitHub Pages, see astro.config.mjs),
 * Astro.url.pathname carries the on-disk ".html" suffix (e.g.
 * "/blog/nbody-webgpu.html", "/index.html" for the root); every consumer of
 * the pathname needs the logical route instead.
 */
export function cleanPathname(pathname: string): string {
  return pathname.replace(/(?:\/index)?\.html$/, "") || "/";
}

/** Locale-agnostic logical path: strip the /fr prefix and any trailing slash. */
export function logicalPath(pathname: string): string {
  const clean = cleanPathname(pathname);
  return clean.replace(/^\/fr(?=\/|$)/, "").replace(/\/$/, "") || "/";
}

/**
 * Whether a logical path exists in both locales (canonical + hreflang). Covers
 * the fixed PAIRED_ROUTES plus the blog index and every blog post, which are
 * generated in both locales from the same slug.
 */
export function isPairedPath(logical: string): boolean {
  return PAIRED_ROUTES.includes(logical) || logical === "/blog" || logical.startsWith("/blog/");
}
