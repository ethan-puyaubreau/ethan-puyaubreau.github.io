// Pages are built as files (/fr -> fr.html). GitHub Pages answers /fr/ with a 404,
// so every page is also written as <name>/index.html. Its canonical link still points
// to the slash-less URL.
import { copyFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("dist");

async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(full);
    } else if (entry.name.endsWith(".html") && entry.name !== "index.html") {
      if (dir === dist && entry.name === "404.html") continue;
      const target = path.join(dir, entry.name.slice(0, -".html".length), "index.html");
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(full, target);
    }
  }
}

await walk(dist);
