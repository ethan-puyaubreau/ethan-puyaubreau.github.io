import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

// Bilingual blog. One Markdown file per language in a per-locale folder
// (src/content/blog/en/<slug>.md and fr/<slug>.md), paired by the `slug` field
// so /blog/<slug> (EN) and /fr/blog/<slug> (FR) are hreflang alternates. The
// route key is `slug`. House style: no em dashes in copy.
const blog = defineCollection({
  // generateId keeps the locale folder in the id (en/nbody-webgpu vs
  // fr/nbody-webgpu); the default collapses both to "nbody-webgpu" and one
  // silently overwrites the other.
  loader: glob({
    pattern: "**/*.md",
    base: "./src/content/blog",
    generateId: ({ entry }) => entry.replace(/\.md$/i, ""),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    /** Optional last-updated date; feeds dateModified in the article schema. */
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(["en", "fr"]),
    slug: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /** Override the canonical URL (defaults to the post's own URL on this site). */
    canonical: z.string().optional(),
  }),
});

export const collections = { blog };
