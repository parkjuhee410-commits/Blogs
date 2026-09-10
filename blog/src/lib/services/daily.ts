import "server-only";

import {
  getLatestPostsByType,
  getPostBySlugAndType,
  getPublishedPostsByType,
} from "@/lib/posts";
import type { Category } from "@/lib/taxonomy";

const TYPE = "daily" as const;

export function getDailyPosts(category?: Category) {
  return getPublishedPostsByType(TYPE, category);
}

export function getLatestDailyPosts(limit: number) {
  return getLatestPostsByType(TYPE, limit);
}

export function getDailyPostBySlug(slug: string) {
  return getPostBySlugAndType(slug, TYPE);
}
