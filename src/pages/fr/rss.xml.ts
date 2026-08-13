import rss from "@astrojs/rss";
import { getCollection, type CollectionEntry } from "astro:content";
import type { APIContext } from "astro";
import { site } from "../../lib/site";
import { getUI } from "../../lib/ui";
import { blogPost } from "../../lib/i18n";

type Post = CollectionEntry<"blog">;

export async function GET(context: APIContext) {
  const ui = getUI("fr");
  const posts = (
    await getCollection("blog", (p: Post) => p.data.lang === "fr" && !p.data.draft)
  ).sort((a: Post, b: Post) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
  return rss({
    title: `${site.name} · ${ui.blog.indexTitle}`,
    description: ui.blog.metaDescription,
    site: context.site ?? site.url,
    items: posts.map((p: Post) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.pubDate,
      // Absolute, no trailing slash, to match canonical (trailingSlash: never).
      link: new URL(blogPost("fr", p.data.slug), context.site ?? site.url).href,
    })),
  });
}
