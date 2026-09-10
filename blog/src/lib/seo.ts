import type { Metadata } from "next";

import type { Post } from "@/db/schema";
import { siteConfig } from "@/lib/site";
import { postPath } from "@/lib/taxonomy";

export function buildPostMetadata(post: Post): Metadata {
  const path = postPath(post);
  const url = `${siteConfig.url}${path}`;
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.description;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: post.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url,
      title,
      description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}
