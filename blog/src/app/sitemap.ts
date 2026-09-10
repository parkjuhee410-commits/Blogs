import type { MetadataRoute } from "next";

import { getPublishedPosts } from "@/lib/posts";
import { listSeries } from "@/lib/services/series";
import { listTags } from "@/lib/services/tags";
import { siteConfig } from "@/lib/site";
import { POST_TYPES, postPath, postTypeMeta } from "@/lib/taxonomy";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, tags, seriesList] = await Promise.all([
    getPublishedPosts(),
    listTags(),
    listSeries(),
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
    {
      url: `${siteConfig.url}/tags`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${siteConfig.url}/series`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    ...POST_TYPES.map((type) => ({
      url: `${siteConfig.url}/${postTypeMeta[type].path}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
  ];

  const postRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteConfig.url}${postPath(post)}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const tagRoutes: MetadataRoute.Sitemap = tags
    .filter((tag) => tag.postCount > 0)
    .map((tag) => ({
      url: `${siteConfig.url}/tags/${tag.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const seriesRoutes: MetadataRoute.Sitemap = seriesList
    .filter((item) => item.postCount > 0)
    .map((item) => ({
      url: `${siteConfig.url}/series/${item.slug}`,
      lastModified: item.updatedAt,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...postRoutes, ...tagRoutes, ...seriesRoutes];
}
