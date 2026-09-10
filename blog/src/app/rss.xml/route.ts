import { getPublishedPosts } from "@/lib/posts";
import { getTagsForPosts } from "@/lib/services/tags";
import { siteConfig } from "@/lib/site";
import { postPath } from "@/lib/taxonomy";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPublishedPosts();
  const tagsByPost = await getTagsForPosts(posts.map((post) => post.id));

  const items = posts
    .map((post) => {
      const url = `${siteConfig.url}${postPath(post)}`;
      const categories = (tagsByPost.get(post.id) ?? [])
        .map((tag) => `\n      <category>${escapeXml(tag.name)}</category>`)
        .join("");
      return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>${categories}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(siteConfig.name)}</title>
    <link>${siteConfig.url}</link>
    <description>${escapeXml(siteConfig.description)}</description>
    <language>ko-kr</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
