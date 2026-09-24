/**
 * French typography: the space before ; ! ? becomes a narrow no-break space,
 * the space before : and inside « » a no-break space, and the one between a
 * number and % likewise, so that punctuation never starts a line. Digit
 * groups are joined by a narrow no-break space (500 000) and the straight
 * apostrophe between letters becomes a typographic one; a number and its unit
 * (2,69 s, 777 J) stay on one line.
 * Shared by the French data (content, UI, cluster page) and, through the
 * remark plugin below, by the French blog posts.
 */

/** @param {string} text */
export function frenchSpacing(text) {
  return text
    .replace(/ ([;!?])/g, " $1")
    .replace(/ :/g, " :")
    .replace(/« /g, "« ")
    .replace(/ »/g, " »")
    .replace(/(\d) %/g, "$1 %")
    .replace(/(\d)[ \u00A0](?=\d{3}(?!\d))/g, "$1\u202F")
    .replace(/(\p{L})'(?=\p{L})/gu, "$1\u2019")
    .replace(/(\d) (?=(?:ms|s|min|h|J|kJ|W|kW|Mo|Go|To|°C)(?![\p{L}\d]))/gu, "$1\u00A0");
}

/**
 * Apply frenchSpacing to every string in a plain data tree.
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function withFrenchSpacing(value) {
  if (typeof value === "string") return /** @type {T} */ (frenchSpacing(value));
  if (Array.isArray(value)) return /** @type {T} */ (value.map(withFrenchSpacing));
  if (value && typeof value === "object") {
    return /** @type {T} */ (
      Object.fromEntries(Object.entries(value).map(([k, v]) => [k, withFrenchSpacing(v)]))
    );
  }
  return value;
}

// In raw HTML, only prose is touched: the text between tags and the alt,
// aria-label and title attributes; never markup, other attributes, or the
// inside of <pre>, <code>, <script> or <style>.
const HTML_TOKEN = /<(pre|code|script|style)\b[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi;
const PROSE_ATTR = /\b(alt|aria-label|title)="([^"]*)"/g;

/** @param {string} html */
function spaceHtml(html) {
  return html.replace(HTML_TOKEN, (m) => {
    if (!m.startsWith("<")) return frenchSpacing(m);
    if (/^<(pre|code|script|style)\b/i.test(m)) return m;
    return m.replace(PROSE_ATTR, (_, name, value) => `${name}="${frenchSpacing(value)}"`);
  });
}

/** Remark plugin: French spacing for posts under content/blog/fr/. */
export function remarkFrenchSpacing() {
  /** @param {any} tree @param {{ path?: string }} file */
  return (tree, file) => {
    const path = (file.path ?? "").replaceAll("\\", "/");
    if (!path.includes("/blog/fr/")) return;
    /** @param {any} node */
    const walk = (node) => {
      if (node.type === "text") node.value = frenchSpacing(node.value);
      else if (node.type === "html") node.value = spaceHtml(node.value);
      if (node.type !== "code" && node.type !== "inlineCode" && node.children) {
        node.children.forEach(walk);
      }
    };
    walk(tree);
  };
}
