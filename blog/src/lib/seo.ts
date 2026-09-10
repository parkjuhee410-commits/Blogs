import type { Metadata } from "next";

import type { Post } from "@/db/schema";
import { siteConfig } from "@/lib/site";
import { postPath } from "@/lib/taxonomy";

export function buildPostMetadata(post: Post): Metadata {
  const path = postPath(post);
  const url = `${siteConfig.url}${path}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: path },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}
