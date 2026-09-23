/**
 * French typography: the space before ; ! ? becomes a narrow no-break space,
 * the space before : and inside « » a no-break space, and the one between a
 * number and % likewise, so that punctuation never starts a line.
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
    .replace(/(\d) %/g, "$1 %");
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

// In raw HTML, only the text between tags is touched: never a tag, an
// attribute, or the inside of <pre>, <code>, <script> or <style>.
const HTML_TOKEN = /<(pre|code|script|style)\b[\s\S]*?<\/\1>|<[^>]+>|[^<]+/gi;

/** @param {string} html */
function spaceHtml(html) {
  return html.replace(HTML_TOKEN, (m) => (m.startsWith("<") ? m : frenchSpacing(m)));
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
