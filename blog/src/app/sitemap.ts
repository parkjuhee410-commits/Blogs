import type { MetadataRoute } from "next";

import { getAllTags, getPublishedPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags] = await Promise.all([
    getPublishedPosts(),
    getAllTags(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/about`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${siteConfig.url}/tags/${encodeURIComponent(tag)}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes];
}
